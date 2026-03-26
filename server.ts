import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

let tasks: Task[] = [
  { id: "1", text: "Welcome to TaskFlow!", completed: false, createdAt: Date.now() },
  { id: "2", text: "Build a REST API", completed: true, createdAt: Date.now() - 10000 },
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // REST API Endpoints
  app.get("/api/tasks", (req, res) => {
    res.json(tasks.sort((a, b) => b.createdAt - a.createdAt));
  });

  app.post("/api/tasks", (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });
    
    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 9),
      text,
      completed: false,
      createdAt: Date.now(),
    };
    tasks.push(newTask);
    res.status(201).json(newTask);
  });

  app.patch("/api/tasks/:id", (req, res) => {
    const { id } = req.params;
    const { completed, text } = req.body;
    
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return res.status(404).json({ error: "Task not found" });

    if (completed !== undefined) tasks[taskIndex].completed = completed;
    if (text !== undefined) tasks[taskIndex].text = text;

    res.json(tasks[taskIndex]);
  });

  app.delete("/api/tasks/:id", (req, res) => {
    const { id } = req.params;
    tasks = tasks.filter(t => t.id !== id);
    res.status(204).send();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
