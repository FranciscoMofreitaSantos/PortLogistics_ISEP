import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FaUsers, FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import {
    Container,
    Stack,
    Title,
    Grid,
    Paper,
    Text,
    Table,
    Loader,
    Alert,
    Modal,
    Group,
    Button,
    Badge,
    ActionIcon,
    Center,
    Box,
} from "@mantine/core";

import {getNonAuthorizedUsers, getUserByEmail, getNotEliminatedUsers} from "../service/userService";
import type { User } from "../../../app/types";

import UserSearch from "../components/UserSearch";
import UserDetails from "../components/UserDetails";
import {
    IconUsers,
    IconUserCheck,
    IconUserExclamation,
    IconUserBolt,
} from "@tabler/icons-react";

type SearchParams = {
    type: "all" | "email" | "noRole";
    value: string;
};

function UserManagementPage() {
    const { t } = useTranslation();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchParams, setSearchParams] = useState<SearchParams>({
        type: "all",
        value: "",
    });

    const {
        data: users,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["users", searchParams.type, searchParams.value],

        queryFn: async (): Promise<User[]> => {
            switch (searchParams.type) {
                case "email": {
                    if (!searchParams.value) return [];
                    const user = await getUserByEmail(searchParams.value);
                    return user ? [user] : [];
                }
                case "noRole":
                    return getNonAuthorizedUsers();
                case "all":
                default:
                    return getNotEliminatedUsers();
            }
        },

    });

    const handleSearch = (type: "all" | "email" | "noRole", value: string) => {
        setSearchParams({ type, value });
    };

    const userStats = useMemo(() => {
        const data = users || [];
        const total = data.length;
        const withRole = data.filter((u) => u.role).length;
        const withoutRole = total - withRole;
        const active = data.filter((u) => u.isActive).length;
        return { total, withRole, withoutRole, active };
    }, [users]);

    const handleShowDetails = (user: User) => {
        setSelectedUser(user);
    };

    const handleCloseDetails = () => {
        setSelectedUser(null);
    };

    const tableRows = users?.map((u) => (
        <Table.Tr key={u.id}>
            <Table.Td>{u.name ?? "—"}</Table.Td>
            <Table.Td>{u.email}</Table.Td>
            <Table.Td>{u.role ?? t("users.roles.none")}</Table.Td>
            <Table.Td>
                <Badge color={u.isActive ? "green" : "red"} variant="light">
                    {u.isActive
                        ? t("status.active")
                        : t("status.inactive")}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Button
                    size="xs"
                    variant="outline"
                    onClick={() => handleShowDetails(u)}
                >
                    {t("actions.view")}
                </Button>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Container fluid p="xl">
            <Stack gap="xl">
                {/* HEADER */}
                <Group>
                    <ActionIcon
                        component={Link}
                        to="/dashboard"
                        title={t("actions.backToDashboard")}
                        variant="light"
                        size="lg"
                    >
                        <FaArrowLeft />
                    </ActionIcon>
                    <Title order={2}>
                        <Group gap="sm">
                            <FaUsers /> {t("users.title")}
                        </Group>
                    </Title>
                </Group>

                {/* STATS */}
                <Grid>
                    <StatCard
                        title={t("stats.total")}
                        value={userStats.total}
                        icon={<IconUsers size={24} />}
                        color="blue"
                    />
                    <StatCard
                        title={t("stats.active")}
                        value={userStats.active}
                        icon={<IconUserCheck size={24} />}
                        color="green"
                    />
                    <StatCard
                        title={t("stats.withRole")}
                        value={userStats.withRole}
                        icon={<IconUserBolt size={24} />}
                        color="cyan"
                    />
                    <StatCard
                        title={t("stats.withoutRole")}
                        value={userStats.withoutRole}
                        icon={<IconUserExclamation size={24} />}
                        color="orange"
                    />
                </Grid>

                {/* SEARCH */}
                <Paper shadow="sm" p="md" withBorder>
                    <UserSearch onSearch={handleSearch} isLoading={isLoading} />
                </Paper>

                {/* TABLE */}
                <Paper shadow="sm" withBorder>
                    {isLoading && (
                        <Center h={200}>
                            <Loader />
                        </Center>
                    )}
                    {error && (
                        <Alert color="red" title={t("errors.loadAll")}>
                            {error.message}
                        </Alert>
                    )}
                    {!isLoading && !error && (
                        <Table
                            verticalSpacing="md"
                            horizontalSpacing="xl"
                            highlightOnHover
                            striped
                        >
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>{t("fields.name")}</Table.Th>
                                    <Table.Th>{t("fields.email")}</Table.Th>
                                    <Table.Th>{t("fields.role")}</Table.Th>
                                    <Table.Th>{t("fields.status")}</Table.Th>
                                    <Table.Th>{t("fields.actions")}</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {tableRows?.length === 0 ? (
                                    <Table.Tr>
                                        <Table.Td colSpan={5}>
                                            <Center p="md">
                                                <Text c="dimmed">{t("users.empty")}</Text>
                                            </Center>
                                        </Table.Td>
                                    </Table.Tr>
                                ) : (
                                    tableRows
                                )}
                            </Table.Tbody>
                        </Table>
                    )}
                </Paper>
            </Stack>

            {/* MODAL */}
            <Modal
                opened={!!selectedUser}
                onClose={handleCloseDetails}
                size="xl"
                centered
                transitionProps={{ transition: "pop", duration: 200 }}
            >
                {selectedUser && (
                    <UserDetails
                        user={selectedUser}
                        onClose={handleCloseDetails}
                    />
                )}
            </Modal>
        </Container>
    );
}

function StatCard({ title, value, icon, color }: any) {
    return (
        <Grid.Col span={{ base: 6, md: 3 }}>
            <Paper withBorder p="md" radius="md">
                <Group justify="space-between">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                        {title}
                    </Text>
                    <Box c={color}>{icon}</Box>
                </Group>
                <Text fz={32} fw={700} mt="sm">
                    {value}
                </Text>
            </Paper>
        </Grid.Col>
    );
}

export default UserManagementPage;