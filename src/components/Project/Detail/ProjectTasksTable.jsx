import React from "react";
import { Empty, Spin } from "antd";

const ProjectTasksTable = ({
  tasks = [],
  userMap = new Map(),
  loading,
  onCreateTask,
  isCompleted = false,
}) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case "done":
        return {
          bg: "bg-emerald-500/20",
          text: "text-emerald-500",
          icon: "check_circle",
          label: "Đã xong",
        };
      case "in-progress":
        return {
          bg: "bg-primary/20",
          text: "text-primary",
          icon: "clock_loader_40",
          label: "Đang làm",
        };
      default:
        return {
          bg: "bg-amber-500/20",
          text: "text-amber-500",
          icon: "priority_high",
          label: "Chờ xử lý",
        };
    }
  };

  if (loading) return <Spin className="p-10 w-full flex justify-center" />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Tổng quan công việc
        </h3>
        {!isCompleted && (
          <button
            onClick={onCreateTask}
            className="bg-primary hover:bg-primary/90 text-white text-sm font-bold h-15 px-5 rounded-lg transition-all shadow-lg shadow-primary/20 cursor-pointer flex items-center gap-2 border-none"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            Tạo công việc
          </button>
        )}
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <Empty description="Không tìm thấy công việc nào" />
        ) : (
          tasks.slice(0, 5).map((task) => {
            const config = getStatusConfig(task.status);
            const taskUser = userMap.get(task.userId);
            return (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-white/5 border border-transparent hover:border-primary/30 transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded ${config.bg} ${config.text}`}>
                    <span className="material-symbols-outlined text-lg">
                      {config.icon}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold dark:text-white group-hover:text-primary transition-colors">
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Người phụ trách: {taskUser?.name || "Chưa giao"}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${config.bg} ${config.text}`}
                >
                  {config.label}
                </span>
              </div>
            );
          })
        )}
      </div>

      {tasks.length > 5 && (
        <button className="text-primary text-sm font-bold hover:underline self-end mt-2 bg-transparent border-none cursor-pointer">
          Xem tất cả {tasks.length} công việc
        </button>
      )}
    </div>
  );
};

export default ProjectTasksTable;
