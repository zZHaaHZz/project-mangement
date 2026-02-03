import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { canManageStaff } from "@/lib/utils/permissions";

const Sidebar = () => {
  const { user, logout } = useAuth(); // Destructure logout
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  const getLinkClass = ({ isActive }) => {
    const baseClass = "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors";
    // Force pink color using hex to ensure it works regardless of config
    const activeClass = "bg-[#FF4081]/10 text-[#FF4081]";
    const inactiveClass = "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800";

    return isActive ? `${baseClass} ${activeClass}` : `${baseClass} ${inactiveClass}`;
  };

  const getIconStyle = (isActive) => {
    return isActive ? { fontVariationSettings: "'FILL' 1" } : {};
  };

  const handleLogout = () => {
    logout?.();
    navigate("/login");
  };

  return (
    <aside className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark flex flex-col fixed h-full z-20">
      <div className="p-6 flex items-center gap-4">
        <div className="size-12 bg-primary rounded-lg flex items-center justify-center text-white">
          <span className="material-symbols-outlined text-3xl">account_tree</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">PM System</h1>
          <p className="text-slate-500 text-sm font-normal">Management Console</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <NavLink to="/dashboard" className={getLinkClass}>
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined text-2xl" style={getIconStyle(isActive)}>dashboard</span>
              <span className={`text-base ${isActive ? 'font-bold' : 'font-medium'}`}>Dashboard</span>
            </>
          )}
        </NavLink>

        <NavLink to="/projects" className={getLinkClass}>
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined text-2xl" style={getIconStyle(isActive)}>folder</span>
              <span className={`text-base ${isActive ? 'font-bold' : 'font-medium'}`}>Projects</span>
            </>
          )}
        </NavLink>

        <NavLink to="/my-tasks" className={getLinkClass}>
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined text-2xl" style={getIconStyle(isActive)}>check_box</span>
              <span className={`text-base ${isActive ? 'font-bold' : 'font-medium'}`}>Tasks</span>
            </>
          )}
        </NavLink>

        {canManageStaff(user) && (
          <NavLink to="/users" className={getLinkClass}>
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined text-2xl" style={getIconStyle(isActive)}>group</span>
                <span className={`text-base ${isActive ? 'font-bold' : 'font-medium'}`}>Members</span>
              </>
            )}
          </NavLink>
        )}

        <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <span className="material-symbols-outlined text-2xl">bar_chart</span>
          <span className="text-base font-medium">Reports</span>
        </a>

        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
          <NavLink to="/settings" className={getLinkClass}>
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined text-2xl" style={getIconStyle(isActive)}>settings</span>
                <span className={`text-base ${isActive ? 'font-bold' : 'font-medium'}`}>Settings</span>
              </>
            )}
          </NavLink>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 relative">
        {showUserMenu && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 p-2 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors text-sm font-medium"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              Logout
            </button>
          </div>
        )}
        <div
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none"
        >
          <div
            className="size-10 rounded-full bg-center bg-cover border border-white"
            style={{ backgroundImage: `url('${user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuB9rF0wwPDTvt4oTJH1ihfvDY5tx3cGfXN5oHqL29sYamrIIa-CXWNzq8Ji0fIm4nWOggqiaZ69MXnqAhGlZ0-aMzAGeMR1iIDKqePE4FGF9lJC7w7OE1bCtc1qTKa6wj8SHdCaqrgb4GMjzTek6rTZFXXtg3SmYEgvY3_Jzcp3hwD3N0E0p8Wooy-wyQUDYQyghb_iGgylREg6ck6vrFystQcn9xirS_c_X7xnLLWEhPyvgErlea4b3onDczGPt0b2hxKFRfIO7N9R"}')` }}
          ></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name || "Admin User"}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email || "admin@pmsystem.com"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
