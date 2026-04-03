# sug_backend

Express API with SQLite (`better-sqlite3`) for visitor fingerprints, signals, and personalization.

## Requirements

- Node.js 20+ (22 recommended)
- npm

## Setup

```bash
npm install
```

Optional: copy `env.example` to `.env` and adjust values.

| Variable       | Default   | Description                    |
|----------------|-----------|--------------------------------|
| `PORT`         | `3000`    | HTTP port                      |
| `DB_PATH`      | `./sug.db`| SQLite database file path      |
| `API_VERSION`  | `v1`      | URL segment for `/api/{version}` |
| `RULE_VERSION` | `1.0`    | Rule / personalization version |

## Run

**Development (recommended):** loads `src/index.ts`, opens the DB, starts the server.

```bash
npm run dev
```

**Alternative:** runs `src/app.ts` directly (no `listen` in that file unless you add it—use `dev` for a full server).

```bash
npm start
```

Typecheck:

```bash
npx tsc --noEmit
```

## API endpoints

Base path uses `API_VERSION` (default **`v1`**): `/api/v1/...`

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/health` | Plain `OK` |
| `POST` | `/api/v1/visitors/signals` | Submit a signal; resolves or creates visitor by fingerprint |
| `GET`  | `/api/v1/visitors/:visitorId/personalization` | Personalization payload for a visitor |

## Database (SQLite)

Single file at `DB_PATH` (default **`./sug.db`**). Schema is applied on first `getDb()` (WAL mode, foreign keys on).

### `visitors`

| Column            | Type    | Notes |
|-------------------|---------|--------|
| `id`              | TEXT    | Primary key, UUID v4 default |
| `created_at`      | TEXT    | Not null |
| `fingerprint_hash`| TEXT    | Not null |
| `last_seen_at`    | TEXT    | Not null |
| `visit_count`     | INTEGER | Not null |
| `segment`         | TEXT    | Not null, default `'default'` |

Index: `idx_visitors_fingerprint_hash` on `fingerprint_hash`.

### `visitor_signals`

| Column           | Type | Notes |
|------------------|------|--------|
| `id`             | TEXT | PK, UUID v4 default |
| `created_at`     | TEXT | Not null |
| `visitor_id`     | TEXT | FK → `visitors(id)` ON DELETE CASCADE |
| `utm_source` …   | TEXT | Optional UTM / referrer fields |
| `user_agent`     | TEXT | Optional |
| `language`       | TEXT | Optional |
| `raw_payload`    | TEXT | Not null |

Index: `idx_visitor_signals_visitor_id` on `visitor_id`.

### `personalizations`

| Column         | Type | Notes |
|----------------|------|--------|
| `id`           | TEXT | PK, UUID v4 default |
| `created_at`   | TEXT | Not null |
| `visitor_id`   | TEXT | FK → `visitors(id)` ON DELETE CASCADE |
| `signal_id`    | TEXT | FK → `visitor_signals(id)` ON DELETE CASCADE |
| `variant_key`  | TEXT | Not null |
| `rule_version` | TEXT | Not null |

Index: `idx_personalizations_visitor_id` on `visitor_id`.

## Curl requests

Replace `localhost:3000` if you use another `PORT`. Use a real `visitor_id` from the signals response for the GET example.

**POST** `/api/v1/visitors/signals` — create/update visitor by fingerprint and record a signal:

```bash
curl -s -X POST "http://localhost:3000/api/v1/visitors/signals" \
  -H "Content-Type: application/json" \
  -d '{
  "signal": {
    "utm_source": "google"
    "utm_campaign": "sports,pickleball",
    "utm_medium": "ppc",
    "referrer_domain": "google.com",
    "referrer_path": "/query",
    "landing_path": "/sports",
    "language": "en"
  }
}'
```

curl request body can be updated to other data of your choosing (education, social, etc) see /src/utils/parser.util.ts for built out items

**GET** `/api/v1/visitors/:visitorId/personalization` — personalization for an existing visitor:

```bash
curl -s "http://localhost:3000/api/v1/visitors/{VISITOR_ID}/personalization"
```

(Substitute `VISITOR_ID` with the `visitor_id` returned by the POST above.)