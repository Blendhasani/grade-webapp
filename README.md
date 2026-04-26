# Student Grade Analyzer (Web)

Haskell (Scotty) backend with a small HTML/CSS/ JavaScript front end for viewing and working with student grade data.

## Project layout

- `app/Main.hs` — HTTP server, static file middleware, route registration
- `src/Routes/` — REST-style API areas (records, filters, report)
- `src/Types.hs` — shared data types and JSON encoding
- `static/` — `index.html`, `css/`, `js/`

## How to run

1. Install [GHC and Cabal](https://www.haskell.org/ghcup/) (GHCup is recommended).
2. In the project directory: `cabal run`
3. Open <http://localhost:3000> in a browser

Session data is kept in memory and is not persisted after the server stops.
