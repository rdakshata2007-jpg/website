import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ComplaintAnalysis.css";

function ComplaintAnalysis() {
  const navigate = useNavigate();

  // ==========================================
  // LOAD DRAFT
  // ==========================================

  const [draft] = useState(() => {
    const savedDraft = sessionStorage.getItem(
      "janvoiceComplaintDraft"
    );

    if (!savedDraft) {
      return null;
    }

    try {
      return JSON.parse(savedDraft);
    } catch (error) {
      console.error("Invalid complaint draft:", error);
      return null;
    }
  });

  // ==========================================
  // AI ANALYSIS STATE
  // ==========================================

  const [analysis, setAnalysis] = useState({
    issue: "Analyzing...",
    department: "Analyzing...",
    priority: "Analyzing..."
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // ==========================================
  // SUBMISSION STATE
  // ==========================================

  const [submitting, setSubmitting] = useState(false);
  const [submittedComplaintId, setSubmittedComplaintId] =
    useState("");

  const [submitMessage, setSubmitMessage] = useState("");

  // ==========================================
  // REDIRECT IF NO DRAFT
  // ==========================================

  useEffect(() => {
    if (!draft) {
      navigate("/report");
    }
  }, [draft, navigate]);

  // ==========================================
  // TEXT / VOICE AI CLASSIFICATION
  // ==========================================

  const detectTextIssue = (data) => {
    if (!data) {
      return {
        issue: "Public Grievance",
        department: "General Public Grievance Department",
        priority: "Medium"
      };
    }

    const content = (
      data.complaintText || ""
    ).toLowerCase();

    // ROAD
    if (
      content.includes("road") ||
      content.includes("pothole") ||
      content.includes("road damage") ||
      content.includes("street damage")
    ) {
      return {
        issue: "Road Damage",
        department: "Roads & Highways Department",
        priority: "High"
      };
    }

    // STREET LIGHT
    if (
      content.includes("street light") ||
      content.includes("streetlight") ||
      content.includes("lamp") ||
      content.includes("light pole")
    ) {
      return {
        issue: "Street Light",
        department: "Street Lighting Department",
        priority: "Medium"
      };
    }

    // WATER
    if (
      content.includes("water") ||
      content.includes("leakage") ||
      content.includes("leak") ||
      content.includes("pipe")
    ) {
      return {
        issue: "Water Leakage",
        department: "Water Supply Department",
        priority: "Medium"
      };
    }

    // ELECTRICITY
    if (
      content.includes("electric") ||
      content.includes("electricity") ||
      content.includes("wire") ||
      content.includes("power") ||
      content.includes("eb") ||
      content.includes("transformer")
    ) {
      return {
        issue: "Electricity / EB",
        department: "Electricity Department",
        priority: "High"
      };
    }

    // GARBAGE
    if (
      content.includes("garbage") ||
      content.includes("waste") ||
      content.includes("trash") ||
      content.includes("dump")
    ) {
      return {
        issue: "Garbage / Waste",
        department:
          "Municipal Waste Management Department",
        priority: "Medium"
      };
    }

    // DRAINAGE
    if (
      content.includes("drain") ||
      content.includes("drainage") ||
      content.includes("sewage") ||
      content.includes("overflowing drain")
    ) {
      return {
        issue: "Drainage",
        department: "Drainage Department",
        priority: "High"
      };
    }

    return {
      issue: "Public Grievance",
      department: "General Public Grievance Department",
      priority: "Medium"
    };
  };

  // ==========================================
  // DATA URL TO FILE
  // ==========================================

  const dataURLToFile = (dataUrl, fileName) => {
    if (!dataUrl) {
      throw new Error("No media data available.");
    }

    const parts = dataUrl.split(",");

    if (parts.length < 2) {
      throw new Error("Invalid media data.");
    }

    const mimeMatch = parts[0].match(/:(.*?);/);

    const mimeType = mimeMatch
      ? mimeMatch[1]
      : "application/octet-stream";

    const binaryString = atob(parts[1]);

    const bytes = new Uint8Array(
      binaryString.length
    );

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return new File(
      [bytes],
      fileName,
      {
        type: mimeType
      }
    );
  };

  // ==========================================
  // IMAGE AI ANALYSIS
  // ==========================================

  const analyzeImage = async () => {
    if (!draft?.image?.data) {
      throw new Error(
        "No image was found for AI analysis."
      );
    }

    const imageFile = dataURLToFile(
      draft.image.data,
      draft.image.name || "complaint-image.jpg"
    );

    const formData = new FormData();

    formData.append(
      "image",
      imageFile
    );

    const response = await fetch(
      "http://localhost:5000/api/image-analysis/analyze-image",
      {
        method: "POST",
        body: formData
      }
    );

    const result = await response.json();

    console.log(
      "JanVoice Image AI:",
      result
    );

    if (!response.ok || !result.success) {
      throw new Error(
        result.message ||
        "Image analysis failed."
      );
    }

    if (!result.analysis) {
      throw new Error(
        "AI did not return an analysis."
      );
    }

    return {
      issue:
        result.analysis.problem ||
        "Other Public Problem",

      department:
        result.analysis.department ||
        "General Public Grievance Department",

      priority:
        result.analysis.priority ||
        "Medium"
    };
  };

  // ==========================================
  // VIDEO AI ANALYSIS
  // ==========================================

  const analyzeVideo = async () => {
    /*
      At the moment your backend has image AI analysis.
      Therefore video is safely handled here without
      crashing the page.

      Later we can connect a dedicated video AI endpoint.
    */

    return {
      issue: "Video Public Problem",
      department:
        "General Public Grievance Department",
      priority: "Medium"
    };
  };

  // ==========================================
  // RUN AI ANALYSIS
  //
  // IMPORTANT:
  // This is called ONCE when the page loads.
  // It is NOT inside an effect that repeatedly
  // calls setState.
  // ==========================================

  useEffect(() => {
    if (!draft) {
      return;
    }

    let cancelled = false;

    const runAnalysis = async () => {
      setAiLoading(true);
      setAiError("");

      try {
        let result;

        // TEXT
        if (
          draft.method === "TEXT" ||
          draft.method === "VOICE"
        ) {
          result = detectTextIssue(draft);
        }

        // IMAGE
        else if (draft.method === "IMAGE") {
          result = await analyzeImage();
        }

        // VIDEO
        else if (draft.method === "VIDEO") {
          result = await analyzeVideo();
        }

        // UNKNOWN
        else {
          result = {
            issue: "Public Grievance",
            department:
              "General Public Grievance Department",
            priority: "Medium"
          };
        }

        if (!cancelled) {
          setAnalysis(result);
        }
      } catch (error) {
        console.error(
          "JanVoice AI analysis error:",
          error
        );

        if (!cancelled) {
          setAiError(
            error.message ||
            "AI analysis failed."
          );

          setAnalysis({
            issue: "AI Analysis Failed",
            department:
              "General Public Grievance Department",
            priority: "Medium"
          });
        }
      } finally {
        if (!cancelled) {
          setAiLoading(false);
        }
      }
    };

    runAnalysis();

    return () => {
      cancelled = true;
    };

    // We intentionally run this once for the
    // complaint draft loaded for this page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================
  // SUBMIT COMPLAINT
  // ==========================================

  const confirmAndSubmit = async () => {
    if (!draft) {
      return;
    }

    setSubmitting(true);
    setSubmitMessage("");

    try {
      let citizenEmail = localStorage.getItem("janvoiceUserEmail") || "";
      let citizenName = localStorage.getItem("janvoiceUserName") || "";
      let userId = localStorage.getItem("janvoiceUserId") || "";
      let citizenMobile = "";

      const storedUser = localStorage.getItem("janvoiceUser");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.email) citizenEmail = parsed.email;
          if (parsed.name) citizenName = parsed.name;
          if (parsed.userId) userId = parsed.userId;
          if (parsed.mobile) citizenMobile = parsed.mobile;
        } catch (e) {
          console.error("Error reading stored user:", e);
        }
      }

      if (!citizenEmail) citizenEmail = "citizen@janvoice.local";
      if (!citizenName) citizenName = "Citizen";
      if (!userId) userId = "GUEST-" + Date.now();

      // ======================================
      // FORM DATA
      // ======================================

      const formData = new FormData();

      formData.append(
        "userId",
        userId
      );

      formData.append(
        "citizenName",
        citizenName
      );

      formData.append(
        "citizenEmail",
        citizenEmail
      );

      if (citizenMobile) {
        formData.append(
          "citizenMobile",
          citizenMobile
        );
      }

      formData.append(
        "method",
        draft.method
      );

      formData.append(
        "complaintText",
        draft.complaintText || ""
      );

      formData.append(
        "problem",
        analysis.issue
      );

      formData.append(
        "department",
        analysis.department
      );

      formData.append(
        "priority",
        analysis.priority
      );

      formData.append(
        "status",
        "Submitted"
      );

      formData.append(
        "location",
        JSON.stringify({
          state:
            draft.location?.state || "",

          district:
            draft.location?.district || "",

          area:
            draft.location?.area || "",

          street:
            draft.location?.street || "",

          latitude:
            draft.location?.latitude || null,

          longitude:
            draft.location?.longitude || null
        })
      );

      // ======================================
      // IMAGE
      // ======================================

      if (
        draft.method === "IMAGE" &&
        draft.image?.data
      ) {
        const imageFile =
          dataURLToFile(
            draft.image.data,
            draft.image.name ||
            "complaint-image.jpg"
          );

        formData.append(
          "image",
          imageFile
        );
      }

      // ======================================
      // VIDEO
      // ======================================

      /*
        Your current Report page stores video
        information but does not store video.data.

        Therefore we do not try to upload a missing
        video file here.
      */

      // ======================================
      // SEND TO BACKEND
      // ======================================

      const response = await fetch(
        "http://localhost:5000/api/complaints",
        {
          method: "POST",
          body: formData
        }
      );

      const result =
        await response.json();

      console.log(
        "Complaint backend response:",
        result
      );

      if (!response.ok) {
        throw new Error(
          result.message ||
          "Failed to submit complaint."
        );
      }

      const complaintId =
        result.complaint?.complaintId ||
        result.complaintId;

      if (!complaintId) {
        throw new Error(
          "Complaint was submitted but Complaint ID was not returned."
        );
      }

      // ======================================
      // SUCCESS
      // ======================================

      setSubmittedComplaintId(
        complaintId
      );

      setSubmitMessage(
        "Complaint submitted successfully."
      );

      sessionStorage.setItem(
        "janvoiceConfirmedComplaint",
        JSON.stringify({
          complaintId,
          userId,
          citizenName,
          citizenEmail,

          method:
            draft.method,

          complaintText:
            draft.complaintText || "",

          problem:
            analysis.issue,

          department:
            analysis.department,

          priority:
            analysis.priority,

          status:
            "Submitted",

          location:
            draft.location,

          image:
            draft.image || null,

          video:
            draft.video || null
        })
      );

      sessionStorage.removeItem(
        "janvoiceComplaintDraft"
      );
    } catch (error) {
      console.error(
        "Complaint submission error:",
        error
      );

      setSubmitMessage(
        error.message ||
        "Unable to submit complaint. Please make sure the backend server is running."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // NO DRAFT
  // ==========================================

  if (!draft) {
    return null;
  }

  // ==========================================
  // SUCCESS PAGE
  // ==========================================

  if (submittedComplaintId) {
    return (
      <div className="analysis-page">
        <main className="analysis-container">

          <section className="analysis-card success-card">

            <div className="success-icon">
              ✓
            </div>

            <h1>
              Complaint Submitted Successfully
            </h1>

            <p>
              Your complaint has been stored successfully.
            </p>

            <div className="complaint-id-box">

              <span>
                Complaint ID
              </span>

              <strong>
                {submittedComplaintId}
              </strong>

              <p>
                Please save this ID to track your complaint.
              </p>

            </div>

            <div className="analysis-actions">

              <button
                className="edit-button"
                onClick={() =>
                  navigate("/report")
                }
              >
                Report Another Problem
              </button>

              <button
                className="confirm-button"
                onClick={() =>
                  navigate("/citizen-dashboard")
                }
              >
                Track Complaint
              </button>

            </div>

          </section>

        </main>
      </div>
    );
  }

  // ==========================================
  // ANALYSIS PAGE
  // ==========================================

  return (
    <div className="analysis-page">

      <main className="analysis-container">

        <section className="analysis-card">

          {/* HEADER */}

          <div className="analysis-heading">

            <div className="analysis-logo">
              JV
            </div>

            <div>

              <h1>
                JanVoice AI Analysis
              </h1>

              <p>
                Review your complaint before submitting it.
              </p>

            </div>

          </div>

          {/* YOUR REPORT */}

          <h2 className="section-title">
            Your Report
          </h2>

          <div className="report-summary-grid">

            <div className="summary-box">

              <span>
                Submission Method
              </span>

              <strong>
                {draft.method}
              </strong>

            </div>

            <div className="summary-box">

              <span>
                Reported Problem
              </span>

              <strong>

                {draft.method === "TEXT" ||
                draft.method === "VOICE"
                  ? draft.complaintText
                  : draft.method === "IMAGE"
                  ? "Uploaded Image"
                  : "Uploaded Video"}

              </strong>

            </div>

          </div>

          {/* IMAGE */}

          {draft.method === "IMAGE" &&
            draft.image?.data && (

            <div className="location-summary">

              <span>
                Uploaded Image
              </span>

              <img
                src={draft.image.data}
                alt="Complaint"
                style={{
                  width: "100%",
                  maxWidth: "500px",
                  maxHeight: "350px",
                  objectFit: "contain",
                  display: "block",
                  marginTop: "12px",
                  borderRadius: "10px"
                }}
              />

            </div>
          )}

          {/* VIDEO */}

          {draft.method === "VIDEO" &&
            draft.video?.data && (

            <div className="location-summary">

              <span>
                Uploaded Video
              </span>

              <video
                src={draft.video.data}
                controls
                style={{
                  width: "100%",
                  maxWidth: "600px",
                  marginTop: "12px",
                  borderRadius: "10px"
                }}
              />

            </div>
          )}

          {/* LOCATION */}

          <div className="location-summary">

            <span>
              Location
            </span>

            <strong>

              {draft.location?.state || ""}

              {draft.location?.district
                ? `, ${draft.location.district}`
                : ""}

              {draft.location?.area
                ? `, ${draft.location.area}`
                : ""}

              {draft.location?.street
                ? `, ${draft.location.street}`
                : ""}

            </strong>

          </div>

          {/* AI ANALYSIS */}

          <div className="ai-analysis-box">

            <div className="ai-analysis-heading">

              <div className="ai-icon">
                ✦
              </div>

              <div>

                <h2>
                  JanVoice AI Analysis
                </h2>

                <p>
                  AI-based complaint classification and department routing.
                </p>

              </div>

            </div>

            {/* LOADING */}

            {aiLoading && (

              <div className="analysis-notice">

                <span>
                  ✦
                </span>

                <p>
                  JanVoice AI is analyzing your complaint...
                </p>

              </div>

            )}

            {/* ERROR */}

            {aiError && (

              <div className="analysis-notice">

                <span>
                  !
                </span>

                <p>
                  {aiError}
                </p>

              </div>

            )}

            {/* RESULT */}

            <div className="analysis-result-grid">

              <div className="analysis-result">

                <span>
                  IDENTIFIED ISSUE
                </span>

                <strong>
                  {analysis.issue}
                </strong>

              </div>

              <div className="analysis-result">

                <span>
                  PRIORITY
                </span>

                <strong>
                  {analysis.priority}
                </strong>

              </div>

              <div className="analysis-result">

                <span>
                  CONCERNED DEPARTMENT
                </span>

                <strong>
                  {analysis.department}
                </strong>

              </div>

              <div className="analysis-result">

                <span>
                  STATUS
                </span>

                <strong>
                  {aiLoading
                    ? "Analyzing..."
                    : "Ready for Submission"}
                </strong>

              </div>

            </div>

          </div>

          {/* MESSAGE */}

          {submitMessage && (

            <div className="analysis-notice">

              <span>
                ℹ
              </span>

              <p>
                {submitMessage}
              </p>

            </div>

          )}

          {/* ACTIONS */}

          <div className="analysis-actions">

            <button
              className="edit-button"
              onClick={() =>
                navigate("/report")
              }
              disabled={submitting}
            >
              ← Edit Report
            </button>

            <button
              className="confirm-button"
              onClick={confirmAndSubmit}
              disabled={
                submitting ||
                aiLoading ||
                !!aiError
              }
            >
              {submitting
                ? "Submitting..."
                : "✓ Confirm & Submit"}
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default ComplaintAnalysis;