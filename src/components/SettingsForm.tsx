"use client";

import { useActionState } from "react";
import { updateSettingsAction } from "@/lib/actions/settings-actions";

const CALCULATION_METHODS = [
  { value: "MWL", label: "Muslim World League" },
  { value: "ISNA", label: "ISNA (North America)" },
  { value: "EGYPT", label: "Egyptian General Authority" },
  { value: "MAKKAH", label: "Umm al-Qura (Makkah)" },
  { value: "KARACHI", label: "University of Islamic Sciences, Karachi" },
];

const MADHABS = [
  { value: "SHAFI", label: "Shafi’i / Maliki / Hanbali (Asr earlier)" },
  { value: "HANAFI", label: "Hanafi (Asr later)" },
];

export function SettingsForm({
  name,
  city,
  country,
  calculationMethod,
  madhab,
}: {
  name: string;
  city: string;
  country: string;
  calculationMethod: string;
  madhab: string;
}) {
  const [state, formAction, pending] = useActionState(updateSettingsAction, undefined);

  return (
    <form action={formAction} className="space-y-4 rounded-card border border-border bg-surface p-4">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
          Full name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={name}
          required
          className="w-full rounded-control border border-border bg-canvas px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-foreground">Location</p>
        <p className="mb-2 text-xs text-foreground-muted">
          Used to fetch today&apos;s real prayer times, so each prayer only unlocks for
          logging once its time actually begins.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="city" className="mb-1.5 block text-xs font-medium text-foreground-muted">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              placeholder="Tunis"
              defaultValue={city}
              className="w-full rounded-control border border-border bg-canvas px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <div>
            <label
              htmlFor="country"
              className="mb-1.5 block text-xs font-medium text-foreground-muted"
            >
              Country
            </label>
            <input
              id="country"
              name="country"
              type="text"
              placeholder="Tunisia"
              defaultValue={country}
              className="w-full rounded-control border border-border bg-canvas px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor="calculationMethod"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Calculation method
        </label>
        <select
          id="calculationMethod"
          name="calculationMethod"
          defaultValue={calculationMethod}
          className="w-full rounded-control border border-border bg-canvas px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          {CALCULATION_METHODS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="madhab" className="mb-1.5 block text-sm font-medium text-foreground">
          Madhab (Asr timing)
        </label>
        <select
          id="madhab"
          name="madhab"
          defaultValue={madhab}
          className="w-full rounded-control border border-border bg-canvas px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          {MADHABS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      {state?.success && <p className="text-sm text-success">Settings saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-control bg-primary py-2.5 text-sm font-semibold text-on-primary transition-opacity disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
