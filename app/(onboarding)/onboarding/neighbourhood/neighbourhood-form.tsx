"use client";

import { useActionState, useMemo, useRef, useState } from "react";

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
    "Balham",
    "Battersea",
    "Beckenham",
    "Bermondsey",
    "Bethnal Green",
    "Bexley",
    "Blackheath",
    "Borough",
    "Bow",
    "Brent",
    "Brentford",
    "Brixton",
    "Bromley",
    "Camberwell",
    "Camden",
    "Canary Wharf",
    "Chelsea",
    "Chingford",
    "Chiswick",
    "Clapham",
    "Clerkenwell",
    "Crouch End",
    "Croydon",
    "Dagenham",
    "Dalston",
    "Deptford",
    "Dulwich",
    "Ealing",
    "Earls Court",
    "East Ham",
    "Edgware",
    "Enfield",
    "Farringdon",
    "Finchley",
    "Fitzrovia",
    "Finsbury Park",
    "Forest Gate",
    "Fulham",
    "Golders Green",
    "Greenwich",
    "Hackney",
    "Hackney Wick",
    "Hammersmith and Fulham",
    "Hammersmith",
    "Haringey",
    "Harringay",
    "Harrow",
    "Hampstead",
    "Havering",
    "Highbury",
    "Highgate",
    "Hillingdon",
    "Holloway",
    "Homerton",
    "Hoxton",
    "Hounslow",
    "Ilford",
    "Islington",
    "Kensington and Chelsea",
    "Kentish Town",
    "King's Cross",
    "Kilburn",
    "Kingston",
    "Kingston upon Thames",
    "Lambeth",
    "Lewisham",
    "Leyton",
    "Leytonstone",
    "London Fields",
    "Maida Vale",
    "Marylebone",
    "Merton",
    "Mile End",
    "Muswell Hill",
    "Newham",
    "Notting Hill",
    "Old Street",
    "Paddington",
    "Peckham",
    "Plaistow",
    "Poplar",
    "Putney",
    "Redbridge",
    "Richmond",
    "Richmond upon Thames",
    "Romford",
    "Rotherhithe",
    "Seven Sisters",
    "Shepherd's Bush",
    "Shoreditch",
    "Soho",
    "South Woodford",
    "Southall",
    "Southwark",
    "Stamford Hill",
    "Stepney",
    "Stratford",
    "Stoke Newington",
    "Sutton",
    "Swiss Cottage",
    "Tooting",
    "Tottenham",
    "Tower Hamlets",
    "Twickenham",
    "Vauxhall",
    "Victoria Park",
    "Wanstead",
    "Wandsworth",
    "Waltham Forest",
    "Walthamstow",
    "Wembley",
    "Westminster",
    "Whitechapel",
    "Wimbledon",
    "Wood Green",
    "Woodford",
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
    label: "Within 3 miles",
    value: "Within 3 miles",
    helper: "Very local",
  },
  {
    label: "Within 5 miles",
    value: "Within 5 miles",
    helper: "Short trip",
  },
  {
    label: "Within 10 miles",
    value: "Within 10 miles",
    helper: "Across town",
  },
  {
    label: "Within 15 miles",
    value: "Within 15 miles",
    helper: "Outer London too",
  },
  {
    label: "Within 25 miles",
    value: "Within 25 miles",
    helper: "Big London radius",
  },
  {
    label: "Anywhere in London",
    value: "Anywhere in London",
    helper: "Open across London",
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
  const [distanceIndex, setDistanceIndex] = useState(2);
  const locationFieldsRef = useRef<HTMLDivElement>(null);
  const citySelectRef = useRef<HTMLSelectElement>(null);

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

  function focusLocationFields() {
    locationFieldsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    citySelectRef.current?.focus({ preventScroll: true });
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
          onClick={focusLocationFields}
          className="mt-4 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
        >
          Choose from list for now
        </button>
      </div>

      <div ref={locationFieldsRef} className="grid gap-4">
        <div className="space-y-1.5">
          <label
            htmlFor="city"
            className="text-sm font-semibold text-foreground"
          >
            City or town
          </label>
          <select
            ref={citySelectRef}
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
              How far would you travel?
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Choose how far you&apos;d usually be open to travelling for
              someone worth meeting. You can update this later.
            </p>
          </div>

          <div className="rounded-2xl bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground">
            {selectedDistance.label}
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

          <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-3">
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
                  {option.helper}
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
