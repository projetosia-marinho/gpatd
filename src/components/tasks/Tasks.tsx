import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, CheckCircle2, Circle, Clock } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (!newTask.trim()) return;
    const task: Task = {
      id: Math.random().toString(36).substring(7),
      title: newTask.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    setTasks([task, ...tasks]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div id="tasks-container" className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white leading-tight">Suas Tarefas</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie seu fluxo de trabalho diário.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-medium text-sm">
          <Clock size={16} />
          {tasks.filter(t => !t.completed).length} Pendente(s)
        </div>
      </div>

      <div className="relative group bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-2 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900/30 transition-all mb-8">
        <div className="flex items-center gap-2">
          <input
            id="new-task-input"
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="O que precisa ser feito?"
            className="flex-1 bg-transparent px-4 py-3 outline-hidden text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <button
            id="add-task-button"
            onClick={addTask}
            disabled={!newTask.trim()}
            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-white hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 transition-all shadow-sm"
          >
            <Plus size={18} />
            <span className="font-medium">Adicionar Tarefa</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <motion.div
              layout
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                task.completed 
                  ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-60' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md hover:shadow-indigo-50/20'
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <button
                  id={`toggle-task-${task.id}`}
                  onClick={() => toggleTask(task.id)}
                  className={`shrink-0 transition-colors ${
                    task.completed ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-700 hover:text-indigo-400'
                  }`}
                >
                  {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>
                <span className={`text-slate-800 dark:text-slate-200 font-medium ${task.completed ? 'line-through decoration-slate-300 dark:decoration-slate-700 text-slate-400 dark:text-slate-500' : ''}`}>
                  {task.title}
                </span>
              </div>
              <button
                id={`remove-task-${task.id}`}
                onClick={() => removeTask(task.id)}
                className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-300 dark:text-slate-700 mb-6 border border-slate-200 dark:border-slate-800">
              <CheckSquare size={40} />
            </div>
            <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Nenhuma tarefa ainda</h4>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Comece adicionando sua primeira tarefa acima.</p>
          </div>
        )}
      </div>
    </div>
  );
}
import { CheckSquare } from 'lucide-react';
