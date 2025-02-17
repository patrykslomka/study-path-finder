import json
import faiss
import numpy as np
import subprocess

# Load programs.json
with open("programs.json", "r") as f:
    data = json.load(f)["programs"]

def get_embedding(text):
    """
    Generates an embedding using the smaller Phi model.
    """
    response = subprocess.run(
        ["ollama", "run", "phi", "--text", text],  # Using the smaller Phi model
        capture_output=True,
        text=True
    )
    
    # Convert response to a vector (dummy example, adjust as needed)
    embedding = [float(x) for x in response.stdout.strip().split()]
    
    return np.array(embedding)

# Generate embeddings for each program description
program_descriptions = [program["description"] for program in data]
program_vectors = np.array([get_embedding(desc) for desc in program_descriptions])

# Initialize FAISS index
index = faiss.IndexFlatL2(program_vectors.shape[1])
index.add(program_vectors)
faiss.write_index(index, "programs.index")  # Save FAISS index

print("✅ FAISS index created successfully with Ollama embeddings!")
