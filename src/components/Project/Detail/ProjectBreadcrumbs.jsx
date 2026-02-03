import React from "react";
import { useNavigate } from "react-router-dom";

const ProjectBreadcrumbs = ({ projectName }) => {
    const navigate = useNavigate();

    return (
        <nav className="flex flex-wrap items-center gap-2 px-4 py-2">
            <button
                onClick={() => navigate("/")}
                className="text-slate-400 text-sm font-medium leading-none flex items-center gap-1 hover:text-primary cursor-pointer border-none bg-transparent p-0 transition-colors"
            >
                <span className="material-symbols-outlined text-lg">home</span> Trang chủ
            </button>
            <span className="text-slate-400 text-sm font-medium leading-none flex items-center">/</span>
            <button
                onClick={() => navigate("/projects")}
                className="text-slate-400 text-sm font-medium leading-none hover:text-primary cursor-pointer border-none bg-transparent p-0 flex items-center transition-colors"
            >
                Dự án
            </button>
            <span className="text-slate-400 text-sm font-medium leading-none flex items-center">/</span>
            <span className="text-primary text-sm font-semibold leading-none flex items-center">
                {projectName}
            </span>
        </nav>
    );
};

export default ProjectBreadcrumbs;
