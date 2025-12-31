import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Title, Text, Group, Button, Stack, Grid, ThemeIcon, Paper, LoadingOverlay, Box, RingProgress, Center, ActionIcon } from '@mantine/core';
import { IconRocket, IconAnalyze, IconScale, IconTrendingUp, IconArrowLeft } from '@tabler/icons-react';
import { getDockRebalanceProposal } from '../services/dockRebalanceService';
import { mapToDockRebalanceDomain } from '../mappers/dockRebalanceMapper';
import type { DockRebalanceFinal } from '../domain/dockRebalance';
import { RebalanceTable } from '../components/RebalanceTable';
import { LoadComparisonTable } from '../components/LoadComparisonTable';
import { notifyError, notifySuccess } from '../../../utils/notify';

const PRIMARY_COLOR = "#2a9d8f";

export const DockRebalancePage = () => {
    const { t } = useTranslation();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState<DockRebalanceFinal | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCompute = async () => {
        setLoading(true);
        try {
            const res = await getDockRebalanceProposal(date);
            setData(mapToDockRebalanceDomain(res));
            notifySuccess(t('dockRebalance.successNotify'));
        } catch {
            notifyError(t('dockRebalance.errorNotify'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size="xl" py="xl">
            <Group justify="space-between" mb="xl" pb="md" style={{ borderBottom: `1px solid var(--mantine-color-default-border)` }}>
                <Group gap="sm">
                    <ActionIcon component={Link} to="/dashboard" variant="subtle" color="gray" size="xl">
                        <IconArrowLeft size={30} />
                    </ActionIcon>
                    <ThemeIcon size={48} radius="md" variant="gradient" gradient={{ from: PRIMARY_COLOR, to: '#264653' }}>
                        <IconScale size={30} />
                    </ThemeIcon>
                    <Stack gap={0}>
                        <Title order={2}>{t('dockRebalance.title')}</Title>
                        <Text size="sm" c="dimmed">{t('dockRebalance.subtitle')}</Text>
                    </Stack>
                </Group>

                <Group align="flex-end">
                    <Stack gap={4}>
                        <Text size="xs" fw={700} tt="uppercase" c="dimmed">{t('dockRebalance.dateLabel')}</Text>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            style={{
                                padding: '8px',
                                borderRadius: '8px',
                                border: '1px solid var(--mantine-color-default-border)',
                                backgroundColor: 'var(--mantine-color-default)',
                                color: 'var(--mantine-color-text)'
                            }}
                        />
                    </Stack>
                    <Button
                        leftSection={<IconRocket size={20} />}
                        style={{ backgroundColor: PRIMARY_COLOR }}
                        size="md"
                        onClick={handleCompute}
                        loading={loading}
                    >
                        {t('dockRebalance.computeButton')}
                    </Button>
                </Group>
            </Group>

            <Box style={{ position: 'relative', minHeight: 400 }}>
                <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />

                {data && (
                    <Stack gap="xl">
                        <Grid grow gutter="md">
                            <Grid.Col span={{ base: 12, md: 4 }}>
                                <Paper withBorder p="md" radius="md">
                                    <Group justify="space-between">
                                        <Stack gap={0}>
                                            <Text size="xs" c="dimmed" fw={700} tt="uppercase">{t('dockRebalance.improvement')}</Text>
                                            <Text fw={900} size="xl" style={{ color: PRIMARY_COLOR }}>
                                                {data.stats.improvementPercent.toFixed(1)}%
                                            </Text>
                                        </Stack>
                                        <RingProgress
                                            size={80}
                                            roundCaps
                                            thickness={8}
                                            sections={[{ value: data.stats.improvementPercent, color: PRIMARY_COLOR }]}
                                            label={<Center><IconTrendingUp size={20} color={PRIMARY_COLOR} /></Center>}
                                        />
                                    </Group>
                                </Paper>
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, md: 8 }}>
                                <Paper withBorder p="md" radius="md" bg="var(--mantine-color-default-hover)">
                                    <Grid grow>
                                        <Grid.Col span={6}>
                                            <Text size="xs" c="dimmed" fw={700} tt="uppercase">{t('dockRebalance.stdDevBefore')}</Text>
                                            <Text fw={700} size="lg">{data.stats.stdDevBefore.toFixed(2)}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Text size="xs" c="dimmed" fw={700} tt="uppercase">{t('dockRebalance.stdDevAfter')}</Text>
                                            <Text fw={700} size="lg" c="teal">{data.stats.stdDevAfter.toFixed(2)}</Text>
                                        </Grid.Col>
                                    </Grid>
                                </Paper>
                            </Grid.Col>
                        </Grid>

                        <Stack gap="xs">
                            <Title order={4}>{t('dockRebalance.assignments')}</Title>
                            <RebalanceTable data={data.results} />
                        </Stack>

                        <Stack gap="xs">
                            <Title order={4}>{t('dockRebalance.loadComparison')}</Title>
                            <LoadComparisonTable data={data.loadDifferences} />
                        </Stack>
                    </Stack>
                )}

                {!data && !loading && (
                    <Paper withBorder p={100} radius="md" style={{ textAlign: 'center', borderStyle: 'dashed' }}>
                        <IconAnalyze size={48} color="var(--mantine-color-gray-5)" />
                        <Text c="dimmed">{t('dockRebalance.emptyState')}</Text>
                    </Paper>
                )}
            </Box>
        </Container>
    );
};