import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Collapse, Tag, Button, List, Modal, InputNumber, Input, Space, Typography, Drawer, Descriptions, Avatar, Divider, Empty, Dropdown, message } from "antd";
import { ClockCircleOutlined, SettingOutlined, UserOutlined, CalendarOutlined, FileTextOutlined, ProjectOutlined, EllipsisOutlined } from "@ant-design/icons";

import { useAuth } from "../contexts/AuthContext";
import { TasksApi } from "../lib/api/tasks";
import { ProjectsApi } from "../lib/api/projects";
import { ProjectMembersApi } from "../lib/api/project-members";
import { LogworksApi } from "../lib/api/logworks";

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

  // group tasks theo projectId
  const tasksByProject = useMemo(() => {
    const map = {};
    for (const t of visibleTasks) {
      if (!map[t.projectId]) map[t.projectId] = [];
      map[t.projectId].push(t);
    }
    return map;
  }, [visibleTasks]);

  // staff: chỉ hiện project mình tham gia (bao gồm cả project chưa có task)
  const visibleProjects = useMemo(() => {
    const safeProjects = Array.isArray(projects) ? projects : [];
    if (isLeader) return safeProjects;

    return safeProjects.filter((p) => {
      const isMember = myProjectIds.includes(p.id);
      // const hasMyTask = (tasksByProject[p.id] || []).length > 0;
      // Staff mong muốn thấy project mình tham gia
      return isMember;
    });
  }, [isLeader, projects, myProjectIds]);

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
    if (status === "done") return <Tag color="green">Done</Tag>;
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
      children: (
        <List
          dataSource={projectTasks}
          locale={{ emptyText: <Empty description="Không có task nào" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
          renderItem={(task) => (
            <List.Item
              className="hover:bg-gray-50 transition-colors"
              style={{ cursor: "pointer", padding: "12px 16px", borderRadius: "8px", border: "1px solid #f0f0f0", marginBottom: "8px" }}
              onClick={() => openDetail(task)}
              actions={[
                <Button
                  key="logwork"
                  icon={<ClockCircleOutlined />}
                  onClick={(e) => openLogwork(task, e)}
                  size="small"
                >
                  Logwork
                </Button>,
              ]}
            >
              <Space direction="vertical" size={2} style={{ width: '100%' }}>
                <Space size={8} className="w-full justify-between">
                  <Text strong>{task.title}</Text>
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
      <Title level={3} style={{ marginBottom: 24 }}>My Tasks</Title>

      {visibleProjects.length === 0 ? (
        <Empty description="Bạn chưa tham gia project nào hoặc chưa có project nào được tạo." />
      ) : (
        <Collapse
          // Mở project đầu tiên mặc định hoặc tất cả
          defaultActiveKey={visibleProjects.length > 0 ? [String(visibleProjects[0].id)] : []}
          expandIconPlacement="start"
          items={items}
          ghost
        />
      )}

      {/* Log Work Modal */}
      <Modal
        title={selectedTaskLog ? `Logwork: ${selectedTaskLog.title}` : "Logwork"}
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

      {/* Task Detail Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <span>Chi tiết công việc</span>
          </Space>
        }
        centered
        width={700}
        onCancel={() => setDetailOpen(false)}
        open={detailOpen}
        footer={[
          <Button key="close" onClick={() => setDetailOpen(false)}>
            Đóng
          </Button>,
          <Button
            key="logwork"
            type="primary"
            icon={<ClockCircleOutlined />}
            onClick={(e) => openLogwork(detailTask, e)}
          >
            Logwork cho task này
          </Button>
        ]}
      >
        {detailTask && (
          <Space direction="vertical" size="large" style={{ width: '100%', paddingTop: 16 }}>
            <div className="flex flex-col gap-2">
              <Title level={4} style={{ margin: 0 }}>{detailTask.title}</Title>
              <Space>
                <Tag color="geekblue">
                  Project: {projects.find(p => p.id === detailTask.projectId)?.name || "Unknown"}
                </Tag>
                {renderStatus(detailTask.status)}

                {/* Status Update Dropdown */}
                <Dropdown
                  menu={{
                    items: [
                      { key: 'todo', label: 'To Do' },
                      { key: 'in-progress', label: 'In Progress' },
                      { key: 'done', label: 'Done' }
                    ],
                    onClick: async ({ key }) => {
                      try {
                        const tasksApi = new TasksApi();
                        await tasksApi.updateTask(detailTask.id, { ...detailTask, status: key });

                        // Refresh tasks
                        const allTasks = await tasksApi.getTasks();
                        setTasks(Array.isArray(allTasks) ? allTasks : []);

                        // Update detail view immediately
                        setDetailTask(prev => ({ ...prev, status: key }));

                        message.success("Cập nhật trạng thái thành công");
                      } catch (e) {
                        message.error("Lỗi cập nhật trạng thái");
                      }
                    }
                  }}
                  trigger={['click']}
                >
                  <Button size="small" icon={<EllipsisOutlined />} />
                </Dropdown>
              </Space>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Người thực hiện" span={2}>
                <Space><UserOutlined /> <Text strong>{detailTask.userId}</Text></Space>
              </Descriptions.Item>
              <Descriptions.Item label="Hạn chót">
                <Space><CalendarOutlined /> {detailTask.dueDate ? new Date(detailTask.dueDate).toLocaleDateString() : "---"}</Space>
              </Descriptions.Item>
              <Descriptions.Item label="Ước tính">
                <Space><ClockCircleOutlined /> {detailTask.estimation ? `${detailTask.estimation}h` : "---"}</Space>
              </Descriptions.Item>
              <Descriptions.Item label="Đã làm">
                <Text strong type="success">
                  {logworks.filter(l => String(l.taskId) === String(detailTask.id)).reduce((acc, cur) => acc + Number(cur.hours), 0)}h
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số lần log">
                <Text>
                  {logworks.filter(l => String(l.taskId) === String(detailTask.id)).length} lần
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Descriptions column={1} layout="vertical">
              <Descriptions.Item label={<Text strong>Mô tả</Text>}>
                <div style={{ whiteSpace: 'pre-wrap', color: '#595959', background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                  {detailTask.description || "Chưa có mô tả."}
                </div>
              </Descriptions.Item>
            </Descriptions>

            <div>
              <Text strong>Hoạt động</Text>
              <div className="bg-gray-50 p-4 rounded text-center text-gray-500 italic mt-2">
                Chức năng bình luận & lịch sử đang được phát triển...
              </div>
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default TaskPage;
