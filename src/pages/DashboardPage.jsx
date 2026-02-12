import React, { useMemo } from 'react';
import { Row, Col, Card, Progress, Typography, Space, Tag, Empty, Button } from 'antd';
import {
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  TrophyOutlined,
  BarChartOutlined,
  CalendarOutlined,
  RiseOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/lib/hooks/useProjects';
import { useTasks } from '@/lib/hooks/useTasks';
import { isLeader } from '@/lib/utils/permissions';

const { Title, Text, Paragraph } = Typography;

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks();

  // Statistics calculation
  const stats = useMemo(() => {
    const totalProjects = projects?.length || 0;
    const totalTasks = tasks?.length || 0;
    const myTasks = tasks?.filter(task => String(task.userId) === String(user?.id)) || [];
    const myTasksCount = myTasks.length;
    const completedTasks = myTasks.filter(task => task.status === 'done').length;
    const inProgressTasks = myTasks.filter(task => task.status === 'in-progress').length;
    const todoTasks = myTasks.filter(task => !task.status || task.status === 'todo').length;

    const taskCompletionRate = myTasksCount > 0 ? Math.round((completedTasks / myTasksCount) * 100) : 0;

    const projectStats = {
      planning: projects?.filter(p => p.status === 'PLANNING').length || 0,
      inProgress: projects?.filter(p => p.status === 'IN_PROGRESS').length || 0,
      completed: projects?.filter(p => p.status === 'COMPLETED').length || 0,
    };

    const recentProjects = [...(projects || [])]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);

    return {
      totalProjects,
      totalTasks,
      myTasksCount,
      completedTasks,
      inProgressTasks,
      todoTasks,
      taskCompletionRate,
      projectStats,
      recentProjects
    };
  }, [projects, tasks, user]);

  const loading = projectsLoading || tasksLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin size-10 border-4 border-primary border-t-transparent rounded-full"></div>
          <Text className="text-gray-500 font-medium">Đang tải dữ liệu dashboard...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-700 p-6">
      {/* Welcome Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full">
              {isLeader(user) ? 'Quản lý hệ thống' : 'Thành viên dự án'}
            </span>
            <span className="text-gray-300">•</span>
            <Text className="text-gray-400 text-sm font-medium">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
          </div>
          <Title level={1} className="!m-0 !text-[#333] !text-4xl !font-black tracking-tight">
            Chào buổi sáng, {user?.name?.split(' ')[0] || 'User'}! ✨
          </Title>
          <Paragraph className="!text-gray-500 !text-lg !m-0 font-medium">
            Hôm nay bạn có <Text strong className="text-primary">{stats.todoTasks + stats.inProgressTasks}</Text> công việc cần xử lý.
          </Paragraph>
        </div>
        <div className="flex gap-3">
          <Button
            icon={<CalendarOutlined />}
            className="h-11 px-6 rounded-xl font-bold border-gray-200 hover:border-primary hover:text-primary transition-all"
          >
            Lịch trình
          </Button>
          <Button
            type="primary"
            icon={<ProjectOutlined />}
            onClick={() => navigate('/projects')}
            className="h-11 px-6 bg-primary rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 border-none flex items-center gap-2"
          >
            Xem Dự Án
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Tổng Dự Án"
          value={stats.totalProjects}
          icon={<ProjectOutlined />}
          color="bg-indigo-500"
          trend="+2 tháng này"
        />
        <StatCard
          title="Công Việc Của Tôi"
          value={stats.myTasksCount}
          icon={<ClockCircleOutlined />}
          color="bg-primary"
          trend={`${stats.inProgressTasks} đang làm`}
        />
        <StatCard
          title="Đã Hoàn Thành"
          value={stats.completedTasks}
          icon={<TrophyOutlined />}
          color="bg-emerald-500"
          trend={`${stats.taskCompletionRate}% tỉ lệ`}
        />
        <StatCard
          title="Năng Suất Tuần"
          value="85%"
          icon={<RiseOutlined />}
          color="bg-amber-500"
          trend="Tăng 12%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Progress & Details */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#333] flex items-center gap-3">
                <BarChartOutlined className="text-primary" />
                Tổng Quan Tiến Độ
              </h2>
            </div>
            <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-50">
                <div className="p-8 space-y-6">
                  <div className="flex flex-col items-center">
                    <Progress
                      type="dashboard"
                      percent={stats.taskCompletionRate}
                      strokeColor={{ '0%': '#FF4081', '100%': '#ff80ab' }}
                      strokeWidth={10}
                      width={180}
                      className="dash-progress"
                    />
                    <div className="mt-[-40px] text-center">
                      <Text className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Hoàn thành</Text>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xl font-black text-gray-400">{stats.todoTasks}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Cần làm</div>
                    </div>
                    <div>
                      <div className="text-xl font-black text-blue-500">{stats.inProgressTasks}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Đang làm</div>
                    </div>
                    <div>
                      <div className="text-xl font-black text-emerald-500">{stats.completedTasks}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Xong</div>
                    </div>
                  </div>
                </div>
                <div className="p-8 space-y-6 bg-gray-50/30">
                  <Text className="text-gray-400 font-bold uppercase tracking-widest text-[11px]">Trạng Thái Dự Án</Text>
                  <div className="space-y-4">
                    <StatusRow label="Đang lên kế hoạch" count={stats.projectStats.planning} color="bg-blue-500" total={stats.totalProjects} />
                    <StatusRow label="Đang thực hiện" count={stats.projectStats.inProgress} color="bg-primary" total={stats.totalProjects} />
                    <StatusRow label="Đã hoàn thành" count={stats.projectStats.completed} color="bg-emerald-500" total={stats.totalProjects} />
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <Text className="text-gray-500 text-sm italic">Cập nhật lúc {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</Text>
                    <Button type="link" className="p-0 font-bold text-primary" onClick={() => navigate('/projects')}>Chi tiết <ArrowRightOutlined /></Button>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#333] flex items-center gap-3">
                <ProjectOutlined className="text-primary" />
                Dự Án Vừa Cập Nhật
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.recentProjects.length > 0 ? (
                stats.recentProjects.map(proj => (
                  <Card
                    key={proj.id}
                    className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all group cursor-pointer"
                    onClick={() => navigate(`/projects/${proj.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-gray-50 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                          <ProjectOutlined className="text-xl" />
                        </div>
                        <div>
                          <div className="text-base font-bold text-[#333] mb-1">{proj.name}</div>
                          <Tag className="rounded-full border-none px-3 font-bold text-[10px] uppercase tracking-wider" color={proj.status === 'IN_PROGRESS' ? 'magenta' : 'default'}>
                            {proj.status === 'IN_PROGRESS' ? 'Đang chạy' : proj.status}
                          </Tag>
                        </div>
                      </div>
                      <ArrowRightOutlined className="text-gray-300 group-hover:text-primary transition-colors" />
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-2">
                  <Empty description="Chưa có dự án nào" className="my-10" />
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column - Activity & Quick Info */}
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold text-[#333] mb-6 flex items-center gap-3">
              <CheckCircleOutlined className="text-primary" />
              Công Việc Ưu Tiên
            </h2>
            <Card className="rounded-3xl border-none shadow-sm">
              <div className="space-y-6">
                {(tasks || []).filter(t => t.priority === 'high' && t.status !== 'done').slice(0, 5).map(task => (
                  <div key={task.id} className="flex gap-4 group cursor-pointer" onClick={() => navigate('/my-tasks')}>
                    <div className="size-2 rounded-full bg-primary mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                    <div>
                      <div className="text-sm font-bold text-[#333] group-hover:text-primary transition-colors">{task.title}</div>
                      <Text className="text-[11px] text-gray-400 font-medium">#{task.id} • Hạn chót: {new Date(task.createdAt).toLocaleDateString('vi-VN')}</Text>
                    </div>
                  </div>
                ))}
                {tasks?.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có việc khẩn cấp" />}
                <Button block className="h-10 rounded-xl font-bold text-gray-500 hover:text-primary mt-4" onClick={() => navigate('/my-tasks')}>
                  Xem tất cả công việc
                </Button>
              </div>
            </Card>
          </section>

          <section>
            <Card
              className="rounded-3xl border-none text-white overflow-hidden relative"
              style={{ background: 'linear-gradient(135deg, #FF4081 0%, #E91E63 100%)' }}
            >
              <div className="relative z-10 space-y-4">
                <TrophyOutlined className="text-4xl opacity-50" />
                <div className="space-y-1">
                  <div className="text-lg font-black tracking-tight">Bạn đang làm rất tốt!</div>
                  <Text className="text-white/80 text-sm font-medium">
                    Bạn đã hoàn thành {stats.completedTasks} công việc trong tuần này. Hãy tiếp tục duy trì phong độ nhé!
                  </Text>
                </div>
              </div>
              <div className="absolute top-[-20px] right-[-20px] size-40 bg-white/10 rounded-full blur-3xl" />
            </Card>
          </section>
        </div>
      </div>

      <style>{`
        .dash-progress .ant-progress-text {
          font-weight: 900 !important;
          font-size: 32px !important;
          color: #333 !important;
          letter-spacing: -1px;
        }
        .ant-progress-circle-trail {
          stroke: #f3f4f6 !important;
        }
      `}</style>
    </div>
  );
};

/* Helper Components */
const StatCard = ({ title, value, icon, color, trend }) => (
  <Card className="rounded-3xl border-none shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
    <div className="relative z-10">
      <div className={`size-12 ${color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-${color.split('-')[1]}-500/20 group-hover:scale-110 transition-transform`}>
        {React.cloneElement(icon, { style: { fontSize: '24px' } })}
      </div>
      <div>
        <div className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-1">{title}</div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-[#333] tracking-tighter">{value}</span>
          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">{trend}</span>
        </div>
      </div>
    </div>
    <div className="absolute top-[-10px] right-[-10px] text-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
      {React.cloneElement(icon, { style: { fontSize: '80px' } })}
    </div>
  </Card>
);

const StatusRow = ({ label, count, color, total }) => {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-[#333] font-bold">{label}</span>
        <span className="text-gray-400 font-bold">{count} ({percent}%)</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-1000`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
