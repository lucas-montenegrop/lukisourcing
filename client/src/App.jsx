import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { getApiUrl } from "./api/client.js";
import AppLayout from "./components/AppLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Factories from "./pages/Factories.jsx";
import Login from "./pages/Login.jsx";
import Materials from "./pages/Materials.jsx";
import Register from "./pages/Register.jsx";
import StageOfMaterial from "./pages/StageOfMaterial.jsx";

const TOKEN_KEY = "luki_token";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(Boolean(token));

  function clearStoredSession() {
    // WHY: Keeping logout and invalid-session cleanup in one place improves code style
    // and makes auth behavior easier to keep consistent across the whole app.
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setCurrentUser(null);
  }

  useEffect(() => {
    async function loadCurrentUser() {
      if (!token) {
        setCurrentUser(null);
        setLoadingUser(false);
        return;
      }

      setLoadingUser(true);

      try {
        const response = await fetch(getApiUrl("/api/users/me"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          // WHY: A token that cannot load the current user should be cleared so the app
          // returns to a clean login state instead of keeping a broken session around.
          clearStoredSession();
          return;
        }

        const user = await response.json();
        setCurrentUser(user);
      } catch (error) {
        console.error(error);
        setCurrentUser(null);
      } finally {
        setLoadingUser(false);
      }
    }

    loadCurrentUser();
  }, [token]);

  function handleAuthSuccess(authResult) {
    // WHY: Saving the new token and user together keeps the login and register flow
    // aligned with what the protected routes expect.
    localStorage.setItem(TOKEN_KEY, authResult.token);
    setToken(authResult.token);
    setCurrentUser(authResult.user);
  }

  function handleLogout() {
    // WHY: Reusing the shared session cleanup keeps logout behavior consistent with
    // other auth resets, which supports reliable functionality.
    clearStoredSession();
  }

  if (loadingUser) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p className="eyebrow">Loading</p>
          <h1>Checking your workspace</h1>
          <p>One moment while we reconnect your session.</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          currentUser ? (
            <Navigate to="/" replace />
          ) : (
            <Login onAuthSuccess={handleAuthSuccess} />
          )
        }
      />
      <Route
        path="/register"
        element={
          currentUser ? (
            <Navigate to="/" replace />
          ) : (
            <Register onAuthSuccess={handleAuthSuccess} />
          )
        }
      />
      <Route
        path="*"
        element={
          currentUser ? (
            <AppLayout currentUser={currentUser} onLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/factories" element={<Factories />} />
                <Route path="/materials" element={<Materials />} />
                <Route path="/fabrics" element={<Navigate to="/materials" replace />} />
                <Route path="/stage-of-material" element={<StageOfMaterial />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppLayout>
          ) : (
            // WHY: Returning users are more likely to need the login screen after logout
            // or session expiry, so this default redirect improves the main auth flow.
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}
