# NAWAB-AI

This is the foundational setup for the NAWAB-AI project, a sophisticated medical AI system powered by AI agents and a Retrieval-Augmented Generation (RAG) system.

## Project Structure

- `app/`: Next.js App Router, contains all pages and API routes.
- `components/`: Shared React components.
- `lib/`: Core logic, services, and utilities.
  - `agents/`: AI agent implementations.
  - `firebase/`: Firebase configuration and services.
  - `rag/`: RAG system implementation.
  - `encryption/`: Data encryption services.
- `types/`: TypeScript type definitions for the entire application.
- `utils/`: Helper functions.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Create a `.env.local` file based on `.env.example`.
   - Fill in your Firebase, Claude, Pinecone, and OpenAI API keys.

3. **Run the development server:**
   ```bash
   npm run dev
   ```

This project is ready for the implementation of the AI agents and the user-facing assessment and results pages as per the defined 10-task plan.