import { useState } from "react";
import { useVesselTypes } from "../hooks/useVesselTypes";
import type { VesselType } from "../domain/vesselType";

import "../style/vesseltypelist.css";

import VesselTypeHeader from "../components/VesselTypeHeader";
import VesselTypeSearchBar from "../components/VesselTypeSearchBar";
import VesselTypeTable from "../components/VesselTypeTable";
import VesselTypeSlideDetails from "../components/VesselTypeSlideDetails";
import VesselTypeCreateModal from "../components/modals/VesselTypeCreateModal";
import VesselTypeEditModal from "../components/modals/VesselTypeEditModal";
import VesselTypeDeleteModal from "../components/modals/VesselTypeDeleteModal";

export default function VesselTypeListPage() {
    const { items, filtered, setFiltered, loading, reload } = useVesselTypes();

    const [selected, setSelected] = useState<VesselType | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    return (
        <div className="vt-page">
            <VesselTypeHeader
                total={items.length}
                onCreateClick={() => setIsCreateOpen(true)}
            />

            <VesselTypeSearchBar
                items={items}
                onFilteredChange={setFiltered}
            />

            <VesselTypeTable
                items={filtered}
                loading={loading}
                onSelect={setSelected}
            />

            <VesselTypeSlideDetails
                selected={selected}
                onClose={() => setSelected(null)}
                onEdit={() => setIsEditOpen(true)}
                onDelete={() => setIsDeleteOpen(true)}
            />

            <VesselTypeCreateModal
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreated={reload}
            />

            <VesselTypeEditModal
                open={isEditOpen}
                vesselType={selected}
                onClose={() => setIsEditOpen(false)}
                onUpdated={reload}
            />

            <VesselTypeDeleteModal
                open={isDeleteOpen}
                vesselType={selected}
                onClose={() => setIsDeleteOpen(false)}
                onDeleted={reload}
            />
        </div>
    );
}
