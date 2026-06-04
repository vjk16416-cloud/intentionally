"use client";

import { useActionState, useState } from "react";

import { StepNav } from "@/components/onboarding/step-nav";
import { saveNeighbourhood, type NeighbourhoodActionState } from "./actions";

const INITIAL_STATE: NeighbourhoodActionState = {};

const SUGGESTED_AREAS = [
  "Dagenham",
  "Ilford",
  "Barking",
  "Romford",
  "Stratford",
  "East Ham",
  "Walthamstow",
  "Hackney",
  "Bethnal Green",
  "Shoreditch",
];

const DISTANCE_OPTIONS = ["5 miles", "10 miles", "25 miles", "50 miles"];

export function NeighbourhoodForm({
  initialCity,
  initialNeighbourhood,
  returnTo,
  previousStep,
}: {
  initialCity: string | null;
  initialNeighbourhood: string | null;
  returnTo: string | null;
  previousStep: string | null;
}) {
  const [city, setCity] = useState(initialCity ?? "");
  const [neighbourhood, setNeighbourhood] = useState(
    initialNeighbourhood ?? "",
  );
  const [distance, setDistance] = useState("10 miles");

  const [state, action, pending] = useActionState(
    saveNeighbourhood,
    INITIAL_STATE,
  );

  return (
    <form action={action} className="space-y-6">
      <div className="rounded-3xl border border-border/70 bg-card/60 p-4 shadow-sm">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Location
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            Add the area you spend the most time in. We use this for local match
            suggestions, not to show your exact address.
          </p>
        </div>

        <button
          type="button"
          className="mt-4 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
        >
          Use my current location
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="city"
            className="text-sm font-semibold text-foreground"
          >
            City or town
          </label>
          <input
            id="city"
            name="city"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            required
            placeholder="London"
            className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-base shadow-sm outline-none transition focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/30"
          />
          <p className="text-xs text-muted-foreground">
            For example: London, Manchester, Birmingham.
          </p>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="neighbourhood"
            className="text-sm font-semibold text-foreground"
          >
            Neighbourhood or area
          </label>
          <input
            id="neighbourhood"
            name="neighbourhood"
            value={neighbourhood}
            onChange={(event) => setNeighbourhood(event.target.value)}
            required
            placeholder="Ilford"
            className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-base shadow-sm outline-none transition focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/30"
          />
          <p className="text-xs text-muted-foreground">
            Keep it broad. Your exact address is never shown.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-semibold text-foreground">
            Matching distance
          </label>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose how local you want your early matches to feel.
          </p>
        </div>

        <input type="hidden" name="distance" value={distance} />

        <div className="grid grid-cols-4 gap-2">
          {DISTANCE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDistance(option)}
              className={`rounded-2xl border px-2 py-3 text-sm font-medium transition ${
                distance === option
                  ? "border-accent bg-accent text-accent-foreground shadow-sm"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Popular nearby areas
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Tap one to fill the neighbourhood field quickly.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {SUGGESTED_AREAS.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => setNeighbourhood(area)}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {state.error ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <StepNav
        returnTo={returnTo}
        previousStep={previousStep}
        pending={pending}
      />
    </form>
  );
}