import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://artjsvhhkusuoaifxcpl.supabase.co";

const supabaseKey = "sb_publishable_u3Y7T3kV0NR5DILLwlJg3A_PRKVFSJB";

export const supabase = createClient(supabaseUrl, supabaseKey);
