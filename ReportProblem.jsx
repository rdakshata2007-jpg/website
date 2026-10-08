import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ReportProblem.css";

function ReportProblem() {

  const navigate = useNavigate();

  /* =========================================
     STATES
  ========================================= */

  const [selectedMethod, setSelectedMethod] = useState("");

  const [complaintText, setComplaintText] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [voiceText, setVoiceText] =
    useState("");

  const [isListening, setIsListening] =
    useState(false);

  const [locationType, setLocationType] =
    useState("");

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [location, setLocation] = useState({
    state: "",
    district: "",
    area: "",
    street: "",
    ward: ""
  });

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);


  /* =========================================
     SELECT COMPLAINT METHOD
  ========================================= */

  const selectMethod = (method) => {

    setSelectedMethod(method);

    setComplaintText("");

    setVoiceText("");

    setSelectedFile(null);

    setMessage("");

  };


  /* =========================================
     FILE SELECTION
  ========================================= */

  const handleFileChange = (event) => {

    const file =
      event.target.files[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);

    setMessage("");

  };


  /* =========================================
     VOICE INPUT
  ========================================= */

  const startVoiceRecognition = () => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

      setMessage(
        "Voice recognition is not supported in this browser. Please use Google Chrome."
      );

      setMessageType("error");

      return;

    }


    const recognition =
      new SpeechRecognition();

    recognition.lang = "en-IN";

    recognition.continuous = false;

    recognition.interimResults = false;


    recognition.onstart = () => {

      setIsListening(true);

      setMessage(
        "Listening... Please speak your complaint."
      );

      setMessageType("info");

    };


    recognition.onresult = (event) => {

      const text =
        event.results[0][0].transcript;

      setVoiceText(text);

      setComplaintText(text);

      setMessage(
        "Speech converted to text successfully."
      );

      setMessageType("success");

    };


    recognition.onerror = () => {

      setMessage(
        "No speech detected. Please click Start Speaking and try again."
      );

      setMessageType("error");

      setIsListening(false);

    };


    recognition.onend = () => {

      setIsListening(false);

    };


    recognition.start();

  };


  /* =========================================
     LOCATION DETECTION
  ========================================= */

  const detectLocation = () => {

    if (!navigator.geolocation) {

      setMessage(
        "Location detection is not supported by your browser."
      );

      setMessageType("error");

      return;

    }


    setLocationLoading(true);

    setMessage(
      "Detecting your location..."
    );

    setMessageType("info");


    navigator.geolocation.getCurrentPosition(

      async (position) => {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;


        try {

          const response =
            await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2&addressdetails=1&zoom=18`
            );


          const data =
            await response.json();


          const address =
            data.address || {};


          setLocation({

            state:
              address.state || "",

            district:
              address.state_district ||
              address.county ||
              address.city ||
              "",

            area:
              address.suburb ||
              address.neighbourhood ||
              address.village ||
              address.town ||
              "",

            street:
              address.road || "",

            ward:
              address.city_district ||
              address.municipality ||
              ""

          });


          setMessage(
            "Location detected successfully. Please verify the details."
          );

          setMessageType("success");

        } catch (error) {

          console.error(error);

          setMessage(
            "Location detected, but address details could not be loaded."
          );

          setMessageType("error");

        }


        setLocationLoading(false);

      },


      () => {

        setLocationLoading(false);

        setMessage(
          "Unable to detect your location. Please allow location access or enter it manually."
        );

        setMessageType("error");

      }

    );

  };


  /* =========================================
     LOCATION FIELD UPDATE
  ========================================= */

  const handleLocationChange = (
    field,
    value
  ) => {

    setLocation((previous) => ({

      ...previous,

      [field]: value

    }));

  };


  /* =========================================
     VALIDATE LOCATION
  ========================================= */

  const validateLocation = () => {

    if (!location.state.trim()) {

      setMessage(
        "Please enter your State."
      );

      setMessageType("error");

      return false;

    }


    if (!location.district.trim()) {

      setMessage(
        "Please enter your District."
      );

      setMessageType("error");

      return false;

    }


    if (!location.area.trim()) {

      setMessage(
        "Please enter your Area / Locality."
      );

      setMessageType("error");

      return false;

    }


    return true;

  };


  /* =========================================
     SUBMIT COMPLAINT
  ========================================= */

  const handleSubmit = async (event) => {

    event.preventDefault();


    setMessage("");


    /* ===============================
       CHECK LOGIN
    =============================== */

    const storedUser =
      localStorage.getItem(
        "janvoiceUser"
      );


    if (!storedUser) {

      setMessage(
        "Please login as a citizen before submitting a complaint."
      );

      setMessageType("error");

      return;

    }


    let user;

    try {

      user =
        JSON.parse(storedUser);

    } catch {

      setMessage(
        "Your login session is invalid. Please login again."
      );

      setMessageType("error");

      return;

    }


    /* ===============================
       CHECK METHOD
    =============================== */

    if (!selectedMethod) {

      setMessage(
        "Please select a complaint submission method."
      );

      setMessageType("error");

      return;

    }


    /* ===============================
       TEXT VALIDATION
    =============================== */

    if (
      selectedMethod === "TEXT" &&
      !complaintText.trim()
    ) {

      setMessage(
        "Please type your complaint."
      );

      setMessageType("error");

      return;

    }


    /* ===============================
       VOICE VALIDATION
    =============================== */

    if (
      selectedMethod === "VOICE" &&
      !voiceText.trim()
    ) {

      setMessage(
        "Please speak your complaint first."
      );

      setMessageType("error");

      return;

    }


    /* ===============================
       IMAGE / VIDEO VALIDATION
    =============================== */

    if (
      (
        selectedMethod === "IMAGE" ||
        selectedMethod === "VIDEO"
      ) &&
      !selectedFile
    ) {

      setMessage(
        `Please select a ${selectedMethod.toLowerCase()} file.`
      );

      setMessageType("error");

      return;

    }


    /* ===============================
       LOCATION
    =============================== */

    if (!validateLocation()) {

      return;

    }


    /* ===============================
       PREPARE COMPLAINT TEXT
    =============================== */

    let finalComplaintText =
      complaintText.trim();


    if (selectedMethod === "VOICE") {

      finalComplaintText =
        voiceText.trim();

    }


    if (
      selectedMethod === "IMAGE" ||
      selectedMethod === "VIDEO"
    ) {

      finalComplaintText =
        selectedFile
          ? selectedFile.name
          : "";

    }


    /* ===============================
       START SUBMISSION
    =============================== */

    setSubmitting(true);

    setMessage(
      "Submitting your complaint..."
    );

    setMessageType("info");


    try {

      const response =
        await fetch(
          "http://localhost:5000/api/complaints",
          {

            method: "POST",

            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify({

              userId:
                user.userId,

              citizenName:
                user.name,

              citizenEmail:
                user.email,

              method:
                selectedMethod,

              complaintText:
                finalComplaintText,

              location: {

                state:
                  location.state,

                district:
                  location.district,

                area:
                  location.area,

                street:
                  location.street

              }

            })

          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        setMessage(
          data.message ||
          "Complaint submission failed."
        );

        setMessageType("error");

        setSubmitting(false);

        return;

      }


      /* ===============================
         SUCCESS
      =============================== */

      const savedComplaint =
        data.complaint;


      setMessage(
        `Complaint submitted successfully. Complaint ID: ${savedComplaint.complaintId}`
      );

      setMessageType("success");


      /* ===============================
         STORE LAST COMPLAINT
         FOR TRACKING
      =============================== */

      localStorage.setItem(

        "janvoiceComplaint",

        JSON.stringify(
          savedComplaint
        )

      );


      /* ===============================
         CLEAR FORM
      =============================== */

      setSelectedMethod("");

      setComplaintText("");

      setVoiceText("");

      setSelectedFile(null);


      /* ===============================
         SHOW SUCCESS THEN TRACK
      =============================== */

      setTimeout(() => {

        navigate(
          `/track?complaintId=${savedComplaint.complaintId}`
        );

      }, 1800);


    } catch (error) {

      console.error(error);

      setMessage(
        "Cannot connect to the backend. Make sure the Node.js server is running."
      );

      setMessageType("error");

    }


    setSubmitting(false);

  };


  /* =========================================
     PAGE
  ========================================= */

  return (

    <div className="report-page">


      {/* =====================================
          HEADER
      ===================================== */}

      <header className="report-header">

        <div>

          <h1>
            JanVoice AI
          </h1>

          <p>
            People's Problems to Government Action
          </p>

        </div>


        <button
          type="button"
          onClick={() => navigate("/")}
          className="back-home-button"
        >
          Home
        </button>

      </header>


      {/* =====================================
          MAIN
      ===================================== */}

      <main className="report-container">


        <div className="report-title">

          <span>
            CITIZEN SERVICE
          </span>

          <h2>
            Report a Problem
          </h2>

          <p>
            Report a public problem to the
            appropriate government department.
          </p>

        </div>


        {/* =================================
            LOGIN INFORMATION
        ================================= */}

        <div className="login-information">

          <strong>
            Citizen Account
          </strong>

          {localStorage.getItem("janvoiceUser") ? (

            <span>
              Logged in citizen
            </span>

          ) : (

            <span>
              Please login before submitting a complaint.
            </span>

          )}

        </div>


        <form
          onSubmit={handleSubmit}
          className="complaint-form"
        >


          {/* =================================
              STEP 1
          ================================= */}

          <section className="form-section">

            <div className="step-heading">

              <span>
                01
              </span>

              <div>

                <h3>
                  Choose Complaint Method
                </h3>

                <p>
                  Select only one method.
                </p>

              </div>

            </div>


            <div className="method-grid">


              <button
                type="button"
                className={
                  selectedMethod === "TEXT"
                    ? "method-card selected"
                    : "method-card"
                }
                onClick={() =>
                  selectMethod("TEXT")
                }
              >

                <span>
                  📝
                </span>

                <strong>
                  Type
                </strong>

                <small>
                  Type your complaint
                </small>

              </button>


              <button
                type="button"
                className={
                  selectedMethod === "VOICE"
                    ? "method-card selected"
                    : "method-card"
                }
                onClick={() =>
                  selectMethod("VOICE")
                }
              >

                <span>
                  🎤
                </span>

                <strong>
                  Voice
                </strong>

                <small>
                  Speak your complaint
                </small>

              </button>


              <button
                type="button"
                className={
                  selectedMethod === "IMAGE"
                    ? "method-card selected"
                    : "method-card"
                }
                onClick={() =>
                  selectMethod("IMAGE")
                }
              >

                <span>
                  📷
                </span>

                <strong>
                  Image
                </strong>

                <small>
                  Upload an image
                </small>

              </button>


              <button
                type="button"
                className={
                  selectedMethod === "VIDEO"
                    ? "method-card selected"
                    : "method-card"
                }
                onClick={() =>
                  selectMethod("VIDEO")
                }
              >

                <span>
                  🎥
                </span>

                <strong>
                  Video
                </strong>

                <small>
                  Upload a video
                </small>

              </button>


            </div>


            {/* ===============================
                TEXT INPUT
            =============================== */}

            {selectedMethod === "TEXT" && (

              <div className="selected-input">

                <label>
                  Enter your complaint
                </label>

                <textarea
                  value={complaintText}
                  onChange={(event) =>
                    setComplaintText(
                      event.target.value
                    )
                  }
                  placeholder="Type your public problem here..."
                  rows="6"
                />

              </div>

            )}


            {/* ===============================
                VOICE INPUT
            =============================== */}

            {selectedMethod === "VOICE" && (

              <div className="selected-input">

                <label>
                  Voice Complaint
                </label>


                <button
                  type="button"
                  className="voice-button"
                  onClick={
                    startVoiceRecognition
                  }
                  disabled={isListening}
                >

                  {isListening
                    ? "Listening..."
                    : "🎤 Start Speaking"}

                </button>


                <div className="speech-output">

                  <label>
                    Speech-to-Text
                  </label>

                  <textarea
                    value={voiceText}
                    onChange={(event) =>
                      setVoiceText(
                        event.target.value
                      )
                    }
                    placeholder="Your converted speech will appear here..."
                    rows="5"
                  />

                </div>

              </div>

            )}


            {/* ===============================
                IMAGE INPUT
            =============================== */}

            {selectedMethod === "IMAGE" && (

              <div className="selected-input">

                <label>
                  Upload Problem Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleFileChange
                  }
                />


                {selectedFile && (

                  <p className="file-name">

                    Selected:
                    {" "}
                    {selectedFile.name}

                  </p>

                )}

              </div>

            )}


            {/* ===============================
                VIDEO INPUT
            =============================== */}

            {selectedMethod === "VIDEO" && (

              <div className="selected-input">

                <label>
                  Upload Problem Video
                </label>

                <input
                  type="file"
                  accept="video/*"
                  onChange={
                    handleFileChange
                  }
                />


                {selectedFile && (

                  <p className="file-name">

                    Selected:
                    {" "}
                    {selectedFile.name}

                  </p>

                )}

              </div>

            )}

          </section>


          {/* =================================
              STEP 2 LOCATION
          ================================= */}

          <section className="form-section">

            <div className="step-heading">

              <span>
                02
              </span>

              <div>

                <h3>
                  Problem Location
                </h3>

                <p>
                  Choose automatic detection or
                  enter the location manually.
                </p>

              </div>

            </div>


            <div className="location-options">


              <button
                type="button"
                className={
                  locationType === "AUTO"
                    ? "location-option selected"
                    : "location-option"
                }
                onClick={() => {

                  setLocationType("AUTO");

                  detectLocation();

                }}
              >

                📍

                <strong>
                  Detect My Location
                </strong>

                <small>
                  Use your current location
                </small>

              </button>


              <button
                type="button"
                className={
                  locationType === "MANUAL"
                    ? "location-option selected"
                    : "location-option"
                }
                onClick={() =>
                  setLocationType("MANUAL")
                }
              >

                ✏️

                <strong>
                  Enter Manually
                </strong>

                <small>
                  Enter location details
                </small>

              </button>


            </div>


            {locationLoading && (

              <div className="location-loading">

                Detecting location...

              </div>

            )}


            <div className="location-fields">


              <div className="form-field">

                <label>
                  State *
                </label>

                <input
                  type="text"
                  value={location.state}
                  onChange={(event) =>
                    handleLocationChange(
                      "state",
                      event.target.value
                    )
                  }
                  placeholder="Enter state"
                />

              </div>


              <div className="form-field">

                <label>
                  District *
                </label>

                <input
                  type="text"
                  value={location.district}
                  onChange={(event) =>
                    handleLocationChange(
                      "district",
                      event.target.value
                    )
                  }
                  placeholder="Enter district"
                />

              </div>


              <div className="form-field">

                <label>
                  Area / Locality *
                </label>

                <input
                  type="text"
                  value={location.area}
                  onChange={(event) =>
                    handleLocationChange(
                      "area",
                      event.target.value
                    )
                  }
                  placeholder="Enter area or locality"
                />

              </div>


              <div className="form-field">

                <label>
                  Street / Road
                </label>

                <input
                  type="text"
                  value={location.street}
                  onChange={(event) =>
                    handleLocationChange(
                      "street",
                      event.target.value
                    )
                  }
                  placeholder="Enter street or road"
                />

              </div>


              <div className="form-field">

                <label>
                  Ward No.
                </label>

                <input
                  type="text"
                  value={location.ward}
                  onChange={(event) =>
                    handleLocationChange(
                      "ward",
                      event.target.value
                    )
                  }
                  placeholder="Enter ward number"
                />

              </div>


            </div>

          </section>


          {/* =================================
              MESSAGE
          ================================= */}

          {message && (

            <div
              className={`report-message ${messageType}`}
            >
              {message}
            </div>

          )}


          {/* =================================
              SUBMIT
          ================================= */}

          <div className="submit-section">

            <button
              type="submit"
              className="submit-complaint-button"
              disabled={submitting}
            >

              {submitting
                ? "Submitting..."
                : "Submit Complaint"}

            </button>

          </div>


        </form>

      </main>


      {/* =====================================
          FOOTER
      ===================================== */}

      <footer className="report-footer">

        © 2026 JanVoice AI | Public Grievance Portal

      </footer>


    </div>

  );
}

export default ReportProblem;