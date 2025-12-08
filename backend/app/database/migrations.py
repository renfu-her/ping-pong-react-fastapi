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
        alembic_ini_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "alembic.ini")
        alembic_cfg = Config(alembic_ini_path)
        
        # Set database URL from settings
        alembic_cfg.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
        
        logger.info("Running database migrations...")
        
        # Run migrations
        command.upgrade(alembic_cfg, "head")
        
        logger.info("Database migrations completed successfully")
        
    except Exception as e:
        logger.error(f"Failed to run database migrations: {str(e)}")
        # In production, you might want to raise the exception
        # For now, we'll log it and continue
        raise


def check_migrations():
    """Check if migrations are needed without running them"""
    try:
        import os
        alembic_ini_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "alembic.ini")
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

