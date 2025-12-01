import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Row, Col, Button, Card as BSCard, ProgressBar } from "react-bootstrap";
import CardHolder from "../components/CardHolder";
import CardExtra from "../components/CardExtra";
import CardSpare from "../components/CardSpare";
import Help from "../components/Help";
import Score from "../components/ScoreResult";
import Confetti from "react-confetti";

import { resetCardsStatus, clearScoreHistory } from "../actions/logicActions";
import initCardArray from "../utils/card";
import "../styles/app.css";

import { supabase } from "../supabaseClient";

const mapStateToProps = (state) => ({
  score: state.logic.score,
  holdersState: state.logic.holdersState,
  gameOver: state.logic.gameOver,
  scoreHistory: state.logic.scoreHistory,
});

const mapDispatchToProps = (dispatch) => ({
  resetAllCardsStatus: (cardArray) => dispatch(resetCardsStatus(cardArray)),
  clearLocalScores: () => dispatch(clearScoreHistory()),
});

const Game60K = ({
  holdersState,
  score,
  gameOver,
  resetAllCardsStatus,
  clearLocalScores,
}) => {
  const [playerName, setPlayerName] = useState(
    localStorage.getItem("currentUser") || "Guest"
  );
  const [userId, setUserId] = useState(null);

  const [leaderboard, setLeaderboard] = useState([]); // <-- STEP 8
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);
  const [timerActive, setTimerActive] = useState(true);
  const [timeOut, setTimeOut] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);

  const onCloseModal = () => setShowGameOverModal(false);
  const onCloseHelpModal = () => setShowHelpModal(false);

  // ------------------------------------
  // STEP 8 — Load Leaderboard from Supabase 
  // ------------------------------------
