import { useMemo, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FaFilePdf, FaSync } from "react-icons/fa"; // Importar ícones (opcional, ou usa texto)

import type { IncidentType, Severity } from "../domain/incidentType";
import "../style/incidentType.css";

type TreeNode = IncidentType & { children: TreeNode[] };

function buildTree(list: IncidentType[], focusCode?: string | null): TreeNode[] {
    const map = new Map<string, TreeNode>();
    list.forEach(it => map.set(it.code, { ...it, children: [] }));

    map.forEach(node => {
        if (node.parentCode && map.has(node.parentCode)) {
            map.get(node.parentCode)!.children.push(node);
        }
    });

    const roots: TreeNode[] = [];
    map.forEach(node => {
        if (!node.parentCode || !map.has(node.parentCode)) roots.push(node);
    });

    if (focusCode && map.has(focusCode)) return [map.get(focusCode)!];

    const sortRec = (n: TreeNode) => {
        n.children.sort((a, b) => a.code.localeCompare(b.code));
        n.children.forEach(sortRec);
    };
    roots.sort((a, b) => a.code.localeCompare(b.code));
    roots.forEach(sortRec);

    return roots;
}

function SeverityPill({ severity }: { severity: Severity }) {
    const { t } = useTranslation();
    return (
        <span className={`severity-pill severity-${severity.toLowerCase()}`}>
            {t(`incidentType.severity.${severity}`)}
        </span>
    );
}

function TreeItem({
                      node,
                      selectedCode,
                      depth,
                      expanded,
                      toggle,
                      onSelect,
                  }: {
    node: TreeNode;
    selectedCode: string | null;
    depth: number;
    expanded: Set<string>;
    toggle: (code: string) => void;
    onSelect: (code: string) => void;
}) {
    const isSelected = selectedCode === node.code;
    const hasChildren = node.children.length > 0;
    const isExpanded = expanded.has(node.code);

    return (
        <div className="it-tree-node" style={{ marginLeft: depth * 16 }}>
            <div className={`it-tree-row ${isSelected ? "it-tree-row-selected" : ""}`}>
                <button
                    type="button"
                    className="it-tree-toggle"
                    disabled={!hasChildren}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (hasChildren) toggle(node.code);
                    }}
                >
                    {hasChildren ? (isExpanded ? "▾" : "▸") : "•"}
                </button>

                <button
                    type="button"
                    className="it-tree-main"
                    onClick={() => onSelect(node.code)}
                >
                    <span className="it-tree-code">{node.code}</span>
                    <span className="it-tree-name">{node.name}</span>
                    <SeverityPill severity={node.severity} />
                </button>
            </div>

            {hasChildren && isExpanded && (
                <div className="it-tree-children">
                    {node.children.map(child => (
                        <TreeItem
                            key={child.code}
                            node={child}
                            selectedCode={selectedCode}
                            depth={depth + 1}
                            expanded={expanded}
                            toggle={toggle}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function IncidentTypeHierarchyPanel({
                                                       selected,
                                                       subtree,
                                                       loading,
                                                       error,
                                                       onNodeSelect,
                                                       onRefresh,
                                                   }: {
    selected: IncidentType | null;
    subtree: IncidentType[];
    loading: boolean;
    error: string | null;
    onNodeSelect: (code: string) => void;
    onRefresh: () => void;
}) {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    // 1. Referência para a área que queremos "imprimir"
    const treeRef = useRef<HTMLDivElement>(null);

    const treeRoots = useMemo(() => {
        const roots = buildTree(subtree, selected?.code ?? null);
        const next = new Set<string>();
        roots.forEach(r => next.add(r.code));
        setExpanded(prev => (prev.size ? prev : next));
        return roots;
    }, [subtree, selected?.code]);

    const toggle = (code: string) => {
        setExpanded(prev => {
            const next = new Set(prev);
            if (next.has(code)) next.delete(code);
            else next.add(code);
            return next;
        });
    };

    // 2. Função de Exportar PDF
    const handleDownloadPDF = async () => {
        if (!treeRef.current || !selected) return;

        try {
            // Captura a div como canvas
            const canvas = await html2canvas(treeRef.current, {
                scale: 2, // Melhora a resolução
                backgroundColor: "#ffffff", // Garante fundo branco
            });

            const imgData = canvas.toDataURL("image/png");

            // Cria PDF (A4 por defeito)
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            pdf.internal.pageSize.getHeight();
// Ajustar imagem ao PDF
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

            // Título no PDF
            pdf.setFontSize(16);
            pdf.text(`Hierarchy: ${selected.code}`, 10, 15);

            // Adicionar a imagem da árvore
            pdf.addImage(imgData, "PNG", 0, 25, pdfWidth, imgHeight);

            pdf.save(`hierarchy-${selected.code}.pdf`);
        } catch (err) {
            console.error("Failed to generate PDF", err);
            // Podes adicionar um toast de erro aqui se quiseres
        }
    };

    return (
        <div className="it-hierarchy-card">
            <div className="it-hierarchy-header">
                <div>
                    <div className="it-hierarchy-title">{t("incidentType.hierarchy.title")}</div>
                    <div className="it-hierarchy-subtitle">
                        {selected ? `${selected.code} — ${selected.name}` : t("incidentType.hierarchy.subtitleEmpty")}
                    </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                    {/* Botão de PDF só aparece se houver seleção */}
                    {selected && subtree.length > 0 && (
                        <button
                            type="button"
                            className="it-hierarchy-refresh"
                            onClick={handleDownloadPDF}
                            title="Download PDF"
                            style={{ backgroundColor: "#e2e8f0", color: "#475569" }} // Estilo ligeiramente diferente
                        >
                            <FaFilePdf /> PDF
                        </button>
                    )}

                    <button
                        type="button"
                        className="it-hierarchy-refresh"
                        onClick={onRefresh}
                        disabled={!selected || loading}
                    >
                        <FaSync /> {t("incidentType.hierarchy.refresh")}
                    </button>
                </div>
            </div>

            {/* Conteúdo de Erro/Loading/Vazio... */}
            {!selected && <div className="it-hierarchy-empty">{t("incidentType.hierarchy.empty")}</div>}
            {selected && loading && <div className="it-hierarchy-loading">{t("incidentType.hierarchy.loading")}</div>}
            {selected && !loading && error && <div className="it-hierarchy-error">{error}</div>}
            {selected && !loading && !error && subtree.length === 0 && (
                <div className="it-hierarchy-empty">{t("incidentType.hierarchy.noSubtree")}</div>
            )}

            {/* 3. Envolvemos a árvore na div com a ref */}
            {selected && !loading && !error && subtree.length > 0 && (
                <div className="it-tree-container" ref={treeRef} style={{ padding: "1rem", backgroundColor: "white" }}>
                    {treeRoots.map(root => (
                        <TreeItem
                            key={root.code}
                            node={root}
                            selectedCode={selected.code}
                            depth={0}
                            expanded={expanded}
                            toggle={toggle}
                            onSelect={onNodeSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}