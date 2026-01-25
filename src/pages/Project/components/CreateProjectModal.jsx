import React, { useEffect, useMemo, useState } from "react";
import { Modal, Form, Input, Select, message } from "antd";

const { TextArea } = Input;

const CreateProjectModal = ({ open, onClose, onCreated, currentUserId, users = [] }) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const memberOptions = useMemo(() => {
        return (users || [])
            .filter((u) => String(u.id) !== String(currentUserId))
            .map((u) => ({
                label: `${u.name} (${u.email})`,
                value: u.id,
            }));
    }, [users, currentUserId]);

    useEffect(() => {
        if (open) form.resetFields();
    }, [open, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);

            // 1) create project
            const projectPayload = {
                name: values.name,
                description: values.description || "",
                status: values.status,
                userId: Number(currentUserId),
                createdAt: new Date().toISOString(),
            };

            const projectRes = await fetch("http://localhost:3001/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(projectPayload),
            });

            if (!projectRes.ok) throw new Error(`HTTP ${projectRes.status} create project`);
            const createdProject = await projectRes.json();

            // 2) add project_members: owner + members
            const now = new Date().toISOString();
            const selectedMemberIds = values.memberIds || [];

            const requests = [
                fetch("http://localhost:3001/project_members", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        projectId: createdProject.id,
                        userId: Number(currentUserId),
                        role: "owner",
                        createdAt: now,
                    }),
                }),
                ...selectedMemberIds.map((uid) =>
                    fetch("http://localhost:3001/project_members", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            projectId: createdProject.id,
                            userId: Number(uid),
                            role: "member",
                            createdAt: now,
                        }),
                    })
                ),
            ];

            const results = await Promise.all(requests);
            const failed = results.find((r) => !r.ok);
            if (failed) throw new Error(`HTTP ${failed.status} add members`);

            message.success("Tạo project thành công");
            onCreated?.(createdProject);
            onClose?.();
        } catch (err) {
            if (String(err?.message || "").startsWith("HTTP")) {
                message.error("Tạo project/thêm thành viên thất bại");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            title="Tạo project mới"
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            confirmLoading={submitting}
            okText="Tạo"
            cancelText="Hủy"
            destroyOnHidden
        >

            <Form form={form} layout="vertical">
                <Form.Item
                    label="Tên project"
                    name="name"
                    rules={[{ required: true, message: "Vui lòng nhập tên project" }]}
                >
                    <Input placeholder="VD: Hệ thống quản lý dự án" />
                </Form.Item>

                <Form.Item label="Mô tả" name="description">
                    <TextArea rows={4} placeholder="Mô tả ngắn..." />
                </Form.Item>

                <Form.Item
                    label="Trạng thái"
                    name="status"
                    initialValue="PLANNING"
                    rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
                >
                    <Select
                        options={[
                            { value: "PLANNING", label: "Planning" },
                            { value: "IN_PROGRESS", label: "In Progress" },
                            { value: "COMPLETED", label: "Completed" },
                            { value: "CANCELLED", label: "Cancelled" },
                        ]}
                    />
                </Form.Item>

                <Form.Item label="Thành viên tham gia" name="memberIds">
                    <Select
                        mode="multiple"
                        allowClear
                        placeholder="Chọn thành viên"
                        options={memberOptions}
                        optionFilterProp="label"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateProjectModal;
