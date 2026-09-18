"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/lib/actions/auth-actions";

export default function SignUpPage() {
  const [state, formAction, pending] = useActionState(registerAction, undefined);

  return (
    <div className="rounded-card border border-border bg-surface p-8 shadow-[var(--shadow-card)]">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary">
          <CrescentBadge />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Create your sanctuary</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Each account keeps its own private prayer records.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <Field label="Full name" name="name" type="text" autoComplete="name" required />
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          helper="At least 8 characters."
        />
        <Field
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
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
          {pending ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground-muted">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-accent hover:underline">
          Sign in
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
  helper,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  required?: boolean;
  helper?: string;
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
        aria-describedby={helper ? `${name}-helper` : undefined}
        className="w-full rounded-control border border-border bg-canvas px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
      {helper && (
        <p id={`${name}-helper`} className="mt-1 text-xs text-foreground-muted">
          {helper}
        </p>
      )}
    </div>
  );
}

function CrescentBadge() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path
        d="M14.5 4.3A8 8 0 1 0 14.5 19.7 9.5 9.5 0 0 1 14.5 4.3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
