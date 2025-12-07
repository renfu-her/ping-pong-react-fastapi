# Ping Pong Game

A modern web-based ping pong game built with React (TypeScript) frontend and FastAPI (Python) backend, featuring real-time gameplay, leaderboard system, and MVC architecture.

## 🎮 Features

- **Real-time Gameplay**: Smooth canvas-based ping pong game with physics simulation
- **Leaderboard System**: Track top 20 game results with winner/loser information
- **Customizable Rounds**: Set target rounds (default: 11) before starting the game
- **Game Rules**: Game ends when the total score of both players equals the target rounds
- **Modern UI**: Retro arcade-style interface with CRT scanline effects
- **RESTful API**: FastAPI backend with MySQL database integration

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling

### Backend
- **FastAPI** (Python 3.13)
- **SQLAlchemy** for ORM
- **MySQL** database
- **uv** for dependency management
- **Gunicorn** with Uvicorn workers for production

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Python 3.13**
- **MySQL** server
- **uv** package manager (`pip install uv` or `curl -LsSf https://astral.sh/uv/install.sh | sh`)

## 🚀 Getting Started

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Configure database in `.env`:**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=ping-pong-game
   ```

4. **Create MySQL database:**
   ```sql
   CREATE DATABASE `ping-pong-game`;
   ```

5. **Install dependencies and sync:**
   ```bash
   uv sync
   ```

6. **Run the backend server:**
   ```bash
   # Development mode
   uv run uvicorn app.main:app --reload

   # Production mode (with gunicorn)
   uv run gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Configure API endpoint (optional):**
   
   Create a `.env.local` file if you need to change the API base URL:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

   The frontend will be available at `http://localhost:3000` (or the port shown in terminal)

## 🏗️ Project Structure

```
ping-pong-react-fastapi/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application entry
│   │   ├── config.py            # Configuration settings
│   │   ├── models/              # SQLAlchemy models
│   │   │   └── game.py
│   │   ├── controllers/         # API controllers
│   │   │   └── game_controller.py
│   │   ├── views/               # Pydantic schemas
│   │   │   └── game_schemas.py
│   │   ├── services/            # Business logic layer
│   │   │   └── game_service.py
│   │   └── database/            # Database connection
│   │       └── connection.py
│   ├── pyproject.toml          # Python dependencies
│   ├── .python-version         # Python version (3.13)
│   └── .env.example            # Environment variables template
│
└── frontend/
    ├── src/
    │   ├── components/          # React components
    │   │   ├── MainMenu.tsx
    │   │   ├── GameEngine.tsx
    │   │   └── Leaderboard.tsx
    │   ├── services/            # API service layer
    │   │   ├── gameService.ts
    │   │   └── geminiService.ts
    │   ├── App.tsx
    │   ├── types.ts
    │   └── constants.ts
    ├── package.json
    └── vite.config.ts
```

## 📡 API Endpoints

### Base URL
```
http://localhost:8000
```

### Endpoints

#### Get Leaderboard
```http
GET /api/games/leaderboard
```

**Response:**
```json
[
  {
    "id": 1,
    "player_name": "Player 1",
    "player_score": 7,
    "cpu_score": 4,
    "winner": "player",
    "target_score": 11,
    "created_at": "2024-01-01T12:00:00"
  }
]
```

#### Create Game Result
```http
POST /api/games
Content-Type: application/json

{
  "player_name": "Player 1",
  "player_score": 7,
  "cpu_score": 4,
  "target_score": 11
}
```

**Response:**
```json
{
  "id": 1,
  "player_name": "Player 1",
  "player_score": 7,
  "cpu_score": 4,
  "winner": "player",
  "target_score": 11,
  "created_at": "2024-01-01T12:00:00"
}
```

## 🎯 Game Rules

1. Set the target rounds (default: 11) before starting
2. Control your paddle with mouse or touch
3. Game ends when the **total score** of both players equals the target rounds
4. The player with the higher score wins
5. Game results are automatically saved to the leaderboard

## 🗄️ Database Schema

### `games` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key, auto-increment |
| `player_name` | VARCHAR(100) | Player name (default: "Player 1") |
| `player_score` | INT | Player's final score |
| `cpu_score` | INT | CPU's final score |
| `winner` | ENUM | 'player' or 'cpu' |
| `target_score` | INT | Target rounds for the game |
| `created_at` | DATETIME | Timestamp of game completion |

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=ping-pong-game
```

### Frontend Environment Variables

Create a `.env.local` file in the `frontend/` directory (optional):

```env
VITE_API_BASE_URL=http://localhost:8000
```

## 🚀 Deployment

### Backend Production

```bash
cd backend
uv run gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend Production

```bash
cd frontend
npm run build
# or
pnpm build
```

The built files will be in the `dist/` directory.

## 📝 Development Notes

- Backend uses **MVC architecture** (Models, Views, Controllers)
- Frontend uses **service layer pattern** for API calls
- Database tables are automatically created on first run
- CORS is configured to allow frontend connections

## 📄 License

This project is open source and available under the MIT License.

