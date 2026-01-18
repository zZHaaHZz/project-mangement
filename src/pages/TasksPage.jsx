import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Collapse, Tag, Button, List, Modal, InputNumber, Input, Space, Typography } from "antd";
import { ClockCircleOutlined, SettingOutlined } from "@ant-design/icons";

import { TasksApi } from "../lib/api/tasks";
import { ProjectsApi } from "../lib/api/projects";
import { ProjectMembersApi } from "../lib/api/project-members";

const { Text } = Typography;

const TaskPage = ({ user }) => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [myProjectIds, setMyProjectIds] = useState([]); // staff membership

  const isLeader = user?.role === "leader";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasksApi = new TasksApi();
        const projectsApi = new ProjectsApi();
        const projectMembersApi = new ProjectMembersApi();

        const [tasksData, projectsData] = await Promise.all([
          tasksApi.getTasks(),
          projectsApi.getProjects(),
        ]);

        setTasks(Array.isArray(tasksData) ? tasksData : []);
        setProjects(Array.isArray(projectsData) ? projectsData : []);

        // staff: lấy list project đã tham gia
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
  }, [user?.id, isLeader]);

  // staff: chỉ task của mình
  const visibleTasks = useMemo(() => {
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    if (isLeader) return safeTasks;
    return safeTasks.filter((t) => t.userId === user?.id);
  }, [isLeader, tasks, user?.id]);

  // group tasks theo projectId
  const tasksByProject = useMemo(() => {
    const map = {};
    for (const t of visibleTasks) {
      if (!map[t.projectId]) map[t.projectId] = [];
      map[t.projectId].push(t);
    }
    return map;
  }, [visibleTasks]);

  // staff: chỉ hiện project mình tham gia + có task của mình
  const visibleProjects = useMemo(() => {
    const safeProjects = Array.isArray(projects) ? projects : [];
    if (isLeader) return safeProjects;

    return safeProjects.filter((p) => {
      const isMember = myProjectIds.includes(p.id);
      const hasMyTask = (tasksByProject[p.id] || []).length > 0;
      return isMember && hasMyTask; // ✅ chỉ hiện project có task của mình
    });
  }, [isLeader, projects, myProjectIds, tasksByProject]);

  // logwork modal
  const [logworkOpen, setLogworkOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [hours, setHours] = useState(1);
  const [note, setNote] = useState("");

  const openLogwork = (task, e) => {
    e?.stopPropagation?.();
    setSelectedTask(task);
    setHours(1);
    setNote("");
    setLogworkOpen(true);
  };

  const submitLogwork = async () => {
    console.log("LOGWORK:", { taskId: selectedTask?.id, hours, note, userId: user?.id });
    setLogworkOpen(false);
  };

  const renderStatus = (status) => {
    if (status === "done") return <Tag color="green">Done</Tag>;
    if (status === "in-progress") return <Tag color="blue">In Progress</Tag>;
    return <Tag color="default">To Do</Tag>;
  };

  const genExtra = (projectId) => (
    <SettingOutlined
      onClick={(e) => {
        e.stopPropagation();
        console.log("Project setting:", projectId);
      }}
    />
  );

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
      extra: genExtra(p.id),
      children: (
        <List
          dataSource={projectTasks}
          locale={{ emptyText: "Không có task" }}
          renderItem={(task) => (
            <List.Item
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/tasks/${task.id}`)}
              actions={[
                <Button
                  key="logwork"
                  icon={<ClockCircleOutlined />}
                  onClick={(e) => openLogwork(task, e)}
                >
                  Logwork
                </Button>,
              ]}
            >
              <Space direction="vertical" size={2}>
                <Space size={8}>
                  <Text>{task.title}</Text>
                  {renderStatus(task.status)}
                </Space>
                <Text type="secondary">Assignee: {task.userId}</Text>
              </Space>
            </List.Item>
          )}
        />
      ),
    };
  });

  return (
    <>
      <Collapse
        // ✅ mở tất cả panel cho staff để nhìn thấy task luôn
        defaultActiveKey={items.map((i) => i.key)}
        expandIconPlacement="start"
        items={items}
      />

      <Modal
        title={selectedTask ? `Logwork: ${selectedTask.title}` : "Logwork"}
        open={logworkOpen}
        onOk={submitLogwork}
        onCancel={() => setLogworkOpen(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            <Text>Hours</Text>
            <InputNumber
              min={0.25}
              step={0.25}
              style={{ width: "100%", marginTop: 6 }}
              value={hours}
              onChange={(v) => setHours(v || 0)}
            />
          </div>
          <div>
            <Text>Note</Text>
            <Input.TextArea
              rows={3}
              style={{ marginTop: 6 }}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Mô tả công việc đã làm..."
            />
          </div>
        </Space>
      </Modal>
    </>
  );
};

export default TaskPage;
