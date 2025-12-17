import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const connectAI = () => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }

    const gen_ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = gen_ai.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
    });
    console.log("Gemini AI connected successfully");
    return model;
  } catch (error) {
    console.log(error);
  }
};

export default connectAI;
