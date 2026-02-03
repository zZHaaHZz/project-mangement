import React from "react";
import { Avatar, Tooltip } from "antd";
import { UserOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const STATUS_CONFIG = {
    PLANNING: {
        color: "blue",
        icon: "smartphone",
        label: "Dự kiến",
        bgClass: "bg-blue-500/20",
        textClass: "text-blue-400",
        barColor: "bg-blue-400",
    },
    IN_PROGRESS: {
        color: "primary",
        icon: "web",
        label: "Đang triển khai",
        bgClass: "bg-primary/20",
        textClass: "text-primary",
        barColor: "bg-primary",
    },
    COMPLETED: {
        color: "emerald",
        icon: "task_alt",
        label: "Hoàn thành",
        bgClass: "bg-emerald-500/20",
        textClass: "text-emerald-400",
        barColor: "bg-emerald-400",
    },
    CANCELLED: {
        color: "red",
        icon: "cancel",
        label: "Đã hủy",
        bgClass: "bg-red-500/20",
        textClass: "text-red-400",
        barColor: "bg-red-400",
    },
    ON_HOLD: {
        color: "amber",
        icon: "inventory_2",
        label: "Tạm dừng",
        bgClass: "bg-amber-500/20",
        textClass: "text-amber-400",
        barColor: "bg-amber-400",
    },
};

const ProjectCard = ({ project, owner, progress = 0, isAtRisk = false, overdueCount = 0 }) => {
    const navigate = useNavigate();

    const formatDate = (value) => {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";
        return date.toLocaleDateString("vi-VN", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const handleClick = () => {
        navigate(`/projects/${project.id}`);
    };

    const status = STATUS_CONFIG[project.status] || STATUS_CONFIG.IN_PROGRESS;

    return (
        <div
            onClick={handleClick}
            className={`bg-white dark:bg-secondary-dark/30 border ${isAtRisk ? 'border-red-400/50 hover:border-red-500' : 'border-slate-200 dark:border-secondary-dark hover:border-primary/50'} rounded-xl p-5 transition-all flex flex-col gap-4 cursor-pointer hover:-translate-y-1 hover:shadow-xl h-full shadow-sm dark:shadow-none relative overflow-hidden`}
        >
            {isAtRisk && (
                <div className="absolute top-0 right-0">
                    <div className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-[12px]">warning</span>
                        CHẬM TIẾN ĐỘ ({overdueCount})
                    </div>
                </div>
            )}
            <div className="flex justify-between items-start">
                <div
                    className={`size-12 ${status.bgClass} rounded-lg flex items-center justify-center`}
                >
                    <span className={`material-symbols-outlined ${status.textClass}`}>
                        {status.icon}
                    </span>
                </div>
                {!isAtRisk && (
                    <span
                        className={`${status.bgClass.replace(
                            "/20",
                            "/10"
                        )} ${status.textClass} text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider`}
                    >
                        {status.label}
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 pr-10" title={project.name}>
                    {project.name}
                </h3>
                <p className="text-slate-500 dark:text-accent-text text-sm mt-1">
                    Ngày tạo: {formatDate(project.createdAt)}
                </p>
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-semibold">
                    <span className={`${isAtRisk ? 'text-red-500' : 'text-slate-500 dark:text-accent-text'}`}>
                        {isAtRisk ? 'Rủi ro trễ hạn' : 'Tiến độ hoàn thành'}
                    </span>
                    <span className={isAtRisk ? 'text-red-600 font-bold' : 'text-gray-900 dark:text-white'}>{progress}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-secondary-dark rounded-full h-2">
                    <div
                        className={`${isAtRisk ? 'bg-red-500' : status.barColor} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-700/50">
                <div className="flex -space-x-2">
                    {owner ? (
                        <Tooltip title={owner.name}>
                            <div
                                className="size-8 rounded-full border-2 border-background-dark bg-cover bg-center"
                                style={{
                                    backgroundImage: `url('${owner.avatar || "https://ui-avatars.com/api/?name=" + owner.name}')`,
                                }}
                            />
                        </Tooltip>
                    ) : (
                        <div className="size-8 rounded-full border-2 border-background-dark bg-gray-600 flex items-center justify-center text-xs text-white">
                            ?
                        </div>
                    )}
                </div>
                <button className="text-primary text-sm font-bold hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer">
                    Xem chi tiết
                </button>
            </div>
        </div>
    );
};

export default ProjectCard;
