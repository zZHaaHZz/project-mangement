import React from "react";

const ProjectEmptyState = () => {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-secondary-dark/10 rounded-xl border border-dashed border-gray-700">
            <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">
                folder_open
            </span>
            <p className="text-gray-500 text-lg">Không tìm thấy dự án nào</p>
        </div>
    );
};

export default ProjectEmptyState;
