import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CitizenLogin.css";

function CitizenLogin() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    // ===================================================
    // VALIDATION
    // ===================================================

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          identifier: email,
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid email or password.");
      }

      // Save citizen information in localStorage
      localStorage.setItem("janvoiceUser", JSON.stringify(data.user));
      localStorage.setItem("janvoiceLoggedIn", "true");
      localStorage.setItem("janvoiceUserEmail", data.user.email);
      localStorage.setItem("janvoiceUserName", data.user.name);
      localStorage.setItem("janvoiceUserId", data.user.userId);

      // Redirect to citizen dashboard
      navigate("/citizen-dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Ensure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="citizen-login-page">

      {/* HEADER */}

      <header className="login-header">

        <div className="login-brand">

          <div className="login-emblem">
            🏛️
          </div>

          <div>

            <h1>
              JanVoice AI
            </h1>

            <p>
              People’s Problems to Government Action
            </p>

          </div>

        </div>

        <button
          className="back-home-btn"
          onClick={() =>
            navigate("/")
          }
        >
          ← Back to Home
        </button>

      </header>


      {/* MAIN */}

      <main className="login-main">

        {/* LEFT SIDE */}

        <section className="login-info">

          <span className="login-tag">
            CITIZEN PORTAL
          </span>

          <h2>
            Welcome Back
          </h2>

          <p>
            Login to report public problems,
            track your complaints and stay
            updated on government action.
          </p>


          <div className="login-benefits">

            {/* BENEFIT 1 */}

            <div className="benefit">

              <div className="benefit-icon">
                📝
              </div>

              <div>

                <h3>
                  Report Problems
                </h3>

                <p>
                  Submit civic problems quickly
                  and easily.
                </p>

              </div>

            </div>


            {/* BENEFIT 2 */}

            <div className="benefit">

              <div className="benefit-icon">
                🔎
              </div>

              <div>

                <h3>
                  Track Complaints
                </h3>

                <p>
                  Follow your complaint status
                  anytime.
                </p>

              </div>

            </div>


            {/* BENEFIT 3 */}

            <div className="benefit">

              <div className="benefit-icon">
                🔔
              </div>

              <div>

                <h3>
                  Stay Updated
                </h3>

                <p>
                  Get updates about your
                  submitted complaints.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* LOGIN CARD */}

        <section className="login-card">

          <div className="login-card-heading">

            <h2>
              Citizen Login
            </h2>

            <p>
              Login to your JanVoice AI account
            </p>

          </div>


          {/* LOGIN FORM */}

          {error && (
            <div
              style={{
                backgroundColor: "#fde8e8",
                color: "#c81e1e",
                padding: "10px 14px",
                borderRadius: "6px",
                marginBottom: "16px",
                fontSize: "14px",
                borderLeft: "4px solid #c81e1e"
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>

            {/* EMAIL */}

            <div className="form-group">

              <label htmlFor="email">
                Email Address or Mobile
              </label>

              <input
                id="email"
                type="text"
                placeholder="Enter email or 10-digit mobile"
              />

            </div>


            {/* PASSWORD */}

            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
              />

            </div>


            {/* OPTIONS */}

            <div className="login-options">

              <label className="remember">

                <input
                  type="checkbox"
                />

                <span>
                  Remember me
                </span>

              </label>

              <button
                type="button"
                className="forgot-password"
              >
                Forgot Password?
              </button>

            </div>


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="citizen-login-btn"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}

              <span>
                →
              </span>

            </button>

          </form>


          {/* REGISTER */}

          <div className="register-section">

            <p>
              Don't have an account?
            </p>

            <button
              onClick={() =>
                navigate(
                  "/citizen-register"
                )
              }
              className="register-btn"
            >
              Create Citizen Account
            </button>

          </div>

        </section>

      </main>


      {/* FOOTER */}

      <footer className="login-footer">

        <p>
          © 2026 JanVoice AI
        </p>

      </footer>

    </div>
  );
}

export default CitizenLogin;