import { db } from "../db";
import { generatePrompt, storePrompt } from "../services/promptService";
import { GoogleGenerativeAIError } from "@google/generative-ai";
import { promptTable } from "../schema";
import express from "express";

const router = express.Router();

// const genAI = new GoogleGenerativeAI(aiAPIKey);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// const generationConfig = {
//   temperature: 1,
//   topP: 0.95,
//   topK: 64,
//   maxOutputTokens: 8192,
//   responseMimeType: "application/json",
// };

// async function generateText(genre: string, theme: string) {
//   const parts = [
//     {
//       text: "You are an expert author and story teller with experience writing stories of all different genres and themes. Your job is to produce a unique prompt to be used as the basis to write a short story. The prompt is to be structured as either a question, a statement or a scenario and should not be longer than three sentences. This story will involve a specified theme and genre.",
//     },
//     { text: `genre: ${genre}` },
//     { text: `theme: ${theme}` },
//     { text: "prompt: " },
//   ];
//   // Generate the content
//   const result = await model.generateContent({
//     contents: [{ role: "user", parts }],
//     generationConfig,
//   });

//   //Parse the result
//   try {
//     const parsedResponse = JSON.parse(result.response.text());

//     // Store the generated prompt in the database using Drizzle ORM
//     const newPrompt: InsertPrompt = {
//       promptText: parsedResponse.prompt,
//       genre: genre,
//       theme: theme,
//     };
//     console.log("New Prompt Created: " + newPrompt);
//     console.log("Inserting prompt into database...");
//     const insertedPrompt = await db
//       .insert(promptTable)
//       .values(newPrompt)
//       .returning();
//     parsedResponse.promptId = insertedPrompt[0].promptId;

//     return parsedResponse;
//   } catch (error) {
//     throw new GoogleGenerativeAIError(
//       "An error occurred while parsing the response",
//     );
//   }
// }

//get random prompt from the database
async function getAllPrompts() {
  console.log("Getting all prompts from database...");
  const result = await db
    .select({
      promptText: promptTable.promptText,
      genre: promptTable.genre,
      theme: promptTable.theme,
    })
    .from(promptTable);
  return result;
}

router.post("/generate-prompt", async (req, res) => {
  try {
    const { genre, theme } = req.body;

    if (!genre || !theme) {
      res.status(400).json({ error: "Genre and theme are required." });
    }
    console.log("Generating prompt...");
    const result = await generatePrompt(genre, theme);
    res.json(result);
    console.log("Prompt generated successfully");
    console.log("Storing prompt...");
    await storePrompt(result);
  } catch (error) {
    if (error instanceof GoogleGenerativeAIError) {
      res.status(500).send(error.message);
    } else {
      res.status(500).send("An terrible error occurred..");
    }
  }
});

//get all prompts from the database
router.get("/prompts", async (req, res) => {
  try {
    const result = await getAllPrompts();
    res.json(result);
  } catch (error) {
    res.status(500).send("An error occurred while getting prompts");
  }
});

export default router;
