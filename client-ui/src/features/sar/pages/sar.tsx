import { useState, useEffect } from "react";
import {
  getSARs,
  getByName,
  getByEmail,
  createSAR,
  updateSAR,
  deleteSAR
} from "../services/sarService";
import{ getSAOs} from "../../sao/services/saoService";
import type{SAO} from "../../sao/types/sao";
import type { sar, CreateSARRequest, UpdateSARRequest,Status } from "../types/sar";
import { notifySuccess } from "../../../utils/notify";
import "../style/sarpage.css";
import { useTranslation } from "react-i18next";
import { FaTimes, FaUser } from "react-icons/fa";
import toast from "react-hot-toast";
import { NATIONALITIES } from "../constants/nationalities";


function CreateSARForm({
  form,
  setForm,
  t,
  getSAOs,
}: {
  form: CreateSARRequest;
  setForm: (f: CreateSARRequest | ((prev: CreateSARRequest) => CreateSARRequest)) => void;
  t: any;
  getSAOs: () => Promise<SAO[]>;
}) {
  const [saoList, setSaoList] = useState<SAO[]>([]);

  useEffect(() => {
    getSAOs()
      .then((res) => setSaoList(res))
      .catch((err) => console.error("Failed to load SAOs", err));
  }, [getSAOs]);

  const updateField = (field: keyof CreateSARRequest, value: string, nestedKey?: string) => {
    setForm(prev => ({
      ...prev,
      [field]: nestedKey
        ? { ...((prev as any)[field] || {}), [nestedKey]: value }
        : value
    }));
  };

  return (
    <>
      <label>{t("sar.name")} *</label>
      <input
        className="vt-input"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <label>{t("sar.citizenId")} *</label>
      <input
        className="vt-input"
        value={form.citizenId.passportNumber}
        onChange={(e) => updateField("citizenId", e.target.value, "passportNumber")}
      />

      <label>{t("sar.nationality")} *</label>
      <select
        className="vt-input"
        value={form.nationality}
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            nationality: e.target.value,
          }))
        }
      >
        <option value="">{}</option>
        {NATIONALITIES.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>

      <label>{t("sar.sao")} *</label>
      <select
        className="vt-input"
        value={form.Sao}
        onChange={(e) => updateField("Sao", e.target.value)}
      >
        <option value="">{t("")}</option>
        {saoList.map((sao) => (
          <option key={sao.shippingOrganizationCode.value} value={sao.legalName}>
            {sao.legalName}
          </option>
        ))}
      </select>

      <label>{t("sar.email")} *</label>
      <input
        type="email"
        className="vt-input"
        value={form.email.address}
        onChange={(e) => setForm({ ...form, email: { address: e.target.value } })}
      />

      <label>{t("sar.phone")} *</label>
      <input
        className="vt-input"
        value={form.phoneNumber.number}
        onChange={(e) => setForm({ ...form, phoneNumber: { number: e.target.value } })}
      />

      <label>{t("sar.status")} *</label>
      <select
        className="vt-input"
        value={form.status}
         onChange={(e) =>
          setForm(prev => ({
            ...prev,
            status: e.target.value as Status,
          }))
        }>
        <option value="activated">{t("sar.active")}</option>
        <option value="deactivated">{t("sar.inactive")}</option>
      </select>
    </>
  );
}


function EditSARForm({
  form,
  setForm,
  t,
}: {
  form: UpdateSARRequest;
  setForm: (f: UpdateSARRequest | ((prev: UpdateSARRequest) => UpdateSARRequest)) => void;
  t: any;
}) {
  return (
    <>
      <label>{t("sar.email")} *</label>
      <input 
        type="email" className="vt-input" 
        value={form.email.address}
        onChange={(e) => setForm({ ...form, email: { address: e.target.value } })}
       />

      <label>{t("sar.phone")} *</label>
      <input
        className="vt-input"
        value={form.phoneNumber.number}
        onChange={(e) => setForm({ ...form, phoneNumber: { number: e.target.value } })}
      />

      <label>{t("sar.status")} *</label>
      <select
        className="vt-input"
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value as UpdateSARRequest["status"] })}
      >
        <option value="activated">{t("sar.active")}</option>
        <option value="deactivated">{t("sar.inactive")}</option>
      </select>
    </>
  );
}

