"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  getNeighbourhoodsFor,
  MARKET_CITIES,
} from "@/lib/onboarding/constants";

import { saveNeighbourhood, type NeighbourhoodActionState } from "./actions";

const INITIAL_STATE: NeighbourhoodActionState = {};

export function NeighbourhoodForm({
  initialCity,
  initialNeighbourhood,
}: {
  initialCity: string | null;
  initialNeighbourhood: string | null;
}) {
  const [city, setCity] = useState<string>(initialCity ?? "");
  const [neighbourhood, setNeighbourhood] = useState<string>(
    initialNeighbourhood ?? "",
  );
  const [state, action, pending] = useActionState(
    saveNeighbourhood,
    INITIAL_STATE,
  );

  const neighbourhoods = city ? getNeighbourhoodsFor(city) : [];

  function onCityChange(next: string) {
    setCity(next);
    // If the previously-selected neighbourhood doesn't exist in the
    // new city, clear it so the user has to pick again.
    if (!getNeighbourhoodsFor(next).includes(neighbourhood)) {
      setNeighbourhood("");
    }
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="city" className="text-sm font-medium">
          City
        </label>
        <select
          id="city"
          name="city"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          required
          className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="" disabled>
            Choose your city…
          </option>
          {MARKET_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="neighbourhood" className="text-sm font-medium">
          Neighbourhood
        </label>
        <select
          id="neighbourhood"
          name="neighbourhood"
          value={neighbourhood}
          onChange={(e) => setNeighbourhood(e.target.value)}
          required
          disabled={!city}
          className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
        >
          <option value="" disabled>
            {city ? "Choose your neighbourhood…" : "Pick a city first"}
          </option>
          {neighbourhoods.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        {city ? (
          <p className="text-xs text-muted-foreground">
            {city === "London"
              ? "We use this to suggest people near you."
              : "London is the only actively seeded market right now — you can still sign up, but match pools elsewhere may be thin."}
          </p>
        ) : null}
      </div>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving…" : "Continue"}
      </Button>
    </form>
  );
}
