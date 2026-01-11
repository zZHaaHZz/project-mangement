// Custom hook để quản lý state cho Tasks
import { useState, useEffect } from 'react';
import { apiClient } from '../api';
import { Task } from '../../models';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getTasks();
      setTasks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      const newTask = await apiClient.createTask(taskData);
      setTasks([...tasks, newTask]);
      return newTask;
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
      throw err;
    }
  };

  const updateTask = async (id: number, taskData: Partial<Task>) => {
    try {
      setError(null);
      const updatedTask = await apiClient.updateTask(id, taskData);
      setTasks(tasks.map(t => t.id === id ? updatedTask : t));
      return updatedTask;
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
      throw err;
    }
  };

  const deleteTask = async (id: number) => {
    try {
      setError(null);
      await apiClient.deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
      throw err;
    }
  };

  const refetch = () => {
    fetchTasks();
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    refetch,
  };
}