// -----------------------------
// Create Modal (separate component)
// -----------------------------
function CreateModal({
  setIsCreateOpen,
  refresh,
  t,
}: {
  setIsCreateOpen: (v: boolean) => void;
  refresh: () => Promise<void>;
  t: any;
}) {
  const [form, setForm] = useState<CreateSARRequest>({
    name: "",
    citizenId: { passportNumber: "" },
    nationality: "",
    email: { address: "" },
    phoneNumber: { number: "" },
    status: "activated",
    Sao: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSAR(form);
    toast.success(t("sar.created"));
    await refresh();
    setIsCreateOpen(false);
  };

  return (
    <div className="vt-modal-overlay">
      <div className="vt-modal">
        <h3>{t("sar.add")}</h3>
        <form onSubmit={submit}>
          <CreateSARForm form={form} setForm={setForm} t={t} getSAOs={getSAOs} />
          <div className="vt-modal-actions">
            <button className="vt-btn-cancel" type="button" onClick={() => setIsCreateOpen(false)}>
              {t("sar.cancel")}
            </button>
            <button className="vt-btn-save" type="submit">
              {t("sar.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -----------------------------
// Edit Modal (separate component)
// -----------------------------
function EditModal({
  editModel,
  closeEdit,
  refresh,
  t,
}: {
  editModel: sar | null;
  closeEdit: () => void;
  refresh: () => Promise<void>;
  t: any;
}) {
  if (!editModel) return null;

  const [form, setForm] = useState<UpdateSARRequest>({
    email: editModel.email,
    phoneNumber: editModel.phoneNumber,
    status: editModel.status,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSAR(editModel.email.address, form);
    toast.success(t("sar.updated"));
    await refresh();
    closeEdit();
  };

  return (
    <div className="vt-modal-overlay">
      <div className="vt-modal">
        <h3>{t("sar.edit")}</h3>
        <form onSubmit={submit}>
          <EditSARForm form={form} setForm={setForm} t={t} />
          <div className="vt-modal-actions">
            <button className="vt-btn-cancel" type="button" onClick={closeEdit}>
              {t("sar.cancel")}
            </button>
            <button className="vt-btn-save" type="submit">
              {t("sar.update")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Modal
function DeleteModal({
  deleteModel,
  closeDelete,
  refresh,
  t
}: {
  deleteModel: sar | null;
  closeDelete: () => void;
  refresh: () => Promise<void>;
  t: any;
}) {
  if (!deleteModel) return null;

  const model = deleteModel;

  async function handleDelete() {
      await deleteSAR(model.id);
      toast.success(t("sar.deleted"));
      await refresh();
      closeDelete();
  }

  return (
        <div className="vt-modal-overlay">
            <div className="vt-modal vt-modal-delete">
                <h3>{t("sar.delete")}</h3>
                <p>
                    {t("sar.name")}: <strong>{model.name}</strong>
                    <br />
                    {t("sar.email")}: <strong>{model.email.address}</strong>
                    <br />
                    {t("sar.phone")}: <strong>{model.phoneNumber.number}</strong>
                    <br />
                    {t("sar.sao")}: <strong>{model.sao}</strong>
                </p>

                <div className="vt-modal-actions">
                    <button className="vt-btn-cancel" onClick={closeDelete}>
                        {t("sar.cancel")}
                    </button>
                    <button className="vt-btn-delete" onClick={handleDelete}>
                        {t("sar.delete")}
                    </button>
                </div>
            </div>
        </div>
    );
}


// -----------------------------
// Main SARPage component
// -----------------------------
export default function SARPage() {
  const { t } = useTranslation();

  const [items, setItems] = useState<sar[]>([]);
  const [filtered, setFiltered] = useState<sar[]>([]);
  const [selected, setSelected] = useState<sar | null>(null);

  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editModel, setEditModel] = useState<sar | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteModel, setDeleteModel] = useState<sar | null>(null);


  const [searchMode, setSearchMode] = useState<"email" | "name">("email");
  const [searchValue, setSearchValue] = useState("");

  const MIN_LOADING_TIME = 800;

  async function runWithLoading<T>(promise: Promise<T>, loadingText: string) {
    const id = toast.loading(loadingText);
    const start = Date.now();
    try {
      const result = await promise;
      return result;
    } finally {
      const elapsed = Date.now() - start;
      if (elapsed < MIN_LOADING_TIME) {
        await new Promise((res) => setTimeout(res, MIN_LOADING_TIME - elapsed));
      }
      toast.dismiss(id);
    }
  }

  const loadData = async () => {
    setLoading(true);
    try {
      const [sars, saos] = await Promise.all([getSARs(), getSAOs()]);
      setItems(sars);
      setFiltered(sars);

      notifySuccess(t("sar.loadSuccess", { count: sars.length }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runWithLoading(loadData(), t("sar.loading"));
  }, [t]);

  const executeSearch = async () => {
    if (!searchValue.trim()) {
      setFiltered(items);
      return;
    }

    let result: sar[] = [];

    try {
      if (searchMode === "email") {
        const s = await getByEmail({ address: searchValue });
        result = s ? [s] : [];
      }else 
        if (searchMode === "name") {
          const s = await getByName(searchValue);
          if (!s) {
            result = [];
          } else if (Array.isArray(s)) {
            result = s;
          } else {
            // se for um único objeto
            result = [s];
          }
      }
    } catch (err) {
      console.error(err);
      result = [];
    }

    setFiltered(result);
  };

  const refresh = async () => {
    await loadData();
  };

  const openEdit = () => {
    if (!selected) return;
    setEditModel({ ...selected });
    setSelected(null);
    setIsEditOpen(true);
    document.body.classList.add("no-scroll");
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditModel(null);
    document.body.classList.remove("no-scroll");
  };

  const openDelete = () => {
    if (!selected) return;
    setDeleteModel({ ...selected });
    setSelected(null);
    setIsDeleteOpen(true);
    document.body.classList.add("no-scroll");
  };

  const closeDelete = () => {
    setIsDeleteOpen(false);
    setDeleteModel(null);
    document.body.classList.remove("no-scroll");
  };

  return (
    <div className="sar-page">
      {selected && <div className="vt-overlay" />}

      {/* Title & Create button */}
      <div className="vt-title-area">
        <div className="vt-title-box">
          <h2 className="vt-title">
            <FaUser /> {t("sar.title")}
          </h2>
          <p className="vt-sub">{t("sar.count", { count: items.length })}</p>
        </div>
        <button className="vt-create-btn-top" onClick={() => setIsCreateOpen(true)}>
          + {t("sar.add")}
        </button>
      </div>

      {/* Search */}
      <div className="vt-search-mode">
        <button className={searchMode === "email" ? "active" : ""} onClick={() => setSearchMode("email")}>
          {t("sar.searchByEmailButton")}
        </button>
        <button className={searchMode === "name" ? "active" : ""} onClick={() => setSearchMode("name")}>
          {t("sar.searchByNameButton") ?? "Name"}
        </button>
      </div>

      <div className="vt-search-box">
        <div className="vt-search-wrapper">
          <input
            placeholder={t("sar.searchPlaceholder")}
            className="vt-search"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              if (!e.target.value) setFiltered(items);
            }}
            onKeyDown={(e) => e.key === "Enter" && executeSearch()}
          />
          {searchValue && (
            <button
              className="vt-clear-input"
              onClick={() => {
                setSearchValue("");
                setFiltered(items);
              }}
            >
              ✕
            </button>
          )}
        </div>
        <button className="vt-search-btn" onClick={executeSearch}>
          🔍
        </button>
      </div>

      {/* Table */}
      {!loading && filtered.length === 0 ? (
        <p>{t("sar.empty")}</p>
      ) : (
        <div className="vt-table-wrapper">
          <table className="vt-table">
            <thead>
              <tr>
                <th>{t("sar.name") ?? "Name"}</th>
                <th>{t("sar.email") ?? "Email"}</th>
                <th>{t("sar.status") ?? "Status"}</th>
                <th>{t("sar.sao") ?? "SAO"}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} onClick={() => setSelected(s)} className="vt-row">
                  <td>{s.name}</td>
                  <td>{s.email.address}</td>
                  <td>
                    {s.status === "activated"
                      ? t("sar.active")
                      : s.status === "deactivated"
                      ? t("sar.inactive")
                      : s.status}
                  </td>
                  <td>{s.sao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Slide */}
      {selected && (
        <div className="vt-slide">
          <button className="vt-slide-close" onClick={() => setSelected(null)}>
            <FaTimes />
          </button>

          <h3>{selected.name}</h3>
          <p><strong>{t("sar.email")}:</strong> {selected.email.address}</p>
          <p><strong>{t("sar.status")}: </strong> 
            {selected.status === "activated"
                      ? t("sar.active")
                      : selected.status === "deactivated"
                      ? t("sar.inactive")
                      : selected.status}
          </p>
          <p><strong>{t("sar.phone")}:</strong> {selected.phoneNumber.number}</p>
          <p>
            <strong>{t("sar.sao")}:</strong> {selected.sao}
          </p>

          <div className="vt-slide-actions">
            <button className="vt-btn-edit" onClick={openEdit}>{t("sar.edit")}</button>
            <button className="vt-btn-delete" onClick={openDelete}>{t("sar.delete")}</button>
          </div>
        </div>
      )}

      {isCreateOpen && <CreateModal setIsCreateOpen={setIsCreateOpen} refresh={refresh} t={t} />}
      {isEditOpen && <EditModal editModel={editModel} closeEdit={closeEdit} refresh={refresh} t={t} />}
      {isDeleteOpen && <DeleteModal deleteModel={deleteModel} closeDelete={closeDelete} refresh={refresh} t={t} />}
    </div>
  );
}
