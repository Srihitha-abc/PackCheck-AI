# PackCheck AI Quick Start

These steps assume Windows PowerShell. Equivalent macOS/Linux commands are included where they differ.

## 1. Clone

```bash
git clone <repository-url>
cd <project-folder>
```

## 2. Configure environment files

Windows PowerShell:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
Copy-Item ai-service/.env.example ai-service/.env
```

macOS/Linux:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
cp ai-service/.env.example ai-service/.env
```

Set a long `JWT_SECRET` in `server/.env`. For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

## 3. Install dependencies

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

## 4. Start MongoDB

Use a local MongoDB service on port `27017`, or set `MONGODB_URI` in `server/.env` to MongoDB Atlas.

## 5. Seed demo data

```bash
npm run seed
```

## 6. Start backend

Terminal 1:

```bash
npm run server
```

## 7. Start AI service

Terminal 2:

Windows PowerShell:

```powershell
ai-service/venv/Scripts/activate
uvicorn app.main:app --app-dir ai-service --reload --port 8000
```

macOS/Linux:

```bash
source ai-service/venv/bin/activate
uvicorn app.main:app --app-dir ai-service --reload --port 8000
```

## 8. Start frontend

Terminal 3:

```bash
npm run client
```

## 9. Open the application

- Frontend: http://localhost:5173
- Backend health: http://localhost:5000/api/health
- AI service health: http://localhost:8000/health
- AI API docs: http://localhost:8000/docs

Demo inspector: `inspector@packcheck.gov.in` / `Inspector@123`

Demo admin: `admin@packcheck.gov.in` / `Admin@123`
