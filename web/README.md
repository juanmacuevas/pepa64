# pepa64 pilot

This subproject contains the browser prototype for the pepa64 listening study.
It is built on vinext and uses Sites-managed D1 and R2 bindings.

## What it does

- lets a participant join with a language profile
- records short random digit strings to microphone audio
- assigns recordings to other participants for blind transcription
- stores responses, timings, and active-study audio in D1 and R2
- supports export and withdrawal from the browser

## Prerequisites

- Node.js `>=22.13.0`

## Local development

```bash
npm ci
npm run db:local
npm run dev
```

The app expects the Sites-managed D1 and R2 bindings declared in
`web/.openai/hosting.json`. Local development uses `wrangler` to apply the
initial migration to the local D1 database.

## Data and consent

Participant audio is not covered by the repository license. The operational data
policy is in [docs/DATA_POLICY.md](../docs/DATA_POLICY.md) and the study
protocol is in [docs/EXPERIMENT.md](../docs/EXPERIMENT.md).

## Useful commands

- `npm run dev`: start local development
- `npm run build`: verify the production build
- `npm test`: run the core converter tests
- `npm run test:api`: run the API test suite
- `npm run typecheck`: run TypeScript validation
