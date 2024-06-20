import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenerativeAI, GoogleGenerativeAIError, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

dotenv.config(); // Load environment variables first

const app = express();
const port = process.env.PORT || 3000;

const aiAPIKey = process.env.AI_API_KEY || "";

if (!aiAPIKey) {
  console.error("AI_API_KEY environment variable not found!");
  process.exit(1); // Exit the application if the key is missing
}

const genAI = new GoogleGenerativeAI(aiAPIKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

async function generateText() {

  const parts = [
    {text: "You are an expert author and story teller with experience writing stories of all different genres and themes. Your job is to produce a unique prompt to be used as the basis to write a short story. The prompt is to be structured as either a question, a statement or a scenario and should not be longer than three sentences. This story will involve a specified theme and genre."},
    {text: "genre: Fantasy"},
    {text: "theme: Friendship"},
    {text: "prompt: {\"prompt\": \"A young elf, ostracized for his unusual ability to speak with animals, discovers a hidden forest realm where his gift is not only accepted, but revered, and he must decide whether to stay and embrace this new world or return to his old life and risk losing his newfound friends.\"}"},
    {text: "genre: Perseverance"},
    {text: "theme: Science Fiction"},
    {text: "prompt: {\"prompt\": \"After a catastrophic solar flare wipes out most of Earth's technology, a lone astronaut stranded on a distant moon must use salvaged parts and sheer willpower to repair his broken spacecraft and find a way to return home.\"}"},
    {text: "genre: Western"},
    {text: "theme: Honor"},
    {text: "prompt: {\"prompt\": \"A gunslinger with a reputation for ruthlessness finds himself caught in a conflict between two rival towns, forcing him to confront his past and choose between his own ambition and the code of honor he once swore to uphold.\"}"},
    {text: "genre: Comedy"},
    {text: "theme: Self Discovery"},
    {text: "prompt: "},
  ];
  // Generate the content
  const result = await model.generateContent({
    contents: [{ role: "user", parts}],
    generationConfig,
  });

  console.log(result.response.text());
}


app.get('/', async (req, res) => {
    res.send("hello world");
});

app.post('/generate', async (req, res) => {
  console.log("Generating text...");
  try {
    const prompt = "Once upon a time";
    const result = await generateText();
    res.json(result);

  } catch (error) {
    if (error instanceof GoogleGenerativeAIError) {
      res.status(500).send(error.message);
    } else {
      res.status(500).send("An error occurred while generating text");
    }
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

