import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CitizenRegister.css";

function CitizenRegister() {
  const navigate = useNavigate();

  // ================================
  // FORM STATES
  // ================================
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);

  // Error message shown inside page
  const [error, setError] = useState("");

  // Loading state
  const [loading, setLoading] = useState(false);

  // ================================
  // CREATE ACCOUNT
  // ================================
  const handleRegister = async (event) => {
    event.preventDefault();

    // Clear previous error
    setError("");

    // Basic validation
    if (
      !name.trim() ||
      !mobile.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    // Mobile validation
    if (!/^[0-9]{10}$/.test(mobile.trim())) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    // Password validation
    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    // Confirm password
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Terms
    if (!agree) {
      setError("Please agree to use JanVoice AI for genuine complaints.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name.trim(),
          mobile: mobile.trim(),
          email: email.trim(),
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Registration failed. Please try again.");
      }

      // Save user information
      localStorage.setItem("janvoiceUser", JSON.stringify(data.user));
      localStorage.setItem("janvoiceLoggedIn", "true");
      localStorage.setItem("janvoiceUserEmail", data.user.email);
      localStorage.setItem("janvoiceUserName", data.user.name);
      localStorage.setItem("janvoiceUserId", data.user.userId);

      // Redirect to citizen dashboard
      navigate("/citizen-dashboard");
    } catch (err) {
      setError(err.message || "Unable to create account. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      {/* ================= HEADER ================= */}

      <header className="register-header">

        <div className="register-brand">

          <div className="register-emblem">
            🏛️
          </div>

          <div>
            <h1>JanVoice AI</h1>

            <p>
              People’s Problems to Government Action
            </p>
          </div>

        </div>

        <button
          type="button"
          className="register-back"
          onClick={() => navigate("/citizen-login")}
        >
          ← Citizen Login
        </button>

      </header>


      {/* ================= CONTENT ================= */}

      <main className="register-main">

        <div className="register-card">

          {/* HEADING */}

          <div className="register-heading">

            <span>
              CITIZEN PORTAL
            </span>

            <h2>
              Create Your Account
            </h2>

            <p>
              Register to report public problems and track
              your complaints.
            </p>

          </div>


          {/* ================= ERROR MESSAGE ================= */}

          {error && (
            <div className="register-error">
              {error}
            </div>
          )}


          {/* ================= FORM ================= */}

          <form onSubmit={handleRegister}>

            {/* NAME + MOBILE */}

            <div className="register-row">

              <div className="register-field">

                <label htmlFor="name">
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter your full name"
                />

              </div>


              <div className="register-field">

                <label htmlFor="mobile">
                  Mobile Number
                </label>

                <input
                  id="mobile"
                  type="tel"
                  value={mobile}
                  onChange={(event) =>
                    setMobile(event.target.value)
                  }
                  placeholder="Enter mobile number"
                  maxLength="10"
                />

              </div>

            </div>


            {/* EMAIL */}

            <div className="register-field">

              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email address"
              />

            </div>


            {/* PASSWORD + CONFIRM PASSWORD */}

            <div className="register-row">

              <div className="register-field">

                <label htmlFor="password">
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Create password"
                />

              </div>


              <div className="register-field">

                <label htmlFor="confirmPassword">
                  Confirm Password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Confirm password"
                />

              </div>

            </div>


            {/* TERMS */}

            <label className="terms">

              <input
                type="checkbox"
                checked={agree}
                onChange={(event) =>
                  setAgree(event.target.checked)
                }
              />

              <span>
                I agree to use JanVoice AI for submitting
                genuine public complaints.
              </span>

            </label>


            {/* CREATE ACCOUNT */}

            <button
              type="submit"
              className="create-account-btn"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
              <span>→</span>
            </button>

          </form>


          {/* LOGIN */}

          <div className="already-account">

            <span>
              Already have an account?
            </span>

            <button
              type="button"
              onClick={() => navigate("/citizen-login")}
            >
              Login
            </button>

          </div>

        </div>

      </main>


      {/* ================= FOOTER ================= */}

      <footer className="register-footer">

        <span>
          © 2026 JanVoice AI
        </span>

        <span>
          College Project / Demo
        </span>

      </footer>

    </div>
  );
}

export default CitizenRegister;