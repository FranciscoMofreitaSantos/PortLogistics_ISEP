import { useState } from "react";
import api from "../../../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function CreateVesselType() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!name.trim()) return toast.error("Name is required");

    try {
      await api.post("/api/vesselType", {
        name,
        description
      });
      toast.success("Vessel Type created ✅");
      navigate("/vessel-types");
    } catch (err: any) {
      toast.error(err.response?.data ?? "Erro ao criar Vessel Type");
    }
  }

  return (
    <div className="page">
      <h2>Create Vessel Type</h2>
      <form onSubmit={handleSubmit} className="form">
        <label>Name *</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />

        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

        <button className="btn-primary">Save</button>
      </form>
    </div>
  );
}
