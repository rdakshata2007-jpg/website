import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./OfficialLogin.css";

function OfficialLogin() {
  const navigate = useNavigate();

  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    if (!department || !email) {
      setError("Please select your department and enter your official email.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/users/official-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          department,
          email: email.trim()
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to authenticate official.");
      }

      // Save official login information
      localStorage.setItem("officialDepartment", data.official.department || department);
      localStorage.setItem("officialEmail", data.official.email || email);
      localStorage.setItem("officialName", data.official.name || (department + " Officer"));
      localStorage.setItem("officialLoggedIn", "true");

      // Open official dashboard
      navigate("/official-dashboard");
    } catch (err) {
      setError(err.message || "Unable to sign in. Please verify the backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="official-page">

      {/* ================= HEADER ================= */}

      <header className="official-header">

        <div className="official-header-inner">

          <div className="official-brand">

            <div className="official-brand-icon">
              JV
            </div>

            <div>
              <h1>JanVoice AI</h1>
              <p>People’s Problems to Government Action</p>
            </div>

          </div>

          <div className="official-portal-label">
            <span>OFFICIAL PORTAL</span>
          </div>

          <button
            className="official-back-button"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>

        </div>

      </header>


      {/* ================= MAIN ================= */}

      <main className="official-main">

        <div className="official-container">


          {/* ================= LEFT PANEL ================= */}

          <section className="official-info-panel">

        
          <center>
            <span className="official-small-title">
              <h3>GOVERNMENT OFFICIAL ACCESS </h3>
            </span>
            </center>
         
            <h2>
              Manage Public Complaints</h2>
              <center>
             <h2> Efficiently.
            </h2>
            </center>

            <p>
              Access complaints assigned to your department,
              review AI analysis and update the progress of
              citizen grievances.
            </p>


            {/* FEATURES */}

            <div className="official-features">

              <div className="official-feature">

                <div className="feature-number">
                  01
                </div>

                <div>
                  <strong>Department Complaints</strong>
                  <p>
                    View complaints assigned to your department.
                  </p>
                </div>

              </div>


              <div className="official-feature">

                <div className="feature-number">
                  02
                </div>

                <div>
                  <strong>AI-Assisted Analysis</strong>
                  <p>
                    Review issue category, priority and location.
                  </p>
                </div>

              </div>


              <div className="official-feature">

                <div className="feature-number">
                  03
                </div>

                <div>
                  <strong>Action & Tracking</strong>
                  <p>
                    Update complaint status and monitor progress.
                  </p>
                </div>

              </div>

            </div>

          </section>


          {/* ================= LOGIN CARD ================= */}

          <section className="official-login-area">

            <div className="official-login-card">


              {/* CARD HEADER */}

              <div className="login-card-header">

                <div className="login-icon">
                  🔐
                </div>

                <div>
                  <span>SECURE ACCESS</span>

                  <h3>
                    Official Login
                  </h3>
                </div>

              </div>


              <p className="login-description">
                Select your department and sign in using your
                authorized government email.
              </p>


              {/* SECURITY NOTICE */}

              <div className="security-notice">

                <span>✓</span>

                <div>

                  <strong>Authorized Personnel Only</strong>

                  <p>
                    This portal is intended for registered
                    government department officials.
                  </p>

                </div>

              </div>


              {/* FORM */}

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


                {/* DEPARTMENT */}

                <div className="official-form-group">

                  <label>
                    Department
                  </label>

                  <select
                    value={department}
                    onChange={(event) =>
                      setDepartment(event.target.value)
                    }
                    required
                  >

                    <option value="">
                      Select your department
                    </option>

                    <option value="Electricity">
                      Electrical Department
                    </option>

                    <option value="Water Supply">
                      Water Supply Department
                    </option>

                    <option value="Roads & Highways">
                      Roads & Highways Department
                    </option>

                    <option value="Municipal Waste">
                      Sanitation Department
                    </option>

                    <option value="Drainage">
                      Drainage Department
                    </option>

                    <option value="Street Lighting">
                      Street Lighting Department
                    </option>

                    <option value="General Public Grievance">
                      General Public Grievance Department
                    </option>

                  </select>

                </div>


                {/* EMAIL */}

                <div className="official-form-group">

                  <label>
                    Official Government Email
                  </label>

                  <div className="official-input-wrapper">

                    <span>
                      ✉
                    </span>

                    <input
                      type="email"
                      placeholder="official@department.gov.in"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      required
                    />

                  </div>

                </div>


                {/* OPTIONS */}

                <div className="official-login-options">

                  <label className="remember-official">

                    <input
                      type="checkbox"
                    />

                    <span>
                      Remember me
                    </span>

                  </label>

                  <button
                    type="button"
                    className="forgot-official"
                    onClick={() =>
                      alert(
                        "Please contact the system administrator for account assistance."
                      )
                    }
                  >
                    Account help?
                  </button>

                </div>


                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  className="official-submit-button"
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In to Official Portal"}
                  <span>→</span>
                </button>

              </form>


             
     {/* BOTTOM */}

              <div className="official-card-footer">

                <span>
                  🔒 Secure Official Access
                </span>

                <span>
                  •
                </span>

                <span>
                  Authorized Users
                </span>

              </div>

            </div>

          </section>

        </div>
</main>


      {/* ================= FOOTER ================= */}

      <footer className="official-footer">

        <div>

          <strong>
            JanVoice AI
          </strong>

          <span>
            AI-Powered Public Grievance Platform
          </span>

        </div>

        <p>
          © 2026 JanVoice AI • College Project
        </p>

      </footer>

    </div>
  );
}

export default OfficialLogin;