"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { clientEnv } from "@/lib/env";
import { resolveRedirect } from "@/lib/redirects";
import { signInSchema, signUpSchema } from "@/lib/validation/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error?: string;
  /** Set when signup succeeded but the email still needs confirming. */
  message?: string;
  /** Field-level errors, keyed by input name. */
  fieldErrors?: Record<string, string>;
};

function fieldErrorsFrom(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function signIn(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    // Deliberately generic: distinguishing "no such user" from "wrong password"
    // would let an attacker enumerate registered email addresses.
    return { error: "Incorrect email or password." };
  }

  revalidatePath("/", "layout");
  // `next` is attacker-controllable via the sign-in URL, so it is narrowed to
  // a same-origin relative path before being used.
  redirect(resolveRedirect(formData.get("next")));
}

export async function signUp(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }

  const { email, password, displayName } = parsed.data;
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${clientEnv().NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // With email confirmation enabled, signUp returns a user but no session.
  if (!data.session) {
    return {
      message:
        "Check your email to confirm your account, then sign in.",
    };
  }

  revalidatePath("/", "layout");
  redirect(resolveRedirect(formData.get("next")));
}

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/sign-in");
}