const loadLeaderboard = async () => {
  setLoadingLeaderboard(true);

  let { data: scoreData, error } = await supabase
    .from("scores")
    .select("score, player_name, created_at")
    .order("score", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Leaderboard fetch error:", error);
    setLoadingLeaderboard(false);
    return;
  }

  const leaderboardFormatted = scoreData.map((row) => ({
    score: row.score,
    user: row.player_name || "Unknown",
    created_at: row.created_at,
  }));

  setLeaderboard(leaderboardFormatted);
  setLoadingLeaderboard(false);
};

  // ------------------------------------
  // Load authenticated user from Supabase
  // ------------------------------------
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (user) {
        setUserId(user.id);

        if (user.email) {
          const display = user.user_metadata?.display_name;
          setPlayerName(display || user.email.split("@")[0]); 
          localStorage.setItem("currentUser", display);
        } else {
          const fallback = user.user_metadata?.username || user.id.substring(0, 6);
          setPlayerName(fallback);
        }

        localStorage.setItem("currentUser", user.email || "Guest");
      }
    })();
  }, []);

  // ------------------------------------
  // Initialize game
  // ------------------------------------
  useEffect(() => {
    if (!loggedOut) resetAllCardsStatus(initCardArray());
  }, [loggedOut, resetAllCardsStatus]);

  // ------------------------------------
  // Countdown Timer
  // ------------------------------------
  useEffect(() => {
    if (!timerActive || loggedOut) return;

    if (timeLeft <= 0) {
      setTimerActive(false);
      setTimeOut(true);
      setShowGameOverModal(true);
      saveScoreToSupabase("Timeout");
      return;
    }

    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, timerActive, loggedOut]);

  // ------------------------------------
  // Save score when game ends normally
  // ------------------------------------
  useEffect(() => {
    if (gameOver && !loggedOut) {
      setTimerActive(false);
      saveScoreToSupabase("Game Ended");
      loadLeaderboard(); // reload updated leaderboard
    }
  }, [gameOver, loggedOut]);

  // ------------------------------------
  // STEP 7 — Save Score to Supabase
  // ------------------------------------
  const saveScoreToSupabase = async (reason) => {
    if (!userId) return;

    const { error } = await supabase.from("scores").insert({
  user_id: userId,
  player_name: playerName,  
  score,
  reason,
});

    if (error) console.error("Supabase Insert Error:", error);
    else loadLeaderboard(); 
  };

  const resetGame = () => {
    setTimeLeft(180);
    setTimerActive(true);
    setTimeOut(false);
    resetAllCardsStatus(initCardArray());
  };

  const onClickRestart = () => {
    if (window.confirm("Start a new game?")) resetGame();
  };

  const resetGameForSecondChance = async () => {
    const data = { success: true };
    if (data.success) {
      alert("🎉 Heart Game Win → +1 minute!");
      setTimeLeft((prev) => prev + 60);
      setTimeOut(false);
      setTimerActive(true);
      setShowGameOverModal(false);
    }
  };

  const onClickLogout = async () => {
    if (!window.confirm("Logout?")) return;

    await supabase.auth.signOut();
    localStorage.removeItem("currentUser");

    setPlayerName("Guest");
    setUserId(null);
    setLoggedOut(true);
    setTimerActive(false);
    setShowGameOverModal(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  const progress = (timeLeft / 180) * 100;
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Logged-out placeholder
  if (loggedOut) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center"
           style={{ height: "100vh", background: "#121212", color: "white" }}>
        <h2>You are logged out</h2>
        <p>Refresh the page to login again.</p>
      </div>
    );
  }

  // ---------------------------------------------------------
  // MAIN GAME UI
  // ---------------------------------------------------------
  return (
    <div className="d-flex flex-column justify-content-start align-items-center"
         style={{
           height: "100vh",
           width: "100vw",
           overflow: "hidden",
           background: "radial-gradient(circle at center, #121212 0%, #000 100%)",
           color: "white",
         }}>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center w-100 px-4 border-bottom border-secondary"
           style={{ height: "15vh" }}>
        <div>
          <h1 className="text-warning fw-bold mb-0">Card Game 60K</h1>
          <h5 className="text-light">👤 Player: {playerName}</h5>
        </div>

        <div className="text-center">
          <h1 className={`display-6 fw-bold ${timeLeft <= 30 ? "text-danger pulse" : "text-success"}`}>
            ⏱ {formatTime(timeLeft)}
          </h1>
          <ProgressBar now={progress} variant={timeLeft <= 30 ? "danger" : "success"}
                       className="mt-1" style={{ height: "8px", width: "250px" }} />
        </div>

        <div className="text-end d-flex flex-column align-items-end gap-1">
          <h5 className="text-info mb-1">⭐ Score: {score}</h5>
          <Button variant="outline-warning" size="sm" onClick={onClickRestart}>🔄 Restart</Button>
          <Button variant="outline-danger" size="sm" onClick={onClickLogout}>🚪 Logout</Button>
        </div>
      </div>

      {/* GAME AREA */}
      <Row className="justify-content-center align-items-center w-100"
           style={{ height: "75vh", margin: 0 }}>
        <Col sm="12" xl="9"
             className="d-flex justify-content-center align-items-center"
             style={{ height: "100%" }}>
          {holdersState.length > 0 ? (
            <div className="game-board bg-dark p-3 rounded shadow-lg"
                 style={{
                   border: "2px solid #555",
                   width: "98%",
                   height: "105vh",
                   maxWidth: "1300px",
                   display: "flex",
                   justifyContent: "space-between",
                   alignItems: "center",
                   transform: "scale(0.7)",
                 }}>
              <div className="flex-grow-1">
                <Row className="justify-content-center mb-1">
                  {[0, 1, 2, 3, 4].map((id) => <CardHolder key={id} id={id} />)}
                </Row>
                <Row className="justify-content-center mb-1">
                  {[10, 11, 12, 13, 14].map((id) => <CardHolder key={id} id={id} />)}
                </Row>
                <Row className="justify-content-center">
                  {[5, 6, 7, 8, 9].map((id) => <CardHolder key={id} id={id} />)}
                </Row>
              </div>

              <div className="d-flex flex-column align-items-center ml-2"
                   style={{ transform: "scale(0.8)" }}>
                <CardSpare />
                <div className="mt-2">
                  <CardExtra id={15} key={15} />
                </div>
              </div>
            </div>
          ) : (
            <h4 className="text-center text-muted">Loading game board...</h4>
          )}
        </Col>

        {/* RIGHT SIDEBAR — LEADERBOARD */}
        <Col sm="12" xl="3"
             className="h-100 d-flex align-items-center justify-content-center">
          <BSCard bg="dark" text="light"
                  className="shadow-lg border border-secondary p-3"
                  style={{ height: "85%", width: "90%" }}>

            <BSCard.Title>🏆 Leaderboard</BSCard.Title>

            <BSCard.Body className="overflow-auto">

              {loadingLeaderboard ? (
                <p className="text-muted">Loading leaderboard...</p>
              ) : leaderboard.length === 0 ? (
                <p className="text-muted">No scores found.</p>
              ) : (
                leaderboard.map((item, i) => (
                  <div key={i} className="mb-2">
                    <h6 className="text-light mb-0">
                      {item.score}{" "}
                      <small className="text-muted">({item.user})</small>
                    </h6>
                    <small className="text-secondary">
                      {new Date(item.created_at).toLocaleDateString()}
                    </small>
                  </div>
                ))
              )}
            </BSCard.Body>
          </BSCard>
        </Col>
      </Row>

      {/* MODALS */}
      <Score
        score={score}
        show={showGameOverModal}
        onClose={onCloseModal}
        onSecondChance={timeOut ? resetGameForSecondChance : null}
        reason={timeOut ? "Timeout" : "Game Over"}
      />

      <Help show={showHelpModal} onClose={onCloseHelpModal} />
      <Confetti width={width} height={height} numberOfPieces={0} />
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Game60K);
