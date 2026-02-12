import React from "react";
import { Modal, Space, Button, Tag, Dropdown, Divider, Descriptions, Typography, message, Avatar } from "antd";
import {
    FileTextOutlined,
    ClockCircleOutlined,
    UserOutlined,
    CalendarOutlined,
    EllipsisOutlined,
    CloseOutlined,
    CheckCircleOutlined
} from "@ant-design/icons";
import { tasksApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { isLeader } from "@/lib/utils/permissions";

const { Text, Title, Paragraph } = Typography;

const TaskDetailModal = ({
    open,
    onCancel,
    task,
    projects,
    logworks,
    onStatusUpdated,
    onOpenLogwork,
    onEdit,
    onDelete,
}) => {
    const { user } = useAuth();
    if (!task) return null;

    const handleStatusUpdate = async (key) => {
        try {
            await tasksApi.updateTask(task.id, { status: key });
            onStatusUpdated?.(key);
            message.success("Cập nhật trạng thái thành công");
        } catch (e) {
            message.error("Lỗi cập nhật trạng thái");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa công việc này?")) return;
        try {
            await tasksApi.deleteTask(task.id);
            message.success("Xóa công việc thành công");
            onDelete?.(task.id);
            onCancel();
        } catch (e) {
            message.error("Lỗi xóa công việc");
        }
    };

    const project = projects.find((p) => p.id === task.projectId);
    const taskLogworks = logworks.filter((l) => String(l.taskId) === String(task.id));
    const totalHours = taskLogworks.reduce((acc, cur) => acc + Number(cur.hours), 0);

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            closable={false}
            width={750}
            centered
            className="task-modal-charcoal p-0"
            styles={{ body: { padding: 0 }, content: { padding: 0, borderRadius: '12px', overflow: 'hidden' } }}
        >
            <div className="relative w-full bg-white flex flex-col border border-gray-100 font-sans">
                {/* Header */}
                <div className="px-8 pt-8 pb-4 flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${task.status === "done" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                task.status === "in-progress" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                    "bg-gray-50 text-gray-500 border border-gray-100"
                                }`}>
                                {task.status === "done" ? "Hoàn thành" :
                                    task.status === "in-progress" ? "Đang làm" : "Cần làm"}
                            </span>
                            <span className="text-gray-400 text-xs font-medium">#{task.id}</span>
                        </div>
                        <h1 className="text-[#333] tracking-tight text-3xl font-bold leading-tight">{task.title}</h1>
                    </div>
                    <div className="flex gap-2">
                        {(isLeader(user) || String(user?.id) === String(task.userId)) && (
                            <Dropdown
                                menu={{
                                    items: [
                                        { key: "edit", label: <span className="flex items-center gap-2"><span className="material-symbols-outlined text-base">edit</span> Sửa công việc</span> },
                                        ...(isLeader(user) ? [{ key: "delete", label: <span className="flex items-center gap-2 text-red-500"><span className="material-symbols-outlined text-base">delete</span> Xóa công việc</span> }] : []),
                                        { type: 'divider' },
                                        { key: "todo", label: "Cần làm" },
                                        { key: "in-progress", label: "Đang làm" },
                                        { key: "done", label: "Hoàn thành" },
                                    ],
                                    onClick: ({ key }) => {
                                        if (key === 'edit') onEdit?.(task);
                                        else if (key === 'delete') handleDelete();
                                        else handleStatusUpdate(key);
                                    },
                                }}
                                trigger={["click"]}
                            >
                                <button className="size-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-[#333] hover:border-gray-300 transition-all cursor-pointer">
                                    <span className="material-symbols-outlined">more_horiz</span>
                                </button>
                            </Dropdown>
                        )}
                        <button
                            onClick={onCancel}
                            className="size-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-[#333] hover:border-gray-300 transition-all cursor-pointer"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="px-8 py-6 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar border-t border-gray-50">

                    {/* Project & Assignee Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-3">
                            <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Dự án</label>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="material-symbols-outlined text-primary text-xl">folder</span>
                                <span className="text-[#333] font-semibold">{project?.name || "Dự án không xác định"}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Người thực hiện</label>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <Avatar size={24} icon={<UserOutlined />} className="bg-primary/20 text-primary" />
                                <span className="text-[#333] font-semibold">ID: {task.userId}</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline & Effort */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-wrap gap-8 justify-between">
                        <div className="flex flex-col gap-2">
                            <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Ưu tiên</label>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border w-fit ${task.priority === "high" ? "bg-pink-50 text-pink-600 border-pink-100" :
                                task.priority === "medium" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                    "bg-slate-50 text-slate-600 border-slate-100"
                                }`}>
                                {task.priority === "high" ? "Cao" :
                                    task.priority === "medium" ? "Trung bình" : (task.priority === "low" ? "Thấp" : "Trung bình")}
                            </span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Ước tính</label>
                            <div className="flex items-center gap-2 text-[#333] font-bold">
                                <span className="material-symbols-outlined text-lg">timer</span>
                                {task.estimation || 0} Giờ
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Thời gian đã làm</label>
                            <div className="flex items-center gap-2 text-emerald-600 font-bold">
                                <span className="material-symbols-outlined text-lg">history</span>
                                {totalHours} Giờ
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-3">
                        <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Mô tả</label>
                        <div className="text-gray-600 leading-relaxed text-sm bg-white p-4 rounded-xl border border-gray-100">
                            {task.description || "Chưa có mô tả cho công việc này."}
                        </div>
                    </div>

                    {/* Activity Placeholder */}
                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[#333] font-bold text-base">Lịch sử hoạt động</h3>
                            <span className="text-gray-400 text-xs">{taskLogworks.length} lần ghi nhận</span>
                        </div>
                        <div className="space-y-4">
                            {taskLogworks.map((log, idx) => (
                                <div key={idx} className="flex gap-3 text-sm">
                                    <div className="size-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex gap-2 items-center">
                                            <span className="font-bold text-[#333]">Người dùng {log.userId}</span>
                                            <span className="text-gray-400 text-xs">đã ghi {log.hours}h</span>
                                        </div>
                                        <p className="text-gray-500 italic">"{log.note || "không có chú thích"}"</p>
                                    </div>
                                </div>
                            ))}
                            {taskLogworks.length === 0 && (
                                <div className="p-8 text-center text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    Chưa có hoạt động nào. Hãy là người đầu tiên ghi nhận tiến độ!
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-8 py-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2.5 rounded-lg text-gray-600 font-semibold border border-gray-300 bg-white hover:bg-gray-100 hover:text-[#333] transition-all cursor-pointer"
                    >
                        Đóng
                    </button>
                    {task.status !== "done" && String(user?.id) === String(task.userId) && (
                        <button
                            onClick={(e) => onOpenLogwork(task, e)}
                            className="px-10 py-2.5 bg-primary rounded-lg text-white font-bold shadow-lg shadow-primary/25 hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2 border-none cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-lg">history</span>
                            Ghi nhận giờ làm
                        </button>
                    )}
                </div>
            </div>

            <style>{`
                .task-modal-charcoal .ant-modal-content {
                    padding: 0 !important;
                    background: white !important;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f9fafb;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e5e7eb;
                    border-radius: 10px;
                }
            `}</style>
        </Modal>
    );
};

export default TaskDetailModal;
