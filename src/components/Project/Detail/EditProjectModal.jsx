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
      if (String(err?.message || "").startsWith("HTTP")) {
        message.error("Cập nhật project thất bại");
      }
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
      width={700}
      centered
      className="task-modal-charcoal p-0"
      styles={{ body: { padding: 0 }, content: { padding: 0, borderRadius: '12px', overflow: 'hidden' } }}
    >
      <div className="relative w-full bg-white flex flex-col border border-gray-100 font-sans">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <h1 className="text-[#333] tracking-tight text-2xl font-bold leading-tight">Chỉnh Sửa Dự Án</h1>
            <p className="text-gray-500 text-sm font-normal">Cập nhật thông tin chi tiết cho dự án của bạn</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#333] transition-colors border-none bg-transparent cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-4 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar border-t border-gray-50">
          <Form form={form} layout="vertical" requiredMark={false}>
            <Form.Item
              label={<span className="text-[#333] text-sm font-semibold">Tên project <span className="text-primary">*</span></span>}
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên project" }]}
              className="mb-6"
            >
              <Input
                placeholder="VD: Hệ thống quản lý dự án"
                className="w-full rounded-lg text-[#333] focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary border border-transparent bg-[#F3F4F6] h-12 placeholder:text-gray-400 px-4 text-base font-normal transition-all"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-[#333] text-sm font-semibold">Mô tả</span>}
              name="description"
              className="mb-6"
            >
              <TextArea
                rows={4}
                placeholder="Mô tả ngắn gọn về dự án..."
                className="w-full resize-none rounded-lg text-[#333] focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary border border-transparent bg-[#F3F4F6] min-h-[120px] placeholder:text-gray-400 p-4 text-base font-normal transition-all"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-[#333] text-sm font-semibold">Trạng thái <span className="text-primary">*</span></span>}
              name="status"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
              className="mb-0"
            >
              <Select
                className="task-select-charcoal h-12"
                options={[
                  { value: "PLANNING", label: "Đang lên kế hoạch (Planning)" },
                  { value: "IN_PROGRESS", label: "Đang thực hiện (In Progress)" },
                  { value: "COMPLETED", label: "Hoàn thành (Completed)" },
                  { value: "CANCELLED", label: "Đã hủy (Cancelled)" },
                ]}
                suffixIcon={<span className="material-symbols-outlined text-gray-400">unfold_more</span>}
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
            {submitting ? "Đang xử lý..." : "Lưu Thay Đổi"}
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
          padding: 0 16px !important;
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

export default EditProjectModal;
