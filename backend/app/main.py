from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routers import (rooms, classes, class_types, class_registrations,
                       addresses, gyms, contracts, sponsors,
                       clients, articles, stocktakings, transactions, subscriptions,
                       equipment, entries,
                       employees, personaltrainings, receptionists, trainers)


@asynccontextmanager
async def lifespan(app: FastAPI):

    try:
        async with engine.begin() as conn:
            print("Successfully connected to the database!")
    except Exception as e:
        print(f"Database connection failed: {e}")

    yield

    print("Shutting down the application...")
    await engine.dispose()


app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rooms.router)
app.include_router(classes.router)
app.include_router(class_types.router)
app.include_router(class_registrations.router)
app.include_router(employees.router)
app.include_router(personaltrainings.router)
app.include_router(receptionists.router)
app.include_router(trainers.router)
app.include_router(subscriptions.router)
app.include_router(equipment.router)
app.include_router(entries.router)
app.include_router(clients.router)
app.include_router(articles.router)
app.include_router(stocktakings.router)
app.include_router(transactions.router)
app.include_router(addresses.router)
app.include_router(gyms.router)
app.include_router(contracts.router)
app.include_router(sponsors.router)


@app.get("/")
async def root():
    return {"message": "Gym API is running"}