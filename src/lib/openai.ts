import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    console.warn("⚠️ OPENAI_API_KEY not set. OpenAI features will not work.");
}

const openai = apiKey ? new OpenAI({ apiKey }) : null;

export function getOpenAI() {
    if (!openai) throw new Error("OpenAI API key not configured. Set OPENAI_API_KEY in .env");
    return openai;
}

export default openai;
