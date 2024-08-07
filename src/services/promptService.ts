import { SelectPrompt, InsertPrompt, promptTable } from "../schema";
import { db } from "../db";
import {
  GoogleGenerativeAI,
  GoogleGenerativeAIError,
} from "@google/generative-ai";
import { eq } from "drizzle-orm";

const aiAPIKey = process.env.AI_API_KEY || "";

if (!aiAPIKey) {
  console.error("AI_API_KEY environment variable not found!");
  process.exit(1);
}

const promptCache = new Map<number, InsertPrompt>();
const MAX_CACHE_SIZE = 10; //stores the last 10 prompts

const genAI = new GoogleGenerativeAI(aiAPIKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

export async function generatePrompt(
  genre: string,
  theme: string,
): Promise<InsertPrompt> {
  const parts = [
    {
      text: "You are an expert author and story teller with experience writing stories of all different genres and themes. Your job is to produce a unique prompt to be used as the basis to write a short story. The prompt is to be structured as either a question, a statement or a scenario and should not be longer than three sentences. This story will involve a specified theme and genre.",
    },
  ];

  for (const cachedPrompt of promptCache.values()) {
    parts.push({ text: `genre: ${cachedPrompt.genre}` });
    parts.push({ text: `theme: ${cachedPrompt.theme}` });
    parts.push({
      text: `prompt: ${cachedPrompt.promptText}`,
    });
  }
  // Add the genre and theme to the prompt
  parts.push({ text: `genre: ${genre}` });
  parts.push({ text: `theme: ${theme}` });
  parts.push({ text: "prompt: " });

  //Print the parts to the console for debugging and fun
  console.log("Parts: ", parts);

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
    });
    const parsedResponse = JSON.parse(result.response.text());
    // Create the InsertPrompt object directly (using Drizzle's type)
    const prompt: InsertPrompt = {
      promptText: parsedResponse.prompt,
      genre,
      theme,
    };
    return prompt;
  } catch (error: unknown) {
    if (error instanceof GoogleGenerativeAIError) {
      console.error("Error generating prompt:", error);
    } else {
      console.error("Unknown error generating prompt:", error);
    }
    throw error;
  }
}

export async function storePrompt(prompt: InsertPrompt): Promise<void> {
  console.log("Inserting prompt into database...");
  try {
    const insertedPrompt = await db
      .insert(promptTable)
      .values(prompt)
      .returning();
    prompt.promptId = insertedPrompt[0].promptId;
  } catch (error) {
    console.error("Error storing prompt:", error);
    throw error;
  }
  // Add to cache
  promptCache.set(prompt.promptId, prompt);
  if (promptCache.size > MAX_CACHE_SIZE) {
    promptCache.delete(promptCache.keys().next().value); // Remove oldest entry
  }
}

export async function getAllPrompts(): Promise<SelectPrompt[]> {
  console.log("Getting all prompts from database...");
  try {
    const allPrompts = await db.select().from(promptTable);
    return allPrompts;
  } catch (error) {
    console.error("Error getting all prompts:", error);
    throw error;
  }
}

export async function getPromptsByGenre(
  genre: string,
): Promise<SelectPrompt[]> {
  console.log(`Getting prompts by genre: ${genre}`);
  try {
    const prompts = await db
      .select()
      .from(promptTable)
      .where(eq(promptTable.genre, genre));
    return prompts;
  } catch (error) {
    console.error("Error getting prompts by genre:", error);
    throw error;
  }
}
