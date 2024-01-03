import { Typography } from 'antd';
import React from 'react';
import styled from 'styled-components/macro';
import { t } from 'i18next';
import { PostList } from './PostsList';

const PageContainer = styled.div`
    padding-top: 20px;
    width: 100%;
    height: 100%;
`;

const PageHeaderContainer = styled.div`
    && {
        padding-left: 24px;
    }
`;

const PageTitle = styled(Typography.Title)`
    && {
        margin-bottom: 12px;
    }
`;

const ListContainer = styled.div``;

export default function ManagePosts() {
    return (
        <PageContainer>
            <PageHeaderContainer>
                <PageTitle level={3}>{t('Home Page Posts')}</PageTitle>
                <Typography.Paragraph type="secondary">
                    {t('View and manage pinned posts that appear to all users on the landing page.')}
                </Typography.Paragraph>
            </PageHeaderContainer>
            <ListContainer>
                <PostList />
            </ListContainer>
        </PageContainer>
    );
}
