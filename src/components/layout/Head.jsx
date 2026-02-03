import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLayout } from "@/contexts/LayoutContext";

const Head = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { headerActions } = useLayout();

  // Simple breadcrumb logic
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "Dashboard";
    if (path.startsWith("/projects")) return "Projects";
    if (path.startsWith("/my-tasks")) return "Tasks";
    if (path.startsWith("/users")) return "Members";
    if (path.startsWith("/settings")) return "Settings";
    return "Page";
  };

  const currentTitle = getPageTitle();

  return (
    <header className="h-20 bg-white dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <nav className="flex items-center gap-2 text-sm">
          <Link className="text-slate-500 hover:text-primary transition-colors" to="/dashboard">Dashboard</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 dark:text-white font-medium">{currentTitle}</span>
        </nav>
      </div>

      <div className="flex items-center gap-4 flex-1 justify-end">
        {headerActions ? (
          <div className="flex items-center gap-4 w-full max-w-2xl justify-end">
            {headerActions}
          </div>
        ) : (
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-slate-400 text-lg">search</span>
            <input
              className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-slate-400"
              placeholder="Search members..."
              type="text"
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default Head;
