import React from "react";
import { Modal, Space, InputNumber, Input, Typography } from "antd";

const { Text, Title } = Typography;

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
            open={open}
            onCancel={onCancel}
            footer={null}
            closable={false}
            width={500}
            centered
            className="task-modal-charcoal p-0"
            styles={{ body: { padding: 0 }, content: { padding: 0, borderRadius: '12px', overflow: 'hidden' } }}
        >
            <div className="relative w-full bg-white flex flex-col border border-gray-100 font-sans">
                {/* Header */}
                <div className="px-8 pt-8 pb-4 flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-[#333] tracking-tight text-2xl font-bold leading-tight">Ghi Nhận Công Việc</h1>
                        <p className="text-gray-500 text-sm font-normal line-clamp-1">Task: {selectedTask?.title || "Logwork"}</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-[#333] transition-colors border-none bg-transparent cursor-pointer"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="px-8 py-4 space-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[#333] text-sm font-semibold flex items-center gap-1">
                            Số giờ làm việc <span className="text-primary">*</span>
                        </label>
                        <InputNumber
                            min={0.25}
                            step={0.25}
                            className="w-full rounded-lg text-[#333] focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary border border-transparent bg-[#F3F4F6] h-12 flex items-center px-4 text-base font-normal transition-all"
                            value={hours}
                            onChange={(v) => setHours(v || 0)}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[#333] text-sm font-semibold">Ghi chú công việc</label>
                        <Input.TextArea
                            rows={4}
                            placeholder="Bạn đã làm được những gì trong thời gian này?"
                            className="w-full resize-none rounded-lg text-[#333] focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary border border-transparent bg-[#F3F4F6] min-h-[120px] placeholder:text-gray-400 p-4 text-base font-normal transition-all"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2.5 rounded-lg text-gray-600 font-semibold border border-gray-300 bg-white hover:bg-gray-100 hover:text-[#333] transition-all cursor-pointer"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onOk}
                        className="px-10 py-2.5 bg-primary rounded-lg text-white font-bold shadow-lg shadow-primary/25 hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2 border-none cursor-pointer"
                    >
                        Lưu logwork
                    </button>
                </div>
            </div>

            <style>{`
                .task-modal-charcoal .ant-modal-content {
                    padding: 0 !important;
                    background: white !important;
                    box-shadow: none !important;
                }
                
                .ant-modal-mask {
                    background-color: rgba(255, 255, 255, 0.45) !important;
                    backdrop-filter: blur(8px) !important;
                }
            `}</style>
        </Modal>
    );
};

export default LogworkModal;
