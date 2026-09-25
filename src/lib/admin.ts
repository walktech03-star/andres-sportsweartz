import "server-only";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export type AdminUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
};

// Answers the question: "is the person making this request an approved admin?"
//
// Being signed in is NOT enough. The account must also appear in the admin_users
// table and be active. That means a stranger who somehow creates an account in
// Supabase still cannot reach the dashboard.
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const adminClient = getSupabaseAdmin();
  if (!adminClient) return null;

  const { data: row } = await adminClient
    .from("admin_users")
    .select("id, email, full_name, role, is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!row || !row.is_active) return null;

  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
  };
}

// Use at the top of every admin page. Sends the visitor away if they are not
// an approved admin.
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin();

  if (!admin) redirect("/admin/login");

  return admin;
}