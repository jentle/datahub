import React from 'react';
import { Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import { StyledTable } from '../../../entity/shared/components/styled/StyledTable';
import { ExecutionRequest } from '../../../../types.generated';
import { ButtonsColumn, SourceColumn, StatusColumn, TimeColumn } from './IngestionExecutionTableColumns';
import { SUCCESS } from '../utils';

interface Props {
    executionRequests: ExecutionRequest[];
    setFocusExecutionUrn: (urn: string) => void;
    handleViewDetails: (urn: string) => void;
    handleCancelExecution: (urn: string) => void;
    handleRollbackExecution: (runId: string) => void;
}

export default function IngestionExecutionTable({
    executionRequests,
    setFocusExecutionUrn,
    handleViewDetails,
    handleCancelExecution,
    handleRollbackExecution,
}: Props) {
    const { t } = useTranslation();

    const tableColumns = [
        {
            title: t('Requested At'),
            dataIndex: 'requestedAt',
            key: 'requestedAt',
            render: TimeColumn,
        },
        {
            title: t('Started At'),
            dataIndex: 'executedAt',
            key: 'executedAt',
            render: TimeColumn,
        },
        {
            title: t('Duration (s)'),
            dataIndex: 'duration',
            key: 'duration',
            render: (durationMs: number) => {
                const seconds = (durationMs && `${durationMs / 1000}s`) || 'None';
                return seconds;
            },
        },
        {
            title: t('Status'),
            dataIndex: 'status',
            key: 'status',
            render: (status: any, record) => (
                <StatusColumn status={status} record={record} setFocusExecutionUrn={setFocusExecutionUrn} />
            ),
        },
        {
            title: t('Source'),
            dataIndex: 'source',
            key: 'source',
            render: SourceColumn,
        },
        {
            title: t(''),
            dataIndex: '',
            key: 'x',
            render: (_, record: any) => (
                <ButtonsColumn
                    record={record}
                    handleViewDetails={handleViewDetails}
                    handleCancelExecution={handleCancelExecution}
                    handleRollbackExecution={handleRollbackExecution}
                />
            ),
        },
    ];

    const mostRecentSuccessfulExecution = executionRequests.find((execution) => execution.result?.status === SUCCESS);

    const tableData = executionRequests.map((execution) => ({
        urn: execution.urn,
        id: execution.id,
        source: execution.input.source.type,
        requestedAt: execution.input?.requestedAt,
        executedAt: execution.result?.startTimeMs,
        duration: execution.result?.durationMs,
        status: execution.result?.status,
        showRollback: execution.urn === mostRecentSuccessfulExecution?.urn,
    }));

    return (
        <StyledTable
            columns={tableColumns}
            dataSource={tableData}
            rowKey="id"
            locale={{
                emptyText: <Empty description={t('No Executions found!')} image={Empty.PRESENTED_IMAGE_SIMPLE} />,
            }}
            pagination={false}
        />
    );
}
