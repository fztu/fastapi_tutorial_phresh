from typing import Callable
from fastapi import FastAPI

from app.db.tasks import connect_to_db, close_db_connection 

def create_start_app_handler(app: FastAPI) -> Callable:
    """
    Creates a handler that will be called when the application starts.
    """
    async def start_app() -> None:
        await connect_to_db(app)
    return start_app

def create_stop_app_handler(app: FastAPI) -> Callable:
    """
    Creates a handler that will be called when the application stops.
    """
    async def stop_app() -> None:
        await close_db_connection(app)
    return stop_app