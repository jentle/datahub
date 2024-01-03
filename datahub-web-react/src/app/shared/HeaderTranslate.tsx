import React from 'react';
import { TranslationOutlined } from '@ant-design/icons';
import { Dropdown, Button } from 'antd';
import type { MenuProps } from 'antd';
import { useTranslation } from 'react-i18next';

export const HeaderTranslate: React.FC = () => {
    const { i18n } = useTranslation();

    const switchLang = (e) => {
        e.preventDefault();
        const lang = e.detail.value;
        i18n.changeLanguage(lang);
    };

    const items: MenuProps['items'] = [
        {
            key: '1',
            label: '简体中文',
        },
        {
            key: '2',
            label: 'English',
        },
    ];

    return (
        <span>
            <Dropdown menu={{ items }}>
                <Button type="text" aria-hidden="true" onClick={switchLang}>
                    <TranslationOutlined />
                </Button>
            </Dropdown>
        </span>
    );
};
