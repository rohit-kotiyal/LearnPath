from fastapi import FastAPI
from app.core.database import engine
from app.routes.auth import router as auth_router


app = FastAPI()

app.include_router(auth_router)

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