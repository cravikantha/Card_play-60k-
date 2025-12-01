// src/services/auth.js
import { supabase } from "../supabaseClient";

/**
 * Register using username only.
 * We generate a fake email: username@game.local
 */
export async function signUp(username, password) {
  const email = `${username}@game.local`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  return { data, error };
}

/** Login */
export async function signIn(username, password) {
  const email = `${username}@game.local`;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

/** Logout */
export async function signOut() {
  return supabase.auth.signOut();
}

/** Get session user */
export function getCurrentUser() {
  return supabase.auth.getUser();
}
