import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini using your API key from .env
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// You can change to gemini-1.5-flash for faster, cheaper generation
export const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
