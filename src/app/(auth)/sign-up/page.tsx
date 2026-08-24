import type { Metadata } from "next";

import { signUp } from "@/app/(auth)/actions";
import { AuthForm } from "@/components/auth/auth-form";
import { safeRelativePath } from "@/lib/redirects";

export const metadata: Metadata = {
  title: "Create account",
};

export default async function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  const params = await searchParams;

  return (
    <AuthForm
      mode="sign-up"
      action={signUp}
      callbackError={typeof params.error === "string" ? params.error : undefined}
      next={safeRelativePath(params.next)}
    />
  );
}
