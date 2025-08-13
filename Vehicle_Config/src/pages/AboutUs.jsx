import React from "react";

function AboutUs() {
  const team = [
    { name: "Jaydeep", role: "Lead Developer", bio: "Specializes in React and IoT systems, blending digital interfaces with smart automation." },
    { name: "Aarav", role: "UI/UX Designer", bio: "Crafts intuitive user journeys and responsive layouts for seamless experiences." },
    { name: "Neha", role: "Product Manager", bio: "Drives strategy and ensures alignment between user needs and technical execution." }
  ];

  const timeline = [
    { year: "2023", event: "Conceptualized CarVisionX with a focus on user-centric vehicle configuration." },
    { year: "2024", event: "Launched MVP with segment selection, feature customization, and vendor integration." },
    { year: "2025", event: "Expanded platform with PDF generation, smart filters, and real-time inventory sync." }
  ];

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "linear-gradient(to right, #1e3c72, #2a5298)",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
        padding: "2rem"
      }}
    >
      <h1 style={{ marginBottom: "1rem" }}>About Us</h1>

      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          padding: "2rem",
          borderRadius: "8px",
          maxWidth: "800px",
          textAlign: "center",
          lineHeight: "1.6",
          marginBottom: "2rem"
        }}
      >
        <p>
          <strong>CarVisionX</strong> is a forward-thinking automotive platform dedicated to simplifying the vehicle selection and configuration process for customers and vendors alike.
        </p>
        <p>
          We believe that buying a car should be as exciting and personalized as driving one. That’s why we’ve built a system that empowers users to explore, configure, and confirm their ideal vehicle with just a few clicks.
        </p>
        <p>
          Our team combines deep expertise in web development, user experience design, and automotive systems to deliver a platform that’s both powerful and easy to use.
        </p>
      </div>

      <h2>Meet the Team</h2>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "2rem" }}>
        {team.map((member, index) => (
          <div
            key={index}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              padding: "1rem",
              borderRadius: "8px",
              width: "220px",
              textAlign: "center"
            }}
          >
            <h3>{member.name}</h3>
            <p><em>{member.role}</em></p>
            <p>{member.bio}</p>
          </div>
        ))}
      </div>

      <h2>Our Journey</h2>
      <div style={{ marginBottom: "2rem", maxWidth: "600px", textAlign: "left" }}>
        {timeline.map((item, index) => (
          <p key={index}>
            <strong>{item.year}:</strong> {item.event}
          </p>
        ))}
      </div>

      <h2>Contact Us</h2>
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          padding: "1rem",
          borderRadius: "8px",
          maxWidth: "600px",
          textAlign: "center"
        }}
      >
        <p>📧 Email: support@carvisionx.com</p>
        <p>📍 Location: Mumbai, India</p>
        <p>📞 Phone: +91 98765 43210</p>
      </div>
    </div>
  );
}

export default AboutUs;