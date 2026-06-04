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
    <form action={action} className="space-y-5">
      <div className="space-y-3">
        <button
          type="button"
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted"
        >
          Use my current location
        </button>

        <p className="text-xs leading-5 text-muted-foreground">
          Or add your city and area manually. We only use this to keep match suggestions local.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="city" className="text-sm font-semibold text-foreground">
          City or town
        </label>
        <input
          id="city"
          name="city"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          required
          placeholder="London"
          className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-base shadow-sm outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/30"
        />
        <p className="text-xs text-muted-foreground">
          Examples: London, Manchester, Birmingham.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="neighbourhood" className="text-sm font-semibold text-foreground">
          Neighbourhood or area
        </label>
        <input
          id="neighbourhood"
          name="neighbourhood"
          value={neighbourhood}
          onChange={(event) => setNeighbourhood(event.target.value)}
          required
          placeholder="Dagenham"
          className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-base shadow-sm outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/30"
        />
        <p className="text-xs text-muted-foreground">
          This keeps suggestions local without showing your exact address.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">
          How far are you open to matching?
        </label>
        <input type="hidden" name="distance" value={distance} />
        <div className="grid grid-cols-2 gap-2">
          {DISTANCE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDistance(option)}
              className={`rounded-xl border px-3 py-3 text-sm transition ${
                distance === option
                  ? "border-accent bg-accent text-accent-foreground shadow-sm"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          You can change this later.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Popular nearby examples</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_AREAS.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => setNeighbourhood(area)}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground hover:bg-muted"
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <StepNav
        returnTo={returnTo}
        previousStep={previousStep}
        pending={pending}
      />
    </form>
  );
}
