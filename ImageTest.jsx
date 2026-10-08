import { useState } from "react";

function ImageTest() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeImage = async () => {
    if (!image) {
      alert("Please select an image.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();

      formData.append("image", image);

      const response = await fetch(
        "http://localhost:5000/api/analyze-image",
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();

      console.log("AI RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Image analysis failed"
        );
      }

      setResult(data);

    } catch (error) {

      console.error(error);

      setResult({
        success: false,
        message: error.message
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "50px auto",
        padding: "30px",
        fontFamily: "Arial"
      }}
    >

      <h1>JanVoice AI - Image Test</h1>

      <p>
        Upload a civic problem image to test AI classification.
      </p>

      <input
        type="file"
        accept="image/*"
        onChange={(event) => {
          setImage(event.target.files?.[0] || null);
        }}
      />

      <br />
      <br />

      <button
        type="button"
        onClick={analyzeImage}
        disabled={loading}
        style={{
          padding: "12px 20px",
          cursor: "pointer"
        }}
      >
        {loading
          ? "Analyzing..."
          : "Analyze Image"}
      </button>

      {result && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            background: "#f3f6fa",
            borderRadius: "10px"
          }}
        >

          <h2>AI Result</h2>

          <pre>
            {JSON.stringify(result, null, 2)}
          </pre>

        </div>
      )}

    </div>
  );
}

export default ImageTest;