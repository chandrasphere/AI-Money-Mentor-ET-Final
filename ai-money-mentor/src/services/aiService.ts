import { GoogleGenAI } from "@google/genai";
import { UserFinancialData, MoneyHealthScore } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const financialMentor = {
  async getHealthScore(data: UserFinancialData): Promise<MoneyHealthScore> {
    const model = "gemini-3-flash-preview";
    const prompt = `Analyze the following financial data for an Indian user and provide a Money Health Score across 6 dimensions (0-100). 
    Data: ${JSON.stringify(data)}
    Return ONLY a JSON object matching this structure:
    {
      "overall": number,
      "dimensions": {
        "emergency": number,
        "insurance": number,
        "diversification": number,
        "debt": number,
        "tax": number,
        "retirement": number
      },
      "recommendations": string[]
    }`;

    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text || "{}");
  },

  async getFIREPlan(data: UserFinancialData): Promise<string> {
    const model = "gemini-3-flash-preview";
    const prompt = `Act as a professional Indian financial advisor. Based on this data: ${JSON.stringify(data)}, 
    create a detailed FIRE (Financial Independence, Retire Early) roadmap. 
    Include:
    1. Estimated retirement corpus needed.
    2. Monthly SIP required.
    3. Asset allocation strategy.
    4. Specific Indian tax-saving instruments (80C, 80D, NPS).
    5. Emergency fund targets.
    Use Markdown for formatting.`;

    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Unable to generate plan.";
  },

  async getTaxAdvice(salary: number, deductions: any): Promise<string> {
    const model = "gemini-3-flash-preview";
    const prompt = `Analyze this Indian salary structure: Salary: ${salary}, Deductions: ${JSON.stringify(deductions)}.
    Compare Old vs New Tax Regime for FY 2024-25. 
    Suggest missing deductions and optimal tax-saving investments.
    Use Markdown.`;

    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Unable to generate tax advice.";
  }
};
