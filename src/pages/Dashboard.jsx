import { useEffect, useState } from "react";
import { getApiUrl } from "../api/client.js";
import PageHeader from "../components/PageHeader.jsx";
import { materialStatusOptions } from "../constants/materialStatuses.js";

const TOKEN_KEY = "luki_token";
const samplingStatuses = new Set(["sampling requested", "sampling received"]);

export default function Dashboard() {
  const [materials, setMaterials] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadMaterials();
  }, []);

  async function loadMaterials() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return;
    }

    try {
      const response = await fetch(getApiUrl("/api/materials"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleStatusChange(material, nextStatus) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || nextStatus === material.status) {
      return;
    }

    setUpdatingId(material.id);

    try {
      const response = await fetch(getApiUrl(`/api/materials/${material.id}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const updatedMaterial = await response.json();
      setMaterials((current) =>
        current.map((existingMaterial) =>
          existingMaterial.id === updatedMaterial.id ? updatedMaterial : existingMaterial,
        ),
      );
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  }

  const summaryCards = [
    {
      label: "Requested",
      value: String(materials.filter((material) => material.status === "requested").length),
      tone: "blue",
    },
    {
      label: "Sampling",
      value: String(
        materials.filter((material) => samplingStatuses.has(material.status)).length,
      ),
      tone: "pink",
    },
    {
      label: "Approved",
      value: String(materials.filter((material) => material.status === "approved").length),
      tone: "green",
    },
  ];

  const recentMaterials = materials.slice(0, 5);

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Materials Dashboard"
        description="Track sourcing from request to delivery."
      />

      <section className="grid three">
        {summaryCards.map((card) => (
          <article key={card.label} className="stat-card">
            <div className="stat-label">{card.label}</div>
            <div className={`stat-value ${card.tone}`}>{card.value}</div>
          </article>
        ))}
      </section>

      <section className="card table-wrap">
        <div className="section-heading">
          <h2>Recent Materials</h2>
          <p>Quick view of active development materials.</p>
        </div>

        {recentMaterials.length === 0 ? (
          <p className="empty-state">No materials yet. Add one from the Materials page.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Material</th>
                <th>Factory</th>
                <th>Category</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentMaterials.map((material) => (
                <tr key={material.id}>
                  <td>{material.name}</td>
                  <td>{material.factory_names || "Unassigned"}</td>
                  <td>{material.category_collection || "—"}</td>
                  <td>
                    <select
                      className="table-status-select"
                      value={material.status}
                      onChange={(event) => handleStatusChange(material, event.target.value)}
                      disabled={updatingId === material.id}
                    >
                      {materialStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
