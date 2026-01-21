import React, { useEffect, useMemo, useState } from "react";
import { Modal, Form, Input, Select, message, DatePicker, InputNumber } from "antd";

const { TextArea } = Input;

const CreateTaskForMemberModal = ({
  open,
  onClose,
  projectId,
  projectMembers = [],
  userMap = new Map(),
  onCreated,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) form.resetFields();
  }, [open, form]);

  const membersOfProject = useMemo(() => {
    return (projectMembers || []).filter(
      (m) => Number(m.projectId) === Number(projectId)
    );
  }, [projectMembers, projectId]);

  const memberOptions = useMemo(() => {
    return membersOfProject
      // .filter((m) => m.role !== "owner") // tuỳ bạn: cho owner assign hay không
      .map((m) => {
        const u = userMap.get(m.userId);
        if (!u) return null;
        return { label: `${u.name} (${u.email})`, value: u.id };
      })
      .filter(Boolean);
  }, [membersOfProject, userMap]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload = {
        title: values.title,
        description: values.description || "",
        status: values.status,
        projectId: Number(projectId),
        userId: Number(values.userId),
        estimation: values.estimation ? Number(values.estimation) : 0,
        dueDate: values.dueDate ? values.dueDate.toISOString() : null,
        createdAt: new Date().toISOString(),
      };

      const res = await fetch("http://localhost:3001/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      message.success("Tạo task thành công");
      onClose?.();
      onCreated?.();
    } catch (err) {
      // validateFields lỗi thì err.errorFields có tồn tại => khỏi message.error
      if (!err?.errorFields) message.error("Tạo task thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Tạo task cho thành viên"
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={submitting}
      okText="Thêm"
      cancelText="Hủy"
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên task"
          name="title"
          rules={[{ required: true, message: "Nhập tên task" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <TextArea rows={3} />
        </Form.Item>

        <Form.Item
          label="Giao cho thành viên"
          name="userId"
          rules={[{ required: true, message: "Chọn thành viên" }]}
        >
          <Select
            options={memberOptions}
            placeholder="Chọn thành viên trong dự án"
            showSearch
            optionFilterProp="label"
            notFoundContent="Dự án chưa có thành viên"
          />
        </Form.Item>

        <div className="flex gap-4">
          <Form.Item label="Hạn chót" name="dueDate" style={{ flex: 1 }}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item label="Ước tính (giờ)" name="estimation" style={{ flex: 1 }}>
            <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <Form.Item label="Trạng thái" name="status" initialValue="todo">
          <Select
            options={[
              { value: "todo", label: "To Do" },
              { value: "in-progress", label: "In Progress" },
              { value: "done", label: "Done" },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateTaskForMemberModal;
