# 📚 STUDY-PATH-FINDER @ Tilburg University

A web tool to help prospective students find the perfect Bachelor's program at Tilburg University based on their interests and goals. Built with Next.js, TypeScript, and powered by AI (llama3.2 via Ollama).

## ✨ Features
- **Guided Search**: Step-by-step questions to match programs based on interests, career goals, and skills.
- **Freeform Search**: Text-based search with AI explanations for recommendations.
- **Responsive UI**: Modern design with Shadcn/UI and Framer Motion animations.

## 🚀 Getting Started

### Prerequisites
- Node.js (18.x+)
- Anthropic API key (for Claude 3 Haiku)
- Git

### Installation
1. Clone the repo:
   ```bash
   git clone https://github.com/patrykslomka/study-path-finder.git
   cd study-path-finder
2. Install dependencies:
   ```bash
   npm install
3. Set up Anthropic API:
- Sign up at Anthropic and obtain an API key.
- Create a .env.local file in the root directory:
  ```bash
  ANTHROPIC_API_KEY=your-api-key-here
  ```
4. Ensure the API key is valid and has access to Claude 3 Haiku.

### Running
1. Start the dev server:
  ```bash
npm run dev
```
- Access at http://localhost:3000.
2. Verify the API key is correctly configured for freeform search functionality.

## 🖥️ Usage
- **Guided Search**: Answer questions to get tailored program recommendations.
- **Freeform Search**: Enter your interests (e.g., "I want to learn about people management") to get recommendations with detailed AI explanations.
