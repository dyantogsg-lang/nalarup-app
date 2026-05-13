import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Guard for authenticated app routes.
 * Returns the Supabase auth user + matching public.profiles row.
 *
 * Profile creation normally happens via the `on_auth_user_created` trigger
 * (see supabase/migrations/20260513000001_profile_on_signup.sql). This
 * helper includes a fallback insert for edge cases: imported users, trigger
 * disabled, or migration not applied yet. Fallback uses ON CONFLICT so it
 * is race-safe.
 */
export async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  let profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  if (!profile) {
    const fullName =
      (user.user_metadata?.full_name as string | undefined) ||
      user.email?.split("@")[0] ||
      "User";

    await db
      .insert(profiles)
      .values({
        id: user.id,
        email: user.email ?? "",
        fullName,
        role: "user",
      })
      .onConflictDoNothing();

    profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id),
    });

    if (!profile) {
      // Something is seriously wrong (e.g. DB down). Bounce to login.
      redirect("/login");
    }
  }

  return { user, profile };
}
