// lib/groq.ts
import { OpenAI } from "openai";
import { FUNNY_SUMMARY_SYSTEM_PROMPT2, GENZ_SUMMARY_PROMPT, PERPEX_PROMT, } from "./promt";

export const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY, // 🔑 Get from Groq Console
    baseURL: "https://api.groq.com/openai/v1", // ✅ Groq's base URL
});



export const generatePdfSummaryFromGroq = async (pdfText: string) => {
    try {
        const completion = await groq.chat.completions.create({
            model: "llama3-70b-8192", // <- Correct current Groq model name
            messages: [
                {
                    role: "system",
                    content: "You are a friendly, plain-language medical assistant who explains lab results with wit and clarity. Always use markdown tables.",
                },
                {
                    role: "user",
                    content: `Given the following extracted medical report text:

${pdfText}

Your task:
1. Identify each test and its results.
2. For each test, generate a table with columns:
   | Test Name | Result | Reference Range | Brief Meaning (in simple words) | Fun Comment or Tip |
Be concise, use plain language for explanations, and add a touch of humor or a fun tip in each row.
Respond ONLY with the table in markdown format—no extra text, no code fences, no introduction.`,
                },
            ],
            temperature: 0.7,
            max_tokens: 1500,
        });

        return completion.choices[0].message.content;
    } catch (error: any) {
        if (error?.status === 429) {
            throw new Error("RATE_LIMIT_EXCEEDED");
        }
        console.error("Groq API Error:", error);
        throw error;
    }
};


export const generatePdfSummaryFromGroqHindi = () => {

}
