// One-time admin bootstrap endpoint.
// Creates the badge=1234 admin account if it doesn't exist, otherwise resets
// its password to "admin1234" and ensures the admin role.
// Protected by a simple shared secret in the request header.
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { badgeToEmail } from "@/lib/auth-helpers";

const BOOTSTRAP_TOKEN = "copsmart-bootstrap-2026";

export const Route = createFileRoute("/api/admin/bootstrap")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("x-bootstrap-token");
        if (token !== BOOTSTRAP_TOKEN) {
          return new Response("Unauthorized", { status: 401 });
        }

        const badge = "1234";
        const password = "admin1234";
        const email = badgeToEmail(badge);

        // Look for existing user
        const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
          page: 1,
          perPage: 200,
        });
        if (listErr) {
          return Response.json({ step: "list", error: listErr.message }, { status: 500 });
        }
        const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

        let userId: string;
        if (existing) {
          const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
            password,
            email_confirm: true,
            user_metadata: { badge_no: badge, full_name: "Admin User" },
          });
          if (updErr) {
            return Response.json({ step: "update", error: updErr.message }, { status: 500 });
          }
          userId = existing.id;
        } else {
          const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { badge_no: badge, full_name: "Admin User" },
          });
          if (createErr || !created.user) {
            return Response.json({ step: "create", error: createErr?.message ?? "no user" }, { status: 500 });
          }
          userId = created.user.id;
        }

        // Ensure profile (handle_new_user trigger usually does this for inserts)
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

        // Grant admin role (idempotent)
        const { error: roleErr } = await supabaseAdmin
          .from("user_roles")
          .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
        if (roleErr) {
          return Response.json({ step: "role", error: roleErr.message }, { status: 500 });
        }

        return Response.json({
          ok: true,
          userId,
          loginBadge: badge,
          loginPassword: password,
        });
      },
    },
  },
});
