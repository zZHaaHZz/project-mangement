import React from "react";

const StatCard = ({ title, value, trend, trendValue, icon, isTrendingUp }) => (
  <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-slate-200 dark:border-primary/20 bg-white dark:bg-white/5 shadow-sm">
    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">
      {title}
    </p>
    <div className="flex items-baseline justify-between">
      <p className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold">
        {value}
      </p>
      {trendValue && (
        <p
          className={`${isTrendingUp ? "text-emerald-500" : "text-rose-500"
            } text-sm font-bold flex items-center gap-1`}
        >
          <span className="material-symbols-outlined text-sm">
            {isTrendingUp ? "trending_up" : "trending_down"}
          </span>{" "}
          {trendValue}
        </p>
      )}
      {!trendValue && trend && (
        <p className="text-slate-400 text-sm font-medium italic">{trend}</p>
      )}
    </div>
  </div>
);

const ProjectStatistics = ({
  totalTasks,
  completedTasks,
  totalHours,
  totalMembers,
}) => {
  return (
    <div className="flex flex-wrap gap-4 p-4">
      <StatCard
        title="Tổng công việc"
        value={totalTasks}
        trendValue="+5%"
        isTrendingUp={true}
      />
      <StatCard
        title="Hoàn thành"
        value={completedTasks}
        trendValue="-2%"
        isTrendingUp={false}
      />
      <StatCard
        title="Giờ làm việc"
        value={totalHours}
        trendValue="+10%"
        isTrendingUp={true}
      />
      <StatCard
        title="Thành viên"
        value={totalMembers}
        trend="Đang ổn định"
      />
    </div>
  );
};

export default ProjectStatistics;
