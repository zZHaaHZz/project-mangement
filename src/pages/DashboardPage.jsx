import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../lib/hooks/useProjects';
import { useTasks } from '../lib/hooks/useTasks';
import { isLeader } from '../lib/utils/permissions';

const DashboardPage = () => {
  const { user } = useAuth();
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks();

  // Tính toán thống kê
  const totalProjects = projects?.length || 0;
  const totalTasks = tasks?.length || 0;
  const myTasks = tasks?.filter(task => task.userId === user?.id) || [];
  const myTasksCount = myTasks.length;
  const completedTasks = myTasks.filter(task => task.status === 'done: ').length;

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        {isLeader(user) ? 'Dashboard - Leader ' : 'Dashboard - Staff'}
      </h1>
    </div>
  );
};

export default DashboardPage;
