# 📚 STUDY-PATH-FINDER @ Tilburg University

A web tool to help prospective students find the perfect Bachelor's program at Tilburg University based on their interests and goals. Built with Next.js, TypeScript, and powered by AI (llama3.2 via Ollama).

## ✨ Features
- **Guided Search**: Step-by-step questions to match programs based on interests, career goals, and skills.
- **Freeform Search**: Text-based search with AI explanations for recommendations.
- **Responsive UI**: Modern design with Shadcn/UI and Framer Motion animations.

## 🚀 Getting Started

### Prerequisites
- Node.js (18.x+)
- Ollama (for `llama3.2:3b-instruct-q4_0`)
- Git

### Installation
1. Clone the repo:
   ```bash
   git clone https://github.com/your-username/study-path-finder.git
   cd study-path-finder
2. Install dependencies:
   ```bash
   npm install
3. Set up Ollama:
- Install Ollama (ollama.ai)
- Pull the model: ollama pull llama3.2:3b-instruct-q4_0
- Start the server: ollama serve
4. Create .env.local:
  ```bash
  OLLAMA_HOST=http://localhost:11434
  
### Running
1. Start the dev server:
  ```bash
npm run dev
```
- Access at http://localhost:3000.
2. Ensure Ollama is running for freeform search.

## 🖥️ Usage
- **Guided Search**: Answer questions to get tailored program recommendations.
- **Freeform Search**: Enter your interests (e.g., "I want to learn about people management") to get recommendations with AI explanations.
