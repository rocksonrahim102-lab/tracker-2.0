import { useState, useEffect, FormEvent } from "react";
import { Plus, Trash2, CheckCircle2, Circle, Loader2, ListTodo } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    setIsAdding(true);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newTaskText }),
      });
      if (response.ok) {
        const newTask = await response.json();
        setTasks([newTask, ...tasks]);
        setNewTaskText("");
      }
    } catch (error) {
      console.error("Failed to add task:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });
      if (response.ok) {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !completed } : t));
      }
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setTasks(tasks.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-blue-100">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="mb-12 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
                <ListTodo className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">TaskFlow</h1>
            </div>
            <p className="text-gray-500 font-medium">Organize your workflow with ease.</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Status</span>
            <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              API Connected
            </div>
          </div>
        </header>

        {/* Add Task Form */}
        <form onSubmit={addTask} className="relative mb-12 group">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full bg-white border-2 border-transparent shadow-sm rounded-2xl px-6 py-4 pr-16 text-lg transition-all focus:outline-none focus:border-blue-500 focus:shadow-xl focus:shadow-blue-100 placeholder:text-gray-300"
          />
          <button
            type="submit"
            disabled={isAdding || !newTaskText.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            {isAdding ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
          </button>
        </form>

        {/* Task List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-medium">Loading your tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <p className="text-gray-400 font-medium">No tasks yet. Start by adding one above!</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md ${
                    task.completed ? "bg-gray-50/50" : ""
                  }`}
                >
                  <button
                    onClick={() => toggleTask(task.id, task.completed)}
                    className={`transition-colors ${
                      task.completed ? "text-green-500" : "text-gray-300 hover:text-blue-500"
                    }`}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>
                  
                  <span
                    className={`flex-1 text-lg font-medium transition-all ${
                      task.completed ? "text-gray-400 line-through" : "text-gray-700"
                    }`}
                  >
                    {task.text}
                  </span>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer Stats */}
        {!isLoading && tasks.length > 0 && (
          <footer className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between text-sm font-bold text-gray-400 uppercase tracking-widest">
            <div>{tasks.filter(t => !t.completed).length} tasks remaining</div>
            <div className="flex gap-4">
              <span>{tasks.filter(t => t.completed).length} completed</span>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
