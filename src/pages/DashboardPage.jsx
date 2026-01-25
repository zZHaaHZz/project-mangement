import React from 'react';
import { Row, Col, Card, Statistic, Progress, Typography, Space, Tag } from 'antd';
import {
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  RocketOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/lib/hooks/useProjects';
import { useTasks } from '@/lib/hooks/useTasks';
import { isLeader } from '@/lib/utils/permissions';

const { Title, Text } = Typography;

const DashboardPage = () => {
  const { user } = useAuth();
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks();

  // Tính toán thống kê
  const totalProjects = projects?.length || 0;
  const totalTasks = tasks?.length || 0;
  const myTasks = tasks?.filter(task => task.userId === user?.id) || [];
  const myTasksCount = myTasks.length;
  const completedTasks = myTasks.filter(task => task.status === 'done' || task.status === 'done: ').length;
  const inProgressTasks = myTasks.filter(task => task.status === 'in-progress').length;
  const todoTasks = myTasks.filter(task => !task.status || task.status === 'todo').length;

  // Tính toán progress
  const taskCompletionRate = myTasksCount > 0 ? Math.round((completedTasks / myTasksCount) * 100) : 0;

  // Projects by status
  const planningProjects = projects?.filter(p => p.status === 'PLANNING').length || 0;
  const inProgressProjects = projects?.filter(p => p.status === 'IN_PROGRESS').length || 0;
  const completedProjects = projects?.filter(p => p.status === 'COMPLETED').length || 0;

  // Recent projects (last 5)
  const recentProjects = projects?.slice(0, 5) || [];

  return (
    <div className="w-full">
      <div className="mb-8">
        <Title level={2} className="mb-2">
          {isLeader(user) ? 'Dashboard - Leader' : 'Dashboard - Staff'}
        </Title>
        <Text type="secondary" className="text-lg">
          Chào mừng trở lại, {user?.name || 'User'}! 👋
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="shadow-md hover:shadow-lg transition-shadow border-0"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px'
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Tổng dự án</span>}
              value={totalProjects}
              prefix={<ProjectOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            className="shadow-md hover:shadow-lg transition-shadow border-0"
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '12px'
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Tổng công việc</span>}
              value={totalTasks}
              prefix={<CheckCircleOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            className="shadow-md hover:shadow-lg transition-shadow border-0"
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              borderRadius: '12px'
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Công việc của tôi</span>}
              value={myTasksCount}
              prefix={<ClockCircleOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            className="shadow-md hover:shadow-lg transition-shadow border-0"
            style={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              borderRadius: '12px'
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Đã hoàn thành</span>}
              value={completedTasks}
              prefix={<TrophyOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Task Progress Section */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <RocketOutlined style={{ color: '#1890ff' }} />
                <span>Tiến độ công việc</span>
              </Space>
            }
            className="shadow-md border-0"
            style={{ borderRadius: '12px' }}
          >
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <Text strong>Hoàn thành</Text>
                <Text strong>{taskCompletionRate}%</Text>
              </div>
              <Progress
                percent={taskCompletionRate}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                size="default"
              />
            </div>
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{todoTasks}</div>
                  <Text type="secondary" className="text-sm">To Do</Text>
                </div>
              </Col>
              <Col span={8}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{inProgressTasks}</div>
                  <Text type="secondary" className="text-sm">In Progress</Text>
                </div>
              </Col>
              <Col span={8}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                  <Text type="secondary" className="text-sm">Done</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <TeamOutlined style={{ color: '#1890ff' }} />
                <span>Trạng thái dự án</span>
              </Space>
            }
            className="shadow-md border-0"
            style={{ borderRadius: '12px' }}
          >
            <Space direction="vertical" size="middle" className="w-full">
              <div className="flex justify-between items-center">
                <Space>
                  <Tag color="blue">PLANNING</Tag>
                  <Text>Đang lên kế hoạch</Text>
                </Space>
                <Text strong className="text-lg">{planningProjects}</Text>
              </div>
              <div className="flex justify-between items-center">
                <Space>
                  <Tag color="green">IN_PROGRESS</Tag>
                  <Text>Đang thực hiện</Text>
                </Space>
                <Text strong className="text-lg">{inProgressProjects}</Text>
              </div>
              <div className="flex justify-between items-center">
                <Space>
                  <Tag color="gold">COMPLETED</Tag>
                  <Text>Đã hoàn thành</Text>
                </Space>
                <Text strong className="text-lg">{completedProjects}</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Recent Projects */}
      {isLeader(user) && recentProjects.length > 0 && (
        <Card
          title={
            <Space>
              <ProjectOutlined style={{ color: '#1890ff' }} />
              <span>Dự án gần đây</span>
            </Space>
          }
          className="shadow-md border-0"
          style={{ borderRadius: '12px' }}
        >
          <Space direction="vertical" size="middle" className="w-full">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => window.location.href = `/projects/${project.id}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <Text strong className="text-lg">{project.name}</Text>
                    <div className="mt-1">
                      <Tag color={
                        project.status === 'PLANNING' ? 'blue' :
                          project.status === 'IN_PROGRESS' ? 'green' :
                            project.status === 'COMPLETED' ? 'gold' : 'default'
                      }>
                        {project.status}
                      </Tag>
                    </div>
                  </div>
                  <ProjectOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                </div>
              </div>
            ))}
          </Space>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;
