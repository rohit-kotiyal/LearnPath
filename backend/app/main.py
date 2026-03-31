from fastapi import FastAPI
from app.core.database import engine
from app.routes.auth import router as auth_router
from app.routes.session import router as session_router
from app.routes.message import router as message_router

app = FastAPI()

app.include_router(auth_router)
app.include_router(session_router)
app.include_router(message_router)

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