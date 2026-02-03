import React from 'react';
import { Pagination } from 'antd';

const ProjectsPagination = ({
    current,
    total,
    pageSize,
    onChange,
}) => {
    if (total === 0) return null;

    return (
        <div className="mt-6 flex justify-center">
            <Pagination
                current={current}
                total={total}
                pageSize={pageSize}
                onChange={onChange}
                showSizeChanger={false}
                showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} dự án`}
            />
        </div>
    );
};

export default ProjectsPagination;
