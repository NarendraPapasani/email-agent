import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectAI from "./utils/genAI.js";
import emailRouter from "./routes/email.routes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;

// Initialize Gemini AI
connectAI();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://guileless-tiramisu-89bccf.netlify.app",
    ],
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api", emailRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
