import { useEffect, useState } from "react";
import { getApiUrl } from "../api/client.js";
import PageHeader from "../components/PageHeader.jsx";
import { materialStatusOptions } from "../constants/materialStatuses.js";

const TOKEN_KEY = "luki_token";

const seasonOptions = [
  "Spring",
  "Summer",
  "Fall",
  "Winter",
  "Holiday",
  "Pre-Fall",
  "Resort",
];

const weightUnits = ["gsm", "glm"];
const widthUnits = ["inches", "cm", "meters"];
const priceUnits = ["USD/yard", "USD/meter"];
const optionValues = ["", ...Array.from({ length: 10 }, (_, index) => String(index + 1))];

function createEmptyFiber() {
  return {
    percentage: "",
    fiber_name: "",
  };
}

function createEmptyForm() {
  return {
    name: "",
    supplier_quality_name: "",
    season: "",
    year: "",
    category_collection: "",
    weight_value: "",
    weight_unit: "gsm",
    width_value: "",
    width_unit: "inches",
    cutable_width_value: "",
    cutable_width_unit: "inches",
    construction: "",
    price_value: "",
    price_unit: "USD/yard",
    agent_name: "",
    agent_email: "",
    agent_phone: "",
    status: "pulled",
    option_number: "",
    factory_id: "",
    fibers: [createEmptyFiber()],
  };
}

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [factories, setFactories] = useState([]);
  const [factoryQuery, setFactoryQuery] = useState("");
  const [showFactoryResults, setShowFactoryResults] = useState(false);
  const [creatingFactory, setCreatingFactory] = useState(false);
  const [formData, setFormData] = useState(createEmptyForm());
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPageData();
  }, []);

  async function loadPageData() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [materialsResponse, factoriesResponse] = await Promise.all([
        fetch(getApiUrl("/api/materials"), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(getApiUrl("/api/factories"), {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!materialsResponse.ok || !factoriesResponse.ok) {
        throw new Error("Unable to load materials right now.");
      }

      const [materialsData, factoriesData] = await Promise.all([
        materialsResponse.json(),
        factoriesResponse.json(),
      ]);

      setMaterials(materialsData);
      setFactories(factoriesData);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleFiberChange(index, field, value) {
    setFormData((current) => ({
      ...current,
      fibers: current.fibers.map((fiber, fiberIndex) =>
        fiberIndex === index ? { ...fiber, [field]: value } : fiber,
      ),
    }));
  }

  function handleAddFiber() {
    setFormData((current) => ({
      ...current,
      fibers: [...current.fibers, createEmptyFiber()],
    }));
  }

  function handleRemoveFiber(index) {
    setFormData((current) => ({
      ...current,
      fibers:
        current.fibers.length === 1
          ? [createEmptyFiber()]
          : current.fibers.filter((_, fiberIndex) => fiberIndex !== index),
    }));
  }

  function handleEdit(material) {
    setEditingId(material.id);
    const selectedFactory = factories.find(
      (factory) => String(factory.id) === String(material.primary_factory_id),
    );
    setFactoryQuery(selectedFactory?.factory_name ?? material.factory_names ?? "");
    setFormData({
      name: material.name ?? "",
      supplier_quality_name: material.supplier_quality_name ?? "",
      season: material.season ?? "",
      year: material.year ?? "",
      category_collection: material.category_collection ?? "",
      weight_value: material.weight_value ?? "",
      weight_unit: material.weight_unit ?? "gsm",
      width_value: material.width_value ?? "",
      width_unit: material.width_unit ?? "inches",
      cutable_width_value: material.cutable_width_value ?? "",
      cutable_width_unit: material.cutable_width_unit ?? "inches",
      construction: material.construction ?? "",
      price_value: material.price_value ?? "",
      price_unit: material.price_unit ?? "USD/yard",
      agent_name: material.agent_name ?? "",
      agent_email: material.agent_email ?? "",
      agent_phone: material.agent_phone ?? "",
      status: material.status ?? "pulled",
      option_number: material.option_number ? String(material.option_number) : "",
      factory_id: material.primary_factory_id ?? "",
      fibers:
        material.fibers?.length > 0
          ? material.fibers.map((fiber) => ({
              percentage: fiber.percentage ?? "",
              fiber_name: fiber.fiber_name ?? "",
            }))
          : [createEmptyFiber()],
    });
    setError("");
  }

  function handleCancel() {
    setEditingId(null);
    setFormData(createEmptyForm());
    setFactoryQuery("");
    setShowFactoryResults(false);
    setError("");
  }

  function handleFactoryQueryChange(event) {
    const value = event.target.value;
    setFactoryQuery(value);
    setShowFactoryResults(true);
    setFormData((current) => ({
      ...current,
      factory_id: "",
    }));
  }

  function selectFactory(factory) {
    setFactoryQuery(factory.factory_name);
    setShowFactoryResults(false);
    setFormData((current) => ({
      ...current,
      factory_id: String(factory.id),
    }));
  }

  async function createFactoryFromMaterial() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || !factoryQuery.trim()) {
      return;
    }

    setCreatingFactory(true);
    setError("");

    try {
      const response = await fetch(getApiUrl("/api/factories"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          factory_name: factoryQuery.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const createdFactory = await response.json();
      setFactories((current) => [createdFactory, ...current]);
      selectFactory(createdFactory);
    } catch (createError) {
      setError(createError.message || "Unable to create factory.");
    } finally {
      setCreatingFactory(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      ...formData,
      year: formData.year || null,
      weight_value: formData.weight_value || null,
      width_value: formData.width_value || null,
      cutable_width_value: formData.cutable_width_value || null,
      price_value: formData.price_value || null,
      option_number: formData.option_number || null,
      fibers: formData.fibers,
    };

    try {
      const response = await fetch(
        getApiUrl(editingId ? `/api/materials/${editingId}` : "/api/materials"),
        {
          method: editingId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      await loadPageData();
      handleCancel();
    } catch (saveError) {
      setError(saveError.message || "Unable to save material.");
    } finally {
      setSaving(false);
    }
  }

  const matchingFactories = factories.filter((factory) =>
    factory.factory_name.toLowerCase().includes(factoryQuery.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        eyebrow="Material Library"
        title="Materials"
        description="Build material records with the supplier, construction, fiber, and pricing data your sourcing flow needs."
      />

      <section className="card stack">
        <div className="section-heading">
          <h2>{editingId ? "Edit Material" : "Add Material"}</h2>
          <p>Material name, factory, and supplier quality number/name are required for every new material.</p>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field">
            <span>Material ID</span>
            <input value={editingId ?? "Auto-generated after save"} readOnly />
          </label>

          <label className="field">
            <span>Material Name</span>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </label>

          <div className="field factory-picker">
            <span>Factory</span>
            <input
              value={factoryQuery}
              onChange={handleFactoryQueryChange}
              onFocus={() => setShowFactoryResults(true)}
              placeholder="Search factories or type a new one"
              required
            />
            {showFactoryResults && factoryQuery ? (
              <div className="factory-results">
                {matchingFactories.length > 0 ? (
                  matchingFactories.map((factory) => (
                    <button
                      key={factory.id}
                      className="factory-result"
                      type="button"
                      onClick={() => selectFactory(factory)}
                    >
                      {factory.factory_name}
                    </button>
                  ))
                ) : (
                  <p className="empty-state">No partial matches yet.</p>
                )}
                <button
                  className="button secondary create-factory-button"
                  type="button"
                  onClick={createFactoryFromMaterial}
                  disabled={creatingFactory}
                >
                  {creatingFactory
                    ? "Creating..."
                    : `Create new factory "${factoryQuery}"`}
                </button>
              </div>
            ) : null}
          </div>

          <label className="field">
            <span>Supplier Quality Number / Name</span>
            <input
              name="supplier_quality_name"
              value={formData.supplier_quality_name}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>Season</span>
            <select name="season" value={formData.season} onChange={handleChange}>
              <option value="">Select season</option>
              {seasonOptions.map((season) => (
                <option key={season} value={season}>
                  {season}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Year</span>
            <input
              name="year"
              type="number"
              value={formData.year}
              onChange={handleChange}
            />
          </label>

          <label className="field field-full">
            <span>Category / Collection</span>
            <input
              name="category_collection"
              value={formData.category_collection}
              onChange={handleChange}
            />
          </label>

          <div className="field-group">
            <label className="field">
              <span>Weight</span>
              <input
                name="weight_value"
                type="number"
                step="0.01"
                value={formData.weight_value}
                onChange={handleChange}
              />
            </label>

            <label className="field">
              <span>Weight Unit</span>
              <select name="weight_unit" value={formData.weight_unit} onChange={handleChange}>
                {weightUnits.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="field-group">
            <label className="field">
              <span>Width</span>
              <input
                name="width_value"
                type="number"
                step="0.01"
                value={formData.width_value}
                onChange={handleChange}
              />
            </label>

            <label className="field">
              <span>Width Unit</span>
              <select name="width_unit" value={formData.width_unit} onChange={handleChange}>
                {widthUnits.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="field-group">
            <label className="field">
              <span>Cutable Width</span>
              <input
                name="cutable_width_value"
                type="number"
                step="0.01"
                value={formData.cutable_width_value}
                onChange={handleChange}
              />
            </label>

            <label className="field">
              <span>Cutable Width Unit</span>
              <select
                name="cutable_width_unit"
                value={formData.cutable_width_unit}
                onChange={handleChange}
              >
                {widthUnits.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="field field-full">
            <span>Construction</span>
            <input
              name="construction"
              value={formData.construction}
              onChange={handleChange}
            />
          </label>

          <div className="field-group">
            <label className="field">
              <span>Price</span>
              <input
                name="price_value"
                type="number"
                step="0.01"
                value={formData.price_value}
                onChange={handleChange}
              />
            </label>

            <label className="field">
              <span>Price Unit</span>
              <select name="price_unit" value={formData.price_unit} onChange={handleChange}>
                {priceUnits.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="field">
            <span>Agent Name</span>
            <input name="agent_name" value={formData.agent_name} onChange={handleChange} />
          </label>

          <label className="field">
            <span>Agent Email</span>
            <input
              name="agent_email"
              type="email"
              value={formData.agent_email}
              onChange={handleChange}
            />
          </label>

          <label className="field">
            <span>Agent Phone</span>
            <input name="agent_phone" value={formData.agent_phone} onChange={handleChange} />
          </label>

          <label className="field">
            <span>Status</span>
            <select name="status" value={formData.status} onChange={handleChange}>
              {materialStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Option</span>
            <select
              name="option_number"
              value={formData.option_number}
              onChange={handleChange}
            >
              {optionValues.map((optionValue) => (
                <option key={optionValue || "blank"} value={optionValue}>
                  {optionValue || "Blank"}
                </option>
              ))}
            </select>
          </label>

          <div className="field field-full">
            <span>Fiber Content</span>
            <div className="fiber-stack">
              {formData.fibers.map((fiber, index) => (
                <div key={`fiber-${index}`} className="fiber-row">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="%"
                    value={fiber.percentage}
                    onChange={(event) =>
                      handleFiberChange(index, "percentage", event.target.value)
                    }
                  />
                  <input
                    placeholder="Fiber name"
                    value={fiber.fiber_name}
                    onChange={(event) =>
                      handleFiberChange(index, "fiber_name", event.target.value)
                    }
                  />
                  <button
                    className="button secondary"
                    type="button"
                    onClick={() => handleRemoveFiber(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button className="button secondary add-row-button" type="button" onClick={handleAddFiber}>
              + Add Fiber
            </button>
          </div>

          <div className="section-actions field-full">
            <button className="button primary" type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Save Material"
                  : "Create Material"}
            </button>
            {editingId ? (
              <button className="button secondary" type="button" onClick={handleCancel}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        {error ? <p className="form-message error-text">{error}</p> : null}
      </section>

      <section className="card table-wrap">
        <div className="section-heading">
          <h2>Material Records</h2>
          <p>Each record now carries the sourcing details you asked for.</p>
        </div>

        {loading ? (
          <p className="empty-state">Loading materials...</p>
        ) : materials.length === 0 ? (
          <p className="empty-state">No materials yet. Create the first one above.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Material</th>
                <th>Supplier Quality</th>
                <th>Factory</th>
                <th>Season / Year</th>
                <th>Status</th>
                <th>Option</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material) => (
                <tr key={material.id}>
                  <td>{material.id}</td>
                  <td>{material.name}</td>
                  <td>{material.supplier_quality_name || "—"}</td>
                  <td>{material.factory_names || "Unassigned"}</td>
                  <td>
                    {[material.season, material.year].filter(Boolean).join(" / ") || "—"}
                  </td>
                  <td>
                    <span className="tag neutral">{material.status}</span>
                  </td>
                  <td>{material.option_number ?? "—"}</td>
                  <td className="table-actions">
                    <button
                      className="button secondary"
                      type="button"
                      onClick={() => handleEdit(material)}
                    >
                      Edit
                    </button>
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
