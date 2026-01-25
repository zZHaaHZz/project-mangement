import React from "react";
import { Modal, Space, Button, Tag, Dropdown, Divider, Descriptions, Typography, message } from "antd";
import { FileTextOutlined, ClockCircleOutlined, UserOutlined, CalendarOutlined, EllipsisOutlined } from "@ant-design/icons";
import { TasksApi } from "@/lib/api/tasks";

const { Text, Title } = Typography;

const TaskDetailModal = ({
    open,
    onCancel,
    task,
    projects,
    logworks,
    renderStatus,
    onStatusUpdated,
    onOpenLogwork,
}) => {
    if (!task) return null;

    const handleStatusUpdate = async (key) => {
        try {
            const tasksApi = new TasksApi();
            await tasksApi.updateTask(task.id, { ...task, status: key });
            onStatusUpdated?.(key);
            message.success("Cập nhật trạng thái thành công");
        } catch (e) {
            message.error("Lỗi cập nhật trạng thái");
        }
    };

    const project = projects.find((p) => p.id === task.projectId);
    const taskLogworks = logworks.filter((l) => String(l.taskId) === String(task.id));
    const totalHours = taskLogworks.reduce((acc, cur) => acc + Number(cur.hours), 0);

    return (
        <Modal
            title={
                <Space>
                    <FileTextOutlined />
                    <span>Chi tiết công việc</span>
                </Space>
            }
            centered
            width={700}
            onCancel={onCancel}
            open={open}
            footer={[
                <Button key="close" onClick={onCancel}>
                    Đóng
                </Button>,
                <Button
                    key="logwork"
                    type="primary"
                    icon={<ClockCircleOutlined />}
                    onClick={(e) => onOpenLogwork(task, e)}
                >
                    Logwork cho task này
                </Button>,
            ]}
        >
            <Space direction="vertical" size="large" style={{ width: "100%", paddingTop: 16 }}>
                <div className="flex flex-col gap-2">
                    <Title level={4} style={{ margin: 0 }}>
                        {task.title}
                    </Title>
                    <Space>
                        <Tag color="geekblue">Project: {project?.name || "Unknown"}</Tag>
                        {renderStatus(task.status)}

                        <Dropdown
                            menu={{
                                items: [
                                    { key: "todo", label: "To Do" },
                                    { key: "in-progress", label: "In Progress" },
                                    { key: "done", label: "Done" },
                                ],
                                onClick: ({ key }) => handleStatusUpdate(key),
                            }}
                            trigger={["click"]}
                        >
                            <Button size="small" icon={<EllipsisOutlined />} />
                        </Dropdown>
                    </Space>
                </div>

                <Divider style={{ margin: "12px 0" }} />

                <Descriptions column={2} bordered size="small">
                    <Descriptions.Item label="Người thực hiện" span={2}>
                        <Space>
                            <UserOutlined /> <Text strong>{task.userId}</Text>
                        </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Hạn chót">
                        <Space>
                            <CalendarOutlined />{" "}
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "---"}
                        </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ước tính">
                        <Space>
                            <ClockCircleOutlined /> {task.estimation ? `${task.estimation}h` : "---"}
                        </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Đã làm">
                        <Text strong type="success">
                            {totalHours}h
                        </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Số lần log">
                        <Text>{taskLogworks.length} lần</Text>
                    </Descriptions.Item>
                </Descriptions>

                <Descriptions column={1} layout="vertical">
                    <Descriptions.Item label={<Text strong>Mô tả</Text>}>
                        <div
                            style={{
                                whiteSpace: "pre-wrap",
                                color: "#595959",
                                background: "#f5f5f5",
                                padding: 12,
                                borderRadius: 4,
                            }}
                        >
                            {task.description || "Chưa có mô tả."}
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
        </Modal>
    );
};

export default TaskDetailModal;
