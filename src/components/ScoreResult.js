import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import lucky from "../imgs/trophy.png";
import unlucky from "../imgs/unfortune.png";
import axios from "axios";

const ScoreResult = ({ show, onClose, score, onSecondChance }) => {
  const [heartGame, setHeartGame] = useState(null);
  const [message, setMessage] = useState("");

  //  Load Heart Game puzzle from API
  const startHeartGame = async () => {
    try {
      setMessage("Loading puzzle...");
      const res = await axios.get("https://marcconrad.com/uob/heart/api.php");
      setHeartGame(res.data);
      setMessage("Solve the Heart Game to earn another chance!");
    } catch (err) {
      console.error(err);
      setMessage("Error loading Heart Game. Please try again later.");
    }
  };

  //  Check answer
  const checkAnswer = (num) => {
    if (!heartGame) return;
    if (num === heartGame.solution) {
      alert(" Correct! You get another chance!");
      setHeartGame(null);
      onSecondChance(); // restart game
      onClose(); // close modal
    } else {
      alert(" Wrong answer. Game over!");
      setHeartGame(null);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>60K Points</Modal.Title>
      </Modal.Header>

      {/* 🏆 WIN CASE */}
      {score >= 20000 && (
        <Modal.Body>
          <div className="card-body text-center">
            <img src={lucky} width={200} height={200} alt="trophy" />
            <h4 className="text-success">CONGRATULATIONS!</h4>
            <h2 className="text-success">{score}</h2>
          </div>
        </Modal.Body>
      )}

      {/* 😢 LOSE CASE */}
      {score < 20000 && (
        <Modal.Body>
          <div className="card-body text-center">
            <img
              src={unlucky}
              width={200}
              height={200}
              style={{ marginBottom: "20px" }}
              alt="unlucky"
            />
            <h4 className="text-warning">GAME OVER!</h4>
            <h2 className="text-danger">{score}</h2>

            {/* 🧠 HEART GAME SECTION */}
            {!heartGame ? (
              <>
                <p className="text-muted mt-3">
                  Want another chance? Play the Heart Game ❤️
                </p>
                <Button variant="danger" onClick={startHeartGame}>
                  Play Heart Game
                </Button>
              </>
            ) : (
              <div className="mt-3">
                <p>{message}</p>
                <img
                  src={heartGame.question}
                  alt="Heart Puzzle"
                  style={{
                    width: "180px",
                    display: "block",
                    margin: "10px auto",
                  }}
                />
                <div className="d-flex justify-content-center flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <Button
                      key={num}
                      variant="outline-primary"
                      onClick={() => checkAnswer(num)}
                      className="m-1"
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal.Body>
      )}

      {/* FOOTER */}
      <Modal.Footer>
        <Button variant="primary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ScoreResult;
