import React from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Badge, Text, Group, Stack, ThemeIcon, Paper, alpha } from '@mantine/core';
import { IconArrowRight, IconShip, IconCalendarTime, IconCheck, IconClock } from '@tabler/icons-react';
import type { RebalanceResultEntry } from '../domain/dockRebalance';

const PRIMARY_COLOR = "#2a9d8f";

export const RebalanceTable: React.FC<{ data: RebalanceResultEntry[] }> = ({ data }) => {
    const { t, i18n } = useTranslation();

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString(i18n.language === 'pt' ? 'pt-PT' : 'en-US', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <Paper withBorder radius="md" p="0" style={{ overflow: 'hidden' }}>
            <Table verticalSpacing="md" horizontalSpacing="lg" highlightOnHover striped>
                <Table.Thead bg="var(--mantine-color-default-hover)">
                    <Table.Tr>
                        <Table.Th>{t('dockRebalance.vessel')}</Table.Th>
                        <Table.Th>{t('dockRebalance.timeWindow')}</Table.Th>
                        <Table.Th>{t('dockRebalance.dockPath')}</Table.Th>
                        <Table.Th style={{ textAlign: 'center' }}>{t('dockRebalance.status')}</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {data.map((item) => (
                        <Table.Tr
                            key={item.vvnId}
                            style={item.isMoved ? {
                                backgroundColor: alpha(PRIMARY_COLOR, 0.1),
                                borderLeft: `4px solid ${PRIMARY_COLOR}`
                            } : {}}
                        >
                            <Table.Td>
                                <Group gap="sm">
                                    <ThemeIcon variant="light" color={item.isMoved ? "teal" : "gray"} size="md">
                                        <IconShip size={18} />
                                    </ThemeIcon>
                                    <Text size="sm" fw={700}>{item.vesselName}</Text>
                                </Group>
                            </Table.Td>

                            <Table.Td>
                                <Group gap="xs">
                                    <IconCalendarTime size={16} color="var(--mantine-color-gray-text)" />
                                    <Stack gap={0}>
                                        <Text size="xs" fw={600}>{formatDateTime(item.eta)} (ETA)</Text>
                                        <Text size="xs" c="dimmed">{formatDateTime(item.etd)} (ETD)</Text>
                                    </Stack>
                                    <Badge variant="outline" size="xs" ml="xs" color="gray" leftSection={<IconClock size={10}/>}>
                                        {item.duration.toFixed(1)}h
                                    </Badge>
                                </Group>
                            </Table.Td>

                            <Table.Td>
                                <Group gap="xs">
                                    <Badge variant="light" color="gray">{item.originalDock}</Badge>
                                    {item.isMoved && (
                                        <>
                                            <IconArrowRight size={14} color={PRIMARY_COLOR} />
                                            <Badge variant="filled" style={{ backgroundColor: PRIMARY_COLOR }}>{item.proposedDock}</Badge>
                                        </>
                                    )}
                                </Group>
                            </Table.Td>

                            <Table.Td style={{ textAlign: 'center' }}>
                                {item.isMoved ? (
                                    <Badge color="teal" variant="light" leftSection={<IconCheck size={12}/>}>
                                        {t('dockRebalance.moved')}
                                    </Badge>
                                ) : (
                                    <Text size="xs" c="dimmed">--</Text>
                                )}
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Paper>
    );
};