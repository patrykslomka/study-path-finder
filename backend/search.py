import faiss
import numpy as np
import json
import subprocess

# Load program data
with open("programs.json", "r") as f:
    programs = json.load(f)["programs"]

# Load FAISS index
index = faiss.read_index("programs.index")

def get_embedding(text):
    """
    Generates an embedding using Ollama LLM.
    """
    prompt = f"Generate a numerical embedding for this text: {text}"
    response = subprocess.run(
        ["ollama", "run", "phi", prompt],  # Use 'llama3' if needed
        capture_output=True,
        text=True
    )
    
    # Convert response to vector (dummy example, adjust based on actual output)
    embedding = [float(x) for x in response.stdout.strip().split()]

    return np.array(embedding)

def get_ollama_explanation(query, matched_programs):
    """
    Generates an explanation using Ollama.
    """
    prompt = f"""
    A student wants to find the best study program for: "{query}".
    Here are the top 3 recommended programs:

    1. {matched_programs[0]["name"]}: {matched_programs[0]["description"]}
    2. {matched_programs[1]["name"]}: {matched_programs[1]["description"]}
    3. {matched_programs[2]["name"]}: {matched_programs[2]["description"]}

    Explain why these programs match the student's interest.
    """
    response = subprocess.run(
        ["ollama", "run", "phi", prompt],
        capture_output=True,
        text=True
    )
    return response.stdout.strip()

def search_programs(query):
    """
    Searches the FAISS index for the best matching programs.
    """
    query_vector = np.array(get_embedding(query)).reshape(1, -1)
    D, I = index.search(query_vector, k=3)  # Get top 3 matches

    matched_programs = [programs[i] for i in I[0]]
    explanation = get_ollama_explanation(query, matched_programs)

    return {"programs": matched_programs, "explanation": explanation}
