import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://artjsvhhkusuoaifxcpl.supabase.co";

const supabaseKey = "sb_publishable_...";

export const supabase = createClient(supabaseUrl, supabaseKey);
