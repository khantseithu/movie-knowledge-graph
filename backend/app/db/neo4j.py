from typing import AsyncGenerator

from neo4j import AsyncGraphDatabase, AsyncDriver, AsyncSession

from app.core.config import settings

driver: AsyncDriver | None = None


async def init_driver() -> AsyncDriver:
    """Initialize the Neo4j async driver."""
    global driver
    driver = AsyncGraphDatabase.driver(
        settings.neo4j_uri,
        auth=(settings.neo4j_user, settings.neo4j_password),
    )
    # Verify connectivity on startup
    await driver.verify_connectivity()
    return driver


async def close_driver() -> None:
    """Close the Neo4j driver."""
    global driver
    if driver:
        await driver.close()
        driver = None


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields a Neo4j async session."""
    if driver is None:
        raise RuntimeError("Neo4j driver not initialized")
    async with driver.session() as session:
        yield session
