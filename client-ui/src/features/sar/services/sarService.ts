import api from "../../../services/api";
import type { sar, Email, Status, CreateSARRequest, UpdateSARRequest } from "../types/sar";
export async function getSARs(): Promise<sar[]> {
  const res = await api.get("/api/ShippingAgentRepresentative");
  return res.data;
}

export async function getById(id: string): Promise<sar> {
  const res = await api.get(`/api/ShippingAgentRepresentative/${id}`);
  return res.data;
}

export async function getByName(name: string): Promise<sar[]> {
  const res = await api.get(`/api/ShippingAgentRepresentative/name/${encodeURIComponent(name)}`);
  const data = res.data;

  if (Array.isArray(data)) return data;      // caso devolva lista
  if (data && typeof data === "object") return [data]; // caso devolva um único objeto

  return []; // fallback
}

export async function getByEmail(email: { address: string }): Promise<sar> {
  const res = await api.get(
    `/api/ShippingAgentRepresentative/email/${encodeURIComponent(email.address)}`
  );
  return res.data;
}


export async function getByStatus(status: Status): Promise<sar[]> {
  const res = await api.get(`/api/ShippingAgentRepresentative/status/${status}`);
  return res.data;
}


export async function createSAR(data: CreateSARRequest): Promise<sar> {
  const res = await api.post("/api/ShippingAgentRepresentative", data);
  return res.data;
}

export async function updateSAR(email: string, data: UpdateSARRequest): Promise<sar> {
  const res = await api.patch(`/api/ShippingAgentRepresentative/update/${encodeURIComponent(email)}`, data);
  return res.data;
}

export async function addNotification(name: string, vvnCode: string): Promise<sar> {
  const res = await api.post(`/api/ShippingAgentRepresentative/${encodeURIComponent(name)}/notifications`, vvnCode, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

export async function deleteSAR(id: string): Promise<void> {
    await api.delete(`/api/ShippingAgentRepresentative/${id}`);
}