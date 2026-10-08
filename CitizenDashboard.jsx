import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CitizenDashboard.css";

function CitizenDashboard() {
  const navigate = useNavigate();

  /* =====================================================
     CITIZEN INFORMATION FROM LOCALSTORAGE
  ===================================================== */

  const getStoredUser = () => {
    try {
      const storedUser = localStorage.getItem("janvoiceUser");

      if (storedUser) {
        const parsed = JSON.parse(storedUser);

        return {
          name: parsed.name || "Citizen",

          email:
            parsed.email ||
            localStorage.getItem("janvoiceUserEmail") ||
            "",

          mobile: parsed.mobile || "",

          userId:
            parsed.userId ||
            localStorage.getItem("janvoiceUserId") ||
            "",
        };
      }
    } catch (error) {
      console.log(
        "Unable to read citizen information",
        error
      );
    }

    return {
      name:
        localStorage.getItem("janvoiceUserName") ||
        "Citizen",

      email:
        localStorage.getItem("janvoiceUserEmail") ||
        "",

      mobile: "",

      userId:
        localStorage.getItem("janvoiceUserId") ||
        "",
    };
  };

  const currentUser = getStoredUser();

  /* =====================================================
     STATES
  ===================================================== */

  const [complaints, setComplaints] = useState([]);

  const [notifications, setNotifications] = useState([]);

  // IMPORTANT:
  // Complaints are hidden when dashboard initially opens.
  const [showComplaints, setShowComplaints] =
    useState(false);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [loadingComplaints, setLoadingComplaints] =
    useState(false);

  const [selectedComplaintHistory, setSelectedComplaintHistory] =
    useState(null);

  /* =====================================================
     AUTH CHECK
  ===================================================== */

  useEffect(() => {
    const isLoggedIn =
      localStorage.getItem("janvoiceLoggedIn");

    if (
      !isLoggedIn ||
      (!currentUser.email && !currentUser.userId)
    ) {
      navigate("/citizen-login");
    }
  }, [
    currentUser.email,
    currentUser.userId,
    navigate,
  ]);

  /* =====================================================
     LOAD CITIZEN COMPLAINTS + NOTIFICATIONS
  ===================================================== */

  useEffect(() => {
    const loadCitizenData = async () => {
      if (
        !currentUser.userId &&
        !currentUser.email
      ) {
        return;
      }

      try {
        setLoadingComplaints(true);

        /* ---------------------------------------------
           LOAD ALL THIS CITIZEN'S COMPLAINTS
        --------------------------------------------- */

        const targetId =
          currentUser.userId || "GUEST";

        const emailParam = encodeURIComponent(
          currentUser.email || ""
        );

        const response = await fetch(
          `http://localhost:5000/api/complaints/user/${targetId}?email=${emailParam}`
        );

        if (!response.ok) {
          throw new Error(
            `Complaint API error: ${response.status}`
          );
        }

        const data = await response.json();

        if (
          data.success &&
          Array.isArray(data.complaints)
        ) {
          // IMPORTANT:
          // Do NOT slice the array.
          // ALL complaints are stored here.
          setComplaints(data.complaints);
        } else {
          setComplaints([]);
        }

        /* ---------------------------------------------
           LOAD NOTIFICATIONS
        --------------------------------------------- */

        if (currentUser.userId) {
          const notifRes = await fetch(
            `http://localhost:5000/api/users/${currentUser.userId}/notifications`
          );

          if (notifRes.ok) {
            const notifData =
              await notifRes.json();

            if (
              notifData.success &&
              Array.isArray(
                notifData.notifications
              )
            ) {
              setNotifications(
                notifData.notifications
              );
            }
          }
        }
      } catch (error) {
        console.error(
          "Complaint loading error:",
          error
        );

        setComplaints([]);
      } finally {
        setLoadingComplaints(false);
      }
    };

    loadCitizenData();
  }, [
    currentUser.userId,
    currentUser.email,
  ]);

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    localStorage.removeItem(
      "janvoiceUser"
    );

    localStorage.removeItem(
      "janvoiceLoggedIn"
    );

    localStorage.removeItem(
      "janvoiceUserEmail"
    );

    localStorage.removeItem(
      "janvoiceUserName"
    );

    localStorage.removeItem(
      "janvoiceUserId"
    );

    navigate("/citizen-login");
  };

  /* =====================================================
     STATUS CLASS
  ===================================================== */

  const getStatusClass = (status) => {
    switch (status) {
      case "Resolved":
        return "status-resolved";

      case "Closed":
        return "status-closed";

      case "In Progress":
        return "status-progress";

      case "Under Review":
        return "status-review";

      default:
        return "status-submitted";
    }
  };

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (date) => {
    if (!date) {
      return "Date not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date not available";
    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  /* =====================================================
     GET COMPLAINT ICON
  ===================================================== */

  const getComplaintIcon = (complaint) => {
    const department =
      complaint.department?.toLowerCase() ||
      "";

    const text =
      complaint.problem?.toLowerCase() ||
      complaint.complaintText?.toLowerCase() ||
      "";

    if (
      department.includes("road") ||
      department.includes("highway") ||
      text.includes("road") ||
      text.includes("pothole")
    ) {
      return "🛣️";
    }

    if (
      department.includes("water") ||
      text.includes("water") ||
      text.includes("leak")
    ) {
      return "💧";
    }

    if (
      department.includes("electric") ||
      department.includes("eb") ||
      text.includes("electric")
    ) {
      return "⚡";
    }

    if (
      department.includes("street") ||
      text.includes("street light") ||
      text.includes("streetlight")
    ) {
      return "💡";
    }

    if (
      department.includes("waste") ||
      department.includes("sanitation") ||
      text.includes("garbage")
    ) {
      return "🗑️";
    }

    return "📋";
  };

  /* =====================================================
     GET SUBMISSION ICON
  ===================================================== */

  const getMethodIcon = (method) => {
    switch (method) {
      case "IMAGE":
        return "📷";

      case "VIDEO":
        return "🎥";

      case "VOICE":
        return "🎤";

      default:
        return "📝";
    }
  };

  /* =====================================================
     GET LOCATION
  ===================================================== */

  const getLocation = (complaint) => {
    const location =
      complaint.location || {};

    return [
      location.street,
      location.area,
      location.district,
      location.state,
    ]
      .filter(Boolean)
      .join(", ");
  };

  /* =====================================================
     TRACK COMPLAINT
  ===================================================== */

  const trackComplaint = (complaintId) => {
    if (!complaintId) {
      return;
    }

    navigate(
      `/track-complaint?complaintId=${complaintId}`
    );
  };

  /* =====================================================
     SHOW COMPLAINTS
  ===================================================== */

  const openComplaints = () => {
    setShowComplaints(true);

    setShowNotifications(false);

    setTimeout(() => {
      document
        .getElementById(
          "my-complaints-section"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  /* =====================================================
     SHOW NOTIFICATIONS
  ===================================================== */

  const openNotifications = () => {
    setShowNotifications(true);

    setShowComplaints(false);

    setTimeout(() => {
      document
        .getElementById(
          "notifications-section"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  /* =====================================================
     SHOW PROFILE
  ===================================================== */

  const openProfile = () => {
    setShowNotifications(false);

    setShowComplaints(false);

    setTimeout(() => {
      document
        .getElementById(
          "profile-section"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  /* =====================================================
     RETURN
  ===================================================== */

  return (
    <div className="citizen-dashboard">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="citizen-header">

        {/* LOGO */}

        <div
          className="citizen-logo"
          onClick={() => navigate("/")}
          style={{
            cursor: "pointer",
          }}
        >
          <span>JAN</span>
          VOICE <b>AI</b>
        </div>

        {/* NAVIGATION */}

        <nav className="citizen-nav">

          <button
            onClick={() =>
              navigate("/")
            }
          >
            Home
          </button>

          <button
            onClick={openComplaints}
            className={
              showComplaints
                ? "active-nav"
                : ""
            }
          >
            My Complaints (
            {complaints.length}
            )
          </button>

          <button
            onClick={openNotifications}
            className={
              showNotifications
                ? "active-nav"
                : ""
            }
          >
            Notifications{" "}

            {notifications.filter(
              (n) => !n.read
            ).length > 0 &&
              `(${notifications.filter(
                (n) => !n.read
              ).length})`}
          </button>

          <button
            onClick={() =>
              navigate("/report")
            }
          >
            Report Complaint
          </button>

        </nav>

        {/* USER */}

        <div className="citizen-user-area">

          <span className="header-user-name">
            👤 {currentUser.name}
          </span>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* =================================================
          WELCOME BANNER
      ================================================= */}

      <section className="citizen-welcome">

        <div>

          <p className="portal-title">
            GOVERNMENT CITIZEN GRIEVANCE PORTAL
          </p>

          <h1>
            Welcome,{" "}
            <span>
              {currentUser.name}
            </span>{" "}
            👋
          </h1>

          <p>
            Report public problems in your
            community, track investigation
            progress, and monitor government
            actions directly.
          </p>

        </div>

        <button
          className="report-main-button"
          onClick={() =>
            navigate("/report")
          }
        >
          + Report a New Problem
        </button>

      </section>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="citizen-main">

        {/* =================================================
            ACTION CARDS
        ================================================= */}

        <section className="action-grid">

          {/* REPORT */}

          <div
            className="dashboard-card"
            onClick={() =>
              navigate("/report")
            }
          >

            <div className="dashboard-icon">
              📝
            </div>

            <h2>
              Report a Problem
            </h2>

            <p>
              Submit a new civic complaint
              using text, voice, image, or
              video.
            </p>

            <button>
              Report Problem →
            </button>

          </div>

          {/* MY COMPLAINTS */}

          <div
            className="dashboard-card"
            onClick={openComplaints}
          >

            <div className="dashboard-icon">
              📋
            </div>

            <h2>
              My Complaints
            </h2>

            <p>
              You have submitted{" "}
              <strong>
                {complaints.length}
              </strong>{" "}
              complaint
              {complaints.length === 1
                ? ""
                : "s"} through your
              account.
            </p>

            <button>
              View Complaints (
              {complaints.length}
              ) →
            </button>

          </div>

          {/* NOTIFICATIONS */}

          <div
            className="dashboard-card"
            onClick={openNotifications}
          >

            <div className="dashboard-icon">
              🔔
            </div>

            <h2>
              Notifications
            </h2>

            <p>
              Check status updates and
              department remarks on your
              grievances.
            </p>

            <button>
              View Alerts (
              {notifications.length}
              ) →
            </button>

          </div>

          {/* PROFILE */}

          <div
            className="dashboard-card"
            onClick={openProfile}
          >

            <div className="dashboard-icon">
              👤
            </div>

            <h2>
              My Profile
            </h2>

            <p>
              View your registered citizen
              details and verified contact
              information.
            </p>

            <button>
              View Profile →
            </button>

          </div>

        </section>

        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        {showNotifications && (

          <section
            className="my-complaints-section"
            id="notifications-section"
          >

            <div className="complaints-heading">

              <div>

                <p>
                  CITIZEN ALERTS
                </p>

                <h2>
                  Notifications & Updates
                </h2>

                <span>
                  Official communications
                  regarding your registered
                  grievances.
                </span>

              </div>

            </div>

            {notifications.length === 0 ? (

              <div className="complaints-message">

                <div className="empty-icon">
                  🔔
                </div>

                <h3>
                  No Notifications Yet
                </h3>

                <p>
                  When an official updates
                  your complaint status or
                  adds remarks, alerts will
                  appear here.
                </p>

              </div>

            ) : (

              <div className="notifications-list">

                {notifications.map(
                  (notif) => (

                    <div
                      className={`notification-card ${
                        notif.read
                          ? "notification-read"
                          : "notification-unread"
                      }`}
                      key={
                        notif.id ||
                        notif._id
                      }
                    >

                      <div className="notification-content">

                        <h4>
                          {notif.title}
                        </h4>

                        <p>
                          {notif.message}
                        </p>

                        <small>
                          {formatDate(
                            notif.createdAt
                          )}
                        </small>

                      </div>

                      {notif.complaintId && (

                        <button
                          className="notification-track-button"
                          onClick={() =>
                            trackComplaint(
                              notif.complaintId
                            )
                          }
                        >
                          Track Issue →
                        </button>

                      )}

                    </div>

                  )
                )}

              </div>

            )}

          </section>

        )}

        {/* =================================================
            MY COMPLAINTS
            HIDDEN UNTIL CLICKED
        ================================================= */}

        {showComplaints && (

          <section
            className="my-complaints-section"
            id="my-complaints-section"
          >

            {/* HEADING */}

            <div className="complaints-heading">

              <div>

                <p>
                  COMPLAINT HISTORY
                </p>

                <h2>
                  My Complaints
                </h2>

                <span>
                  Track and manage your
                  submitted public grievances.
                </span>

              </div>

              <div className="complaint-count">

                <strong>
                  {complaints.length}
                </strong>

                <span>
                  {complaints.length === 1
                    ? " Complaint"
                    : " Complaints"}
                </span>

              </div>

            </div>

            {/* LOADING */}

            {loadingComplaints && (

              <div className="complaints-message">

                <div className="loading-spinner"></div>

                <h3>
                  Loading Your Complaints
                </h3>

                <p>
                  Please wait while we
                  retrieve your complaints.
                </p>

              </div>

            )}

            {/* EMPTY */}

            {!loadingComplaints &&
              complaints.length === 0 && (

                <div className="complaints-message">

                  <div className="empty-icon">
                    📋
                  </div>

                  <h3>
                    No Complaints Found
                  </h3>

                  <p>
                    You have not submitted
                    any public grievances yet.
                  </p>

                  <button
                    onClick={() =>
                      navigate("/report")
                    }
                  >
                    + Report a Problem
                  </button>

                </div>

              )}

            {/* =================================================
                ALL COMPLAINT CARDS
            ================================================= */}

            {!loadingComplaints &&
              complaints.length > 0 && (

                <div className="complaints-list">

                  {complaints.map(
                    (complaint, index) => {

                      const complaintId =
                        complaint.complaintId ||
                        complaint._id ||
                        `complaint-${index}`;

                      return (

                        <article
                          className="complaint-box"
                          key={complaintId}
                        >

                          {/* =================================
                              CARD HEADER
                          ================================= */}

                          <div className="complaint-card-header">

                            <div className="complaint-heading-left">

                              <div className="complaint-type-icon">

                                {getComplaintIcon(
                                  complaint
                                )}

                              </div>

                              <div>

                                <h3>
                                  {complaint.problem ||
                                    complaint.complaintText ||
                                    "Public Service Grievance"}
                                </h3>

                                <p className="complaint-id">
                                  Complaint ID:{" "}

                                  <strong>
                                    {complaint.complaintId ||
                                      complaint._id ||
                                      "N/A"}
                                  </strong>
                                </p>

                              </div>

                            </div>

                            {/* STATUS */}

                            <span
                              className={`complaint-status ${getStatusClass(
                                complaint.status
                              )}`}
                            >
                              ●{" "}
                              {complaint.status ||
                                "Submitted"}
                            </span>

                          </div>

                          {/* =================================
                              CARD INFORMATION
                          ================================= */}

                          <div className="complaint-details-grid">

                            {/* DATE */}

                            <div className="complaint-info-item">

                              <span className="detail-icon">
                                📅
                              </span>

                              <div>

                                <small>
                                  Date Submitted
                                </small>

                                <strong>
                                  {formatDate(
                                    complaint.createdAt
                                  )}
                                </strong>

                              </div>

                            </div>

                            {/* DEPARTMENT */}

                            <div className="complaint-info-item">

                              <span className="detail-icon">
                                🏢
                              </span>

                              <div>

                                <small>
                                  Department
                                </small>

                                <strong>
                                  {complaint.department ||
                                    "General Public Grievance Department"}
                                </strong>

                              </div>

                            </div>

                            {/* LOCATION */}

                            <div className="complaint-info-item complaint-location-item">

                              <span className="detail-icon">
                                📍
                              </span>

                              <div>

                                <small>
                                  Location
                                </small>

                                <strong>
                                  {getLocation(
                                    complaint
                                  ) ||
                                    "Location not specified"}
                                </strong>

                              </div>

                            </div>

                            {/* METHOD */}

                            <div className="complaint-info-item">

                              <span className="detail-icon">

                                {getMethodIcon(
                                  complaint.method
                                )}

                              </span>

                              <div>

                                <small>
                                  Submitted Through
                                </small>

                                <strong>
                                  {complaint.method ||
                                    "TEXT"}
                                </strong>

                              </div>

                            </div>

                          </div>

                          {/* =================================================
                              IMPORTANT:
                              NO IMAGE / VIDEO / VOICE EVIDENCE HERE
                              Evidence should be shown on Track Complaint.
                          ================================================= */}

                          {/* =================================
                              CARD FOOTER
                          ================================= */}

                          <div className="complaint-card-footer">

                            {/* PRIORITY */}

                            <span
                              className={`priority priority-${String(
                                complaint.priority ||
                                  "medium"
                              ).toLowerCase()}`}
                            >
                              {complaint.priority ||
                                "Medium"}{" "}
                              Priority
                            </span>

                            {/* BUTTONS */}

                            <div className="complaint-actions">

                              {/* HISTORY */}

                              <button
                                className="history-button"
                                onClick={() =>
                                  setSelectedComplaintHistory(
                                    complaint
                                  )
                                }
                              >
                                📜 Status History
                              </button>

                              {/* TRACK */}

                              <button
                                className="track-button"
                                onClick={() =>
                                  trackComplaint(
                                    complaint.complaintId ||
                                      complaint._id
                                  )
                                }
                              >
                                Track Complaint

                                <span>
                                  →
                                </span>

                              </button>

                            </div>

                          </div>

                        </article>

                      );

                    }
                  )}

                </div>

              )}

          </section>

        )}

        {/* =================================================
            STATUS HISTORY MODAL
        ================================================= */}

        {selectedComplaintHistory && (

          <div
            className="history-modal-overlay"
            onClick={() =>
              setSelectedComplaintHistory(
                null
              )
            }
          >

            <div
              className="history-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* MODAL HEADER */}

              <div className="history-modal-header">

                <div>

                  <h3>
                    Status History
                  </h3>

                  <small>
                    Complaint ID:{" "}

                    <strong>
                      {
                        selectedComplaintHistory.complaintId
                      }
                    </strong>
                  </small>

                </div>

                <button
                  className="history-close"
                  onClick={() =>
                    setSelectedComplaintHistory(
                      null
                    )
                  }
                >
                  ✕
                </button>

              </div>

              {/* TIMELINE */}

              <div className="history-timeline">

                {(
                  selectedComplaintHistory.statusHistory &&
                  selectedComplaintHistory
                    .statusHistory.length > 0
                    ? selectedComplaintHistory.statusHistory
                    : [
                        {
                          status:
                            selectedComplaintHistory.status ||
                            "Submitted",

                          changedAt:
                            selectedComplaintHistory.createdAt,

                          changedBy:
                            "System",

                          remarks:
                            "Initial complaint registration.",
                        },
                      ]
                ).map(
                  (entry, index) => (

                    <div
                      className="history-entry"
                      key={index}
                    >

                      <div className="timeline-dot"></div>

                      <div className="history-entry-top">

                        <span
                          className={`complaint-status ${getStatusClass(
                            entry.status
                          )}`}
                        >
                          {entry.status}
                        </span>

                        <small>
                          {formatDate(
                            entry.changedAt
                          )}
                        </small>

                      </div>

                      <p>
                        <strong>
                          Updated By:
                        </strong>{" "}

                        {entry.changedBy ||
                          "Official"}

                        {entry.department
                          ? ` (${entry.department})`
                          : ""}
                      </p>

                      {entry.remarks && (

                        <div className="history-remarks">
                          "{entry.remarks}"
                        </div>

                      )}

                    </div>

                  )
                )}

              </div>

              {/* CLOSE */}

              <button
                className="close-history-button"
                onClick={() =>
                  setSelectedComplaintHistory(
                    null
                  )
                }
              >
                Close History
              </button>

            </div>

          </div>

        )}

        {/* =================================================
            PROFILE
        ================================================= */}

        <section
          className="profile-section"
          id="profile-section"
        >

          <div className="profile-heading">

            <p>
              REGISTERED CITIZEN PROFILE
            </p>

            <h2>
              My Profile
            </h2>

          </div>

          <div className="profile-grid">

            <div className="profile-item">

              <span>
                Name
              </span>

              <strong>
                {currentUser.name ||
                  "Citizen"}
              </strong>

            </div>

            <div className="profile-item">

              <span>
                Email
              </span>

              <strong>
                {currentUser.email ||
                  "Not available"}
              </strong>

            </div>

            <div className="profile-item">

              <span>
                Mobile Number
              </span>

              <strong>
                {currentUser.mobile ||
                  "Verified Citizen"}
              </strong>

            </div>

            <div className="profile-item">

              <span>
                Citizen ID
              </span>

              <strong>
                {currentUser.userId ||
                  "Active"}
              </strong>

            </div>

          </div>

        </section>

      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="citizen-footer">

        <div className="footer-logo">

          <span>
            JAN
          </span>

          VOICE{" "}

          <b>
            AI
          </b>

        </div>

        <p>
          Your Voice. Your Problem.
          Government Action.
        </p>

        <small>
          © 2026 JanVoice AI.
          Academic Public Grievance Prototype.
        </small>

      </footer>

    </div>
  );
}

export default CitizenDashboard;