
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ufyeryeeqqyuqmvwmitu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_yA-rrSKHjkFdggaQWDp-ZA_aYWry7uX";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
