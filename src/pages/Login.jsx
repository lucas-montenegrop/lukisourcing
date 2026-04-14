import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const initialForm = {
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

export default function Login({ onAuthSuccess }) {
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
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const rawResponse = await response.text();
      const data = parseResponseBody(rawResponse);

      if (!response.ok) {
        setError(typeof data === "string" ? data : "Unable to log in.");
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
      <div className="auth-card">
        <p className="eyebrow">Welcome Back</p>
        <h1>Log in to LukiSourcing</h1>
        <p>Use your email and password to enter your sourcing workspace.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
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

          <label>
            <span>Password</span>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="button primary auth-submit" disabled={submitting}>
            {submitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="auth-switch">
          Need an account? <Link to="/register">Create one here.</Link>
        </p>
      </div>
    </div>
  );
}
