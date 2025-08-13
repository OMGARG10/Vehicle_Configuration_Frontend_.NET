  import React from "react";
  import { useNavigate } from "react-router-dom";

  function Header() {
    const navigate = useNavigate();

    const pathMap = {
      "Home": "/",
      "About Us": "/about",
      "Contact Us": "/contact",
      "Carrer": "/career",
      "Registration": "/register",
      "Sign In": "/signin"
    };

    return (
      <header
        style={{
          position: "fixed", // stays on top
          top: 0,
          left: 0,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center", // centers company name
          padding: "1rem 0.5rem",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          zIndex: 1000,
          backdropFilter: "blur(6px)",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)"
        }}
      >
        {/* 🏢 Centered Company Name */}
        <h1 style={{ color: "#fff", fontSize: "2rem", margin: "0.5rem 0" }}>
          CarVisionX
        </h1>

        {/* 🌐 Navigation Buttons Below */}
        <nav style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
          {Object.keys(pathMap).map(label => (
            <button
              key={label}
              onClick={() => navigate(pathMap[label])}
              style={{
                background: "transparent",
                border: "2px solid #fff",
                borderRadius: "5px",
                padding: "0.5rem 1rem",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "1rem",
                transition: "background 0.3s"
              }}
              onMouseEnter={e => (e.target.style.background = "rgba(255,255,255,0.2)")}
              onMouseLeave={e => (e.target.style.background = "transparent")}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>
    );
  }

  export default Header;