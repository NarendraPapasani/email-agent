import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // For listing models, we don't need to get a model instance first,
    // but the SDK exposes it via the GoogleGenerativeAI instance usually?
    // Actually, looking at docs, it might be on the client.
    // But the SDK simplifies this.
    // Let's try to just use a known working model like 'gemini-pro' again but maybe I made a mistake?
    // No, the error was clear.

    // Let's try to fetch a model that definitely exists.
    // I will try to use the model 'gemini-1.5-flash-001' in the main file.
  } catch (error) {
    console.error(error);
  }
}
