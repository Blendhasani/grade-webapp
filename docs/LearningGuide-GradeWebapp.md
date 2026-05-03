# Learning the Student Grade Analyzer (grade-webapp)

A practical order to learn this repository, from the simplest mental model to the deeper pieces.

---

## 1. What the app is (one minute)

- A small web server (library: **Scotty**) listens on **port 3000**.
- It serves **static files** from `static/` (HTML, CSS, JS) and exposes **JSON APIs** under `/api/...`.
- **All grade rows live in memory** in a single `IORef [GradeRecord]` created in `app/Main.hs`. Restarting the server clears them (unless you reload from `SampleData` again at startup).

So: **browser ↔ HTTP ↔ Haskell routes ↔ shared `IORef` + pure functions**.

---

## 2. Project layout (read these names once)

| Path | Role |
|------|------|
| `student-grade-analyzer-web.cabal` | Package name, modules, dependencies, executable entry |
| `app/Main.hs` | **Entry point**: create `IORef`, start Scotty, mount routes, static middleware |
| `src/Types.hs` | **Data model**: `Student`, `Subject`, `GradeRecord`, `ClassReport`, JSON instances |
| `src/SampleData.hs` | Starting list of `GradeRecord`s |
| `src/Analyzer.hs` | **Domain logic** on lists: pass/fail, filters, averages, `categorizeGrade` |
| `src/Report.hs` | Builds `ClassReport` from records using `Analyzer` |
| `src/Routes/*.hs` | **HTTP layer**: URL paths, status codes, JSON in/out |
| `src/Routes/JsonRows.hs` | Shapes JSON rows (e.g. adds `category` for the table) |
| `static/` | **Frontend**: `index.html`, `css/app.css`, `js/*.js` |

Start with **cabal** + **Main** + **Types**; everything else hangs off those.

---

## 3. Start here (simplest reading order)

### Step A — `app/Main.hs`

See how the program boots: `newIORef initialRecords`, `scotty 3000`, `static` middleware, `get "/"` → `index.html`, then three `mount*Routes` with the **same** `IORef`. That’s the whole architecture in one file.

### Step B — `src/Types.hs`

Understand what a “grade row” **is** (`GradeRecord`), what JSON field names look like, and how `Subject` / `GradeCategory` are defined. Every route and the frontend ultimately speak this shape.

### Step C — `static/index.html` + one JS file

Open `index.html` and follow: which buttons call which global functions (`loadAll`, `addRecord`, …), and which elements hold the table (`#tableBody`). Then read **`static/js/filters.js`** as the driver for loading `/api/records` (and related URLs) and filling the table. That ties the UI to the backend URLs.

### Step D — `src/Routes/Records.hs`

Smallest complete “vertical slice”: `GET`/`POST /api/records`, validation, `IORef` read/write. This is the pattern other route modules copy: **read state → call pure helpers → write state → `json`**.

### Step E — `src/Routes/Filters.hs` and `src/Routes/Report.hs`

Same idea: read `IORef`, call `Analyzer` / `Report`, return JSON. Notice **no business rules** duplicated: thresholds and averages stay in `Analyzer` / `Report`.

### Step F — `src/Analyzer.hs` and `src/Report.hs`

This is where **list functions** live (`filter`, aggregates, categorization). Good place to connect to coursework (lists, guards, simple numeric rules).

### Step G — `src/Routes/JsonRows.hs`

Small but important: how the server **adds** `category` to each row for the UI while keeping POST bodies as plain `GradeRecord`.

---

## 4. Concepts to learn in parallel (not specific to this repo)

- **HTTP basics**: GET vs POST, JSON body, status 400 vs 200.
- **Scotty at a skim level**: `ScottyM`, `ActionM`, `get`, `post`, `json`, `jsonData`, `liftIO`, `pathParam`.
- **`IORef`**: shared mutable state in one process (fine for a class project; not how you’d build a big production service).

---

## 5. A good “first exercise”

Trace **one user action** end-to-end, on paper or in the editor:

1. Click **“Show All Records”** → `filters.js` → `GET /api/records`
2. `Routes/Records.hs` → `liftAndRead` → `map gradeRecordRow`
3. Browser gets JSON → table rows (including `category`)

Then trace **“Add Record”**: `records.js` → `POST /api/records` → validation → `addGradeRecord` → `writeIORef` → refresh hook → stats + table.

---

## 6. Where not to start

- Don’t start inside `dist-newstyle/` (build output).
- Ignore duplicate path spellings like `static\js` vs `static/js` on disk—it’s the same tree on Windows.

---

*Generated for the grade-webapp project.*
