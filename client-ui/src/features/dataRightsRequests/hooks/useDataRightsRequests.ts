// src/features/dataRightsRequests/hooks/useDataRightsRequests.ts
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

// Se usares Auth0 (ou substitui pelo teu contexto de auth)
import { useAuth0 } from "@auth0/auth0-react";

import dataRightsService from "../service/dataRightsService";
import { mapRequestsDto } from "../mappers/dataRightsMapper";
import type {
    DataRightsRequest,
    CreatingDataRightsRequest,
    RequestType,
    RectificationPayload,
} from "../domain/dataRights";

/** Extrai uma mensagem legível do erro */
function getErrorMessage(e: any, fallback: string): string {
    const data = e?.response?.data;
    if (data && typeof data === "object") {
        if (data.detail) return data.detail;
        if (data.title) return data.title;
        if (data.message) return data.message;
    }
    if (typeof data === "string") return data;
    return e?.message || fallback;
}

/* Estado inicial limpo para Retificação */
function emptyRectification(): RectificationPayload {
    return {
        newName: "",
        newEmail: "",
        newPicture: "",
        isActive: null,
        newPhoneNumber: "",
        newNationality: "",
        newCitizenId: "",
        reason: "",
    };
}

/* Estado inicial limpo para Criação */
function emptyCreating(): CreatingDataRightsRequest {
    return {
        type: "Access",
        rectification: emptyRectification(),
        deletionReason: "",
    };
}

export function useDataRightsRequests() {
    const { t } = useTranslation();
    const { user } = useAuth0();

    // --- ESTADOS DE DADOS ---
    const [items, setItems] = useState<DataRightsRequest[]>([]); // Lista bruta completa
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<DataRightsRequest | null>(null);

    // --- ESTADOS DE CRIAÇÃO (WIZARD) ---
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [creating, setCreating] = useState<CreatingDataRightsRequest>(emptyCreating());

    const email = user?.email;
    const userId = user?.sub ?? "";

    // --- CARREGAR DADOS ---
    async function reload() {
        if (!email) return;
        try {
            setLoading(true);
            const dtos = await dataRightsService.getRequestsForUser(email);
            const mapped = mapRequestsDto(dtos);

            // Ordenar por data (mais recente primeiro), se o backend não o fizer
            mapped.sort((a, b) => {
                const dateA = new Date((a.createdOn as any).value ?? a.createdOn).getTime();
                const dateB = new Date((b.createdOn as any).value ?? b.createdOn).getTime();
                return dateB - dateA;
            });

            setItems(mapped);

            // Seleciona o primeiro automaticamente se nada estiver selecionado
            if (mapped.length && !selected) {
                setSelected(mapped[0]);
            }
        } catch (e: any) {
            console.error(e);
            toast.error(t("dataRights.toast.listError", "Error loading requests."));
        } finally {
            setLoading(false);
        }
    }

    // Carregar ao iniciar (sempre que o email mudar)
    useEffect(() => {
        if (email) reload();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email]);

    // --- AÇÕES DE CRIAÇÃO ---

    function setType(type: RequestType) {
        setCreating(prev => ({ ...prev, type }));
    }

    function updateRectification(partial: Partial<RectificationPayload>) {
        setCreating(prev => ({
            ...prev,
            rectification: { ...prev.rectification, ...partial },
        }));
    }

    async function submitNewRequest() {
        if (!email || !userId) {
            toast.error(t("dataRights.toast.noUser", "You must be logged in."));
            return;
        }

        try {
            let payload: string | undefined = undefined;

            // 1. Construir Payload para RETIFICAÇÃO
            if (creating.type === "Rectification") {
                const p: RectificationPayload = { ...creating.rectification };

                // Remove chaves vazias/nulas para limpar o JSON
                Object.keys(p).forEach(k => {
                    const key = k as keyof RectificationPayload;
                    if (p[key] === "" || p[key] === undefined || p[key] === null) {
                        delete p[key];
                    }
                });
                payload = JSON.stringify(p);

                // 2. Construir Payload para ELIMINAÇÃO
            } else if (creating.type === "Deletion") {
                // Motivo é opcional, mas se quiseres obrigar:
                // if (!creating.deletionReason.trim()) { ... erro ... }

                if (creating.deletionReason.trim()) {
                    payload = JSON.stringify({ reason: creating.deletionReason.trim() });
                }

                // 3. ACESSO (Sem payload)
            } else {
                payload = undefined;
            }

            // Enviar para o serviço
            const dto = {
                userId,
                userEmail: email,
                type: creating.type,
                payload,
            };

            const createdDto = await dataRightsService.createRequest(dto);

            // Mapear resposta (assumindo que o DTO de resposta é igual ao request mapeado)
            // Se o teu mapper precisar de ser chamado: const mapped = mapSingleDto(createdDto);
            const mapped: DataRightsRequest = { ...createdDto } as any;

            // Atualizar lista localmente (adicionar ao topo)
            setItems(prev => [mapped, ...prev]);
            setSelected(mapped);

            // Reset e Sucesso
            setCreating(emptyCreating());
            setIsCreateOpen(false);
            toast.success(t("dataRights.toast.created", "Request created successfully! 🚀"));

        } catch (e: any) {
            const msg = getErrorMessage(e, "Error creating request.");
            toast.error(msg);
        }
    }

    return {
        // Dados
        items,      // Lista completa
        loading,
        selected,
        setSelected,
        reload,

        // Criação
        creating,
        setCreating,
        setType,
        updateRectification,
        submitNewRequest,

        // Modal Control
        isCreateOpen,
        setIsCreateOpen,
    };
}