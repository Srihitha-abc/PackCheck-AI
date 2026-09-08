# PackCheck AI

AI-assisted Legal Metrology compliance screening for packaged commodities. The system extracts label text, maps declarations to versioned MongoDB rules, and produces a reviewable preliminary compliance result. Final legal decisions remain with authorized officers.

## Stack

- React + Vite frontend
- Node.js + Express + MongoDB backend
- FastAPI OCR service with OpenCV/Pillow and optional PaddleOCR

## Run locally

1. Start MongoDB locally, or set `MONGODB_URI` to a hosted instance.
2. Copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env`.
3. Install dependencies:

```powershell
npm install
npm run install:all
pip install -r ai-service/requirements.txt
```

4. Seed demo users, rules, products, and inspections:

```powershell
npm run seed
```

5. Start the services in separate terminals:

```powershell
npm run dev
uvicorn app.main:app --reload --port 8000
```

The frontend is at `http://localhost:5173`, API at `http://localhost:5000`, and OCR service at `http://localhost:8000`.

Demo credentials: `admin@packcheck.gov.in / Admin@123`, `inspector@packcheck.gov.in / Inspector@123`.

## Architecture

React -> Express REST API -> MongoDB; Express forwards images to FastAPI for OCR quality and text blocks, then runs declaration extraction and the MongoDB-backed compliance rule engine.

OCR falls back to a deterministic local text extraction adapter when the Python service is unavailable, so the inspection workflow remains testable during development. Replace that adapter with PaddleOCR in production and keep legal validation in Node.js.

## Current limitations

Physical font-size measurement is intentionally labelled a potential screening only and requires officer calibration/review. Cloud object storage, production observability, and full PaddleOCR model packaging should be added before deployment.

## Clone-ready setup

### Prerequisites

- Git
- Node.js 18 or newer and npm
- Python 3.10 or newer and pip
- MongoDB 6+ locally, or MongoDB Atlas

Clone the repository, then create environment files.

Windows PowerShell:

```powershell
git clone <repository-url>
cd <project-folder>
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
Copy-Item ai-service/.env.example ai-service/.env
```

macOS/Linux:

```bash
git clone <repository-url>
cd <project-folder>
cp server/.env.example server/.env
cp client/.env.example client/.env
cp ai-service/.env.example ai-service/.env
```

Never commit `.env` files. The backend validates `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, and `AI_SERVICE_URL` at startup and reports missing values clearly.

### Environment variables

`server/.env` requires:

```dotenv
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/packcheck_ai
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
AI_SERVICE_URL=http://127.0.0.1:8000
UPLOAD_DIR=uploads
NODE_ENV=development
```

`client/.env`:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

`ai-service/.env`:

```dotenv
PORT=8000
NODE_BACKEND_URL=http://localhost:5000
```

For Atlas, replace `MONGODB_URI` with your `mongodb+srv://` connection string. Do not commit credentials.

### Install

```bash
npm install
npm run install:all
```

Create a Python virtual environment:

Windows:

```powershell
python -m venv ai-service/venv
ai-service/venv/Scripts/activate
pip install -r ai-service/requirements.txt
```

macOS/Linux:

```bash
python3 -m venv ai-service/venv
source ai-service/venv/bin/activate
pip install -r ai-service/requirements.txt
```

### Database and seed

Start local MongoDB on port `27017`, or configure Atlas in `server/.env`, then run:

```bash
npm run seed
```

The seed command creates development demo data and clears the demo collections first. Demo credentials:

- Admin: `admin@packcheck.gov.in` / `Admin@123`
- Inspector: `inspector@packcheck.gov.in` / `Inspector@123`

### Run services

Use three terminals from the project root.

Backend:

```bash
npm run server
```

AI service, after activating the Python environment:

```bash
uvicorn app.main:app --app-dir ai-service --reload --port 8000
```

Frontend:

```bash
npm run client
```

`npm run dev` starts frontend and backend together. Keeping FastAPI in its own terminal is more portable across operating systems.

Access the application at `http://localhost:5173`. Backend health is at `http://localhost:5000/api/health`; AI health is at `http://localhost:8000/health`; AI docs are at `http://localhost:8000/docs`.

See [QUICKSTART.md](QUICKSTART.md) for the shortest copy-paste setup.

### Project structure

```text
client/        React/Vite frontend
server/        Express API, MongoDB models, routes, rules, and uploads
ai-service/    FastAPI image-quality and OCR service
QUICKSTART.md  Short setup guide
```

Runtime uploads are created automatically under the configured `UPLOAD_DIR`. The root `.gitignore` excludes secrets, dependencies, builds, Python environments, uploads, reports, and logs.

### Troubleshooting

- MongoDB error: verify the local service or Atlas URI, credentials, and network access.
- Missing environment error: copy all `.env.example` files to `.env` and configure them.
- Port conflict: change `PORT`, update `VITE_API_URL`, or pass a different Uvicorn port.
- CORS error: make `CLIENT_URL` match the browser origin exactly.
- Python dependency error: recreate `ai-service/venv` and reinstall requirements.
- AI unavailable: start FastAPI; the backend will report an explicit OCR warning while keeping the workflow available.
- Node module issue: remove `node_modules`, then run `npm install` and `npm run install:all` again.

### Disclaimer

PackCheck AI is an AI-assisted screening and decision-support tool. Final legal findings and enforcement decisions must be made by authorized Legal Metrology officials.
