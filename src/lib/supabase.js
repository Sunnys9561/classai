import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bfycyfmlmkpucjbaygqs.supabase.co";

const supabasePublishableKey =
  "sb_publishable_AJYVpR37iKq_1ODxY0xUFg_K2y82qYc";

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);