import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Collapse, Tag, Button, List, Modal, InputNumber, Input, Space, Typography, Drawer, Descriptions, Avatar, Divider, Empty, Dropdown, message, Switch } from "antd";
import { ClockCircleOutlined, SettingOutlined, UserOutlined, CalendarOutlined, FileTextOutlined, ProjectOutlined, EllipsisOutlined, CheckCircleOutlined } from "@ant-design/icons";

import { useAuth } from "@/contexts/AuthContext";
import { TasksApi } from "@/lib/api/tasks";
import { ProjectsApi } from "@/lib/api/projects";
import { ProjectMembersApi } from "@/lib/api/project-members";
import { LogworksApi } from "@/lib/api/logworks";

import LogworkModal from "./components/LogworkModal";
import TaskDetailModal from "./components/TaskDetailModal";

const { Text, Title, Paragraph } = Typography;

const TaskPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [logworks, setLogworks] = useState([]);
  const [myProjectIds, setMyProjectIds] = useState([]); // staff membership

  // Task Detail state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTask, setDetailTask] = useState(null);

  // ✅ Filter state cho completed tasks
  const [showCompletedTasks, setShowCompletedTasks] = useState(true);

  const isLeader = user?.role === "leader";

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const tasksApi = new TasksApi();
        const projectsApi = new ProjectsApi();
        const projectMembersApi = new ProjectMembersApi();
        const logworksApi = new LogworksApi();

        const [tasksData, projectsData, logworksData] = await Promise.all([
          tasksApi.getTasks(),
          projectsApi.getProjects(),
          logworksApi.getLogworks(),
        ]);

        setTasks(Array.isArray(tasksData) ? tasksData : []);
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        setLogworks(Array.isArray(logworksData) ? logworksData : []);

        // staff: lấy list project đã tham gia
        if (!isLeader && user?.id) {
          const members = await projectMembersApi.getProjectMembersByUser(user.id);
          const ids = (Array.isArray(members) ? members : []).map((m) => m.projectId);
          setMyProjectIds(ids);
        } else {
          setMyProjectIds([]);
        }

      } catch (err) {
        console.error("fetchData error:", err);
      }
    };

    fetchData();
  }, [user?.id, isLeader, user]); // Added user dependency

  // staff: chỉ task của mình
  const visibleTasks = useMemo(() => {
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    if (isLeader) return safeTasks;
    // Ensure accurate filtering by userId
    return safeTasks.filter((t) => String(t.userId) === String(user?.id));
  }, [isLeader, tasks, user?.id]);

  // ✅ Filter tasks: ẩn task đã done nếu showCompletedTasks = false
  const filteredVisibleTasks = useMemo(() => {
    if (showCompletedTasks) return visibleTasks;
    return visibleTasks.filter((t) => t.status !== "done");
  }, [visibleTasks, showCompletedTasks]);

  // group tasks theo projectId (sử dụng filteredVisibleTasks)
  const tasksByProject = useMemo(() => {
    const map = {};
    for (const t of filteredVisibleTasks) {
      if (!map[t.projectId]) map[t.projectId] = [];
      map[t.projectId].push(t);
    }
    return map;
  }, [filteredVisibleTasks]);

  // ✅ Tính toán số task đã done để hiển thị
  const completedTasksCount = useMemo(() => {
    return visibleTasks.filter((t) => t.status === "done").length;
  }, [visibleTasks]);

  // ✅ Tính toán userTaskProjectIds để check fallback
  const userTaskProjectIds = useMemo(() => {
    if (!user) return [];
    const myTasks = tasks.filter((t) => String(t.userId) === String(user.id));
    return Array.from(new Set(myTasks.map((t) => t.projectId)));
  }, [tasks, user]);

  // staff: chỉ hiện project mình tham gia (từ project_members) HOẶC có task trong project
  const visibleProjects = useMemo(() => {
    const safeProjects = Array.isArray(projects) ? projects : [];
    if (isLeader) return safeProjects;

    return safeProjects.filter((p) => {
      // ✅ Check 1: Là member (từ project_members)
      const isMember = myProjectIds.includes(p.id);
      if (isMember) return true;

      // ✅ Check 2: Có task trong project (fallback)
      const hasMyTask = userTaskProjectIds.includes(p.id);
      return hasMyTask;
    });
  }, [isLeader, projects, myProjectIds, userTaskProjectIds]);

  // logwork modal
  const [logworkOpen, setLogworkOpen] = useState(false);
  const [selectedTaskLog, setSelectedTaskLog] = useState(null);
  const [hours, setHours] = useState(1);
  const [note, setNote] = useState("");

  const openLogwork = (task, e) => {
    e?.stopPropagation?.();
    setSelectedTaskLog(task);
    setHours(1);
    setNote("");
    setLogworkOpen(true);
  };

  const submitLogwork = async () => {
    try {
      if (!selectedTaskLog) return;
      const logworksApi = new LogworksApi();
      const newLogwork = {
        taskId: selectedTaskLog.id,
        userId: user?.id,
        hours: Number(hours),
        note: note,
        createdAt: new Date().toISOString()
      };

      await logworksApi.createLogwork(newLogwork);

      // Update local state to reflect changes immediately
      const updatedLogworks = await logworksApi.getLogworks();
      setLogworks(Array.isArray(updatedLogworks) ? updatedLogworks : []);

      setLogworkOpen(false);
    } catch (error) {
      console.error("Failed to logwork", error);
    }
  };

  const openDetail = (task) => {
    setDetailTask(task);
    setDetailOpen(true);
  };

  const renderStatus = (status) => {
    if (status === "done") return <Tag color="green" icon={<CheckCircleOutlined />}>Done</Tag>;
    if (status === "in-progress") return <Tag color="blue">In Progress</Tag>;
    if (status === "review") return <Tag color="purple">Review</Tag>;
    return <Tag color="default">To Do</Tag>;
  };

  const genExtra = (p) => {
    if (isLeader) {
      return (
        <SettingOutlined
          onClick={(e) => {
            e.stopPropagation();
            // Navigate to project settings
            navigate(`/projects/${p.id}/settings`);
          }}
        />
      )
    }
    return null;
  };

  const items = visibleProjects.map((p) => {
    const projectTasks = tasksByProject[p.id] || [];

    return {
      key: String(p.id),
      label: (
        <Space size={12}>
          <Text strong>{p.name}</Text>
          <Tag>{projectTasks.length} tasks</Tag>
        </Space>
      ),
      extra: genExtra(p),
      style: {
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        marginBottom: '12px',
        padding: '8px 12px',
        backgroundColor: '#ffffff'
      },
      children: (
        <List
          dataSource={projectTasks}
          locale={{ emptyText: <Empty description="Không có task nào" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
          renderItem={(task) => (
            <List.Item
              className={`hover:bg-gray-50 transition-colors ${task.status === "done" ? "opacity-75" : ""}`}
              style={{
                cursor: "pointer",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid #f0f0f0",
                marginBottom: "8px",
                backgroundColor: task.status === "done" ? "#f6ffed" : "transparent"
              }}
              onClick={() => openDetail(task)}
              actions={[
                task.status !== "done" && (
                  <Button
                    key="logwork"
                    icon={<ClockCircleOutlined />}
                    onClick={(e) => openLogwork(task, e)}
                    size="small"
                  >
                    Logwork
                  </Button>
                ),
              ].filter(Boolean)}
            >
              <Space direction="vertical" size={2} style={{ width: '100%' }}>
                <Space size={8} className="w-full justify-between">
                  <Text
                    strong
                    style={{
                      textDecoration: task.status === "done" ? "line-through" : "none",
                      color: task.status === "done" ? "#8c8c8c" : undefined
                    }}
                  >
                    {task.title}
                  </Text>
                  {renderStatus(task.status)}
                </Space>
                <Space size={16}>
                  <Space size={4}>
                    <UserOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>ID: {task.userId}</Text>
                  </Space>
                  {task.dueDate && (
                    <Space size={4}>
                      <CalendarOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
                      <Text type="secondary" style={{ fontSize: 12 }}>{new Date(task.dueDate).toLocaleDateString()}</Text>
                    </Space>
                  )}
                </Space>
              </Space>
            </List.Item>
          )}
        />
      ),
    };
  });

  return (
    <div style={{ padding: 24, background: '#fff', borderRadius: 8, minHeight: '100%' }}>
      <div className="flex justify-between items-center mb-6">
        <Title level={3} style={{ margin: 0 }}>My Tasks</Title>
        <div className="flex items-center gap-3">
          {completedTasksCount > 0 && (
            <Text type="secondary" className="text-sm">
              {completedTasksCount} task đã hoàn thành
            </Text>
          )}
          <Space>
            <Text className="text-sm">Hiển thị task đã hoàn thành:</Text>
            <Switch
              checked={showCompletedTasks}
              onChange={setShowCompletedTasks}
              checkedChildren="Có"
              unCheckedChildren="Không"
            />
          </Space>
        </div>
      </div>

      {visibleProjects.length === 0 ? (
        <Empty description="Bạn chưa tham gia project nào hoặc chưa có project nào được tạo." />
      ) : (
        <Collapse
          // Không mở project nào mặc định, người dùng tự click để mở
          defaultActiveKey={[]}
          expandIconPlacement="start"
          items={items}
          ghost={false}
          className="project-collapse"
        />
      )}

      <LogworkModal
        open={logworkOpen}
        onCancel={() => setLogworkOpen(false)}
        onOk={submitLogwork}
        selectedTask={selectedTaskLog}
        hours={hours}
        setHours={setHours}
        note={note}
        setNote={setNote}
      />

      <TaskDetailModal
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        task={detailTask}
        projects={projects}
        logworks={logworks}
        renderStatus={renderStatus}
        onStatusUpdated={async (newStatus) => {
          // Refresh tasks
          const tasksApi = new TasksApi();
          const allTasks = await tasksApi.getTasks();
          setTasks(Array.isArray(allTasks) ? allTasks : []);
          setDetailTask(prev => ({ ...prev, status: newStatus }));
        }}
        onOpenLogwork={openLogwork}
      />
    </div>
  );
};

export default TaskPage;
