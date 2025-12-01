import { GoogleGenAI } from "@google/genai";
import { Alert } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeThreat = async (alert: Alert): Promise<string> => {
  if (!apiKey) {
    return "API Key missing. Cannot analyze threat.";
  }

  try {
    const prompt = `
      You are a senior cybersecurity analyst (SOC). Analyze the following Intrusion Detection System (IDS) alert.
      
      Alert Details:
      - Type: ${alert.type}
      - Severity: ${alert.severity}
      - Protocol: ${alert.protocol}
      - Source IP: ${alert.sourceIp}
      - Payload/Signature: "${alert.payload}"

      Please provide a concise response (max 150 words) covering:
      1. What is this attack attempting to do?
      2. How dangerous is it realistically?
      3. Recommended immediate mitigation step (e.g., block IP, patch service).
      
      Format as Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No analysis could be generated.";
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return "Error contacting AI analysis service. Please try again later.";
  }
};