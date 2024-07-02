import {
  generatePrompt,
  storePrompt,
  getPromptsByGenre,
} from "../services/promptService";
import { GoogleGenerativeAIError } from "@google/generative-ai";
import express from "express";

const router = express.Router();

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
// router.get("/all-prompts", async (req, res) => {
//   try {
//     const result = await getAllPrompts();
//     res.json(result);
//   } catch (error) {
//     res.status(500).send("An error occurred while getting prompts");
//   }
// });

//get prompts by genre
router.get("/prompts", async (req, res) => {
  try {
    const genre = req.body;
    const result = await getPromptsByGenre(genre);
    res.json(result);
  } catch (error) {
    res.status(500).send("An error occurred while getting prompts by genre");
  }
});

export default router;
