
import { GoogleGenAI } from "@google/genai";
import { Entry, FinancialStats } from "../types";

export const aiService = {
  analyzeFinancials: async (stats: FinancialStats, entries: Entry[], yearId: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Format data for the model
    const expenseList = entries
      .filter(e => e.type === 'expense')
      .map(e => `- ${e.title}: $${e.amount} (${e.date})`)
      .join('\n');
      
    const prompt = `
      As a professional Financial Analyst, analyze the following records for the fiscal year ${yearId}:
      
      SUMMARY:
      - Opening Balance: $${stats.openingBalance}
      - Total Collected: $${stats.totalCollection}
      - Total Spent: $${stats.totalExpense}
      - Current Net Balance: $${stats.currentBalance}
      
      DETAILED EXPENSES:
      ${expenseList || 'No expenses recorded yet.'}
      
      Please provide:
      1. A concise executive summary (3 sentences).
      2. Top 3 spending categories or patterns noticed.
      3. A "Health Score" out of 10 for this year's budget management.
      4. One strategic suggestion to improve the balance for the next fiscal year.
      
      Format the response in clean Markdown with professional headings.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("AI Analysis failed:", error);
      return "Unable to generate AI analysis at this time. Please check your network connection.";
    }
  }
};
