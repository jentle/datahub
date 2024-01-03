import React, { ReactNode, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { Affix, Row, Select, Typography } from 'antd';
import { useGetDataProfilesLazyQuery } from '../../../../../../graphql/dataset.generated';
import { DatasetProfile, DateInterval } from '../../../../../../types.generated';
import { Message } from '../../../../../shared/Message';
import { getFixedLookbackWindow, TimeWindowSize } from '../../../../../shared/time/timeUtils';

import ProfilingRunsChart from './charts/ProfilingRunsChart';
import StatsSection from '../StatsSection';
import StatChart from './charts/StatChart';

const HeaderRow = styled(Row)`
    padding-top: 24px;
    padding-bottom: 28px;
    background-color: white;
`;

const SubHeaderText = styled(Typography.Text)`
    color: gray;
    font-size: 16px;
`;

const EmbeddedSelect = styled(Select)`
    padding-left: 8px;
`;

const isPresent = (val: any) => {
    return val !== undefined && val !== null;
};

/**
 * Extracts a set of points used to render charts from a list of Dataset Profiles +
 * a particular numeric statistic name to extract. Note that the stat *must* be numeric for this utility to work.
 */
const extractChartValuesFromTableProfiles = (profiles: Array<any>, statName: string) => {
    return profiles
        .filter((profile) => isPresent(profile[statName]))
        .map((profile) => ({
            timeMs: profile.timestampMillis,
            value: profile[statName] as number,
        }));
};

/**
 * Extracts a set of field-specific points used to render charts from a list of Dataset Profiles +
 * a particular numeric statistic name to extract. Note that the stat *must* be numeric for this utility to work.
 */
const extractChartValuesFromFieldProfiles = (profiles: Array<any>, fieldPath: string, statName: string) => {
    return profiles
        .filter((profile) => profile.fieldProfiles)
        .map((profile) => {
            const fieldProfiles = profile.fieldProfiles
                ?.filter((field) => field.fieldPath === fieldPath)
                .filter((field) => field[statName] !== null && field[statName] !== undefined);

            if (fieldProfiles?.length === 1) {
                const fieldProfile = fieldProfiles[0];
                return {
                    timeMs: profile.timestampMillis,
                    value: fieldProfile[statName],
                };
            }
            return null;
        })
        .filter((value) => value !== null);
};

const computeChartTickInterval = (windowSize: TimeWindowSize): DateInterval => {
    switch (windowSize.interval) {
        case DateInterval.Day:
            return DateInterval.Hour;
        case DateInterval.Week:
            return DateInterval.Day;
        case DateInterval.Month:
            return DateInterval.Week;
        case DateInterval.Year:
            return DateInterval.Month;
        default:
            throw new Error(`Unrecognized DateInterval provided ${windowSize.interval}`);
    }
};

const computeAllFieldPaths = (profiles: Array<DatasetProfile>): Set<string> => {
    const uniqueFieldPaths = new Set<string>();
    profiles.forEach((profile) => {
        const fieldProfiles = profile.fieldProfiles || [];
        fieldProfiles.forEach((fieldProfile) => {
            uniqueFieldPaths.add(fieldProfile.fieldPath);
        });
    });
    return uniqueFieldPaths;
};

/**
 * Change this to add or modify the lookback windows that are selectable via the UI.
 */
const LOOKBACK_WINDOWS = [
    { text: '1 day', windowSize: { interval: DateInterval.Day, count: 1 } },
    { text: '1 week', windowSize: { interval: DateInterval.Week, count: 1 } },
    { text: '1 month', windowSize: { interval: DateInterval.Month, count: 1 } },
    { text: '3 months', windowSize: { interval: DateInterval.Month, count: 3 } },
    { text: '1 year', windowSize: { interval: DateInterval.Year, count: 1 } },
];

const DEFAULT_LOOKBACK_WINDOW = '3 months';

const getLookbackWindowSize = (text: string) => {
    for (let i = 0; i < LOOKBACK_WINDOWS.length; i++) {
        const window = LOOKBACK_WINDOWS[i];
        if (window.text === text) {
            return window.windowSize;
        }
    }
    throw new Error(`Unrecognized lookback window size ${text} provided`);
};

export type Props = {
    urn: string;
    toggleView: ReactNode;
};

export default function HistoricalStatsView({ urn, toggleView }: Props) {
    const { t } = useTranslation();
    const [getDataProfiles, { data: profilesData, loading: profilesLoading }] = useGetDataProfilesLazyQuery({
        fetchPolicy: 'cache-first',
    });

    /**
     * Perform initial fetch of default lookback window stats.
     */
    useEffect(() => {
        getDataProfiles({
            variables: { urn, ...getFixedLookbackWindow(getLookbackWindowSize(DEFAULT_LOOKBACK_WINDOW)) },
        });
    }, [urn, getDataProfiles]);

    /**
     * Determines which fixed lookback window is used to display historical statistics. See above for valid options.
     */
    const [selectedLookbackWindow, setSelectedLookbackWindow] = useState(DEFAULT_LOOKBACK_WINDOW);
    const selectedWindowSize = getLookbackWindowSize(selectedLookbackWindow);
    const selectedWindow = getFixedLookbackWindow(selectedWindowSize);

    /**
     * Determines which field path is highlighted in column stats. Defaults to none.
     */
    const [selectedFieldPath, setSelectedFieldPath] = useState('');

    /**
     *  Change handlers.
     */
    const onChangeSelectedLookbackWindow = (text) => {
        const newWindowSize = getLookbackWindowSize(text);
        const newTimeWindow = getFixedLookbackWindow(newWindowSize);
        getDataProfiles({
            variables: { urn, ...newTimeWindow },
        });
        setSelectedLookbackWindow(text);
    };

    const onChangeSelectedFieldPath = (value) => {
        setSelectedFieldPath(value);
    };

    const graphTickInterval = computeChartTickInterval(selectedWindowSize);
    const graphDateRange = {
        start: selectedWindow.startTime.toString(),
        end: selectedWindow.endTime.toString(),
    };

    const profiles = profilesData?.dataset?.datasetProfiles || [];
    const allFieldPaths = Array.from(computeAllFieldPaths(profiles));

    if (selectedFieldPath === '' && allFieldPaths.length > 0) {
        // Set initially selected field path.
        setSelectedFieldPath(allFieldPaths[0]);
    }

    const columnSelectView = (
        <span>
            <SubHeaderText>Viewing stats for column</SubHeaderText>
            <EmbeddedSelect style={{ width: 200 }} value={selectedFieldPath} onChange={onChangeSelectedFieldPath}>
                {allFieldPaths.map((fieldPath) => (
                    <Select.Option value={fieldPath}>{fieldPath}</Select.Option>
                ))}
            </EmbeddedSelect>
        </span>
    );

    /**
     * Compute Table Stat chart data.
     */
    const rowCountChartValues = extractChartValuesFromTableProfiles(profiles, 'rowCount');
    const columnCountChartValues = extractChartValuesFromTableProfiles(profiles, 'columnCount');

    /**
     * Compute Column Stat chart data.
     */
    const nullCountChartValues: Array<any> = extractChartValuesFromFieldProfiles(
        profiles,
        selectedFieldPath,
        'nullCount',
    );
    const nullPercentageChartValues: Array<any> = extractChartValuesFromFieldProfiles(
        profiles,
        selectedFieldPath,
        'nullProportion',
    );
    const distinctCountChartValues: Array<any> = extractChartValuesFromFieldProfiles(
        profiles,
        selectedFieldPath,
        'uniqueCount',
    );
    const distinctPercentageChartValues: Array<any> = extractChartValuesFromFieldProfiles(
        profiles,
        selectedFieldPath,
        'uniqueProportion',
    );

    return (
        <>
            {profilesLoading && <Message type="loading" content="Loading..." style={{ marginTop: '10%' }} />}
            <Affix offsetTop={127}>
                <HeaderRow justify="space-between" align="middle">
                    <div>
                        <Typography.Title level={2}>Profiling History</Typography.Title>
                        <span>
                            <SubHeaderText>Viewing profiling history for the past</SubHeaderText>
                            <EmbeddedSelect value={selectedLookbackWindow} onChange={onChangeSelectedLookbackWindow}>
                                {LOOKBACK_WINDOWS.map((lookbackWindow) => (
                                    <Select.Option value={lookbackWindow.text}>{lookbackWindow.text}</Select.Option>
                                ))}
                            </EmbeddedSelect>
                        </span>
                    </div>
                    {toggleView}
                </HeaderRow>
            </Affix>
            <StatsSection title={t('Profiling Runs')}>
                <Row>
                    <ProfilingRunsChart profiles={profiles} />
                </Row>
            </StatsSection>
            <StatsSection title={t('Historical Table Stats')}>
                <Row>
                    <StatChart
                        title={t('Row Count Over Time')}
                        tickInterval={graphTickInterval}
                        dateRange={graphDateRange}
                        values={rowCountChartValues}
                    />
                    <StatChart
                        title={t('Column Count Over Time')}
                        tickInterval={graphTickInterval}
                        dateRange={graphDateRange}
                        values={columnCountChartValues}
                    />
                </Row>
            </StatsSection>
            <StatsSection title={t('Historical Column Stats')} rightFloatView={columnSelectView}>
                <Row>
                    <StatChart
                        title={t('Null Count Over Time')}
                        tickInterval={graphTickInterval}
                        dateRange={graphDateRange}
                        values={nullCountChartValues}
                    />
                    <StatChart
                        title={t('Null Percentage Over Time')}
                        tickInterval={graphTickInterval}
                        dateRange={graphDateRange}
                        values={nullPercentageChartValues}
                    />
                    <StatChart
                        title={t('Distinct Count Over Time')}
                        tickInterval={graphTickInterval}
                        dateRange={graphDateRange}
                        values={distinctCountChartValues}
                    />
                    <StatChart
                        title={t('Distinct Percentage Over Time')}
                        tickInterval={graphTickInterval}
                        dateRange={graphDateRange}
                        values={distinctPercentageChartValues}
                    />
                </Row>
            </StatsSection>
        </>
    );
}
