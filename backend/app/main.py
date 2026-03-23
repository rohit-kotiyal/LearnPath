from fastapi import FastAPI
from app.database import engine

app = FastAPI()


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