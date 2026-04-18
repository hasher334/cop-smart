// One-time admin bootstrap server function.
// Creates badge=1234 / password=admin1234 with admin role, or resets it if already present.
import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { badgeToEmail } from "@/lib/auth-helpers";

export const bootstrapAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const badge = "1234";
  const password = "admin1234";
  const email = badgeToEmail(badge);

  const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) throw new Error(`list: ${listErr.message}`);
  const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  let userId: string;
  if (existing) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { badge_no: badge, full_name: "Admin User" },
    });
    if (error) throw new Error(`update: ${error.message}`);
    userId = existing.id;
  } else {
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { badge_no: badge, full_name: "Admin User" },
    });
    if (error || !created.user) throw new Error(`create: ${error?.message ?? "no user"}`);
    userId = created.user.id;
  }

  await supabaseAdmin.from("profiles").upsert(
    {
      user_id: userId,
      badge_no: badge,
      full_name: "Admin User",
      email,
      status: "active",
    },
    { onConflict: "user_id" },
  );

  const { error: roleErr } = await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
  if (roleErr) throw new Error(`role: ${roleErr.message}`);

  return { ok: true, badge, password };
});
