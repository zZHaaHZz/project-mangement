import React from "react";

const ProjectFilters = ({
    filterStatus,
    setFilterStatus,
    sortOrder,
    setSortOrder,
    totalVisible
}) => {
    return (
        <div className="flex flex-col gap-8">
            {/* Page Heading and Sort */}
            <div className="flex flex-wrap justify-between items-end gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                        Dự án
                    </h1>
                    <p className="text-accent-text text-base">
                        Bạn đang có {totalVisible} dự án trong không gian làm việc.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                        className="flex items-center gap-2 bg-gray-200 dark:bg-secondary-dark text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-secondary-dark/80 cursor-pointer border-none transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">
                            {sortOrder === "desc" ? "south" : "north"}
                        </span>
                        {sortOrder === "desc" ? "Mới nhất" : "Cũ nhất"}
                    </button>
                    <button className="flex items-center gap-2 bg-gray-200 dark:bg-secondary-dark text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-secondary-dark/80 cursor-pointer border-none transition-all">
                        <span className="material-symbols-outlined text-lg">filter_list</span>
                        Bộ lọc
                    </button>
                </div>
            </div>

            {/* Filters/Chips */}
            <div className="flex gap-3 flex-wrap">
                <button
                    onClick={() => setFilterStatus("all")}
                    className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold cursor-pointer transition-all border-none ${filterStatus === "all"
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "bg-gray-200 dark:bg-secondary-dark text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-secondary-dark/80"
                        }`}
                >
                    Tất cả dự án
                </button>
                <button
                    onClick={() => setFilterStatus("IN_PROGRESS")}
                    className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium cursor-pointer transition-all border-none ${filterStatus === "IN_PROGRESS"
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "bg-gray-200 dark:bg-secondary-dark text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-secondary-dark/80"
                        }`}
                >
                    Đang triển khai
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                </button>
                <button
                    onClick={() => setFilterStatus("COMPLETED")}
                    className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium cursor-pointer transition-all border-none ${filterStatus === "COMPLETED"
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "bg-gray-200 dark:bg-secondary-dark text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-secondary-dark/80"
                        }`}
                >
                    Hoàn thành
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                </button>
                <button
                    onClick={() => setFilterStatus("ON_HOLD")}
                    className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium cursor-pointer transition-all border-none ${filterStatus === "ON_HOLD"
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "bg-gray-200 dark:bg-secondary-dark text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-secondary-dark/80"
                        }`}
                >
                    Tạm dừng
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                </button>
            </div>
        </div>
    );
};

export default ProjectFilters;
