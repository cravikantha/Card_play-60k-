// src/services/scores.js
import { supabase } from "../supabaseClient";

export async function saveScoreToDB({ score, reason }) {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  if (!user) throw new Error("Not logged in");

  const { data, error } = await supabase
    .from("scores")
    .insert([
      {
        user_id: user.id,
        score,
        reason,
      },
    ]);

  return { data, error };
}

/** Fetch top leaderboard */
export async function fetchTopScores(limit = 10) {
  const { data, error } = await supabase
    .from("scores")
    .select("score, created_at, user_id")
    .order("score", { ascending: false })
    .limit(limit);

  return { data, error };
}

/** Fetch my score history */
export async function fetchMyScores() {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  if (!user) return { data: [], error: null };

  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return { data, error };
}
