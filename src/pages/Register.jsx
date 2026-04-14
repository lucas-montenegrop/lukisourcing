import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const initialForm = {
  first_name: "",
  last_name: "",
  company: "",
  email: "",
  password: "",
};

function parseResponseBody(rawResponse) {
  if (!rawResponse) return null;

  try {
    return JSON.parse(rawResponse);
  } catch {
    return rawResponse;
  }
}

export default function Register({ onAuthSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const rawResponse = await response.text();
      const data = parseResponseBody(rawResponse);

      if (!response.ok) {
        setError(typeof data === "string" ? data : "Unable to create your account.");
        return;
      }

      if (!data || typeof data !== "object" || !data.token || !data.user) {
        setError("The server did not return a complete login session.");
        return;
      }

      onAuthSuccess(data);
      navigate("/");
    } catch (networkError) {
      console.error(networkError);
      setError("Unable to reach the server right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <p className="eyebrow">Create Account</p>
        <h1>Start your sourcing workspace</h1>
        <p>Create your user with the basic details your app needs first.</p>

        <form className="auth-form auth-grid" onSubmit={handleSubmit}>
          <label>
            <span>First Name</span>
            <input
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Lucas"
              required
            />
          </label>

          <label>
            <span>Last Name</span>
            <input
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Montenegro"
              required
            />
          </label>

          <label className="full-width">
            <span>Company</span>
            <input
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Luki Sourcing"
              required
            />
          </label>

          <label className="full-width">
            <span>Email</span>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@company.com"
              required
            />
          </label>

          <label className="full-width">
            <span>Password</span>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
            />
          </label>

          {error ? <p className="form-error full-width">{error}</p> : null}

          <button className="button primary auth-submit full-width" disabled={submitting}>
            {submitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in here.</Link>
        </p>
      </div>
    </div>
  );
}
