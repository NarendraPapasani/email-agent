# 📧 AgentInbox - AI-Powered Email Productivity Agent

An intelligent email management system that automatically categorizes emails, extracts action items, and generates smart reply drafts using **Groq (Llama 3.3)**.

## 🚀 Features

- **Mobile-First Design**: Fully responsive interface with a dedicated mobile layout, full-screen reading pane, and modal-based AI chat.
- **Smart Email Categorization**: Automatically categorizes emails (Important, Urgent, Spam, Newsletter, etc.)
- **Action Item Extraction**: AI identifies tasks and deadlines from email content
- **Smart Reply Generation**: Generate professional email responses with one click
- **Customizable AI Prompts**: Configure how the AI analyzes and responds to your emails
- **Real-time Analysis**: Live "Analyzing..." status with smooth UI transitions
- **Responsive Design**: Beautiful Gmail-like interface that works on mobile and desktop
- **AI Chat Assistant**: Chat with your emails to ask questions and get insights

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS v4, Shadcn UI
- **Backend**: Node.js, Express, Prisma ORM, MySQL (TiDB)
- **AI**: Groq (Llama 3.3-70b-versatile)

## 📋 Setup Instructions

### Prerequisites

- Node.js (v18+)
- MySQL (v8+)
- Groq API Key

### 1. Clone the Repository

```bash
git clone https://github.com/NarendraPapasani/email-agent.git
cd email-agent
```

### 2. Database Setup

Create a MySQL database named `email_agent_db`.

```bash
mysql -u root -p
CREATE DATABASE email_agent_db;
EXIT;
```

### 3. Backend Configuration

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Update .env with your credentials:
# DATABASE_URL="mysql://root:password@localhost:3306/email_agent_db"
# GROQ_API_KEY="your_groq_api_key"
# PORT=7000
```

### 4. Frontend Configuration

```bash
cd ../frontend
npm install

# Create .env file
# VITE_API_BASE_URL="http://localhost:7000/api"
```

## 🚀 How to Run the UI and Backend

You need to run both the backend and frontend servers.

**1. Start the Backend:**

```bash
cd backend
npx prisma migrate dev --name init  # Run migrations
npm run dev
```

The backend will start on `http://localhost:7000`.

**2. Start the Frontend:**

```bash
cd frontend
npm run dev
```

The UI will be accessible at `http://localhost:5173`.

## 📥 How to Load the Mock Inbox

The application comes with a seed script to populate the database with realistic mock emails for testing.

To load the mock inbox:

```bash
cd backend
node prisma/seed.js
```

_Note: This will clear existing data and load 20 sample emails with detailed content._

## ⚙️ How to Configure Prompts

You can customize how the AI analyzes emails and generates replies directly from the UI.

1. Click the **Settings (Gear Icon)** in the top header.
2. You will see three configuration areas:
   - **Categorization Prompt**: Define rules for how emails are labeled (e.g., "Mark emails with 'invoice' as Finance").
   - **Action Item Prompt**: Define how tasks should be extracted.
   - **Auto-Reply Prompt**: Set the tone and style for generated drafts.
3. Edit the text and click **"Save & Re-analyze"**.
4. The system will re-process emails based on your new rules.

## 💡 Usage Examples

### 1. Analyzing Emails

- When you open the app, click the **"Analyze Emails"** (Refresh) button in the header.
- The AI will process unanalyzed emails, assigning categories and summaries.

### 2. Viewing Action Items

- Click on an email to open the reading pane.
- Look for the **"Action Items"** section below the email body.
- You'll see extracted tasks with checkboxes and deadlines.

### 3. Generating Smart Replies

- In the reading pane, click the **"Auto Draft"** button.
- The AI will generate a context-aware reply based on the email content.
- You can edit the draft before sending (sending functionality is a future feature).

### 4. Chatting with your Email (AI Assistant)

- Use the **AI Chat** sidebar on the right.
- Ask questions like:
  - "What is the deadline mentioned?"
  - "Summarize this email in 3 bullets."
  - "Is this urgent?"
- The AI answers based on the specific email context.

## 📡 API Endpoints

- `GET /api/emails` - List all emails
- `POST /api/emails/ingest` - Trigger AI analysis
- `POST /api/emails/:id/chat` - Chat with email context
- `POST /api/emails/reanalyze` - Re-run analysis on all emails
- `POST /api/emails/:id/generate-draft` - Generate reply draft

## 📄 License

MIT
