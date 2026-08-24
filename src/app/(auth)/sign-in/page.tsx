import type { Metadata } from "next";

import { signIn } from "@/app/(auth)/actions";
import { AuthForm } from "@/components/auth/auth-form";
import { safeRelativePath } from "@/lib/redirects";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const params = await searchParams;

  return (
    <AuthForm
      mode="sign-in"
      action={signIn}
      callbackError={typeof params.error === "string" ? params.error : undefined}
      next={safeRelativePath(params.next)}
    />
  );
}
