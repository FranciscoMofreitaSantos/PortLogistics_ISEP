import React from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Text, Group, Progress, Paper, Stack, rem } from '@mantine/core';
import { IconArrowUpRight, IconArrowDownRight, IconMinus } from '@tabler/icons-react';
import type { LoadChange } from '../domain/dockRebalance';

export const LoadComparisonTable: React.FC<{ data: LoadChange[] }> = ({ data }) => {
    const { t } = useTranslation();
    const maxLoad = Math.max(...data.map(d => Math.max(d.before, d.after, 1)));

    return (
        <Paper withBorder radius="md" p="md" shadow="sm">
            <Table verticalSpacing="sm" striped highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>{t('dockRebalance.dock')}</Table.Th>
                        <Table.Th>{t('dockRebalance.loadBefore')}</Table.Th>
                        <Table.Th>{t('dockRebalance.loadAfter')}</Table.Th>
                        <Table.Th>{t('dockRebalance.difference')}</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {data.map((item) => (
                        <Table.Tr key={item.dock}>
                            <Table.Td fw={700}>{item.dock}</Table.Td>
                            <Table.Td>
                                <Stack gap={2} style={{ minWidth: rem(120) }}>
                                    <Text size="xs">{item.before.toFixed(1)}h</Text>
                                    <Progress value={(item.before / maxLoad) * 100} color="gray" size="sm" />
                                </Stack>
                            </Table.Td>
                            <Table.Td>
                                <Stack gap={2} style={{ minWidth: rem(120) }}>
                                    <Text size="xs" fw={700}>{item.after.toFixed(1)}h</Text>
                                    <Progress value={(item.after / maxLoad) * 100} color="teal" size="sm" />
                                </Stack>
                            </Table.Td>
                            <Table.Td>
                                <Group gap="xs">
                                    <Text size="sm" fw={700} c={item.difference < 0 ? 'green' : item.difference > 0 ? 'orange' : 'dimmed'}>
                                        {item.difference > 0 ? '+' : ''}{item.difference.toFixed(1)}h
                                    </Text>
                                    {item.difference > 0 && <IconArrowUpRight size={16} color="var(--mantine-color-orange-filled)" />}
                                    {item.difference < 0 && <IconArrowDownRight size={16} color="var(--mantine-color-green-filled)" />}
                                    {item.difference === 0 && <IconMinus size={16} color="var(--mantine-color-gray-5)" />}
                                </Group>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Paper>
    );
};