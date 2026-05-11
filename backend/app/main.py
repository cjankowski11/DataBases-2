from fastapi import FastAPI
from .database import engine, Base
import asyncio
from .routers import rooms, classes, class_types, class_registrations
from .routers import clients, articles, stocktakings, transactions

app = FastAPI()

app.include_router(rooms.router)
app.include_router(classes.router)
app.include_router(class_types.router)
app.include_router(class_registrations.router)

app.include_router(clients.router)
app.include_router(articles.router)
app.include_router(stocktakings.router)
app.include_router(transactions.router)

@app.on_event("startup")
async def startup():
    try:
        async with engine.begin() as conn:
            print("Successfully connected to the database!")
    except Exception as e:
        print(f"Database connection failed: {e}")

@app.get("/")
async def root():
    return {"message": "Gym API is running"}