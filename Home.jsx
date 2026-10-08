import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="government-page">

      {/* =====================================================
          TOP GOVERNMENT BAR
      ===================================================== */}

      <div className="top-government-bar">

        <div className="top-bar-content">

          <span>
            Government Public Grievance Portal
          </span>

          <div className="top-links">

            <span>
              Skip to Main Content
            </span>

            <span>
              Accessibility
            </span>

            <span>
              Help
            </span>

            <span>
              English ▾
            </span>

          </div>

        </div>

      </div>


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="main-header">

        <div className="header-container">

          {/* BRAND */}

          <div
            className="brand-section"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >

            <div className="government-emblem">
              🏛️
            </div>

            <div className="brand-text">

              <h1>
                JanVoice AI
              </h1>

              <p>
                People's Problems to Government Action
              </p>

            </div>

          </div>


          {/* HELPLINE */}

          <div className="helpline">

            <span className="helpline-icon">
              ☎
            </span>

            <div>

              <small>
                Citizen Helpline
              </small>

              <strong>
                1800-XXX-XXXX
              </strong>

            </div>

          </div>

        </div>

      </header>


      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav className="main-navigation">

        <div className="navigation-container">

          <button
            type="button"
            onClick={() => navigate("/")}
          >
            🏠 Home
          </button>


          <button
            type="button"
            onClick={() => navigate("/report")}
          >
            Report a Problem
          </button>


          {/* TRACK COMPLAINT */}

          <button
            type="button"
            onClick={() => navigate("/track")}
          >
            Track Complaint
          </button>


          <button
            type="button"
            onClick={() => navigate("/citizen-login")}
          >
            Citizen Login
          </button>


          <button
            type="button"
            onClick={() => navigate("/official-login")}
          >
            Official Login
          </button>

        </div>

      </nav>


      {/* =====================================================
          IMPORTANT NOTICE
      ===================================================== */}

      <div className="notice-bar">

        <div className="notice-container">

          <strong>
            📢 Important Notice
          </strong>

          <span>
            Citizens can submit public grievances through
            voice, text, image or video.
          </span>

        </div>

      </div>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main>


        {/* =================================================
            HERO SECTION
        ================================================= */}

        <section className="hero-section">

          <div className="hero-container">


            {/* HERO CONTENT */}

            <div className="hero-content">

              <div className="official-tag">
                DIGITAL PUBLIC SERVICE
              </div>


              <h2>

                Your Problem.

                <br />

                <span>
                  Our Responsibility.
                </span>

              </h2>


              <p>

                JanVoice AI provides a simple and accessible
                platform for citizens to report public problems
                and connect them with the appropriate government
                department.

              </p>


              {/* HERO BUTTONS */}

              <div className="hero-buttons">

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => navigate("/report")}
                >
                  📝 Report a Problem
                </button>


                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => navigate("/track")}
                >
                  🔍 Track Complaint
                </button>

              </div>

            </div>


            {/* =================================================
                SERVICE CARD
            ================================================= */}

            <div className="hero-card">

              <div className="hero-card-header">

                <span>
                  Citizen Grievance Services
                </span>

                <span>
                  ✓
                </span>

              </div>


              <div className="hero-card-body">


                {/* VOICE */}

                <div className="service-mini-card">

                  <div className="service-icon">
                    🎤
                  </div>

                  <div>

                    <strong>
                      Voice Complaint
                    </strong>

                    <p>
                      Speak your problem
                    </p>

                  </div>

                </div>


                {/* TEXT */}

                <div className="service-mini-card">

                  <div className="service-icon">
                    📝
                  </div>

                  <div>

                    <strong>
                      Text Complaint
                    </strong>

                    <p>
                      Describe the issue
                    </p>

                  </div>

                </div>


                {/* IMAGE */}

                <div className="service-mini-card">

                  <div className="service-icon">
                    📷
                  </div>

                  <div>

                    <strong>
                      Photo Evidence
                    </strong>

                    <p>
                      Upload an image
                    </p>

                  </div>

                </div>


                {/* LOCATION */}

                <div className="service-mini-card">

                  <div className="service-icon">
                    📍
                  </div>

                  <div>

                    <strong>
                      Location
                    </strong>

                    <p>
                      Provide issue location
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            SERVICES
        ===================================================== */}

        <section className="services-section">

          <div className="section-container">


            <div className="center-heading">

              <span className="section-label">
                CITIZEN SERVICES
              </span>

              <h2>
                Online Public Grievance Services
              </h2>

              <p>
                Access important services for submitting and
                tracking public complaints.
              </p>

            </div>


            <div className="service-grid">


              {/* REPORT */}

              <div
                className="service-card"
                onClick={() => navigate("/report")}
              >

                <div className="large-service-icon">
                  📝
                </div>

                <h3>
                  Report a Problem
                </h3>

                <p>
                  Submit a complaint about a public issue
                  in your area.
                </p>

                <span>
                  Submit Complaint →
                </span>

              </div>


              {/* TRACK */}

              <div
                className="service-card"
                onClick={() => navigate("/track")}
              >

                <div className="large-service-icon">
                  🔍
                </div>

                <h3>
                  Track Complaint
                </h3>

                <p>
                  Check the current status of your submitted
                  complaint.
                </p>

                <span>
                  Track Status →
                </span>

              </div>


              {/* CITIZEN LOGIN */}

              <div
                className="service-card"
                onClick={() => navigate("/citizen-login")}
              >

                <div className="large-service-icon">
                  👤
                </div>

                <h3>
                  Citizen Login
                </h3>

                <p>
                  Access your complaints and notifications.
                </p>

                <span>
                  Citizen Portal →
                </span>

              </div>


              {/* OFFICIAL LOGIN */}

              <div
                className="service-card"
                onClick={() => navigate("/official-login")}
              >

                <div className="large-service-icon">
                  🏛️
                </div>

                <h3>
                  Official Login
                </h3>

                <p>
                  Government officials can manage assigned
                  grievances.
                </p>

                <span>
                  Official Portal →
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}

        <section className="process-section">

          <div className="section-container">


            <div className="center-heading">

              <span className="section-label">
                HOW JANVOICE AI WORKS
              </span>

              <h2>
                From People's Problems to Government Action
              </h2>

              <p>
                Every complaint follows a structured process
                so it can reach the appropriate department.
              </p>

            </div>


            <div className="process-grid">


              {/* STEP 1 */}

              <div className="process-item">

                <div className="process-number">
                  01
                </div>

                <div className="process-icon">
                  📝
                </div>

                <h3>
                  Report
                </h3>

                <p>
                  Citizen submits a public grievance.
                </p>

              </div>


              <div className="process-line"></div>


              {/* STEP 2 */}

              <div className="process-item">

                <div className="process-number">
                  02
                </div>

                <div className="process-icon">
                  🤖
                </div>

                <h3>
                  AI Analysis
                </h3>

                <p>
                  The complaint is analyzed and categorized.
                </p>

              </div>


              <div className="process-line"></div>


              {/* STEP 3 */}

              <div className="process-item">

                <div className="process-number">
                  03
                </div>

                <div className="process-icon">
                  🏢
                </div>

                <h3>
                  Department
                </h3>

                <p>
                  The complaint reaches the relevant department.
                </p>

              </div>


              <div className="process-line"></div>


              {/* STEP 4 */}

              <div className="process-item">

                <div className="process-number">
                  04
                </div>

                <div className="process-icon">
                  ✓
                </div>

                <h3>
                  Resolution
                </h3>

                <p>
                  Officials update the complaint until resolution.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            PUBLIC ISSUES
        ===================================================== */}

        <section className="categories-section">

          <div className="section-container">


            <div className="center-heading">

              <span className="section-label">
                PUBLIC ISSUES
              </span>

              <h2>
                What Can You Report?
              </h2>

            </div>


            <div className="category-grid">


              <div className="category-item">

                <span>
                  🛣️
                </span>

                <strong>
                  Roads & Highways
                </strong>

              </div>


              <div className="category-item">

                <span>
                  💧
                </span>

                <strong>
                  Water Management
                </strong>

              </div>


              <div className="category-item">

                <span>
                  ⚡
                </span>

                <strong>
                  Electricity
                </strong>

              </div>


              <div className="category-item">

                <span>
                  🗑️
                </span>

                <strong>
                  Garbage & Waste
                </strong>

              </div>


              <div className="category-item">

                <span>
                  🚰
                </span>

                <strong>
                  Drainage
                </strong>

              </div>


              <div className="category-item">

                <span>
                  💡
                </span>

                <strong>
                  Street Lights
                </strong>

              </div>


              <div className="category-item">

                <span>
                  🏗️
                </span>

                <strong>
                  Infrastructure
                </strong>

              </div>


              <div className="category-item">

                <span>
                  🏛️
                </span>

                <strong>
                  Other Civic Issues
                </strong>

              </div>

            </div>

          </div>

        </section>

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="government-footer">

        <div className="footer-container">


          {/* FOOTER BRAND */}

          <div className="footer-brand">

            <div className="footer-emblem">
              🏛️
            </div>

            <div>

              <h3>
                JanVoice AI
              </h3>

              <p>
                People's Problems to Government Action
              </p>

            </div>

          </div>


          {/* FOOTER LINKS */}

          <div className="footer-links">


            {/* CITIZEN SERVICES */}

            <div>

              <h4>
                Citizen Services
              </h4>

              <p
                onClick={() => navigate("/report")}
              >
                Report a Problem
              </p>

              <p
                onClick={() => navigate("/track")}
              >
                Track Complaint
              </p>

              <p
                onClick={() => navigate("/citizen-login")}
              >
                Citizen Login
              </p>

            </div>


            {/* OFFICIAL SERVICES */}

            <div>

              <h4>
                Official Services
              </h4>

              <p
                onClick={() => navigate("/official-login")}
              >
                Official Login
              </p>

              <p>
                Help & Support
              </p>

            </div>

          </div>

        </div>


        {/* FOOTER BOTTOM */}

        <div className="footer-bottom">

          <span>
            © 2026 JanVoice AI
          </span>

          <span>
            Digital Public Grievance Service
          </span>

        </div>

      </footer>

    </div>
  );
}

export default Home;