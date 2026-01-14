import React, { useEffect, useMemo, useState } from "react";
import { Modal, Form, Select, message } from "antd";

const AddProjectMemberModal = ({
  open,
  onClose,
  projectId,
  users = [],
  currentUserId,
  existingMembers = [], // projectMembers
  onAdded, // callback để parent refetch/update members
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) form.resetFields();
  }, [open, form]);

  // set userId đã có trong project_members
  const existingUserIdSet = useMemo(() => {
    const set = new Set();
    (existingMembers || []).forEach((m) => set.add(String(m.userId)));
    // owner cũng coi như "đã có"
    if (currentUserId != null) set.add(String(currentUserId));
    return set;
  }, [existingMembers, currentUserId]);

  const options = useMemo(() => {
    return (users || [])
      .filter((u) => !existingUserIdSet.has(String(u.id)))
      .map((u) => ({
        label: `${u.name} (${u.email})`,
        value: u.id,
      }));
  }, [users, existingUserIdSet]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const now = new Date().toISOString();
      const userIds = values.userIds || [];

      // POST nhiều member cùng lúc
      const requests = userIds.map((uid) =>
        fetch("http://localhost:3001/project_members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: Number(projectId),
            userId: Number(uid),
            role: "member",
            createdAt: now,
          }),
        })
      );

      const results = await Promise.all(requests);
      const failed = results.find((r) => !r.ok);
      if (failed) throw new Error(`HTTP ${failed.status}`);

      message.success("Thêm thành viên thành công");
      onAdded?.(); // thường gọi lại fetchMembers()
      onClose?.();
    } catch (err) {
      // validateFields throw -> bỏ qua
      if (String(err?.message || "").startsWith("HTTP")) {
        message.error("Thêm thành viên thất bại");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Thêm thành viên"
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
          label="Chọn thành viên"
          name="userIds"
          rules={[
            { required: true, message: "Vui lòng chọn ít nhất 1 thành viên" },
          ]}
        >
          <Select
            mode="multiple"
            allowClear
            placeholder="Chọn user để thêm vào dự án"
            options={options}
            optionFilterProp="label"
            notFoundContent="Không còn user nào để thêm"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddProjectMemberModal;
