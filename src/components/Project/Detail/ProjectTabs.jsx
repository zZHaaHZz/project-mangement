import React from "react";

const ProjectTabs = ({ activeTab = "Tổng quan", onTabChange }) => {
    const tabs = [
        "Tổng quan",
        "Bảng Kanban",
        "Phân tích",
        "Lịch",
        "Cài đặt",
    ];

    return (
        <div className="px-4">
            <div className="flex border-b border-slate-200 dark:border-primary/20 gap-8 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => onTabChange?.(tab)}
                        className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-all cursor-pointer whitespace-nowrap bg-transparent border-none ${activeTab === tab
                                ? "border-b-primary text-primary"
                                : "border-b-transparent text-slate-500 dark:text-slate-400 hover:text-primary"
                            }`}
                    >
                        <p className="text-sm font-bold leading-normal tracking-wide">
                            {tab}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ProjectTabs;
