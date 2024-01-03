import React from 'react';
import styled from 'styled-components';
import { t } from 'i18next';
import { Typography } from 'antd';
import { GlobalOutlined, LockOutlined } from '@ant-design/icons';
import { DataHubViewType } from '../../../types.generated';

const StyledLockOutlined = styled(LockOutlined)<{ color }>`
    color: ${(props) => props.color};
    margin-right: 4px;
`;

const StyledGlobalOutlined = styled(GlobalOutlined)<{ color }>`
    color: ${(props) => props.color};
    margin-right: 4px;
`;

const StyledText = styled(Typography.Text)<{ color }>`
    && {
        color: ${(props) => props.color};
    }
`;

type Props = {
    type: DataHubViewType;
    color: string;
};

/**
 * Label used to describe View Types
 *
 * @param param0 the color of the text and iconography
 */
export const ViewTypeLabel = ({ type, color }: Props) => {
    const copy =
        type === DataHubViewType.Personal ? (
            <>
                <b>{t('Private')}</b> - {t('only visible to you.')}
            </>
        ) : (
            <>
                <b>{t('Public')}</b> - {t('visible to everyone.')}
            </>
        );
    const Icon = type === DataHubViewType.Global ? StyledGlobalOutlined : StyledLockOutlined;

    return (
        <>
            <Icon color={color} />
            <StyledText color={color} type="secondary">
                {copy}
            </StyledText>
        </>
    );
};
