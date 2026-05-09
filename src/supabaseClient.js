import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "COLOCA_AQUI_A_TUA_URL";
const supabaseKey = "COLOCA_AQUI_A_TUA_ANON_KEY";

export const supabase = createClient(supabaseUrl, supabaseKey);
