# Change Log

## 2025-12-08 14:42:42

### Fixed .env File Loading Issue

#### Backend Fix:
- **app/config.py**: 
  - Fixed `.env` file loading to use absolute path from backend directory
  - Added explicit path resolution using `Path(__file__).parent.parent`
  - Added logging to confirm .env file location and loading status
  - Added fallback to load from current directory if .env not found at expected location
  - Added database configuration logging (without password) for debugging

#### Changes:
- `.env` file is now loaded from `backend/.env` using absolute path
- Logs will show where .env file was loaded from
- Logs will show database configuration on startup (for debugging)
- Prevents connection to wrong database due to .env not being loaded

---

## 2025-12-08 14:40:02

### Fixed Gunicorn Worker Boot Failure

#### Backend Fix:
- **app/main.py**: 
  - Moved migration execution to FastAPI startup event (better practice)
  - Improved error handling to prevent app crash if migrations fail
  - Migration failures no longer prevent application startup
- **app/database/migrations.py**: 
  - Added file existence checks before running migrations
  - Added check for alembic.ini and alembic/versions directory
  - Returns False instead of raising exceptions on failure
  - Gracefully handles missing Alembic setup (for first-time deployment)

#### Changes:
- Migration execution now happens in `@app.on_event("startup")` instead of module level
- If Alembic files don't exist, app will use `create_all()` as fallback
- Application will start even if migrations fail (errors are logged but don't crash the app)

---

## 2025-12-08 14:34:41

### Added Automatic Database Migration System

#### Backend Changes:
- **pyproject.toml**: 
  - Added `alembic>=1.13.0` dependency for database migrations
- **alembic.ini**: 
  - Created Alembic configuration file
  - Configured to use database URL from settings
- **alembic/env.py**: 
  - Created Alembic environment configuration
  - Automatically imports all models for migration detection
  - Uses database URL from app settings
- **alembic/script.py.mako**: 
  - Created migration script template
- **app/database/migrations.py**: 
  - Created automatic migration utility
  - `run_migrations()` function automatically runs migrations on startup
  - `check_migrations()` function checks if migrations are needed
- **app/main.py**: 
  - Modified to run automatic migrations on application startup
  - Falls back to `create_all()` if migrations fail (for development)
- **app/models/__init__.py**: 
  - Updated to import all models for Alembic detection

#### Features:
- Database migrations now run automatically when the application starts
- No manual migration commands needed in production
- Safe fallback to `create_all()` if migrations fail
- All model changes are tracked through Alembic migrations

#### Initial Setup:
To initialize Alembic for the first time, run:
```bash
cd backend
uv run alembic revision --autogenerate -m "Initial migration"
uv run alembic upgrade head
```

---

## 2025-12-08 12:14:59

### Fixed Backend API Validator

#### Backend Fix:
- **game_schemas.py**: 
  - Fixed `field_validator` implementation to use correct Pydantic v2 syntax
  - Removed `mode='before'` parameter (not needed in Pydantic v2)
  - Validator now correctly cleans and validates player names
  - Tested and confirmed working correctly

---

## 2025-12-08 12:10:26

### Backend API Improvements for Player Name

#### Backend API Enhancements:
- **game_schemas.py**: 
  - Added `field_validator` for `player_name` to validate and clean player names
  - Automatically trims whitespace from player names
  - Ensures player name is not empty (defaults to "Player 1" if empty)
  - Limits player name to 100 characters (database limit)
- **game_service.py**: 
  - Added additional validation and cleaning logic for player_name
  - Double-checks name is not empty before saving
  - Ensures name length doesn't exceed database limit
- **game_controller.py**: 
  - Updated API documentation to clarify player_name handling
  - Added detailed docstring explaining player_name behavior

---

## 2025-12-08 12:08:40

### Added Player Name Feature

#### Frontend Changes:
- **App.tsx**: Added `playerName` state management to track player name across screens
- **MainMenu.tsx**: 
  - Added player name input field with validation
  - Added `handleNameChange` function to update player name
  - Added `handleStartGame` function to ensure player name is not empty before starting game
  - Updated UI to include name input field above rounds selector
- **GameEngine.tsx**: 
  - Added `playerName` prop to receive player name from parent
  - Updated `saveScore` function to use provided player name instead of hardcoded "Player 1"
- **Leaderboard.tsx**: 
  - Added "Player" column to display player names in the leaderboard table
  - Updated table headers to include player name column

#### Backend (Initial Implementation):
- Backend API already supports `player_name` field in GameCreate schema
- API endpoint `/api/games` accepts `player_name` parameter
- API endpoint `/api/games/leaderboard` returns `player_name` in response

#### Features:
- Players can now enter their name before starting a game
- Player name is saved with game results
- Leaderboard displays player names for each game record
- Default name "Player 1" is used if no name is provided

