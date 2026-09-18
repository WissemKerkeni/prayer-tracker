"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInAction } from "@/lib/actions/auth-actions";

export default function SignInPage() {
  const [state, formAction, pending] = useActionState(signInAction, undefined);

  return (
    <div className="rounded-card border border-border bg-surface p-8 shadow-[var(--shadow-card)]">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary">
          <MoonBadge />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Welcome back</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Sign in to continue your prayer journey.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />

        {state?.error && (
          <p role="alert" className="text-sm text-danger">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-control bg-primary py-2.5 text-sm font-semibold text-on-primary transition-opacity disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground-muted">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-medium text-accent hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
  required,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-control border border-border bg-canvas px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
    </div>
  );
}

function MoonBadge() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path
        d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
