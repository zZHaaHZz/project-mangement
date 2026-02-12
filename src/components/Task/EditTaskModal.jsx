import React, { useEffect, useMemo, useState } from "react";
import { Modal, Form, Input, Select, message, Button } from "antd";
import { tasksApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { isLeader } from "@/lib/utils/permissions";

const { TextArea } = Input;

const EditTaskModal = ({
    open,
    onClose,
    task,
    projectMembers = [],
    userMap = new Map(),
    onUpdated,
}) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (open && task) {
            form.setFieldsValue({
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                userId: task.userId,
                estimation: task.estimation,
            });
        }
    }, [open, task, form]);

    const memberOptions = useMemo(() => {
        return (projectMembers || [])
            .map((m) => {
                const u = userMap.get(m.userId);
                if (!u) return null;
                return { label: u.name, value: u.id };
            })
            .filter(Boolean);
    }, [projectMembers, userMap]);

    const handleUpdate = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);

            const payload = {
                ...task,
                ...values,
                projectId: Number(task.projectId),
                userId: values.userId ? Number(values.userId) : null,
                estimation: values.estimation ? Number(values.estimation) : 0,
            };

            await tasksApi.updateTask(task.id, payload);
            message.success("Cập nhật task thành công");
            onClose?.();
            onUpdated?.();
        } catch (err) {
            if (!err?.errorFields) message.error("Cập nhật task thất bại");
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
            width={800}
            centered
            className="task-modal-charcoal p-0"
            styles={{ body: { padding: 0 }, content: { padding: 0, borderRadius: '12px', overflow: 'hidden' } }}
        >
            <div className="relative w-full bg-white flex flex-col border border-gray-100 font-sans">
                {/* Header */}
                <div className="px-8 pt-8 pb-4 flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-[#333] tracking-tight text-2xl font-bold leading-tight font-display">Chỉnh Sửa Task</h1>
                        <p className="text-gray-500 text-sm font-normal">Cập nhật thông tin chi tiết của công việc</p>
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
                        {/* Task Title */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#333] text-sm font-semibold flex items-center gap-1">
                                Tên task <span className="text-primary">*</span>
                            </label>
                            <Form.Item
                                name="title"
                                rules={[{ required: true, message: "Vui lòng nhập tên công việc" }]}
                                className="mb-0"
                            >
                                <Input
                                    placeholder="VD: Thiết kế giao diện Modal"
                                    className="w-full rounded-lg text-[#333] focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary border border-transparent bg-[#F3F4F6] h-12 placeholder:text-gray-400 px-4 text-base font-normal transition-all"
                                />
                            </Form.Item>
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#333] text-sm font-semibold">Mô tả</label>
                            <Form.Item name="description" className="mb-0">
                                <TextArea
                                    rows={4}
                                    placeholder="Mô tả ngắn gọn về công việc..."
                                    className="w-full resize-none rounded-lg text-[#333] focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary border border-transparent bg-[#F3F4F6] min-h-[120px] placeholder:text-gray-400 p-4 text-base font-normal transition-all"
                                />
                            </Form.Item>
                        </div>

                        {/* Status & Priority & Assignee Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[#333] text-sm font-semibold flex items-center gap-1">
                                    Trạng thái <span className="text-primary">*</span>
                                </label>
                                <Form.Item
                                    name="status"
                                    rules={[{ required: true }]}
                                    className="mb-0"
                                >
                                    <Select
                                        className="task-select-charcoal h-12"
                                        options={[
                                            { value: "planning", label: "Lên kế hoạch" },
                                            { value: "todo", label: "Cần làm" },
                                            { value: "in-progress", label: "Đang làm" },
                                            { value: "done", label: "Hoàn thành" },
                                        ]}
                                        suffixIcon={<span className="material-symbols-outlined text-gray-400">unfold_more</span>}
                                    />
                                </Form.Item>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[#333] text-sm font-semibold flex items-center gap-1">
                                    Độ ưu tiên <span className="text-primary">*</span>
                                </label>
                                <Form.Item
                                    name="priority"
                                    rules={[{ required: true }]}
                                    className="mb-0"
                                >
                                    <Select
                                        className="task-select-charcoal h-12"
                                        options={[
                                            { value: "high", label: "Cao" },
                                            { value: "medium", label: "Trung bình" },
                                            { value: "low", label: "Thấp" },
                                        ]}
                                        suffixIcon={<span className="material-symbols-outlined text-gray-400">priority_high</span>}
                                    />
                                </Form.Item>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[#333] text-sm font-semibold">Thành viên</label>
                                <Form.Item name="userId" className="mb-0">
                                    <Select
                                        disabled={!isLeader(user)}
                                        className="task-select-charcoal h-12"
                                        placeholder="Chọn thành viên"
                                        showSearch
                                        optionFilterProp="label"
                                        options={memberOptions}
                                        suffixIcon={<span className="material-symbols-outlined text-gray-400">search</span>}
                                    />
                                </Form.Item>
                            </div>
                        </div>
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
                        onClick={handleUpdate}
                        disabled={submitting}
                        className="px-10 py-2.5 bg-primary rounded-lg text-white font-bold shadow-lg shadow-primary/25 hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2 border-none cursor-pointer disabled:opacity-50"
                    >
                        {submitting ? "Đang xử lý..." : "Cập nhật"}
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

export default EditTaskModal;
