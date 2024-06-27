import express from "express";
import dotenv from "dotenv";
import promptRoutes from "./routes/promptRoutes";
import defaultRoutes from "./routes/defaultRoutes";

dotenv.config();
const app = express();
app.use(express.json());
app.use(defaultRoutes);
app.use(promptRoutes);

const port = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  res.send("hello world");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
