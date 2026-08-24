"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { AuthActionState } from "@/app/(auth)/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthAction = (
  state: AuthActionState,
  formData: FormData,
) => Promise<AuthActionState>;

export type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  action: AuthAction;
  /** Error code forwarded from the auth callback, if any. */
  callbackError?: string;
  /** Relative path to return to after signing in. */
  next?: string;
};

const copy = {
  "sign-in": {
    title: "Welcome back",
    description: "Sign in to keep building your brand.",
    submit: "Sign in",
    footer: "Don't have an account?",
    footerHref: "/sign-up",
    footerLink: "Create one",
  },
  "sign-up": {
    title: "Create your account",
    description: "Set up your brand once, then create everything from it.",
    submit: "Create account",
    footer: "Already have an account?",
    footerHref: "/sign-in",
    footerLink: "Sign in",
  },
} as const;

/** Maps callback error codes to messages a user can act on. */
const CALLBACK_ERRORS: Record<string, string> = {
  missing_code: "That confirmation link is incomplete. Request a new one.",
  invalid_code: "That confirmation link has expired or was already used.",
};

export function AuthForm({
  mode,
  action,
  callbackError,
  next,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    action,
    {},
  );

  const text = copy[mode];
  const isSignUp = mode === "sign-up";

  const errorMessage =
    state.error ??
    (callbackError ? CALLBACK_ERRORS[callbackError] : undefined);

  return (
    <Card className="bg-[var(--surface-elevated)]">
      <CardHeader>
        <CardTitle className="text-xl">{text.title}</CardTitle>
        <CardDescription>{text.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          {next ? <input type="hidden" name="next" value={next} /> : null}

          {errorMessage ? <Alert variant="danger">{errorMessage}</Alert> : null}
          {state.message ? <Alert variant="success">{state.message}</Alert> : null}

          {isSignUp ? (
            <Field
              id="displayName"
              label="Name"
              type="text"
              autoComplete="name"
              placeholder="Alex Rivera"
              error={state.fieldErrors?.displayName}
            />
          ) : null}

          <Field
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={state.fieldErrors?.email}
          />

          <Field
            id="password"
            label="Password"
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            placeholder={isSignUp ? "At least 8 characters" : "••••••••"}
            error={state.fieldErrors?.password}
          />

          <Button type="submit" loading={pending} className="mt-2 w-full">
            {text.submit}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {text.footer}{" "}
          <Link
            href={text.footerHref}
            className="rounded font-medium text-[var(--primary)] hover:underline"
          >
            {text.footerLink}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

type FieldProps = {
  id: string;
  label: string;
  type: string;
  autoComplete: string;
  placeholder: string;
  error?: string;
};

function Field({ id, label, error, ...inputProps }: FieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        required
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error ? (
        <p id={errorId} className="text-xs text-[var(--danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
