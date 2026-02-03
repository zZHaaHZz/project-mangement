import React from "react";
import { Dropdown, message } from "antd";

const ProjectDetailHeader = ({
  project,
  canEdit,
  onEdit,
  onStatusChange
}) => {
  return (
    <div className="flex flex-wrap justify-between items-end gap-3 p-4">
      <div className="flex min-w-72 flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-tight">
            {project?.name}
          </h1>
          {canEdit ? (
            <Dropdown
              menu={{
                items: [
                  { key: "PLANNING", label: "Dự kiến" },
                  { key: "IN_PROGRESS", label: "Đang triển khai" },
                  { key: "COMPLETED", label: "Hoàn thành" },
                  { key: "ON_HOLD", label: "Tạm dừng" },
                  { key: "CANCELLED", label: "Đã hủy" },
                ],
                onClick: ({ key }) => {
                  onStatusChange?.(key)
                    .then(() => message.success("Đã cập nhật trạng thái"))
                    .catch(() => message.error("Cập nhật thất bại"));
                },
              }}
              trigger={["click"]}
            >
              <button
                className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase cursor-pointer border-none transition-all flex items-center gap-1 shadow-sm ${project.status === "PLANNING" ? "bg-blue-100 text-blue-600 hover:bg-blue-200" :
                  project.status === "IN_PROGRESS" ? "bg-primary/10 text-primary hover:bg-primary/20" :
                    project.status === "COMPLETED" ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200" :
                      project.status === "ON_HOLD" ? "bg-amber-100 text-amber-600 hover:bg-amber-200" :
                        project.status === "CANCELLED" ? "bg-red-100 text-red-600 hover:bg-red-200" :
                          "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
              >
                {project.status === "PLANNING" ? "Dự kiến" :
                  project.status === "IN_PROGRESS" ? "Đang triển khai" :
                    project.status === "COMPLETED" ? "Hoàn thành" :
                      project.status === "ON_HOLD" ? "Tạm dừng" :
                        project.status === "CANCELLED" ? "Đã hủy" : "Đang triển khai"}
                <span className="material-symbols-outlined text-[14px]">
                  expand_more
                </span>
              </button>
            </Dropdown>
          ) : (
            <span
              className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase shadow-sm ${project.status === "PLANNING" ? "bg-blue-100 text-blue-600" :
                project.status === "IN_PROGRESS" ? "bg-primary/10 text-primary" :
                  project.status === "COMPLETED" ? "bg-emerald-100 text-emerald-600" :
                    project.status === "ON_HOLD" ? "bg-amber-100 text-amber-600" :
                      project.status === "CANCELLED" ? "bg-red-100 text-red-600" :
                        "bg-primary/10 text-primary"
                }`}
            >
              {project.status === "PLANNING" ? "Dự kiến" :
                project.status === "IN_PROGRESS" ? "Đang triển khai" :
                  project.status === "COMPLETED" ? "Hoàn thành" :
                    project.status === "ON_HOLD" ? "Tạm dừng" :
                      project.status === "CANCELLED" ? "Đã hủy" : "Đang triển khai"}
            </span>
          )}
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">event</span>
          Ngày tạo:{" "}
          {project.createdAt
            ? new Date(project.createdAt).toLocaleDateString("vi-VN")
            : "Không rõ"}
        </p>
      </div>
      <div className="flex gap-4">
        <button className="flex items-center justify-center rounded-xl h-14 px-10 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white text-base font-bold transition-all hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer border-none group shadow-sm">
          <span className="material-symbols-outlined mr-3 text-2xl transition-transform group-hover:scale-110" style={{ fontVariationSettings: "'wght' 600" }}>
            share
          </span>
          Chia sẻ
        </button>
        {canEdit && (
          <button
            onClick={onEdit}
            className="flex items-center justify-center rounded-xl h-14 px-10 bg-primary text-white text-base font-bold shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 cursor-pointer border-none group"
          >
            <span className="material-symbols-outlined mr-3 text-2xl transition-transform group-hover:scale-110" style={{ fontVariationSettings: "'wght' 600" }}>
              edit_square
            </span>
            Sửa dự án
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailHeader;
