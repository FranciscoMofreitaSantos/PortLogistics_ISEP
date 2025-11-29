// src/features/viewer3d/components/InfoOverlay.tsx
import type { SelectedEntityInfo, UserRole } from "../types/selection";
import { Roles } from "../../../app/types";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type Props = {
    visible: boolean;
    selected: SelectedEntityInfo | null;
    roles: UserRole[];
};

/* ========= SIMULAÇÃO LOCAL ========= */

type SimStatus =
    | "Waiting"
    | "Loading"
    | "Unloading"
    | "Loading & Unloading"
    | "Completed";

type VisitSimSummary = {
    status: SimStatus;
    ongoingCount: number;
    totalTasks: number;
};

function hashStringToInt(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
        h = (h * 31 + s.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
}

/**
 * Duração pseudo-aleatória e determinística para cada task,
 * entre 30s e 120s (usando o id/código).
 */
function getTaskDurationSeconds(task: any): number {
    const key = String(task.id ?? task.code ?? "");
    const base = hashStringToInt(key);
    const span = 120 - 30; // 90
    return 30 + (base % span); // [30,120)
}

/**
 * Dado um visit + tempo de simulação (segundos desde epoch local),
 * devolve status atual e nº de tasks em execução.
 */
function computeVesselSimulation(visit: any, simNowSec: number): VisitSimSummary | null {
    if (!visit || !Array.isArray(visit.tasks) || visit.tasks.length === 0) {
        return null;
    }

    const tasks = visit.tasks as any[];

    let cursor = 0; // início da primeira task
    let ongoingCount = 0;
    const activeTypes = new Set<string>();

    for (const t of tasks) {
        const dur = getTaskDurationSeconds(t);
        const start = cursor;
        const end = cursor + dur;

        if (simNowSec >= start && simNowSec < end) {
            ongoingCount++;
            activeTypes.add(String(t.type));
        }

        cursor = end + 5; // 5s de pausa entre tasks
    }

    const totalSpanEnd = cursor; // tempo em que todas as tasks já terminaram

    let status: SimStatus;
    if (ongoingCount === 0 && simNowSec < 0) {
        status = "Waiting";
    } else if (ongoingCount === 0 && simNowSec < totalSpanEnd) {
        // antes da 1ª task começar
        status = "Waiting";
    } else if (ongoingCount === 0 && simNowSec >= totalSpanEnd) {
        status = "Completed";
    } else {
        // Há pelo menos uma task em execução → escolhemos com base nos tipos
        const hasContainer =
            Array.from(activeTypes).some((t) => t === "ContainerHandling");
        const hasYardOrStorage = Array.from(activeTypes).some(
            (t) => t === "YardTransport" || t === "StoragePlacement",
        );

        if (hasContainer && hasYardOrStorage) status = "Loading & Unloading";
        else if (hasContainer) status = "Unloading";
        else status = "Loading";
    }

    return {
        status,
        ongoingCount,
        totalTasks: tasks.length,
    };
}

function getStatusColor(status?: SimStatus): string {
    switch (status) {
        case "Loading":
            return "#22c55e"; // verde
        case "Unloading":
            return "#f97316"; // laranja
        case "Loading & Unloading":
            return "#a855f7"; // roxo
        case "Completed":
            return "#3b82f6"; // azul
        case "Waiting":
        default:
            return "#9ca3af"; // cinzento
    }
}

function getStatusTooltip(status?: SimStatus): string {
    switch (status) {
        case "Loading":
            return "Vessel currently loading cargo.";
        case "Unloading":
            return "Vessel currently unloading cargo.";
        case "Loading & Unloading":
            return "Vessel loading and unloading cargo simultaneously.";
        case "Completed":
            return "All scheduled operations for this vessel are completed.";
        case "Waiting":
        default:
            return "Vessel at dock, waiting for operations to start.";
    }
}

export function InfoOverlay({ visible, selected, roles }: Props) {
    // epoch local da simulação (segundos desde que o overlay montou)
    const epochRef = useRef<number | null>(null);
    const [, setTick] = useState(0); // só para forçar re-render

    useEffect(() => {
        if (epochRef.current == null) {
            epochRef.current = Date.now();
        }
        const id = window.setInterval(() => {
            setTick((t) => t + 1);
        }, 1000); // atualiza 1x/segundo

        return () => window.clearInterval(id);
    }, []);

    if (!visible || !selected || selected.kind === "unknown") return null;

    const privileged =
        roles.includes(Roles.PortAuthorityOfficer) ||
        roles.includes(Roles.LogisticsOperator);

    let title = "";
    const general: ReactNode[] = [];
    const restricted: ReactNode[] = [];

    switch (selected.kind) {
        case "dock": {
            const d = selected.dto;
            title = `Dock ${d.code}`;
            general.push(
                <p key="loc">
                    <strong>Location:</strong> {d.location ?? "—"}
                </p>,
                <p key="len">
                    <strong>Length:</strong> {d.lengthM.toFixed(1)} m
                </p>,
                <p key="depth">
                    <strong>Depth:</strong> {d.depthM.toFixed(1)} m
                </p>,
            );
            if (privileged) {
                restricted.push(
                    <p key="status">
                        <strong>Status:</strong> {d.status ?? "Unknown"}
                    </p>,
                    <p key="allowed">
                        <strong>Allowed vessel types:</strong>{" "}
                        {d.allowedVesselTypeIds?.length ?? 0}
                    </p>,
                );
            }
            break;
        }

        case "storageArea": {
            const s = selected.dto;
            title = s.name;
            general.push(
                <p key="type">
                    <strong>Type:</strong> {s.type}
                </p>,
                <p key="cap">
                    <strong>Capacity:</strong>{" "}
                    {s.currentCapacityTeu}/{s.maxCapacityTeu} TEU
                </p>,
            );
            if (s.description) {
                general.push(
                    <p key="desc">
                        <strong>Description:</strong> {s.description}
                    </p>,
                );
            }
            if (privileged) {
                restricted.push(
                    <p key="phys">
                        <strong>Physical resources:</strong>{" "}
                        {s.physicalResources?.length ?? 0}
                    </p>,
                );
            }
            break;
        }

        case "vessel": {
            const v = selected.dto;
            title = v.name;

            // dados gerais – sempre visíveis
            general.push(
                <p key="imo">
                    <strong>IMO:</strong> {v.imoNumber}
                </p>,
                <p key="owner">
                    <strong>Owner:</strong> {v.owner}
                </p>,
            );

            const visit = v.visit;
            let sim: VisitSimSummary | null = null;

            if (visit && epochRef.current != null) {
                const nowSec = (Date.now() - epochRef.current) / 1000;
                sim = computeVesselSimulation(visit, nowSec);
            }

            if (visit && privileged) {
                // status operacional + dot de cor + tooltip
                if (sim) {
                    restricted.push(
                        <p key="op-status">
                            <strong>Operational status:</strong>{" "}
                            <span
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                }}
                                title={getStatusTooltip(sim.status)}
                            >
                                <span
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "999px",
                                        display: "inline-block",
                                        backgroundColor: getStatusColor(sim.status),
                                    }}
                                />
                                <span>{sim.status}</span>
                            </span>
                        </p>,
                    );
                }

                restricted.push(
                    <p key="dims">
                        <strong>Dimensions:</strong>{" "}
                        {v.lengthMeters ?? "?"} m × {v.widthMeters ?? "?"} m
                    </p>,
                );

                restricted.push(
                    <p key="eta">
                        <strong>ETA:</strong>{" "}
                        {new Date(visit.eta).toLocaleString()}
                    </p>,
                    <p key="etd">
                        <strong>ETD:</strong>{" "}
                        {new Date(visit.etd).toLocaleString()}
                    </p>,
                );

                if (visit.dockCode) {
                    restricted.push(
                        <p key="dock">
                            <strong>Dock:</strong> {visit.dockCode}
                        </p>,
                    );
                }

                if (sim) {
                    restricted.push(
                        <p key="tasks">
                            <strong>Ongoing tasks:</strong>{" "}
                            {sim.ongoingCount} / {sim.totalTasks}
                        </p>,
                    );
                }
            } else if (privileged) {
                // sem visit: pelo menos mostra as dimensões
                restricted.push(
                    <p key="dims">
                        <strong>Dimensions:</strong>{" "}
                        {v.lengthMeters ?? "?"} m × {v.widthMeters ?? "?"} m
                    </p>,
                );
            }
            break;
        }

        case "container": {
            const c = selected.dto;
            title = `Container ${c.isoCode}`;
            general.push(
                <p key="type">
                    <strong>Type:</strong> {c.type ?? "—"}
                </p>,
                <p key="status">
                    <strong>Status:</strong> {c.status ?? "—"}
                </p>,
            );
            if (privileged && c.weightKg != null) {
                restricted.push(
                    <p key="w">
                        <strong>Weight:</strong> {c.weightKg} kg
                    </p>,
                );
            }
            break;
        }

        case "resource": {
            const r = selected.dto;
            title = r.code;
            general.push(
                <p key="desc">
                    <strong>Description:</strong> {r.description}
                </p>,
            );
            if (privileged) {
                restricted.push(
                    <p key="cap">
                        <strong>Capacity:</strong> {r.operationalCapacity}
                    </p>,
                    <p key="status">
                        <strong>Status:</strong> {r.physicalResourceStatus}
                    </p>,
                );
            }
            break;
        }

        case "decorativeCrane":
            title = "Decorative Crane";
            general.push(
                <p key="dock">
                    <strong>Dock:</strong> {selected.dto.dockId ?? "—"}
                </p>,
            );
            break;

        case "decorativeStorage":
            title = "Decorative Building";
            general.push(
                <p key="zone">
                    <strong>Zone:</strong> {selected.dto.zone ?? "—"}
                </p>,
            );
            break;
    }

    return (
        <div
            style={{
                position: "absolute",
                right: 12,
                bottom: 12,
                pointerEvents: "none", // não bloqueia a câmara
                zIndex: 20,
            }}
        >
            <div
                style={{
                    pointerEvents: "auto",
                    maxWidth: 320,
                    background: "rgba(10,10,20,0.9)",
                    color: "#f9fafb",
                    padding: "0.75rem 0.9rem",
                    borderRadius: 10,
                    fontSize: 13,
                    boxShadow: "0 8px 20px rgba(0,0,0,0.45)",
                    border: "1px solid rgba(148,163,184,0.5)",
                }}
            >
                <div style={{ marginBottom: 6 }}>
                    <strong>{title}</strong>
                </div>
                <div>{general}</div>
                {privileged && restricted.length > 0 && (
                    <div
                        style={{
                            marginTop: 8,
                            paddingTop: 6,
                            borderTop: "1px solid rgba(148,163,184,0.35)",
                            opacity: 0.9,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 11,
                                textTransform: "uppercase",
                                marginBottom: 4,
                            }}
                        >
                            Operational details
                        </div>
                        {restricted}
                    </div>
                )}
                <div
                    style={{
                        marginTop: 8,
                        fontSize: 11,
                        opacity: 0.7,
                    }}
                >
                    Press <kbd>i</kbd> to toggle this panel.
                </div>
            </div>
        </div>
    );
}
