import React, { useMemo, useState, useEffect } from "react";
import { message, Tooltip, Avatar } from "antd";
import dayjs from "dayjs";
import { PlusOutlined, FilterOutlined } from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { logworksApi, usersApi } from "@/lib/api";
import { useTasks } from "@/lib/hooks/useTasks";
import { useProjects } from "@/lib/hooks/useProjects";
import { useLogworks } from "@/lib/hooks/useLogworks";
import { useProjectMembers } from "@/lib/hooks/useProjectMembers";
import TaskDetailModal from "@/components/Task/TaskDetailModal";
import LogworkModal from "@/components/Task/LogworkModal";
import CreateTaskForMemberModal from "@/components/Project/Detail/CreateTaskForMemberModal";
import EditTaskModal from "@/components/Task/EditTaskModal";
import { useLayout } from "@/contexts/LayoutContext";

const TaskPage = () => {
  const { user } = useAuth();
  const { tasks = [], fetchTasks } = useTasks();
  const { projects = [] } = useProjects();
  const { logworks = [] } = useLogworks();
  const { members = [] } = useProjectMembers();

  const [activeTab, setActiveTab] = useState("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTask, setDetailTask] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchText, setSearchText] = useState("");

  // Logwork state
  const [logworkOpen, setLogworkOpen] = useState(false);
  const [selectedTaskLog, setSelectedTaskLog] = useState(null);
  const [hours, setHours] = useState(1);
  const [note, setNote] = useState("");
  const [logworkDate, setLogworkDate] = useState(dayjs());

  const isLeader = user?.role === "leader";

  const openLogwork = (task, e) => {
    e?.stopPropagation?.();
    if (task.status === "done") return; // Safety guard
    setSelectedTaskLog(task);
    setHours(1);
    setNote("");
    setLogworkDate(dayjs());
    setLogworkOpen(true);
  };

  const submitLogwork = async () => {
    try {
      if (!selectedTaskLog) return;
      const newLogwork = {
        taskId: selectedTaskLog.id,
        userId: user?.id,
        hours: Number(hours),
        note: note,
        date: logworkDate.format("YYYY-MM-DD"), // Store date
        createdAt: new Date().toISOString()
      };

      await logworksApi.createLogwork(newLogwork);
      message.success("Ghi nhận logwork thành công");
      setLogworkOpen(false);
      // Refresh data
      fetchTasks();
    } catch (error) {
      message.error("Không thể lưu logwork");
    }
  };

  // Filter tasks based on role
  const roleFilteredTasks = useMemo(() => {
    if (isLeader) return tasks;
    return tasks.filter((t) => String(t.userId) === String(user?.id));
  }, [tasks, isLeader, user]);

  // Filter tasks based on active tab
  const tabFilteredTasks = useMemo(() => {
    if (activeTab === "all") return roleFilteredTasks;
    if (activeTab === "in-progress") return roleFilteredTasks.filter(t => t.status === "in-progress" || t.status === "todo");
    if (activeTab === "completed") return roleFilteredTasks.filter(t => t.status === "done");
    if (activeTab === "archived") return roleFilteredTasks.filter(t => t.status === "cancelled");
    return roleFilteredTasks;
  }, [roleFilteredTasks, activeTab]);

  // Filter based on search text
  const visibleTasks = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return tabFilteredTasks;
    return tabFilteredTasks.filter(t =>
      (t.title || "").toLowerCase().includes(q) ||
      (t.description || "").toLowerCase().includes(q)
    );
  }, [tabFilteredTasks, searchText]);

  // Group tasks by project
  const tasksByProject = useMemo(() => {
    const map = {};
    visibleTasks.forEach((t) => {
      if (!map[t.projectId]) map[t.projectId] = [];
      map[t.projectId].push(t);
    });
    return map;
  }, [visibleTasks]);

  // Get project details for grouped tasks
  const relevantProjects = useMemo(() => {
    const projectIds = Object.keys(tasksByProject).map(Number);
    return projects.filter(p => projectIds.includes(p.id));
  }, [projects, tasksByProject]);

  // Statistics
  const stats = useMemo(() => {
    const total = roleFilteredTasks.length;
    const completed = roleFilteredTasks.filter(t => t.status === "done").length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      rate
    };
  }, [roleFilteredTasks]);

  const openDetail = (task) => {
    setDetailTask(task);
    setDetailOpen(true);
  };

  const [users, setUsers] = useState([]);
  useEffect(() => {
    usersApi.getUsers().then(data => {
      setUsers(Array.isArray(data) ? data : (data?.data ?? []));
    });
  }, []);

  const userMap = useMemo(() => {
    const map = new Map();
    users.forEach(u => map.set(u.id, u));
    return map;
  }, [users]);

  const { setHeaderActions } = useLayout();

  useEffect(() => {
    setHeaderActions(
      <div className="flex items-center gap-6 w-full">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-slate-400 font-medium"
            placeholder="Tìm kiếm công việc..."
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        {isLeader && (
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold py-2 px-5 rounded-lg transition-all shadow-lg shadow-primary/20 cursor-pointer whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span>Thêm task mới</span>
          </button>
        )}
      </div>
    );
    return () => setHeaderActions(null);
  }, [searchText, isLeader, setHeaderActions]);

  return (
    <main className="flex-1 flex flex-col bg-white min-h-screen">
      <div className="layout-content-container flex flex-col max-w-[1200px] mx-auto flex-1 w-full px-4 md:px-8 py-8">

        {/* Page Heading (Breadcrumbs styled) */}
        <div className="flex flex-col gap-1 mb-8">
          <h1 className="text-[#333] text-4xl font-extrabold leading-tight tracking-tight">Công việc</h1>
          <p className="text-gray-500 text-base font-normal">Theo dõi tiến độ và tối ưu hóa quy trình làm việc của bạn.</p>
        </div>

        {/* Tabs Section */}
        <div className="mb-8">
          <div className="flex border-b border-gray-200 gap-8">
            {[
              { id: "all", label: "Tất cả" },
              { id: "in-progress", label: "Đang làm" },
              { id: "completed", label: "Hoàn thành" },
              { id: "archived", label: "Lưu trữ" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center border-b-2 pb-3 pt-2 transition-all bg-transparent cursor-pointer border-none ${activeTab === tab.id
                  ? "border-primary text-[#333]"
                  : "border-transparent text-gray-400 hover:text-[#333]"
                  }`}
              >
                <p className={`text-sm tracking-tight ${activeTab === tab.id ? "font-bold" : "font-semibold"}`}>
                  {tab.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Task Groups by Project */}
        <div className="space-y-12">
          {relevantProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">task_alt</span>
              <p className="text-gray-400 text-lg font-medium">Không tìm thấy công việc nào trong danh sách này</p>
            </div>
          ) : (
            relevantProjects.map((project) => {
              const projectTasks = tasksByProject[project.id] || [];
              const pendingCount = projectTasks.filter(t => t.status !== "done").length;

              return (
                <div key={project.id} className="flex flex-col gap-4">
                  {/* Section Header */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-[#333] text-xl font-bold tracking-tight">{project.name}</h2>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
                      {pendingCount} task chưa hoàn thành
                    </span>
                  </div>

                  {/* Task Table */}
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-6 py-4 text-[#333] text-xs font-bold uppercase tracking-widest">Tên công việc</th>
                          <th className="px-6 py-4 text-[#333] text-xs font-bold uppercase tracking-widest text-center">Trạng thái</th>
                          <th className="px-6 py-4 text-[#333] text-xs font-bold uppercase tracking-widest text-center">Ưu tiên</th>
                          <th className="px-6 py-4 text-[#333] text-xs font-bold uppercase tracking-widest">Thành viên</th>
                          <th className="px-6 py-4 text-[#333] text-xs font-bold uppercase tracking-widest text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {projectTasks.map((task) => {
                          const assignee = userMap.get(task.userId);
                          return (
                            <tr key={task.id} className="hover:bg-gray-50 transition-colors group">
                              <td className="px-6 py-5">
                                <div className="flex flex-col">
                                  <span className="text-[#333] font-semibold text-sm group-hover:text-primary transition-colors">
                                    {task.title}
                                  </span>
                                  <span className="text-gray-400 text-xs mt-1 font-medium line-clamp-1">
                                    {task.description || "Không có mô tả"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-center">
                                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${task.status === "done" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                  task.status === "in-progress" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                    "bg-gray-50 text-gray-500 border border-gray-100"
                                  }`}>
                                  <span className={`size-1.5 rounded-full mr-2 ${task.status === "done" ? "bg-emerald-500" :
                                    task.status === "in-progress" ? "bg-blue-500" :
                                      "bg-gray-400"
                                    }`}></span>
                                  {task.status === "done" ? "Hoàn thành" :
                                    task.status === "in-progress" ? "Đang làm" : "Cần làm"}
                                </span>
                              </td>
                              <td className="px-6 py-5 text-center">
                                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${task.priority === "high" ? "bg-pink-50 text-pink-600 border border-pink-100" :
                                  task.priority === "medium" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                    "bg-slate-50 text-slate-600 border border-slate-100"
                                  }`}>
                                  {task.priority === "high" ? "Cao" :
                                    task.priority === "medium" ? "Trung bình" : (task.priority === "low" ? "Thấp" : "Trung bình")}
                                </span>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex -space-x-2">
                                  {assignee ? (
                                    <Tooltip title={assignee.name}>
                                      <Avatar
                                        size={32}
                                        src={assignee.avatar}
                                        className="border-2 border-white shadow-sm"
                                      >
                                        {assignee.name[0]}
                                      </Avatar>
                                    </Tooltip>
                                  ) : (
                                    <Avatar size={32} icon="?" className="border-2 border-white shadow-sm" />
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <div className="flex justify-end gap-2">
                                  <Tooltip title={
                                    task.status === "done"
                                      ? "Không thể ghi nhận giờ làm cho công việc đã hoàn thành"
                                      : String(user?.id) !== String(task.userId)
                                        ? "Bạn không có quyền ghi nhận giờ cho công việc này"
                                        : "Ghi nhận công việc"
                                  }>
                                    <button
                                      disabled={task.status === "done" || String(user?.id) !== String(task.userId)}
                                      onClick={(e) => openLogwork(task, e)}
                                      className={`size-9 flex items-center justify-center rounded-lg transition-all border-none ${task.status === "done" || String(user?.id) !== String(task.userId) ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 cursor-pointer"}`}
                                    >
                                      <span className="material-symbols-outlined text-xl">history</span>
                                    </button>
                                  </Tooltip>
                                  <button
                                    onClick={() => openDetail(task)}
                                    className="px-4 h-9 flex items-center justify-center rounded-lg bg-gray-50 text-gray-600 font-bold text-sm hover:bg-gray-100 transition-all border-none cursor-pointer"
                                  >
                                    Chi tiết
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Statistics Cards */}
        <div className="mt-16 pb-12">
          <h2 className="text-[#333] text-xl font-bold tracking-tight mb-6">Thống kê dự án</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm font-medium">Tỉ lệ hoàn thành</span>
                <span className="material-symbols-outlined text-emerald-500">trending_up</span>
              </div>
              <div className="text-2xl font-black text-[#333]">{stats.rate}%</div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-4">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${stats.rate}%` }}
                ></div>
              </div>
            </div>
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm font-medium">Công việc đang chờ</span>
                <span className="material-symbols-outlined text-primary">data_exploration</span>
              </div>
              <div className="text-2xl font-black text-[#333]">{stats.pending}</div>
              <p className="text-xs text-gray-400 mt-4 font-medium">Trên tổng số {stats.total} công việc</p>
            </div>
            <div className="p-6 bg-primary rounded-xl shadow-lg shadow-primary/20 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm font-medium">Hiệu suất đội ngũ</span>
                <span className="material-symbols-outlined text-white">bolt</span>
              </div>
              <div className="text-2xl font-black text-white">4.2 <span className="text-sm font-normal text-white/70">task/ngày</span></div>
              <p className="text-xs text-white/80 mt-4 font-medium">Quy trình tối ưu</p>
            </div>
          </div>
        </div>
      </div>

      <TaskDetailModal
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        task={detailTask}
        projects={projects}
        logworks={logworks}
        onStatusUpdated={async (newStatus) => {
          await fetchTasks();
          setDetailTask(prev => ({ ...prev, status: newStatus }));
        }}
        onEdit={(task) => {
          setEditingTask(task);
          setDetailOpen(false);
          setEditOpen(true);
        }}
        onDelete={() => {
          fetchTasks();
        }}
        onOpenLogwork={openLogwork}
      />

      <EditTaskModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        task={editingTask}
        projectMembers={members}
        userMap={userMap}
        onUpdated={fetchTasks}
      />

      <LogworkModal
        open={logworkOpen}
        onCancel={() => setLogworkOpen(false)}
        onOk={submitLogwork}
        selectedTask={selectedTaskLog}
        hours={hours}
        setHours={setHours}
        note={note}
        setNote={setNote}
        date={logworkDate}
        setDate={setLogworkDate}
      />

      <CreateTaskForMemberModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          fetchTasks();
          setCreateOpen(false);
        }}
        projects={projects} // Pass all projects
        projectMembers={members} // All members to allow assignee selection
        userMap={userMap}
      />
    </main>
  );
};

export default TaskPage;
