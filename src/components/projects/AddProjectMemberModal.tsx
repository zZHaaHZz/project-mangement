import React, { useState, useEffect } from 'react';
import { Modal, Select, Button, message, Space, Tag, List, Avatar } from 'antd';
import { UserOutlined, PlusOutlined } from '@ant-design/icons';
import { projectMembersApi } from '../../lib/api';
import { usersApi } from '../../lib/api';
import { User, ProjectMember } from '../../models';
import { useAuth } from '../../contexts/AuthContext';

interface AddProjectMemberModalProps {
  open: boolean;
  projectId: number;
  projectUserId: number; // ID của người tạo project
  onCancel: () => void;
  onSuccess: () => void;
  existingMembers?: ProjectMember[];
}

const AddProjectMemberModal: React.FC<AddProjectMemberModalProps> = ({
  open,
  projectId,
  projectUserId,
  onCancel,
  onSuccess,
  existingMembers = [],
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const { user } = useAuth();

  // Lấy danh sách user IDs đã là member
  const existingMemberIds = existingMembers.map(m => m.userId);
  // Lọc bỏ owner và các member đã có
  const availableUsers = users.filter(
    u => u.id !== projectUserId && !existingMemberIds.includes(u.id)
  );

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      setFetchingUsers(true);
      const data = await usersApi.getUsers();
      setUsers(data);
    } catch (error: any) {
      message.error('Không thể tải danh sách người dùng');
      console.error(error);
    } finally {
      setFetchingUsers(false);
    }
  };

  const handleAddMembers = async () => {
    if (selectedUserIds.length === 0) {
      message.warning('Vui lòng chọn ít nhất một thành viên');
      return;
    }

    try {
      setLoading(true);
      
      // Thêm từng member
      for (const userId of selectedUserIds) {
        await projectMembersApi.createProjectMember({
          projectId,
          userId,
          role: 'member',
        });
      }

      message.success(`Đã thêm ${selectedUserIds.length} thành viên vào project`);
      setSelectedUserIds([]);
      onSuccess();
      onCancel();
    } catch (error: any) {
      message.error(error.message || 'Không thể thêm thành viên');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Thêm thành viên vào project"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="add"
          type="primary"
          loading={loading}
          onClick={handleAddMembers}
          icon={<PlusOutlined />}
        >
          Thêm thành viên
        </Button>,
      ]}
      width={600}
    >
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Chọn thành viên
        </label>
        <Select
          mode="multiple"
          placeholder="Chọn thành viên để thêm vào project"
          value={selectedUserIds}
          onChange={setSelectedUserIds}
          loading={fetchingUsers}
          style={{ width: '100%' }}
          optionLabelProp="label"
        >
          {availableUsers.map((user) => (
            <Select.Option key={user.id} value={user.id} label={user.name}>
              <Space>
                <Avatar size="small" icon={<UserOutlined />} />
                <span>{user.name}</span>
                <Tag color={user.role === 'leader' ? 'blue' : 'default'}>
                  {user.role === 'leader' ? 'Leader' : 'Staff'}
                </Tag>
              </Space>
            </Select.Option>
          ))}
        </Select>
        {availableUsers.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Tất cả người dùng đã tham gia project này
          </p>
        )}
      </div>

      {selectedUserIds.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Thành viên đã chọn:</p>
          <List
            size="small"
            dataSource={users.filter(u => selectedUserIds.includes(u.id))}
            renderItem={(user) => (
              <List.Item>
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <span>{user.name}</span>
                  <Tag color={user.role === 'leader' ? 'blue' : 'default'}>
                    {user.role === 'leader' ? 'Leader' : 'Staff'}
                  </Tag>
                </Space>
              </List.Item>
            )}
          />
        </div>
      )}
    </Modal>
  );
};

export default AddProjectMemberModal;


