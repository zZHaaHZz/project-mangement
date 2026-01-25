import React from "react";
import { Row, Col, Card, Statistic } from "antd";
import { PlusOutlined, UserAddOutlined } from "@ant-design/icons";

const ProjectStatistics = ({
  totalTasks,
  completedTasks,
  totalHours,
  totalMembers,
}) => {
  return (
    <Row gutter={16} className="mb-6">
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Tổng số task"
            value={totalTasks}
            prefix={<PlusOutlined />}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Task hoàn thành"
            value={completedTasks}
            styles={{
              content: {
                color: "#3f8600",
              },
            }}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Tổng giờ làm việc"
            value={totalHours}
            suffix="giờ"
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Thành viên"
            value={totalMembers}
            prefix={<UserAddOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default ProjectStatistics;
