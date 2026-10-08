import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./OfficialDashboard.css";

const API_URL = "http://localhost:5000/api/complaints";

function OfficialDashboard() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  /* =========================================
     OFFICIAL LOGIN DETAILS
  ========================================= */

  const department =
    localStorage.getItem("janvoiceOfficialDepartment") ||
    localStorage.getItem("officialDepartment") ||
    localStorage.getItem("department") ||
    "";

  const officialEmail =
    localStorage.getItem("janvoiceOfficialEmail") ||
    localStorage.getItem("officialEmail") ||
    localStorage.getItem("officialGovernmentEmail") ||
    "";

  /* =========================================
     LOAD COMPLAINTS
  ========================================= */

  useEffect(() => {
    let cancelled = false;

    const loadComplaints = async () => {
      try {
        setLoading(true);
        setError("");

        const storedDepartment =
          localStorage.getItem("janvoiceOfficialDepartment") ||
          localStorage.getItem("officialDepartment") ||
          localStorage.getItem("department") ||
          "";

        if (!storedDepartment) {
          if (!cancelled) {
            setComplaints([]);

            setError(
              "Department information was not found. Please login again."
            );
          }

          return;
        }

        console.log(
          "Loading complaints for department:",
          storedDepartment
        );

        const response = await fetch(
          `${API_URL}/official?department=${encodeURIComponent(
            storedDepartment
          )}`
        );

        const data = await response.json();

        console.log("Official dashboard response:", data);

        if (!response.ok) {
          throw new Error(
            data.message || `Server returned ${response.status}`
          );
        }

        if (!cancelled) {
          if (Array.isArray(data.complaints)) {
            setComplaints(data.complaints);
          } else if (Array.isArray(data)) {
            setComplaints(data);
          } else {
            setComplaints([]);
          }
        }
      } catch (err) {
        console.error("Official dashboard error:", err);

        if (!cancelled) {
          setComplaints([]);

          setError(
            err.message || "Unable to load complaints."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadComplaints();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================
     REFRESH
  ========================================= */

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError("");

      const storedDepartment =
        localStorage.getItem("janvoiceOfficialDepartment") ||
        localStorage.getItem("officialDepartment") ||
        localStorage.getItem("department") ||
        "";

      if (!storedDepartment) {
        setError(
          "Department information was not found. Please login again."
        );

        return;
      }

      const response = await fetch(
        `${API_URL}/official?department=${encodeURIComponent(
          storedDepartment
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to refresh complaints."
        );
      }

      if (Array.isArray(data.complaints)) {
        setComplaints(data.complaints);
      } else if (Array.isArray(data)) {
        setComplaints(data);
      } else {
        setComplaints([]);
      }
    } catch (err) {
      console.error("Refresh error:", err);

      setError(
        err.message || "Unable to refresh complaints."
      );
    } finally {
      setRefreshing(false);
    }
  };

  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout = () => {
    localStorage.removeItem("janvoiceOfficialDepartment");
    localStorage.removeItem("officialDepartment");
    localStorage.removeItem("department");

    localStorage.removeItem("janvoiceOfficialEmail");
    localStorage.removeItem("officialEmail");
    localStorage.removeItem("officialGovernmentEmail");

    localStorage.removeItem("janvoiceOfficialLoggedIn");
    localStorage.removeItem("officialLoggedIn");

    navigate("/official-login");
  };

  /* =========================================
     FORMAT DATE
  ========================================= */

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =========================================
     LOCATION
  ========================================= */

  const getLocation = (complaint) => {
    const location = complaint?.location;

    if (!location) {
      return "Location not provided";
    }

    if (typeof location === "string") {
      return location;
    }

    const parts = [
      location.area,
      location.street,
      location.district,
      location.state,
    ].filter(Boolean);

    return parts.length > 0
      ? parts.join(", ")
      : "Location not provided";
  };

  /* =========================================
     PRIORITY CLASS
  ========================================= */

  const getPriorityClass = (priority) => {
    const value = String(priority || "Medium").toLowerCase();

    if (value === "high") {
      return "priority-high";
    }

    if (value === "low") {
      return "priority-low";
    }

    return "priority-medium";
  };

  /* =========================================
     STATUS CLASS
  ========================================= */

  const getStatusClass = (status) => {
    const value = String(status || "Submitted")
      .toLowerCase()
      .replace(/\s+/g, "-");

    if (value === "submitted") {
      return "status-submitted";
    }

    if (value === "under-review") {
      return "status-under-review";
    }

    if (value === "in-progress") {
      return "status-in-progress";
    }

    if (value === "resolved") {
      return "status-resolved";
    }

    if (value === "closed") {
      return "status-closed";
    }

    return "status-submitted";
  };

  /* =========================================
     COMPLAINT CONTENT
  ========================================= */

  const getComplaintText = (complaint) => {
    return (
      complaint?.complaintText ||
      complaint?.description ||
      complaint?.text ||
      ""
    );
  };

  /* =========================================
     MEDIA URL
  ========================================= */

  const getMediaUrl = (complaint) => {
    return (
      complaint?.fileUrl ||
      complaint?.mediaUrl ||
      complaint?.imageUrl ||
      complaint?.videoUrl ||
      complaint?.file ||
      complaint?.media ||
      ""
    );
  };

  /* =========================================
     METHOD
  ========================================= */

  const getMethod = (complaint) => {
    return String(
      complaint?.method || ""
    ).toUpperCase();
  };

  /* =========================================
     SEARCH
  ========================================= */

  const filteredComplaints = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return complaints;
    }

    return complaints.filter((complaint) => {
      const complaintId = String(
        complaint?.complaintId ||
          complaint?._id ||
          ""
      ).toLowerCase();

      const citizenName = String(
        complaint?.citizenName || ""
      ).toLowerCase();

      const location = String(
        getLocation(complaint)
      ).toLowerCase();

      const priority = String(
        complaint?.priority || ""
      ).toLowerCase();

      const status = String(
        complaint?.status || ""
      ).toLowerCase();

      return (
        complaintId.includes(search) ||
        citizenName.includes(search) ||
        location.includes(search) ||
        priority.includes(search) ||
        status.includes(search)
      );
    });
  }, [complaints, searchTerm]);

  /* =========================================
     STATISTICS
  ========================================= */

  const totalComplaints = complaints.length;

  const submittedComplaints = complaints.filter(
    (complaint) =>
      String(
        complaint?.status || "Submitted"
      ).toLowerCase() === "submitted"
  ).length;

  const inProgressComplaints = complaints.filter(
    (complaint) => {
      const status = String(
        complaint?.status || ""
      ).toLowerCase();

      return (
        status === "in progress" ||
        status === "under review"
      );
    }
  ).length;

  const resolvedComplaints = complaints.filter(
    (complaint) => {
      const status = String(
        complaint?.status || ""
      ).toLowerCase();

      return (
        status === "resolved" ||
        status === "closed"
      );
    }
  ).length;

  /* =========================================
     OPEN DETAILS
  ========================================= */

  const openComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint);

    setSelectedStatus(
      complaint?.status || "Submitted"
    );

    setStatusMessage("");
  };

  /* =========================================
     CLOSE DETAILS
  ========================================= */

  const closeComplaintDetails = () => {
    setSelectedComplaint(null);

    setSelectedStatus("");

    setStatusMessage("");
  };

  /* =========================================
     UPDATE STATUS
  ========================================= */

  const updateComplaintStatus = async () => {
    if (!selectedComplaint) {
      return;
    }

    const complaintId =
      selectedComplaint.complaintId ||
      selectedComplaint._id ||
      selectedComplaint.id;

    if (!complaintId) {
      setStatusMessage(
        "Complaint ID is missing."
      );

      return;
    }

    try {
      setUpdatingStatus(true);

      setStatusMessage("");

      const response = await fetch(
        `${API_URL}/${encodeURIComponent(
          complaintId
        )}/status`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            status: selectedStatus,
            department,
            officialEmail,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update complaint status."
        );
      }

      setComplaints((previousComplaints) =>
        previousComplaints.map((complaint) => {
          const currentId =
            complaint.complaintId ||
            complaint._id ||
            complaint.id;

          if (String(currentId) === String(complaintId)) {
            return {
              ...complaint,
              status: selectedStatus,
            };
          }

          return complaint;
        })
      );

      setSelectedComplaint((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          status: selectedStatus,
        };
      });

      setStatusMessage(
        "Complaint status updated successfully."
      );
    } catch (err) {
      console.error(
        "Update complaint status error:",
        err
      );

      setStatusMessage(
        err.message ||
          "Failed to update complaint status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="official-dashboard">

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="official-header">

        <div className="official-header-left">

          <div className="government-emblem">
            IN
          </div>

          <div>
            <h1>Official Dashboard</h1>

            <p>
              JanVoice AI Government Grievance Portal
            </p>
          </div>

        </div>

        <div className="official-header-right">

          <div className="official-info">

            <strong>
              {department || "Government Department"}
            </strong>

            <span>
              {officialEmail || "Official Account"}
            </span>

          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* =====================================
          MAIN AREA
      ===================================== */}

      <main className="official-main">

        {/* ===================================
            SEPARATE WHITE DASHBOARD BOX
        =================================== */}

        <div className="dashboard-content-box">

          {/* =================================
              TITLE
          ================================= */}

          <div className="dashboard-title-section">

            <div>

              <h2>
                {department || "Official Department"}
              </h2>

              <p>
                Review and manage complaints assigned
                to your department.
              </p>

            </div>

            <button
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

          </div>

          {/* =================================
              STATISTICS
          ================================= */}

          <div className="stats-grid">

            <div className="stat-card">

              <div className="stat-card-label">
                Total Complaints
              </div>

              <div className="stat-card-value">
                {totalComplaints}
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-card-label">
                Submitted
              </div>

              <div className="stat-card-value">
                {submittedComplaints}
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-card-label">
                In Progress
              </div>

              <div className="stat-card-value">
                {inProgressComplaints}
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-card-label">
                Resolved
              </div>

              <div className="stat-card-value">
                {resolvedComplaints}
              </div>

            </div>

          </div>

          {/* =================================
              ERROR
          ================================= */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* =================================
              SEARCH
          ================================= */}

          <div className="complaint-toolbar">

            <div className="search-wrapper">

              <input
                type="text"
                className="complaint-search"
                placeholder="Search complaint ID, citizen, location or status..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />

            </div>

            <div className="complaint-count">

              {filteredComplaints.length}{" "}
              {filteredComplaints.length === 1
                ? "complaint"
                : "complaints"}

            </div>

          </div>

          {/* =================================
              COMPLAINT HEADER
          ================================= */}

          {!loading &&
            filteredComplaints.length > 0 && (
              <div className="complaint-header">

                <span>
                  Complaint ID
                </span>

                <span>
                  Citizen Name
                </span>

                <span>
                  Location
                </span>

                <span>
                  Priority
                </span>

                <span>
                  Status
                </span>

                <span>
                  Action
                </span>

              </div>
            )}

          {/* =================================
              COMPLAINT LIST
          ================================= */}

          {loading ? (

            <div className="empty-state">

              <div className="loading-spinner"></div>

              <h3>
                Loading complaints
              </h3>

              <p>
                Please wait while complaints are
                retrieved from MongoDB.
              </p>

            </div>

          ) : filteredComplaints.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                📋
              </div>

              <h3>
                No complaints found
              </h3>

              <p>
                There are no complaints assigned
                to this department.
              </p>

            </div>

          ) : (

            <div className="complaints-list">

              {filteredComplaints.map(
                (complaint) => {

                  const complaintId =
                    complaint.complaintId ||
                    complaint._id ||
                    complaint.id;

                  return (

                    <div
                      className="complaint-row"
                      key={complaintId}
                    >

                      {/* Complaint ID */}

                      <div className="complaint-cell complaint-id">

                        {complaint.complaintId ||
                          complaint._id ||
                          "—"}

                      </div>

                      {/* Citizen */}

                      <div className="complaint-cell citizen-name">

                        {complaint.citizenName ||
                          "Citizen"}

                      </div>

                      {/* Location */}

                      <div className="complaint-cell location-cell">

                        {getLocation(complaint)}

                      </div>

                      {/* Priority */}

                      <div className="complaint-cell">

                        <span
                          className={`priority-badge ${getPriorityClass(
                            complaint.priority
                          )}`}
                        >
                          {complaint.priority ||
                            "Medium"}
                        </span>

                      </div>

                      {/* Status */}

                      <div className="complaint-cell">

                        <span
                          className={`status-badge ${getStatusClass(
                            complaint.status
                          )}`}
                        >
                          {complaint.status ||
                            "Submitted"}
                        </span>

                      </div>

                      {/* View Details */}

                      <button
                        className="view-details-btn"
                        onClick={() =>
                          openComplaintDetails(
                            complaint
                          )
                        }
                      >
                        View Details
                      </button>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </div>

      </main>

      {/* =====================================
          DETAILS MODAL
      ===================================== */}

      {selectedComplaint && (

        <div
          className="details-overlay"
          onClick={closeComplaintDetails}
        >

          <div
            className="details-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* Modal Header */}

            <div className="details-modal-header">

              <div>

                <span className="details-label">
                  Complaint ID
                </span>

                <h2>
                  {selectedComplaint.complaintId ||
                    selectedComplaint._id ||
                    "—"}
                </h2>

              </div>

              <button
                className="close-details-btn"
                onClick={closeComplaintDetails}
              >
                ×
              </button>

            </div>

            {/* Modal Body */}

            <div className="details-modal-body">

              {/* Citizen Details */}

              <div className="details-section">

                <h3>
                  Citizen Information
                </h3>

                <div className="details-grid">

                  <div className="detail-item">

                    <span>
                      Name
                    </span>

                    <strong>
                      {selectedComplaint.citizenName ||
                        "Citizen"}
                    </strong>

                  </div>

                  <div className="detail-item">

                    <span>
                      Email
                    </span>

                    <strong>
                      {selectedComplaint.citizenEmail ||
                        "Not provided"}
                    </strong>

                  </div>

                </div>

              </div>

              {/* Complaint Information */}

              <div className="details-section">

                <h3>
                  Complaint Information
                </h3>

                <div className="details-grid">

                  <div className="detail-item">

                    <span>
                      Department
                    </span>

                    <strong>
                      {selectedComplaint.department ||
                        department ||
                        "—"}
                    </strong>

                  </div>

                  <div className="detail-item">

                    <span>
                      Method
                    </span>

                    <strong>
                      {getMethod(
                        selectedComplaint
                      ) || "TEXT"}
                    </strong>

                  </div>

                  <div className="detail-item">

                    <span>
                      Date
                    </span>

                    <strong>
                      {formatDate(
                        selectedComplaint.createdAt
                      )}
                    </strong>

                  </div>

                </div>

              </div>

              {/* Location */}

              <div className="details-section">

                <h3>
                  Location
                </h3>

                <div className="location-detail-box">

                  <div>

                    <span>
                      State
                    </span>

                    <strong>
                      {selectedComplaint
                        ?.location?.state ||
                        "—"}
                    </strong>

                  </div>

                  <div>

                    <span>
                      District
                    </span>

                    <strong>
                      {selectedComplaint
                        ?.location?.district ||
                        "—"}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Area
                    </span>

                    <strong>
                      {selectedComplaint
                        ?.location?.area ||
                        "—"}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Street
                    </span>

                    <strong>
                      {selectedComplaint
                        ?.location?.street ||
                        "—"}
                    </strong>

                  </div>

                </div>

              </div>

              {/* Complaint Content */}

              <div className="details-section">

                <h3>
                  Complaint Content
                </h3>

                {getComplaintText(
                  selectedComplaint
                ) ? (

                  <div className="complaint-text-box">

                    {getComplaintText(
                      selectedComplaint
                    )}

                  </div>

                ) : (

                  <div className="no-content-message">

                    No text description was
                    provided for this complaint.

                  </div>

                )}

              </div>

              {/* Evidence */}

              {getMediaUrl(
                selectedComplaint
              ) && (

                <div className="details-section">

                  <h3>
                    Evidence
                  </h3>

                  <div className="media-preview">

                    {getMethod(
                      selectedComplaint
                    ) === "IMAGE" ? (

                      <img
                        src={getMediaUrl(
                          selectedComplaint
                        )}
                        alt="Complaint evidence"
                      />

                    ) : getMethod(
                        selectedComplaint
                      ) === "VIDEO" ? (

                      <video
                        src={getMediaUrl(
                          selectedComplaint
                        )}
                        controls
                      />

                    ) : (

                      <a
                        href={getMediaUrl(
                          selectedComplaint
                        )}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open Evidence
                      </a>

                    )}

                  </div>

                </div>

              )}

              {/* Status Update */}

              <div className="status-update-section">

                <h3>
                  Update Complaint Status
                </h3>

                <div className="status-update-row">

                  <select
                    className="status-select"
                    value={selectedStatus}
                    onChange={(event) =>
                      setSelectedStatus(
                        event.target.value
                      )
                    }
                  >

                    <option value="Submitted">
                      Submitted
                    </option>

                    <option value="Under Review">
                      Under Review
                    </option>

                    <option value="In Progress">
                      In Progress
                    </option>

                    <option value="Resolved">
                      Resolved
                    </option>

                    <option value="Closed">
                      Closed
                    </option>

                  </select>

                  <button
                    className="update-status-btn"
                    onClick={
                      updateComplaintStatus
                    }
                    disabled={updatingStatus}
                  >
                    {updatingStatus
                      ? "Updating..."
                      : "Update Status"}
                  </button>

                </div>

                {statusMessage && (

                  <div
                    className={`status-message ${
                      statusMessage.toLowerCase().includes(
                        "success"
                      )
                        ? "success"
                        : "error"
                    }`}
                  >
                    {statusMessage}
                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default OfficialDashboard;