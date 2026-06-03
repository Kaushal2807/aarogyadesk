from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# ------------------------------------------------------------------ #
#  SQLAlchemy engine tuned for Neon Serverless + PgBouncer pooler.   #
#  - pool_size=2 / max_overflow=5: stays within Neon free-tier       #
#    connection limits on the pooler.                                 #
#  - pool_recycle=300: recycle connections every 5 min so stale      #
#    TCP sockets are shed before Neon can close them server-side.     #
#  - pool_pre_ping=True: validate connection before handing it out   #
#    (catches silently dropped connections from the pooler).          #
#  - connect_timeout=10: fail fast on cold compute rather than       #
#    blocking a request thread for 30+ seconds.                       #
# ------------------------------------------------------------------ #
engine = create_engine(
    settings.database_url,
    echo=settings.debug,
    pool_pre_ping=True,
    pool_size=2,
    max_overflow=5,
    pool_recycle=300,
    connect_args={"connect_timeout": 10},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

