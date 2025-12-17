import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const connectAI = () => {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not defined in environment variables");
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    console.log("Groq AI (Llama 3.3) connected successfully");
    
    return groq;
  } catch (error) {
    console.error("Failed to connect to Groq:", error.message);
    return null;
  }
};

export default connectAI;
