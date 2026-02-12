// Custom hook để quản lý state cho Tasks
import { useState, useEffect } from 'react';
import { tasksApi } from '../api';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tasksApi.getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData) => {
    try {
      setError(null);
      const newTask = await tasksApi.createTask(taskData);
      setTasks([...tasks, newTask]);
      return newTask;
    } catch (err) {
      setError(err.message || 'Failed to create task');
      throw err;
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      setError(null);
      const updatedTask = await tasksApi.updateTask(id, taskData);
      setTasks(tasks.map(t => t.id === id ? updatedTask : t));
      return updatedTask;
    } catch (err) {
      setError(err.message || 'Failed to update task');
      throw err;
    }
  };

  const deleteTask = async (id) => {
    try {
      setError(null);
      await tasksApi.deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
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

