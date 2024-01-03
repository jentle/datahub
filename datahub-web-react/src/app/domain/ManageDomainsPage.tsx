import { Typography } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { DomainsList } from './DomainsList';

const PageContainer = styled.div`
    padding-top: 20px;
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

export const ManageDomainsPage = () => {
    const { t } = useTranslation();

    return (
        <PageContainer>
            <PageHeaderContainer>
                <PageTitle level={3}>{t('Domains')}</PageTitle>
                <Typography.Paragraph type="secondary">{t('view_domains')}</Typography.Paragraph>
            </PageHeaderContainer>
            <ListContainer>
                <DomainsList />
            </ListContainer>
        </PageContainer>
    );
};
