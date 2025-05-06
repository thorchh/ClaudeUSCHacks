# 🧠 BrainstormAI

BrainstormAI is an advanced AI-powered workflow system that transforms raw ideas into structured, validated concepts with actionable implementation plans. Perfect for entrepreneurs, product teams, innovation departments, and creative professionals looking to rapidly validate and expand ideas with AI-powered intelligence.

## 🚀 Key Features

- **Idea Intake & AI-Powered Expansion**: Submit initial ideas which are then expanded and refined by AI.
- **AI-Driven Feasibility Validation**: Automated scoring and visualization of an idea's technical, market, and financial viability.
- **Multi-Agent System Analysis**: Employs specialized AI agents that provide diverse perspectives, including market research, feature brainstorming, and contrarian viewpoints.
- **Cross-Industry Innovation**: AI enhances ideas by drawing analogies and insights from different industries to foster unique solutions during refinement stages.
- **In-depth Market & Competitive Research**: AI conducts real-time research, integrating competitive intelligence, market data, and trend analysis.
- **Structured AI Agent Debate**: AI agents engage in structured debates to explore the pros and cons of various aspects of the idea, with visualizations of the debate flow.
- **MVP Roadmap Generation**: AI assists in prioritizing features and generating actionable MVP (Minimum Viable Product) roadmaps.
- **Iterative & Interactive Refinement**: Users can review AI outputs at each stage, provide feedback, and guide the AI for iterative development of the concept.
- **Comprehensive Final Reporting**: Generates a detailed report summarizing all phases, including analyses, visualizations, and actionable plans.

## 🖥️ Project Structure

- `frontend/` – Next.js 14 app (React, Tailwind CSS)
- `backend/` – Python Flask API (Anthropic Claude integration)

## 🛠️ How to Run

### 1. Backend (Flask + Anthropic)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Set your Anthropic API key in brainstorm1.py or as an environment variable
python brainstorm1.py
```

The backend will start on http://127.0.0.1:5000

### 2. Frontend (Next.js)

```bash
cd frontend
pnpm install # or npm install
pnpm dev     # or npm run dev
```

The frontend will start on http://localhost:3000

> **Note:** The frontend expects the backend to be running at `http://127.0.0.1:5000` by default. You can change this in your environment variables if needed.

## 🤝 Collaboration

Contributions, ideas, and feedback are welcome! If you'd like to collaborate, please open an issue or submit a pull request.

## 📄 License

MIT
