"use client";

import { useActionState, useMemo, useState } from "react";

import { StepNav } from "@/components/onboarding/step-nav";
import { saveNeighbourhood, type NeighbourhoodActionState } from "./actions";

const INITIAL_STATE: NeighbourhoodActionState = {};

const CITY_OPTIONS = [
  "London",
  "Manchester",
  "Birmingham",
  "Leeds",
  "Bristol",
];

const NEIGHBOURHOODS_BY_CITY: Record<string, string[]> = {
  London: [
    "Acton",
    "Angel",
    "Barking",
    "Barnet",
    "Battersea",
    "Beckenham",
    "Bethnal Green",
    "Bexley",
    "Brixton",
    "Camden",
    "Canary Wharf",
    "Chelsea",
    "Chiswick",
    "Clapham",
    "Croydon",
    "Dagenham",
    "Dalston",
    "Deptford",
    "Ealing",
    "East Ham",
    "Edgware",
    "Enfield",
    "Finsbury Park",
    "Fulham",
    "Greenwich",
    "Hackney",
    "Hammersmith",
    "Harrow",
    "Highbury",
    "Hounslow",
    "Ilford",
    "Islington",
    "Kingston",
    "Lewisham",
    "Leyton",
    "Mile End",
    "Newham",
    "Peckham",
    "Putney",
    "Richmond",
    "Romford",
    "Shoreditch",
    "Southall",
    "Southwark",
    "Stratford",
    "Tottenham",
    "Tower Hamlets",
    "Walthamstow",
    "Wembley",
    "Westminster",
    "Whitechapel",
    "Woolwich",
  ],
  Manchester: [
    "Ancoats",
    "Northern Quarter",
    "Didsbury",
    "Chorlton",
    "Salford",
    "Fallowfield",
  ],
  Birmingham: [
    "Digbeth",
    "Edgbaston",
    "Jewellery Quarter",
    "Moseley",
    "Selly Oak",
  ],
  Leeds: [
    "City Centre",
    "Headingley",
    "Chapel Allerton",
    "Hyde Park",
    "Roundhay",
  ],
  Bristol: [
    "Clifton",
    "Redland",
    "Bedminster",
    "Stokes Croft",
    "Bishopston",
  ],
};

const DISTANCE_OPTIONS = [
  {
    label: "Local",
    value: "5 miles",
    helper: "Closest matches",
  },
  {
    label: "Nearby",
    value: "10 miles",
    helper: "Balanced",
  },
  {
    label: "Flexible",
    value: "25 miles",
    helper: "More options",
  },
  {
    label: "Wider",
    value: "50 miles",
    helper: "Maximum reach",
  },
];

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
  const defaultCity =
    initialCity && CITY_OPTIONS.includes(initialCity) ? initialCity : "London";

  const [city, setCity] = useState(defaultCity);

  const neighbourhoodOptions = useMemo(
    () => NEIGHBOURHOODS_BY_CITY[city] ?? NEIGHBOURHOODS_BY_CITY.London,
    [city],
  );

  const defaultNeighbourhood =
    initialNeighbourhood && neighbourhoodOptions.includes(initialNeighbourhood)
      ? initialNeighbourhood
      : neighbourhoodOptions[0];

  const [neighbourhood, setNeighbourhood] = useState(defaultNeighbourhood);
  const [distanceIndex, setDistanceIndex] = useState(1);

  const selectedDistance = DISTANCE_OPTIONS[distanceIndex];

  const [state, action, pending] = useActionState(
    saveNeighbourhood,
    INITIAL_STATE,
  );

  function handleCityChange(nextCity: string) {
    const nextNeighbourhoods =
      NEIGHBOURHOODS_BY_CITY[nextCity] ?? NEIGHBOURHOODS_BY_CITY.London;

    setCity(nextCity);
    setNeighbourhood(nextNeighbourhoods[0]);
  }

  return (
    <form action={action} className="space-y-5">
      <div className="rounded-3xl border border-border/70 bg-card/60 p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Location
        </p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Choose where you spend most of your time. Your exact address is never
          shown.
        </p>

        <button
          type="button"
          className="mt-4 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
        >
          Use my current location
        </button>
      </div>

      <div className="grid gap-4">
        <div className="space-y-1.5">
          <label
            htmlFor="city"
            className="text-sm font-semibold text-foreground"
          >
            City or town
          </label>
          <select
            id="city"
            name="city"
            value={city}
            onChange={(event) => handleCityChange(event.target.value)}
            required
            className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-base shadow-sm outline-none transition focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/30"
          >
            {CITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="neighbourhood"
            className="text-sm font-semibold text-foreground"
          >
            Neighbourhood or area
          </label>
          <select
            id="neighbourhood"
            name="neighbourhood"
            value={neighbourhood}
            onChange={(event) => setNeighbourhood(event.target.value)}
            required
            className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-base shadow-sm outline-none transition focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/30"
          >
            {neighbourhoodOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            This keeps match suggestions local without sharing your exact
            location.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-border/70 bg-card/60 p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Matching distance
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Move between local and wider matches.
            </p>
          </div>

          <div className="rounded-2xl bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground">
            {selectedDistance.value}
          </div>
        </div>

        <input type="hidden" name="distance" value={selectedDistance.value} />

        <div className="mt-5">
          <input
            type="range"
            min="0"
            max={DISTANCE_OPTIONS.length - 1}
            step="1"
            value={distanceIndex}
            onChange={(event) => setDistanceIndex(Number(event.target.value))}
            className="w-full accent-current"
            aria-label="Matching distance"
          />

          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
            {DISTANCE_OPTIONS.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDistanceIndex(index)}
                className={`rounded-2xl px-2 py-2 text-xs transition ${
                  distanceIndex === index
                    ? "bg-accent text-accent-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                <span className="block font-semibold">{option.label}</span>
                <span className="mt-0.5 block text-[11px] opacity-80">
                  {option.value}
                </span>
              </button>
            ))}
          </div>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            {selectedDistance.helper}
          </p>
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