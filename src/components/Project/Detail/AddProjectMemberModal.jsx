import React, { useEffect, useMemo, useState } from "react";
import { Modal, Form, Select, message } from "antd";
import { projectMembersApi } from "@/lib/api";

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

      // POST nhiều member cùng lúc bằng projectMembersApi
      const requests = userIds.map((uid) =>
        projectMembersApi.createProjectMember({
          projectId: Number(projectId),
          userId: Number(uid),
          role: "member",
          createdAt: now,
        })
      );

      await Promise.all(requests);

      message.success("Thêm thành viên thành công");
      onAdded?.(); // thường gọi lại fetchMembers()
      onClose?.();
    } catch (err) {
      // validateFields throw -> bỏ qua
      if (err?.errorFields) return;
      message.error("Thêm thành viên thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={600}
      centered
      className="task-modal-charcoal p-0"
      styles={{ body: { padding: 0 }, content: { padding: 0, borderRadius: '12px', overflow: 'hidden' } }}
    >
      <div className="relative w-full bg-white flex flex-col border border-gray-100 font-sans">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <h1 className="text-[#333] tracking-tight text-2xl font-bold leading-tight">Thêm Thành Viên</h1>
            <p className="text-gray-500 text-sm font-normal">Mời thêm nhân viên tham gia vào dự án này</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#333] transition-colors border-none bg-transparent cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar border-t border-gray-50">
          <Form form={form} layout="vertical" requiredMark={false}>
            <Form.Item
              label={<span className="text-[#333] text-sm font-semibold">Chọn thành viên <span className="text-primary">*</span></span>}
              name="userIds"
              rules={[
                { required: true, message: "Vui lòng chọn ít nhất 1 thành viên" },
              ]}
              className="mb-0"
            >
              <Select
                mode="multiple"
                allowClear
                placeholder="Chọn user để thêm vào dự án"
                options={options}
                optionFilterProp="label"
                notFoundContent="Không còn user nào để thêm"
                className="task-select-charcoal h-auto min-h-[48px]"
                suffixIcon={<span className="material-symbols-outlined text-gray-400">search</span>}
              />
            </Form.Item>
          </Form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg text-gray-600 font-semibold border border-gray-300 bg-white hover:bg-gray-100 hover:text-[#333] transition-all cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={handleOk}
            disabled={submitting}
            className="px-10 py-2.5 bg-primary rounded-lg text-white font-bold shadow-lg shadow-primary/25 hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2 border-none cursor-pointer disabled:opacity-50"
          >
            {submitting ? "Đang thêm..." : "Thêm"}
          </button>
        </div>
      </div>

      <style>{`
        .task-modal-charcoal .ant-modal-content {
          padding: 0 !important;
          background: white !important;
          box-shadow: none !important;
        }
        
        .task-select-charcoal .ant-select-selector {
          background-color: #F3F4F6 !important;
          border: 1px solid transparent !important;
          color: #333 !important;
          border-radius: 8px !important;
          padding: 4px 16px !important;
          font-weight: 400 !important;
          transition: all 0.2s !important;
        }

        .task-select-charcoal.ant-select-focused .ant-select-selector {
          border-color: #FF4081 !important;
          box-shadow: 0 0 0 2px rgba(255, 64, 129, 0.2) !important;
          background-color: white !important;
        }

        .ant-modal-mask {
          background-color: rgba(255, 255, 255, 0.45) !important;
          backdrop-filter: blur(8px) !important;
        }
      `}</style>
    </Modal>
  );
};

export default AddProjectMemberModal;
