import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, message } from "antd";

const { TextArea } = Input;

const EditProjectModal = ({ open, onClose, project, onUpdated }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      name: project?.name || "",
      description: project?.description || "",
      status: project?.status || "PLANNING",
    });
  }, [open, project, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const res = await fetch(`http://localhost:3001/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          description: values.description || "",
          status: values.status,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();

      message.success("Cập nhật project thành công");
      onUpdated?.(updated);
      onClose?.();
    } catch (err) {
      // validateFields throw -> bỏ qua
      if (String(err?.message || "").startsWith("HTTP")) {
        message.error("Cập nhật project thất bại");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Chỉnh sửa dự án"
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={submitting}
      okText="Lưu"
      cancelText="Hủy"
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên project"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên project" }]}
        >
          <Input placeholder="VD: Project A" />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <TextArea rows={4} placeholder="Mô tả..." />
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          name="status"
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
      </Form>
    </Modal>
  );
};

export default EditProjectModal;
