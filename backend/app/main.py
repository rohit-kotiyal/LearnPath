from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine
from app.routes.auth import router as auth_router
from app.routes.session import router as session_router
from app.routes.message import router as message_router
from app.websocket.socket import router as ws_router


app = FastAPI()


origins = [
    "http://localhost:5173",  # Vite frontend
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, PUT, DELETE
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(session_router)
app.include_router(message_router)
app.include_router(ws_router)


@app.get("/")
def health():
    return {"message": "FastAPI is working"}


@app.get("/test_db")
def test_db():
    try:
        conn = engine.connect()
        conn.close()
        return {"message": "Connection successfull with Database..!"}
    except:
        return {"message": "Connection Failed"}