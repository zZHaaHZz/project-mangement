import React from "react";
import { Modal, Space, InputNumber, Input, Typography } from "antd";

const { Text } = Typography;

const LogworkModal = ({
    open,
    onCancel,
    onOk,
    selectedTask,
    hours,
    setHours,
    note,
    setNote,
}) => {
    return (
        <Modal
            title={selectedTask ? `Logwork: ${selectedTask.title}` : "Logwork"}
            open={open}
            onOk={onOk}
            onCancel={onCancel}
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
    );
};

export default LogworkModal;
