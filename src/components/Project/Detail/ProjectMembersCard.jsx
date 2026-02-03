import React from "react";
import { Popconfirm, Tooltip, message } from "antd";

const ProjectMembersCard = ({
  members = [],
  owner,
  userMap = new Map(),
  loading,
  canAddMember,
  onAddMember,
  canRemoveMember = false,
  onRemoveMember,
  currentUserId,
  isCompleted = false,
}) => {
  if (loading) return null;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-primary/20 bg-white dark:bg-white/5 p-6 shadow-sm">
      <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">
        Thành viên nhóm
      </h3>
      <div className="flex flex-wrap gap-6">
        {/* Owner first */}
        {owner && (
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full border-2 border-primary overflow-hidden shadow-sm">
              <img
                alt={owner.name}
                className="w-full h-full object-cover"
                src={owner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(owner.name)}&background=FF4081&color=fff`}
              />
            </div>
            <div>
              <p className="text-sm font-bold dark:text-white">{owner.name}</p>
              <p className="text-xs text-slate-500">Trưởng dự án</p>
            </div>
          </div>
        )}

        {/* Other members */}
        {members
          .filter((m) => String(m.userId) !== String(currentUserId))
          .map((m) => {
            const user = userMap.get(m.userId);
            if (!user) return null;
            return (
              <div key={m.id} className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="size-10 rounded-full border-2 border-primary/20 overflow-hidden group-hover:border-primary transition-all shadow-sm">
                    <img
                      alt={user.name}
                      className="w-full h-full object-cover"
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f3f4f6&color=4b5563`}
                    />
                  </div>
                  {canRemoveMember && (
                    <Popconfirm
                      title="Xóa thành viên"
                      description="Bạn có chắc muốn xóa thành viên này?"
                      onConfirm={() => onRemoveMember?.(m)}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true, size: 'small' }}
                    >
                      <button className="absolute -top-1 -right-1 size-5 bg-red-500 text-white rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform cursor-pointer border-none">
                        <span className="material-symbols-outlined text-[12px]">
                          close
                        </span>
                      </button>
                    </Popconfirm>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold dark:text-white">{user.name}</p>
                  <p className="text-xs text-slate-500">Thành viên</p>
                </div>
              </div>
            );
          })}

        {/* Add Member Button */}
        {canAddMember && !isCompleted && (
          <Tooltip title="Thêm thành viên">
            <button
              onClick={onAddMember}
              className="size-10 rounded-full border-2 border-dashed border-slate-300 dark:border-primary/30 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all cursor-pointer bg-transparent"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default ProjectMembersCard;
