import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./TrackComplaint.css";

function TrackComplaint() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [complaintId, setComplaintId] = useState("");
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchComplaint = async (targetId) => {
    const id = (targetId || complaintId).trim();

    if (!id) {
      setMessage("Please enter your Complaint ID.");
      setComplaint(null);
      return;
    }

    setLoading(true);
    setMessage("");
    setComplaint(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/complaints/${encodeURIComponent(id)}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Complaint not found.");
      }

      const data = result.complaint || result;
      setComplaint(data);
    } catch (error) {
      console.error("Track complaint error:", error);
      setMessage(
        error.message ||
          "Unable to find the complaint. Please check your Complaint ID."
      );
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if complaintId is passed in URL query param
  useEffect(() => {
    const idFromParam = searchParams.get("complaintId");
    if (idFromParam) {
      setComplaintId(idFromParam);
      fetchComplaint(idFromParam);
    }
  }, [searchParams]);

  const getStatusStep = (status) => {
    switch (status) {
      case "Closed":
        return 5;
      case "Resolved":
        return 4;
      case "In Progress":
        return 3;
      case "Under Review":
        return 2;
      case "Submitted":
      default:
        return 1;
    }
  };

  const statusStep = getStatusStep(complaint?.status);

  const getStatusText = () => {
    if (!complaint) return "";
    return complaint.status || "Submitted";
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="track-page">
      {/* ================= HEADER ================= */}
      <header className="track-header">
        <div className="track-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <div className="track-logo">JV</div>
          <div>
            <h1>JanVoice AI</h1>
            <p>People’s Problems to Government Action</p>
          </div>
        </div>

        <nav className="track-navigation">
          <button onClick={() => navigate("/")}>Home</button>
          <button onClick={() => navigate("/report")}>Report a Problem</button>
          <button className="active">Track Complaint</button>
          <button onClick={() => navigate("/citizen-dashboard")}>Citizen Portal</button>
        </nav>

        <button className="track-official-button" onClick={() => navigate("/official-login")}>
          Official Login
        </button>
      </header>

      {/* ================= MAIN ================= */}
      <main className="track-main">
        <section className="track-search-section">
          <div className="track-label">PUBLIC COMPLAINT TRACKING</div>
          <h2>Track Your Grievance Status</h2>
          <p className="track-description">
            Enter your JanVoice AI Complaint ID (e.g., JVA-2026-XXXXXX) to monitor real-time department investigation and resolution progress.
          </p>

          {/* SEARCH BOX */}
          <div className="track-search-box">
            <input
              type="text"
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fetchComplaint();
                }
              }}
              placeholder="Enter Complaint ID (e.g. JVA-2026-123456)"
            />

            <button onClick={() => fetchComplaint()} disabled={loading}>
              {loading ? "Searching..." : "Track Now"}
            </button>
          </div>

          {message && <div className="track-message error">{message}</div>}
        </section>

        {/* LOADING INDICATOR */}
        {loading && <div className="track-loading">Fetching complaint details from the government database...</div>}

        {/* RESULT CARD */}
        {complaint && !loading && (
          <section className="track-result-card">
            {/* CARD TOP */}
            <div className="result-top">
              <div>
                <span className="result-small-label">OFFICIAL GRIEVANCE RECORD</span>
                <h3>{complaint.problem || complaint.complaintText || "Public Grievance"}</h3>
              </div>

              <span className={`result-priority ${String(complaint.priority || "Medium").toLowerCase()}`}>
                {complaint.priority || "Medium"} Priority
              </span>
            </div>

            {/* LOCATION */}
            <div className="result-location">
              <div className="location-icon">📍</div>
              <div>
                <strong>
                  {complaint.location?.street ? `${complaint.location.street}, ` : ""}
                  {complaint.location?.area || "Area"}
                </strong>
                <p>
                  {complaint.location?.district || ""}{complaint.location?.state ? `, ${complaint.location.state}` : ""}
                </p>
              </div>
            </div>

            {/* DETAILS GRID */}
            <div className="result-info-grid">
              <div className="result-info">
                <span>Complaint ID</span>
                <strong style={{ color: "#0066cc" }}>{complaint.complaintId}</strong>
              </div>

              <div className="result-info">
                <span>Responsible Department</span>
                <strong>{complaint.department || "General Public Grievance Department"}</strong>
              </div>

              <div className="result-info">
                <span>Citizen Name</span>
                <strong>{complaint.citizenName}</strong>
              </div>

              <div className="result-info">
                <span>Registered Date</span>
                <strong>{formatDate(complaint.createdAt)}</strong>
              </div>
            </div>

            {/* STATUS PIPELINE */}
            <div className="tracking-status">
              <div className="status-heading">
                <span>Current Status</span>
                <strong style={{ fontSize: "18px", color: "#123f73" }}>{getStatusText()}</strong>
              </div>

              <div className="status-progress">
                <div
                  className="status-progress-fill"
                  style={{
                    width: `${Math.min(100, Math.max(20, statusStep * 20))}%`
                  }}
                />
              </div>

              <div className="status-steps" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}>
                <div className={statusStep >= 1 ? "status-step completed" : "status-step"}>
                  <div className="step-circle">{statusStep >= 1 ? "✓" : "1"}</div>
                  <span>Submitted</span>
                </div>

                <div className={statusStep >= 2 ? "status-step completed" : "status-step"}>
                  <div className="step-circle">{statusStep >= 2 ? "✓" : "2"}</div>
                  <span>Under Review</span>
                </div>

                <div className={statusStep >= 3 ? "status-step completed" : "status-step"}>
                  <div className="step-circle">{statusStep >= 3 ? "✓" : "3"}</div>
                  <span>In Progress</span>
                </div>

                <div className={statusStep >= 4 ? "status-step completed" : "status-step"}>
                  <div className="step-circle">{statusStep >= 4 ? "✓" : "4"}</div>
                  <span>Resolved</span>
                </div>

                <div className={statusStep >= 5 ? "status-step completed" : "status-step"}>
                  <div className="step-circle">{statusStep >= 5 ? "✓" : "5"}</div>
                  <span>Closed</span>
                </div>
              </div>
            </div>

            {/* COMPLAINT TEXT / MEDIA */}
            {complaint.complaintText && (
              <div className="complaint-description" style={{ marginTop: "20px" }}>
                <span style={{ fontWeight: "bold", color: "#183657", display: "block", marginBottom: "6px" }}>
                  Citizen Grievance Description:
                </span>
                <p style={{ margin: 0, color: "#333", lineHeight: 1.6 }}>{complaint.complaintText}</p>
              </div>
            )}

            {complaint.imageUrl && (
              <div style={{ marginTop: "16px" }}>
                <span style={{ fontWeight: "bold", color: "#183657", display: "block", marginBottom: "8px" }}>
                  Attached Photographic Evidence:
                </span>
                <img
                  src={`http://localhost:5000${complaint.imageUrl}`}
                  alt="Complaint Evidence"
                  style={{ maxWidth: "100%", maxHeight: "280px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>
            )}

            {/* STATUS HISTORY TIMELINE */}
            <div style={{ marginTop: "28px", borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>
              <h4 style={{ margin: "0 0 16px", color: "#123f73", fontSize: "16px" }}>
                📜 Official Action & Status History
              </h4>

              <div style={{ position: "relative", paddingLeft: "24px", borderLeft: "2px solid #0066cc", margin: "10px 0 20px 8px" }}>
                {(complaint.statusHistory && complaint.statusHistory.length > 0
                  ? complaint.statusHistory
                  : [
                      {
                        status: complaint.status || "Submitted",
                        changedAt: complaint.createdAt,
                        changedBy: "System",
                        remarks: "Complaint received and recorded in public ledger."
                      }
                    ]
                ).map((item, idx) => (
                  <div key={idx} style={{ marginBottom: "18px", position: "relative" }}>
                    <div
                      style={{
                        position: "absolute",
                        left: "-31px",
                        top: "3px",
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: "#0066cc",
                        border: "2px solid #ffffff"
                      }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <strong style={{ color: "#0b3b60", fontSize: "14px" }}>{item.status}</strong>
                      <small style={{ color: "#777" }}>{formatDate(item.changedAt)}</small>
                    </div>
                    <div style={{ fontSize: "13px", color: "#444", marginTop: "3px" }}>
                      <span>Updated By: </span>
                      <strong>{item.changedBy || "Department Officer"}</strong>
                      {item.department ? ` (${item.department})` : ""}
                    </div>
                    {item.remarks && (
                      <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#555", fontStyle: "italic", background: "#f8fafc", padding: "6px 10px", borderRadius: "4px" }}>
                        "{item.remarks}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="track-actions" style={{ marginTop: "24px" }}>
              <button className="new-report-button" onClick={() => navigate("/report")}>
                + Report Another Problem
              </button>

              <button className="home-track-button" onClick={() => navigate("/")}>
                Back to Home
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default TrackComplaint;