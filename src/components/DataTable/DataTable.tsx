/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Table, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { DataTableProps } from '../../types/components';
import type { UUIDRecord } from '../../types';

export const DataTable: React.FC<DataTableProps> = ({ csvData }) => {
  const columns: any = [
    {
      title: 'Linha',
      dataIndex: 'line',
      key: 'line',
      width: 80,
      align: 'center',
    },
    {
      title: 'UUID',
      dataIndex: 'uuid',
      key: 'uuid',
      render: (uuid: string) => (
        <code style={{ 
          fontSize: '12px', 
          backgroundColor: '#f5f5f5', 
          padding: '2px 6px', 
          borderRadius: '4px',
          fontFamily: 'Monaco, Consolas, monospace'
        }}>
          {uuid}
        </code>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isValid',
      key: 'status',
      width: 120,
      align: 'center',
      render: (isValid: boolean) => (
        <Tag 
          icon={isValid ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={isValid ? 'success' : 'error'}
        >
          {isValid ? 'Válido' : 'Inválido'}
        </Tag>
      ),
      filters: [
        { text: 'Válidos', value: true },
        { text: 'Inválidos', value: false },
      ],
      onFilter: (value: any, record: any) => record.isValid === value,
    },
  ];

  return (
    <Table<UUIDRecord>
      columns={columns}
      dataSource={csvData}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} de ${total} registros`,
      }}
      scroll={{ y: 400 }}
      size="small"
    />
  );
};
