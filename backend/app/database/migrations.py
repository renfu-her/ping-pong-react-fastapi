"""
Database migration utilities
Automatically runs migrations on application startup
"""
import logging
from alembic import command
from alembic.config import Config
from app.config import settings
from app.database.connection import engine

logger = logging.getLogger(__name__)


def run_migrations():
    """Run database migrations automatically"""
    try:
        import os
        # Get Alembic configuration (alembic.ini is in the backend directory)
        # __file__ is in app/database/migrations.py, so we need to go up 2 levels to backend/
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        alembic_ini_path = os.path.join(backend_dir, "alembic.ini")
        
        # Check if alembic.ini exists
        if not os.path.exists(alembic_ini_path):
            logger.warning(f"Alembic config not found at {alembic_ini_path}, skipping migrations")
            return False
        
        # Check if alembic/versions directory exists
        alembic_versions_dir = os.path.join(backend_dir, "alembic", "versions")
        if not os.path.exists(alembic_versions_dir):
            logger.warning(f"Alembic versions directory not found at {alembic_versions_dir}, skipping migrations")
            return False
        
        alembic_cfg = Config(alembic_ini_path)
        
        # Set database URL from settings
        alembic_cfg.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
        
        logger.info("Running database migrations...")
        
        # Check if there are any migrations to run
        try:
            from alembic.script import ScriptDirectory
            script = ScriptDirectory.from_config(alembic_cfg)
            head_rev = script.get_current_head()
            if head_rev is None:
                logger.warning("No migrations found, skipping")
                return False
        except Exception as e:
            logger.warning(f"Could not check migration status: {str(e)}, skipping migrations")
            return False
        
        # Run migrations
        command.upgrade(alembic_cfg, "head")
        
        logger.info("Database migrations completed successfully")
        return True
        
    except FileNotFoundError as e:
        logger.warning(f"Alembic files not found: {str(e)}, skipping migrations")
        return False
    except Exception as e:
        logger.error(f"Failed to run database migrations: {str(e)}")
        # Don't raise, just return False so app can continue
        return False


def check_migrations():
    """Check if migrations are needed without running them"""
    try:
        import os
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        alembic_ini_path = os.path.join(backend_dir, "alembic.ini")
        alembic_cfg = Config(alembic_ini_path)
        alembic_cfg.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
        
        # Get current revision
        with engine.connect() as connection:
            from alembic.runtime.migration import MigrationContext
            context = MigrationContext.configure(connection)
            current_rev = context.get_current_revision()
            
            # Get head revision
            from alembic.script import ScriptDirectory
            script = ScriptDirectory.from_config(alembic_cfg)
            head_rev = script.get_current_head()
            
            return current_rev != head_rev
            
    except Exception as e:
        logger.warning(f"Could not check migration status: {str(e)}")
        return True  # Assume migrations are needed if check fails

