# 📧 AgentInbox - AI-Powered Email Productivity Agent

An intelligent email management system that automatically categorizes emails, extracts action items, and generates smart reply drafts using Google's Gemini AI.

## 🚀 Features

- **Smart Email Categorization**: Automatically categorizes emails (Important, Urgent, Spam, Newsletter, etc.)
- **Action Item Extraction**: AI identifies tasks and deadlines from email content
- **Smart Reply Generation**: Generate professional email responses with one click
- **Customizable AI Prompts**: Configure how the AI analyzes and responds to your emails
- **Real-time Analysis**: Live "Analyzing..." status with smooth UI transitions
- **Responsive Design**: Beautiful Gmail-like interface that works on mobile and desktop

## 🛠️ Tech Stack

### Frontend

- **React** (Vite)
- **Tailwind CSS** (v4)
- **Shadcn UI** - Component library
- **Lucide React** - Icons
- **Axios** - API client
- **Sonner** - Toast notifications

### Backend

- **Node.js** + **Express**
- **Prisma** (v5) - ORM
- **MySQL** - Database
- **Google Gemini AI** - AI processing
- **Dotenv** - Environment management

## 📁 Project Structure

```
Email Prod/
├── backend/
│   ├── controllers/
│   │   └── email.controller.js
│   ├── routes/
│   │   └── email.routes.js
│   ├── utils/
│   │   ├── genAI.js
│   │   ├── mockEmails.js
│   │   └── prisma.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── migrations/
│   ├── app.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── EmailList.jsx
│   │   │   ├── EmailReadingPane.jsx
│   │   │   ├── SettingsModal.jsx
│   │   │   └── ui/ (Shadcn components)
│   │   ├── lib/
│   │   │   ├── api.js
│   │   │   ├── helpers.js
│   │   │   └── utils.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── .env
└── README.md
```

## 🔧 Setup Instructions

### Prerequisites

- Node.js (v18+)
- MySQL (v8+)
- Google Gemini API Key

### 1. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE email_agent_db;
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Create .env file with:
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/email_agent_db"
GEMINI_API_KEY="your_gemini_api_key_here"
PORT=8000

# Run Prisma migrations
npx prisma migrate dev --name init

# Seed the database with mock data
node prisma/seed.js

# Start the server
npm run dev
```

Server will run at: `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
# .env file (already configured):
VITE_API_URL=http://localhost:8000/api

# Start the development server
npm run dev
```

Frontend will run at: `http://localhost:5173`

## 📡 API Endpoints

### Email Endpoints

- `GET /api/emails` - Get all emails with analysis
- `GET /api/emails/:id` - Get single email by ID
- `POST /api/emails/ingest` - Trigger AI analysis for unprocessed emails
- `POST /api/emails/:id/generate-draft` - Generate reply draft
- `POST /api/emails/:id/regenerate-draft` - Regenerate reply draft

### Prompt Endpoints

- `GET /api/prompts` - Get all AI prompts
- `POST /api/prompts/update` - Update AI prompts configuration

## 🎯 Usage

1. **Start Both Servers**

   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

2. **Open the App**

   - Navigate to `http://localhost:5173`

3. **Sync Emails**

   - Click the "Sync Emails" button in the sidebar
   - Watch as AI analyzes emails in real-time

4. **Read & Respond**

   - Click on any email to read
   - View AI-generated summary and action items
   - Generate smart reply drafts

5. **Customize AI Behavior**
   - Click "Settings" in sidebar
   - Configure categorization rules
   - Define action item extraction logic
   - Set auto-reply persona

## 🗄️ Database Schema

```prisma
model Email {
  id         Int       @id @default(autoincrement())
  from       String
  subject    String
  body       String    @db.Text
  recived_at DateTime
  createdAt  DateTime  @default(now())
  analysis   EmailAnalysis?
}

model EmailAnalysis {
  id            Int      @id @default(autoincrement())
  emailId       Int      @unique
  category      String
  summary       String   @db.Text
  actionItems   Json
  responseDraft String?  @db.Text
  createdAt     DateTime @default(now())
  email         Email    @relation(...)
}

model Prompt {
  id        Int        @id @default(autoincrement())
  type      PromptType @unique
  content   String     @db.Text
  createdAt DateTime   @default(now())
}
```

## 🎨 Design Philosophy

- **"Render First, Enrich Later"** - UI loads immediately, AI enriches content
- **Clean & Minimal** - Inspired by Linear and Superhuman
- **Smooth Transitions** - All interactions have 200ms ease-in-out transitions
- **Mobile Responsive** - Full mobile support with hamburger menu

## 🔐 Environment Variables

### Backend (.env)

```env
DATABASE_URL="mysql://root:password@localhost:3306/email_agent_db"
GEMINI_API_KEY="your_gemini_api_key"
PORT=8000
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api
```

## 🐛 Troubleshooting

### Backend Issues

- **Prisma Client not found**: Run `npx prisma generate`
- **Database connection failed**: Check MySQL is running and credentials are correct
- **Gemini API errors**: Verify your API key is valid

### Frontend Issues

- **API calls failing**: Ensure backend is running on port 8000
- **Components not rendering**: Check all dependencies are installed

## 📝 Notes

- The app comes with 20 pre-seeded mock emails for testing
- AI analysis processes 5 emails at a time during "Sync"
- All AI responses are cached in the database for performance
- Custom prompts persist across sessions

## 🚀 Future Enhancements

- [ ] Email sending functionality
- [ ] Multiple inbox support
- [ ] Email search and filters
- [ ] Priority inbox view
- [ ] Email threading
- [ ] Dark mode
- [ ] Calendar integration

## 📄 License

MIT

---

Built with ❤️ using React, Prisma, and Google Gemini AI
