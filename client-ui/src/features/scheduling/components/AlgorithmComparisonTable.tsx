import React from 'react';
import {
    Card,
    Table,
    Badge,
    Title,
    Group,
    Stack,
} from '@mantine/core';
import { IconStar } from '@tabler/icons-react';

import {
    type ScheduleResponse,
    type AlgorithmType
} from '../services/SchedulingService';

interface AlgorithmComparisonTableProps {
    allResults: Partial<Record<AlgorithmType, ScheduleResponse>>;
    t: (key: string, options?: any) => string;
}

const ComparisonRow: React.FC<{
    algo: AlgorithmType;
    result?: ScheduleResponse;
    minDelay: number | null;
    t: (key: string, options?: any) => string;
}> = ({ algo, result, minDelay, t }) => {


    const hasData = !!result;


    const totalCraneHours = hasData
        ? result.schedule.operations.reduce(
            (sum, op) => sum + (op.optimizedOperationDuration * op.craneCountUsed),
            0
        )
        : 0;

    const delay = hasData ? result.prolog.total_delay ?? 0 : '-';
    const operations = hasData ? result.schedule.operations.length : '-';


    const isBest = hasData && minDelay !== null && delay === minDelay && minDelay >= 0;
    const isNotComputed = !hasData;

    return (
        <Table.Tr
            style={{
                backgroundColor: isBest ? 'var(--mantine-color-green-0)' : 'transparent'
            }}
        >
            <Table.Td fw={700}>
                <Group gap="xs">
                    {isBest && <IconStar size={18} color='var(--mantine-color-yellow-6)' />}
                    {algo.toUpperCase().replace('-', ' ')}
                </Group>
            </Table.Td>

            <Table.Td style={{textAlign: 'right'}}>
                {isNotComputed ? (
                    <Badge color="gray" size="lg">{t('planningScheduling.notComputed')}</Badge>
                ) : (
                    <Badge size="lg" color={delay > 0 ? "red" : "green"}>
                        {delay} {t('planningScheduling.hours')}
                    </Badge>
                )}
            </Table.Td>
            <Table.Td style={{textAlign: 'right'}}>{totalCraneHours !== 0 ? totalCraneHours : '-'}</Table.Td>
            <Table.Td style={{textAlign: 'right'}}>{operations}</Table.Td>
        </Table.Tr>
    );
}


const AlgorithmComparisonTable: React.FC<AlgorithmComparisonTableProps> = ({ allResults, t }) => {

    const algorithmTypes: AlgorithmType[] = ['optimal', 'greedy', 'local_search'];

    const computedDelays = Object.values(allResults)
        .map(r => r?.prolog?.total_delay)
        .filter(delay => typeof delay === 'number' && delay >= 0);

    const minDelay = computedDelays.length > 0 ? Math.min(...computedDelays) : null;


    return (
        <Stack gap="lg" mb="xl">
            <Title order={3}>{t('planningScheduling.comparisonTitle')}</Title>

            <Card shadow="lg" radius="xl" p="lg" withBorder>
                <Table horizontalSpacing="xl" verticalSpacing="md" striped>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>{t('planningScheduling.algorithm')}</Table.Th>
                            <Table.Th style={{textAlign: 'right'}}>{t('planningScheduling.totalDelay')}</Table.Th>
                            <Table.Th style={{textAlign: 'right'}}>{t('planningScheduling.totalCraneHours')}</Table.Th>
                            <Table.Th style={{textAlign: 'right'}}>{t('planningScheduling.totalOperations')}</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {algorithmTypes.map(algo => (
                            <ComparisonRow
                                key={algo}
                                algo={algo}
                                result={allResults[algo]}
                                minDelay={minDelay}
                                t={t}
                            />
                        ))}
                    </Table.Tbody>
                </Table>
            </Card>
        </Stack>
    );
};

export default AlgorithmComparisonTable;