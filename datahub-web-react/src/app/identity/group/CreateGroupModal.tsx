import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { message, Button, Input, Modal, Typography, Form, Collapse } from 'antd';
import { useCreateGroupMutation } from '../../../graphql/group.generated';
import { useEnterKeyListener } from '../../shared/useEnterKeyListener';
import { validateCustomUrnId } from '../../shared/textUtil';
import analytics, { EventType } from '../../analytics';
import { CorpGroup, EntityType } from '../../../types.generated';

type Props = {
    onClose: () => void;
    onCreate: (group: CorpGroup) => void;
};

export default function CreateGroupModal({ onClose, onCreate }: Props) {
    const { t } = useTranslation();
    const [stagedName, setStagedName] = useState('');
    const [stagedDescription, setStagedDescription] = useState('');
    const [stagedId, setStagedId] = useState<string | undefined>(undefined);
    const [createGroupMutation] = useCreateGroupMutation();
    const [createButtonEnabled, setCreateButtonEnabled] = useState(true);
    const [form] = Form.useForm();

    const onCreateGroup = () => {
        createGroupMutation({
            variables: {
                input: {
                    id: stagedId,
                    name: stagedName,
                    description: stagedDescription,
                },
            },
        })
            .then(({ data, errors }) => {
                if (!errors) {
                    analytics.event({
                        type: EventType.CreateGroupEvent,
                    });
                    message.success({
                        content: `Created group!`,
                        duration: 3,
                    });
                    // TODO: Get a full corp group back from create endpoint.
                    onCreate({
                        urn: data?.createGroup || '',
                        type: EntityType.CorpGroup,
                        name: stagedName,
                        info: {
                            description: stagedDescription,
                        },
                    });
                }
            })
            .catch((e) => {
                message.destroy();
                message.error({ content: `Failed to create group!: \n ${e.message || ''}`, duration: 3 });
            })
            .finally(() => {
                setStagedName('');
                setStagedDescription('');
            });
        onClose();
    };

    // Handle the Enter press
    useEnterKeyListener({
        querySelectorToExecuteClick: '#createGroupButton',
    });

    return (
        <Modal
            title={t('Create new group')}
            visible
            onCancel={onClose}
            footer={
                <>
                    <Button onClick={onClose} type="text">
                        {t('Cancel')}
                    </Button>
                    <Button id="createGroupButton" onClick={onCreateGroup} disabled={createButtonEnabled}>
                        {t('Create')}
                    </Button>
                </>
            }
        >
            <Form
                form={form}
                initialValues={{}}
                layout="vertical"
                onFieldsChange={() =>
                    setCreateButtonEnabled(form.getFieldsError().some((field) => field.errors.length > 0))
                }
            >
                <Form.Item label={<Typography.Text strong>{t('Name')}</Typography.Text>}>
                    <Typography.Paragraph>{t('Give your new group a name.')}</Typography.Paragraph>
                    <Form.Item
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: t('Enter a Group name.'),
                            },
                            { whitespace: true },
                            { min: 1, max: 50 },
                        ]}
                        hasFeedback
                    >
                        <Input
                            placeholder={t('A name for your group')}
                            value={stagedName}
                            onChange={(event) => setStagedName(event.target.value)}
                        />
                    </Form.Item>
                </Form.Item>
                <Form.Item label={<Typography.Text strong>{t('Description')}</Typography.Text>}>
                    <Typography.Paragraph>{t('An optional description for your new group.')}</Typography.Paragraph>
                    <Form.Item name="description" rules={[{ whitespace: true }, { min: 1, max: 500 }]} hasFeedback>
                        <Input
                            placeholder={t('A description for your group')}
                            value={stagedDescription}
                            onChange={(event) => setStagedDescription(event.target.value)}
                        />
                    </Form.Item>
                </Form.Item>
                <Collapse ghost>
                    <Collapse.Panel
                        header={<Typography.Text type="secondary">{t('Advanced')}</Typography.Text>}
                        key="1"
                    >
                        <Form.Item label={<Typography.Text strong>{t('Group Id')}</Typography.Text>}>
                            <Typography.Paragraph>
                                {t('UniqueId.create.id.description', { type: t('Groups') })}
                            </Typography.Paragraph>
                            <Form.Item
                                name="groupId"
                                rules={[
                                    () => ({
                                        validator(_, value) {
                                            if (value && validateCustomUrnId(value)) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Please enter correct Group name'));
                                        },
                                    }),
                                ]}
                            >
                                <Input
                                    placeholder={t('product_engineering')}
                                    value={stagedId || ''}
                                    onChange={(event) => setStagedId(event.target.value)}
                                />
                            </Form.Item>
                        </Form.Item>
                    </Collapse.Panel>
                </Collapse>
            </Form>
        </Modal>
    );
}
