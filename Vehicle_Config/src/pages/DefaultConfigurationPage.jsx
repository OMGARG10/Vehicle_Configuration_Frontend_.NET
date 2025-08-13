import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function DefaultConfigurationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { modelId, quantity } = location.state || {};

  const [modelInfo, setModelInfo] = useState(null);

  useEffect(() => {
    if (!modelId) return;

    fetch(`https://localhost:7000/api/models/default/${modelId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setModelInfo(data);
      })
      .catch((err) => {
        console.error("Failed to fetch default configuration:", err);
        setModelInfo(null);
      });
  }, [modelId]);

  const handleConfirm = async () => {
    if (!modelInfo) return;

    try {
      // Read user info from sessionStorage
      const userIdStr = sessionStorage.getItem("userId");
      const jwtToken = sessionStorage.getItem("jwtToken");

      if (!userIdStr || !jwtToken) {
        alert("User is not logged in or session expired. Please login again.");
        return;
      }

      const userId = parseInt(userIdStr);
      if (isNaN(userId)) {
        alert("Invalid user info. Please login again.");
        return;
      }

      // Prepare invoice details: all default components are not alternates
      const details = modelInfo.DefaultComponents.map((comp) => ({
        CompId: comp.Component.CompId,
        IsAlternate: "N",
      }));

      // Payload similar to Configure page
      const payload = {
        UserId: userId,
        ModelId: modelInfo.ModelId,
        Quantity: quantity ?? modelInfo.Segment?.MinQuantity ?? 1,
        Details: details,
      };

      const response = await fetch(
        "https://localhost:7000/api/invoiceheader/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create invoice: ${errorText || response.statusText}`
        );
      }

      const createdInvoice = await response.json();

      // Navigate to invoice page with same structure as Configure page
      navigate("/invoice", {
        state: {
          invoice: createdInvoice,
          modelId: modelInfo.ModelId,
          selectedAlternates: {}, // No alternates in default configuration
          defaultComponents: modelInfo.DefaultComponents,
          totalPrice:
            (modelInfo.Price ?? 0) * (quantity ?? modelInfo.Segment?.MinQuantity ?? 1),
          basePrice: modelInfo.Price ?? 0,
          quantity: quantity ?? modelInfo.Segment?.MinQuantity ?? 1,
        },
      });
    } catch (err) {
      console.error("Error creating invoice:", err);
      alert(`Failed to create invoice. ${err.message}`);
    }
  };


  const handleConfigure = () =>
    navigate("/configure", {
      state: {
        modelId: modelInfo.ModelId,
        quantity: quantity ?? modelInfo.Segment?.MinQuantity ?? 1,
        modelName: modelInfo.ModelName,
        price: modelInfo.Price,
        defaultComponents: modelInfo.DefaultComponents // Pass all components here
      },
    });

  const handleModify = () => navigate("/welcome");

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>Default Configuration</h1>

      <div style={cardStyle}>
        {modelInfo && modelInfo.ImagePath && (
          <img
            src={`https://localhost:7000${modelInfo.ImagePath}`}
            alt={modelInfo.ModelName}
            style={imageStyle}
          />
        )}

        {modelInfo ? (
          <>
            <div style={{ marginBottom: "1rem" }}>
              <div><strong>Segment:</strong> {modelInfo.Segment?.SegName}</div>
              <div><strong>Manufacturer:</strong> {modelInfo.Manufacturer?.MfgName}</div>
              <div><strong>Model:</strong> {modelInfo.ModelName}</div>
              <div><strong>Quantity:</strong> {quantity ?? modelInfo.Segment?.MinQuantity}</div>
              <div><strong>Price per Unit:</strong> ₹{modelInfo.Price}</div>
              <div><strong>Total Price:</strong> ₹{(quantity ?? modelInfo.Segment?.MinQuantity) * modelInfo.Price}</div>

              <hr style={{ borderColor: "#ccc", margin: "1rem 0" }} />

              <h3 style={{ marginBottom: "0.5rem" }}>Default Components</h3>
              {modelInfo.DefaultComponents?.length > 0 ? (
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={tableHeaderStyle}>Component Name</th>
                      <th style={tableHeaderStyle}>Component Type</th>
                      <th style={tableHeaderStyle}>Is Configurable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelInfo.DefaultComponents.map((comp) => (
                      <tr key={comp.ConfigId}>
                        <td style={tableCellStyle}>{comp.Component?.CompName || "Unknown"}</td>
                        <td style={tableCellStyle}>
                          {({
                            C: "Core",
                            S: "Standard",
                            I: "Interior",
                            E: "Exterior"
                          }[comp.CompType] || comp.CompType)}
                        </td>
                        <td style={tableCellStyle}>
                          {({
                            Y: "Yes",
                            N: "No"
                          }[comp.IsConfigurable] || comp.IsConfigurable)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No default components found for this model.</p>
              )}
            </div>
          </>
        ) : (
          <p style={{ textAlign: "center", color: "#555" }}>Loading or no data found.</p>
        )}

        <div style={buttonContainerStyle}>
          <button onClick={handleConfirm} style={buttonStyle}>Confirm Order</button>
          <button onClick={handleConfigure} style={buttonStyle}>Configure</button>
          <button onClick={handleModify} style={buttonStyle}>Modify Selection</button>
        </div>
      </div>
    </div>
  );
}

// -- Styling (Unchanged) --

const containerStyle = {
  minHeight: "80vh",
  width: "100vw",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  backgroundImage: `linear-gradient(rgba(255,255,255,0.0), rgba(255,255,255,0.5)), url('/images/w1.jpg')`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundAttachment: "fixed",
  fontFamily: "Arial, sans-serif",
  padding: "3rem",
  paddingTop: "6rem",
};

const headingStyle = {
  fontSize: "2rem",
  marginBottom: "1rem",
  color: "#222",
};

const cardStyle = {
  backgroundColor: "rgba(255, 255, 255, 0.7)",
  backdropFilter: "blur(10px)",
  padding: "2rem",
  borderRadius: "10px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  width: "100%",
  maxWidth: "1000px",
  position: "relative",
  color: "#333",
};

const imageStyle = {
  width: "250px",
  height: "auto",
  borderRadius: "10px",
  position: "absolute",
  top: "2rem",
  right: "2rem",
  boxShadow: "0 0 10px rgba(0,0,0,0.2)",
  backgroundColor: "#fff",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "1rem",
};

const tableHeaderStyle = {
  borderBottom: "2px solid #ccc",
  padding: "0.75rem",
  textAlign: "left",
  backgroundColor: "#f0f0f0",
};

const tableCellStyle = {
  padding: "0.6rem",
  borderBottom: "1px solid #ddd",
};

const buttonContainerStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "1rem",
  marginTop: "2rem",
};

const buttonStyle = {
  padding: "0.8rem 1.2rem",
  borderRadius: "6px",
  border: "none",
  fontWeight: "bold",
  backgroundColor: "#2a5298",
  color: "#fff",
  cursor: "pointer",
  fontSize: "1rem",
  transition: "background-color 0.3s",
};

export default DefaultConfigurationPage;