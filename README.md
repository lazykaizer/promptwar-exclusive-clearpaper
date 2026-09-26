# ClearPaper

> Understand what you sign. *Jo likha hai, wahi samjho.*

ClearPaper is a privacy-first web app that helps anyone understand legal documents through plain-language explanations, clause-by-clause risk analysis, obligation extraction, and a grounded document chat.

---

## Quick Start (Local)

```bash
# 1. Clone and install
cd "Legal Assistance/clearpaper"
npm install

# 2. Copy environment variables
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY

# 3. Run the dev server
npm run dev
# Open http://localhost:3000
```

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `GEMINI_API_KEY` | Google AI Studio API key | Yes (unless using Vertex AI) |
| `GEMINI_MODEL` | Model name (default: `gemini-2.5-flash`) | No |
| `GEMINI_MODEL_PRO` | Pro model for compare (default: `gemini-2.5-pro`) | No |
| `GOOGLE_GENAI_USE_VERTEXAI` | Set `true` to use Vertex AI instead of AI Studio | No |
| `GOOGLE_CLOUD_PROJECT` | GCP project ID (required if using Vertex AI) | Conditional |
| `GOOGLE_CLOUD_LOCATION` | GCP region (default: `us-central1`) | No |
| `RATE_LIMIT_PER_MIN` | Requests per IP per minute (default: 20) | No |
| `RATE_LIMIT_PER_HOUR` | Requests per IP per hour (default: 60) | No |

**Get a Gemini API key:** https://aistudio.google.com/

---

## Verify the Build

```bash
npm run typecheck   # TypeScript strict check
npm run lint        # ESLint
npm run test        # Vitest unit tests
npm run build       # Production build
```

---

## Deploy to Google Cloud Run

### Enable GCP APIs

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com
```

### Store the API key in Secret Manager

```bash
echo -n "your_gemini_api_key_here" | gcloud secrets create gemini-api-key --data-file=-
```

### Deploy (AI Studio key)

```bash
gcloud run deploy clearpaper \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --max-instances 5 \
  --timeout 300 \
  --memory 1Gi \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest \
  --set-env-vars GEMINI_MODEL=gemini-2.5-flash
```

### Deploy (Vertex AI variant — recommended for production)

Vertex AI has enterprise data processing terms (prompts are not used to improve Google models).

```bash
# Grant the Cloud Run service account access to Vertex AI
SERVICE_ACCOUNT=$(gcloud run services describe clearpaper --region asia-south1 --format="value(spec.template.spec.serviceAccountName)")
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/aiplatform.user"

# Deploy with Vertex AI config
gcloud run deploy clearpaper \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --max-instances 5 \
  --timeout 300 \
  --memory 1Gi \
  --set-env-vars GOOGLE_GENAI_USE_VERTEXAI=true,GOOGLE_CLOUD_PROJECT=your-project-id,GOOGLE_CLOUD_LOCATION=us-central1,GEMINI_MODEL=gemini-2.5-flash
```

---

## Privacy Note

> **AI Studio** (free tier) may use your prompts to improve Google products.
> **Vertex AI** has enterprise data terms — prompts are not used for model training.
>
> For a public demo with real user documents, **use Vertex AI** or instruct users to try the bundled sample documents.

---

## Architecture

| Path | Description |
|---|---|
| `src/app/` | Next.js App Router pages |
| `src/app/api/` | API routes (extract, analyze, chat, compare, health) |
| `lib/ai/` | AI client, prompts, runner with retry/validation |
| `lib/verify.ts` | Quote verification against document text |
| `lib/extract.ts` | Document extraction (PDF, DOCX, OCR) |
| `lib/schemas.ts` | Zod schemas for all types |
| `store/useStore.ts` | Zustand in-memory session state |
| `components/` | React UI components |
| `samples/` | Sample documents for demo |
| `tests/` | Unit tests (Vitest) |

---

## Decisions

| Decision | Rationale |
|---|---|
| **Gemini Flash as default** | Speed: Flash-class models return results in under 10 seconds, critical for first-impression demo. Pro model used for comparison only. |
| **Zustand over Context/Redux** | Minimal boilerplate, easy "clear session" (just `set()` to defaults), no persistence. |
| **No localStorage for document data** | Privacy by design. Refresh = clean state. |
| **Per-section parallel API calls** | Summary loads first, then clauses/obligations/action run in parallel. Users see something within ~10 seconds. |
| **Server-side quote verification** | Verification runs on the server after model output, before sending to client. Not trusted at face value. |
| **Print API for PDF export** | Avoids heavy PDF library dependency. Opens a new tab with print-optimized HTML. Works everywhere. |
| **Sample documents in /public** | Loaded via fetch() from the browser — no server round-trip, instant demo. |
| **Noto Sans Devanagari** | CSS fallback for Hindi/Marathi output. Loaded from Google Fonts only when needed (lang attribute). |

---

## Known Limitations

- Rate limiting is per-instance (each Cloud Run instance has its own counter). Set `--max-instances 1` for strict limits.
- No PDF generation library — uses browser print for PDF export.
- Scanned document OCR quality depends on image clarity.
- Analysis quality depends on Gemini model version — results may vary.
