import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useAppStore } from "../../../app/store";
import type { User } from "../../../app/types";
import {
    changeUserRole,
    toggleUserStatus,
    eliminateUser,
} from "../service/userService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { modals } from "@mantine/modals";
import "../style/user.css";
import ConfettiExplosion from "react-confetti-explosion";

import {
    Stack,
    Group,
    Avatar,
    Text,
    Badge,
    Select,
    Button,
    Alert,
    Title,
    Divider,
    Paper,
    SimpleGrid,
    Switch, Box,
} from "@mantine/core";
import {
    FaExclamationTriangle,
    FaCheck,
    FaTrash,
    FaSave,
} from "react-icons/fa";

interface UserDetailsProps {
    user: User;
    onClose: () => void;
}

const fragmentationProps = {
    force: 0.8,
    duration: 3000,
    particleCount: 200,
    width: 1600,
    colors: ['#FFFFFF', '#E0E0E0', '#BDBDBD', '#9E9E9E', '#757575', '#424242'],
};

export default function UserDetails({ user, onClose }: UserDetailsProps) {
    const { t } = useTranslation();
    const storeUser = useAppStore((s) => s.user);
    const queryClient = useQueryClient();
    const [currentUser, setCurrentUser] = useState<User>(user);
    const [selectedRole, setSelectedRole] = useState(user.role ?? "");
    const [isRoleSuccess, setIsRoleSuccess] = useState(false);
    const isSelf = storeUser?.id === user.id;
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setCurrentUser(user);
        setSelectedRole(user.role ?? "");
        setIsRoleSuccess(false);
    }, [user]);

    const roleMutation = useMutation({
        mutationFn: () => {
            if (!currentUser.id) throw new Error("User ID is missing");
            if (!selectedRole)
                throw new Error(t("errors.noRoleSelected"));
            // @ts-ignore
            return changeUserRole(currentUser.id, selectedRole);
        },
        onSuccess: (updatedUser) => {
            toast.success(t("success.roleChanged"));
            setIsRoleSuccess(true);

            queryClient.invalidateQueries({ queryKey: ["users"] });

            setTimeout(() => {
                setIsRoleSuccess(false);
                setCurrentUser(updatedUser);
            }, 2000);
        },
        onError: (error: Error) => {
            toast.error(error.message || t("errors.roleChangeFailed"));
        },
    });

    const statusMutation = useMutation({
        mutationFn: () => {
            if (!currentUser.id) throw new Error("User ID is missing");
            return toggleUserStatus(currentUser.id);
        },
        onSuccess: (updatedUser) => {
            toast.success(
                updatedUser.isActive
                    ? t("success.activated")
                    : t("success.deactivated")
            );

            setCurrentUser(updatedUser);

            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: () => {
            toast.error(t("users.errors.toggleFailed"));
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => {
            if (!currentUser.id) throw new Error("User ID is missing");
            return eliminateUser(currentUser.email);
        },
        onSuccess: () => {
            toast.success(t("users.success.deleted"));
            queryClient.invalidateQueries({ queryKey: ["users"] });

            setIsDeleting(true);
            setTimeout(() => {
                onClose();
            }, 400);
        },
        onError: () => {
            toast.error(t("users.errors.deleteFailed"));
        },
    });

    const handleOpenDeleteModal = () => {
        modals.openConfirmModal({
            title: (
                <Title order={4} c="red">
                    <Group gap="xs">
                        <FaExclamationTriangle />
                        {t("delete.title")}
                    </Group>
                </Title>
            ),
            children: (
                <Text size="sm">
                    {t("delete.message", { email: currentUser.email })}
                </Text>
            ),
            labels: {
                confirm: t("actions.confirmDelete"),
                cancel: t("actions.cancel"),
            },
            confirmProps: {
                color: "red",
                loading: deleteMutation.isPending,
            },
            onConfirm: () => deleteMutation.mutate(),
        });
    };

    const isLoading =
        roleMutation.isPending ||
        statusMutation.isPending ||
        deleteMutation.isPending;

    const roleOptions = [
        { value: "", label: t("roles.none") },
        { value: "Administrator", label: t("roles.administrator") },
        { value: "LogisticsOperator", label: t("roles.operator") },
        { value: "PortAuthorityOfficer", label: t("roles.officer") },
        { value: "ShippingAgentRepresentative", label: t("roles.agent") },
        { value: "ProjectManager", label: t("roles.projectManager") },
    ];

    return (
        <div
            className={`user-details-wrapper ${isDeleting ? "deleting" : ""}`}
        >
            <Stack gap="lg" style={{ position: "relative" }}>

                {isDeleting && (
                    <Box
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            zIndex: 99,
                        }}
                    >
                        <ConfettiExplosion {...fragmentationProps} />
                    </Box>
                )}

                {/* ===== HEADER ===== */}
                {/* (Todo o resto do JSX permanece igual ao seu ficheiro) */}
                <Paper p="lg" radius="md" withBorder>
                    <Group>
                        <Avatar
                            src={currentUser.picture}
                            alt={currentUser.name}
                            radius="xl"
                            size="lg"
                        >
                            {(currentUser.name || "U")
                                .split(" ")
                                .map((s) => s[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                        </Avatar>
                        <Stack gap={0}>
                            <Title order={3}>
                                {currentUser.name || t("users.unknown")}
                            </Title>
                            <Text c="dimmed">{currentUser.email || "—"}</Text>
                        </Stack>
                    </Group>
                </Paper>

                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <Paper withBorder p="md" radius="md">
                        <Text fz="xs" c="dimmed" tt="uppercase" fw={700}>
                            {t("fields.status")}
                        </Text>
                        <Group justify="space-between" mt="sm">
                            <Badge
                                color={currentUser.isActive ? "green" : "red"}
                                variant="light"
                                size="lg"
                            >
                                {currentUser.isActive
                                    ? t("status.active")
                                    : t("status.inactive")}
                            </Badge>

                            <Switch
                                size="lg"
                                onLabel={t("status.on")}
                                offLabel={t("status.off")}
                                checked={currentUser.isActive ?? false}
                                onChange={() => statusMutation.mutate()}
                                disabled={isLoading || isSelf}
                            />
                        </Group>
                    </Paper>

                    <Paper withBorder p="md" radius="md">
                        <Text fz="xs" c="dimmed" tt="uppercase" fw={700}>
                            {t("fields.role")}
                        </Text>
                        <Group justify="space-between" mt="sm" wrap="nowrap">
                            <Select
                                data={roleOptions}
                                value={selectedRole}
                                onChange={(value) => setSelectedRole(value ?? "")}
                                disabled={isLoading || isSelf || isRoleSuccess}
                                placeholder={t("roles.select")}
                                style={{ flex: 1 }}
                            />
                            <Button
                                onClick={() => roleMutation.mutate()}
                                loading={roleMutation.isPending}
                                disabled={
                                    isLoading ||
                                    isSelf ||
                                    currentUser.role === selectedRole
                                }
                                color={isRoleSuccess ? "green" : "blue"}
                                leftSection={
                                    isRoleSuccess ? <FaCheck /> : <FaSave size={14} />
                                }
                            >
                                {isRoleSuccess
                                    ? t("actions.saved")
                                    : t("actions.save")}
                            </Button>
                        </Group>
                    </Paper>
                </SimpleGrid>

                {isSelf && (
                    <Alert
                        color="yellow"
                        title={t("errors.alert")}
                        icon={<FaExclamationTriangle />}
                        variant="light"
                    >
                        {t("errors.cannotEditSelf")}
                    </Alert>
                )}

                <Divider my="xs" />

                {/* ===== FOOTER ===== */}
                <Group justify="space-between">
                    <Button
                        color="red"
                        variant="outline"
                        leftSection={<FaTrash size={14} />}
                        onClick={handleOpenDeleteModal}
                        disabled={isLoading || isSelf}
                        loading={deleteMutation.isPending}
                    >
                        {t("actions.delete")}
                    </Button>

                    <Button
                        variant="default"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {t("actions.close")}
                    </Button>
                </Group>
            </Stack>
        </div>
    );
}