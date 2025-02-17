from fastapi import FastAPI
from fastapi.responses import FileResponse
from search import search_programs

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Study Path Finder API"}

@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return FileResponse("../app/favicon.ico")

@app.get("/search")
async def search(query: str):
    """
    API endpoint to search for study programs using Ollama-powered embeddings.
    """
    return search_programs(query)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
