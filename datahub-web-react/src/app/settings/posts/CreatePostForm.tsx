import React, { useState } from 'react';
import { Form, Input, Typography, FormInstance, Radio } from 'antd';
import styled from 'styled-components';
import { t } from 'i18next';
import {
    DESCRIPTION_FIELD_NAME,
    LINK_FIELD_NAME,
    LOCATION_FIELD_NAME,
    TITLE_FIELD_NAME,
    TYPE_FIELD_NAME,
} from './constants';
import { PostContentType } from '../../../types.generated';

const TopFormItem = styled(Form.Item)`
    margin-bottom: 24px;
`;

const SubFormItem = styled(Form.Item)`
    margin-bottom: 0;
`;

type Props = {
    setCreateButtonEnabled: (isEnabled: boolean) => void;
    form: FormInstance;
};

export default function CreatePostForm({ setCreateButtonEnabled, form }: Props) {
    const [postType, setPostType] = useState<PostContentType>(PostContentType.Text);

    return (
        <Form
            form={form}
            initialValues={{}}
            layout="vertical"
            onFieldsChange={() => {
                setCreateButtonEnabled(!form.getFieldsError().some((field) => field.errors.length > 0));
            }}
        >
            <TopFormItem name={TYPE_FIELD_NAME} label={<Typography.Text strong>{t('Post Type')}</Typography.Text>}>
                <Radio.Group
                    onChange={(e) => setPostType(e.target.value)}
                    value={postType}
                    defaultValue={postType}
                    optionType="button"
                    buttonStyle="solid"
                >
                    <Radio value={PostContentType.Text}>{t('Announcement')}</Radio>
                    <Radio value={PostContentType.Link}>{t('Link')}</Radio>
                </Radio.Group>
            </TopFormItem>

            <TopFormItem label={<Typography.Text strong>{t('Title')}</Typography.Text>}>
                <Typography.Paragraph>{t('The title for your new post.')}</Typography.Paragraph>
                <SubFormItem name={TITLE_FIELD_NAME} rules={[{ required: true }]} hasFeedback>
                    <Input data-testid="create-post-title" placeholder={t('Your post title')} />
                </SubFormItem>
            </TopFormItem>
            {postType === PostContentType.Text && (
                <TopFormItem label={<Typography.Text strong>{t('Description')}</Typography.Text>}>
                    <Typography.Paragraph>{t('The main content for your new post.')}</Typography.Paragraph>
                    <SubFormItem name={DESCRIPTION_FIELD_NAME} rules={[{ min: 0, max: 500 }]} hasFeedback>
                        <Input.TextArea placeholder={t('Your post description')} />
                    </SubFormItem>
                </TopFormItem>
            )}
            {postType === PostContentType.Link && (
                <>
                    <TopFormItem label={<Typography.Text strong>{t('Link URL')}</Typography.Text>}>
                        <Typography.Paragraph>
                            {t('Where users will be directed when they click this post.')}
                        </Typography.Paragraph>
                        <SubFormItem name={LINK_FIELD_NAME} rules={[{ type: 'url', warningOnly: true }]} hasFeedback>
                            <Input data-testid="create-post-link" placeholder={t('Your post link URL')} />
                        </SubFormItem>
                    </TopFormItem>
                    <SubFormItem label={<Typography.Text strong>{t('Image URL')}</Typography.Text>}>
                        <Typography.Paragraph>
                            {t('A URL to an image you want to display on your link post.')}
                        </Typography.Paragraph>
                        <SubFormItem
                            name={LOCATION_FIELD_NAME}
                            rules={[{ type: 'url', warningOnly: true }]}
                            hasFeedback
                        >
                            <Input data-testid="create-post-media-location" placeholder={t('Your post image URL')} />
                        </SubFormItem>
                    </SubFormItem>
                </>
            )}
        </Form>
    );
}
