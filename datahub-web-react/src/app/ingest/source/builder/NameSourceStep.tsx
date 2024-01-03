import { Button, Checkbox, Collapse, Form, Input, Typography } from 'antd';
import React from 'react';
import { t } from 'i18next';
import styled from 'styled-components';
import { SourceBuilderState, StepProps } from './types';

const ControlsContainer = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
`;

const SaveButton = styled(Button)`
    margin-right: 15px;
`;

export const NameSourceStep = ({ state, updateState, prev, submit }: StepProps) => {
    const setName = (stagedName: string) => {
        const newState: SourceBuilderState = {
            ...state,
            name: stagedName,
        };
        updateState(newState);
    };

    const setExecutorId = (execId: string) => {
        const newState: SourceBuilderState = {
            ...state,
            config: {
                ...state.config,
                executorId: execId,
            },
        };
        updateState(newState);
    };

    const setVersion = (version: string) => {
        const newState: SourceBuilderState = {
            ...state,
            config: {
                ...state.config,
                version,
            },
        };
        updateState(newState);
    };

    const setDebugMode = (debugMode: boolean) => {
        const newState: SourceBuilderState = {
            ...state,
            config: {
                ...state.config,
                debugMode,
            },
        };
        updateState(newState);
    };

    const onClickCreate = (shouldRun?: boolean) => {
        if (state.name !== undefined && state.name.length > 0) {
            submit(shouldRun);
        }
    };

    return (
        <>
            <Form layout="vertical">
                <Form.Item
                    required
                    label={
                        <Typography.Text strong style={{ marginBottom: 0 }}>
                            {t('Name')}
                        </Typography.Text>
                    }
                    style={{ marginBottom: 8 }}
                >
                    <Typography.Paragraph>{t('Give this ingestion source a name.')}</Typography.Paragraph>
                    <Input
                        data-testid="source-name-input"
                        className="source-name-input"
                        placeholder={t('My Redshift Source #2')}
                        value={state.name}
                        onChange={(event) => setName(event.target.value)}
                    />
                </Form.Item>
                <Collapse ghost>
                    <Collapse.Panel
                        header={<Typography.Text type="secondary">{t('Advanced')}</Typography.Text>}
                        key="1"
                    >
                        <Form.Item label={<Typography.Text strong>{t('Executor Id')}</Typography.Text>}>
                            <Typography.Paragraph>
                                {t('Executor Id')}
                                {t('UniqueId.create.id.description', { type: t('executor') })}
                            </Typography.Paragraph>
                            <Input
                                placeholder={t('default')}
                                value={state.config?.executorId || ''}
                                onChange={(event) => setExecutorId(event.target.value)}
                            />
                        </Form.Item>
                        <Form.Item label={<Typography.Text strong>CLI Version</Typography.Text>}>
                            <Typography.Paragraph>
                                {t('Advanced: Provide a custom CLI version to use for ingestion.')}
                            </Typography.Paragraph>
                            <Input
                                data-testid="cli-version-input"
                                className="cli-version-input"
                                placeholder={t('(e.g. 0.10.5)')}
                                value={state.config?.version || ''}
                                onChange={(event) => setVersion(event.target.value)}
                            />
                        </Form.Item>
                        <Form.Item label={<Typography.Text strong>{t('Debug Mode')}</Typography.Text>}>
                            <Typography.Paragraph>
                                {t('Advanced: Turn on debug mode in order to get more verbose logs.')}
                            </Typography.Paragraph>
                            <Checkbox
                                checked={state.config?.debugMode || false}
                                onChange={(event) => setDebugMode(event.target.checked)}
                            />
                        </Form.Item>
                    </Collapse.Panel>
                </Collapse>
            </Form>
            <ControlsContainer>
                <Button onClick={prev}>{t('Previous')}</Button>
                <div>
                    <SaveButton
                        disabled={!(state.name !== undefined && state.name.length > 0)}
                        onClick={() => onClickCreate(false)}
                    >
                        {t('Save')}
                    </SaveButton>
                    <Button
                        disabled={!(state.name !== undefined && state.name.length > 0)}
                        onClick={() => onClickCreate(true)}
                        type="primary"
                    >
                        {t('Save & Run')}
                    </Button>
                </div>
            </ControlsContainer>
        </>
    );
};
