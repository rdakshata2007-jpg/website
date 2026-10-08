import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Report.css";

function Report() {
  const navigate = useNavigate();

  const [selectedMethod, setSelectedMethod] = useState("");
  const [text, setText] = useState("");

  const [image, setImage] = useState(null);
  const [imageData, setImageData] = useState("");

  const [video, setVideo] = useState(null);

  const [isListening, setIsListening] = useState(false);

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  const [location, setLocation] = useState({
    state: "",
    district: "",
    area: "",
    street: "",
    latitude: null,
    longitude: null
  });

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // ==========================================
  // SELECT METHOD
  // ==========================================

  const selectMethod = (method) => {
    setSelectedMethod(method);

    if (method === "IMAGE") {
      imageInputRef.current?.click();
    }

    if (method === "VIDEO") {
      videoInputRef.current?.click();
    }

    if (method === "VOICE") {
      startVoiceRecognition();
    }
  };

  // ==========================================
  // IMAGE
  // ==========================================

  const handleImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Please select an image smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setImage(file);
    setSelectedMethod("IMAGE");

    const reader = new FileReader();

    reader.onload = () => {
      setImageData(reader.result);
    };

    reader.onerror = () => {
      setImageData("");
      alert("Unable to read the selected image.");
    };

    reader.readAsDataURL(file);
  };

  // ==========================================
  // VIDEO
  // ==========================================

  const handleVideo = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setVideo(file);
    setSelectedMethod("VIDEO");
  };

  // ==========================================
  // VOICE
  // ==========================================

  const startVoiceRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;

    setSelectedMethod("VOICE");
    setIsListening(true);

    recognition.onresult = (event) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript += event.results[i][0].transcript;
      }

      setText(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // ==========================================
  // LOCATION DETECTION
  // ==========================================

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage(
        "Location detection is not supported by this browser."
      );
      return;
    }

    setLocationLoading(true);
    setLocationMessage("Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                Accept: "application/json"
              }
            }
          );

          if (!response.ok) {
            throw new Error("Address lookup failed");
          }

          const data = await response.json();
          const address = data.address || {};

          const state = address.state || "";

          const district =
            address.state_district ||
            address.county ||
            address.district ||
            "";

          const area =
            address.suburb ||
            address.neighbourhood ||
            address.village ||
            address.town ||
            address.city_district ||
            address.city ||
            "";

          const street =
            address.house_number && address.road
              ? `${address.house_number}, ${address.road}`
              : address.road ||
                address.house_number ||
                "";

          setLocation({
            state,
            district,
            area,
            street,
            latitude,
            longitude
          });

          setLocationMessage(
            "Location detected successfully. You can edit the details if needed."
          );
        } catch (error) {
          console.error(
            "Address lookup error:",
            error
          );

          setLocation((previous) => ({
            ...previous,
            latitude,
            longitude
          }));

          setLocationMessage(
            "Coordinates detected, but the address could not be found. Please enter the location manually."
          );
        }

        setLocationLoading(false);
      },
      (error) => {
        console.error(
          "Location error:",
          error
        );

        setLocationLoading(false);

        setLocationMessage(
          "Unable to detect your location. Please allow location access or enter the location manually."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  // ==========================================
  // LOCATION INPUT
  // ==========================================

  const handleLocationChange = (field, value) => {
    setLocation((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = () => {
    if (!selectedMethod) {
      alert(
        "Please select Text, Voice, Image or Video."
      );
      return;
    }

    if (
      selectedMethod === "TEXT" ||
      selectedMethod === "VOICE"
    ) {
      if (!text.trim()) {
        alert(
          "Please enter or speak your complaint."
        );
        return;
      }
    }

    if (
      selectedMethod === "IMAGE" &&
      !image
    ) {
      alert("Please select an image.");
      return;
    }

    if (
      selectedMethod === "IMAGE" &&
      !imageData
    ) {
      alert(
        "The image is still being processed. Please select the image again."
      );
      return;
    }

    if (
      selectedMethod === "VIDEO" &&
      !video
    ) {
      alert("Please select a video.");
      return;
    }

    if (
      !location.state.trim() ||
      !location.district.trim() ||
      !location.area.trim()
    ) {
      alert(
        "Please enter your State, District and Area."
      );
      return;
    }

    const complaintDraft = {
      method: selectedMethod,

      complaintText: text.trim(),

      image: image
        ? {
            name: image.name,
            type: image.type,
            size: image.size,
            data: imageData
          }
        : null,

      video: video
        ? {
            name: video.name,
            type: video.type,
            size: video.size
          }
        : null,

      location: {
        state: location.state,
        district: location.district,
        area: location.area,
        street: location.street,
        latitude: location.latitude,
        longitude: location.longitude
      },

      createdAt: new Date().toISOString()
    };

    try {
      sessionStorage.setItem(
        "janvoiceComplaintDraft",
        JSON.stringify(complaintDraft)
      );

      navigate("/complaint-analysis");
    } catch (error) {
      console.error(
        "Unable to save complaint draft:",
        error
      );

      alert(
        "The selected image is too large to temporarily store. Please choose a smaller image."
      );
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="report-page">

      {/* HEADER */}

      <header className="report-header">

        <div
          className="report-brand"
          onClick={() => navigate("/")}
        >

          <div className="report-logo">
            JV
          </div>

          <div>
            <h2>JanVoice AI</h2>

            <span>
              People's Problems to Government Action
            </span>
          </div>

        </div>

        <button
          className="report-home-button"
          onClick={() => navigate("/")}
        >
          Home
        </button>

      </header>


      {/* MAIN */}

      <main className="report-container">

        <section className="report-card">

          {/* TITLE */}

          <div className="report-title">

            <h1>
              Report Your Problem Here
            </h1>

            <p>
              Submit your public problem using text,
              voice, image or video.
            </p>

          </div>


          {/* METHODS */}

          <div className="method-row">

            <button
              type="button"
              className={`method-card ${
                selectedMethod === "TEXT"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                selectMethod("TEXT")
              }
            >

              <div className="method-icon">
                📝
              </div>

              <span>
                Text
              </span>

            </button>


            <button
              type="button"
              className={`method-card ${
                selectedMethod === "VOICE"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                selectMethod("VOICE")
              }
            >

              <div className="method-icon">
                🎤
              </div>

              <span>
                Voice
              </span>

            </button>


            <button
              type="button"
              className={`method-card ${
                selectedMethod === "IMAGE"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                selectMethod("IMAGE")
              }
            >

              <div className="method-icon">
                📷
              </div>

              <span>
                Image
              </span>

            </button>


            <button
              type="button"
              className={`method-card ${
                selectedMethod === "VIDEO"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                selectMethod("VIDEO")
              }
            >

              <div className="method-icon">
                🎥
              </div>

              <span>
                Video
              </span>

            </button>

          </div>


          {/* HIDDEN FILE INPUTS */}

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="hidden-input"
          />

          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideo}
            className="hidden-input"
          />


          {/* TEXT / VOICE */}

          {(selectedMethod === "TEXT" ||
            selectedMethod === "VOICE") && (

            <div className="complaint-input-area">

              <label>
                Complaint
              </label>

              <textarea
                value={text}
                onChange={(event) =>
                  setText(event.target.value)
                }
                placeholder="Type your public problem here..."
              />

              {selectedMethod === "VOICE" && (
                <div
                  className={
                    isListening
                      ? "voice-status listening"
                      : "voice-status"
                  }
                >
                  {isListening
                    ? "🔴 Listening..."
                    : "🎤 Voice input completed"}
                </div>
              )}

            </div>

          )}


          {/* IMAGE PREVIEW */}

          {selectedMethod === "IMAGE" &&
            image && (

              <div className="media-preview">

                <div className="preview-heading">
                  Uploaded Image
                </div>

                <img
                  src={URL.createObjectURL(image)}
                  alt="Complaint"
                />

                <p>
                  {image.name}
                </p>

              </div>

          )}


          {/* VIDEO PREVIEW */}

          {selectedMethod === "VIDEO" &&
            video && (

              <div className="media-preview">

                <div className="preview-heading">
                  Uploaded Video
                </div>

                <video
                  src={URL.createObjectURL(video)}
                  controls
                />

                <p>
                  {video.name}
                </p>

              </div>

          )}


          {/* LOCATION */}

          <section className="location-section">

            <div className="location-heading-row">

              <h2>
                Location
              </h2>

              <button
                type="button"
                className="detect-location-small"
                onClick={detectLocation}
                disabled={locationLoading}
              >
                📍{" "}
                {locationLoading
                  ? "Detecting..."
                  : "Detect Location"}
              </button>

            </div>


            {locationMessage && (
              <div className="location-message">
                {locationMessage}
              </div>
            )}


            <div className="location-grid">

              <div className="location-field">

                <label>
                  State
                </label>

                <input
                  type="text"
                  placeholder="Enter state"
                  value={location.state}
                  onChange={(event) =>
                    handleLocationChange(
                      "state",
                      event.target.value
                    )
                  }
                />

              </div>


              <div className="location-field">

                <label>
                  District
                </label>

                <input
                  type="text"
                  placeholder="Enter district"
                  value={location.district}
                  onChange={(event) =>
                    handleLocationChange(
                      "district",
                      event.target.value
                    )
                  }
                />

              </div>


              <div className="location-field">

                <label>
                  Area
                </label>

                <input
                  type="text"
                  placeholder="Enter area"
                  value={location.area}
                  onChange={(event) =>
                    handleLocationChange(
                      "area",
                      event.target.value
                    )
                  }
                />

              </div>


              <div className="location-field">

                <label>
                  Street / Landmark
                </label>

                <input
                  type="text"
                  placeholder="Enter street or landmark"
                  value={location.street}
                  onChange={(event) =>
                    handleLocationChange(
                      "street",
                      event.target.value
                    )
                  }
                />

              </div>

            </div>

          </section>


          {/* SUBMIT */}

          <button
            type="button"
            className="submit-report-button"
            onClick={handleSubmit}
          >
            Continue to AI Analysis →
          </button>

        </section>

      </main>

    </div>
  );
}

export default Report;
