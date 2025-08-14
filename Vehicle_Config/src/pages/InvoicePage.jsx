import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function parseCustDetails(detailsStr) {
  if (!detailsStr) return [];
  return detailsStr.split(",").map((part) => {
    const [key, ...rest] = part.split(":");
    return { key: key?.trim(), value: rest.join(":").trim() };
  });
}

function InvoicePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { invoice, invoiceId, imagePath: stateImagePath, modelId: stateModelId } =
    location.state || {};
  const id = invoiceId || invoice?.InvId;

  const [invoiceData, setInvoiceData] = useState(invoice || null);
  const [details, setDetails] = useState([]);
  const [modelImageUrl, setModelImageUrl] = useState(stateImagePath || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        let headerData = invoiceData;

        // 1️⃣ Fetch invoice header if not passed
        if (id && !invoiceData) {
          const headerRes = await fetch(
            `https://localhost:7000/api/invoiceheader/${id}`
          );
          if (!headerRes.ok) throw new Error("Failed to fetch invoice header");
          headerData = await headerRes.json();
          setInvoiceData(headerData);
        }

        // 2️⃣ Fetch invoice details
        if (id) {
          const detailRes = await fetch(
            `https://localhost:7000/api/invoicedetail/byinvoice/${id}`
          );
          if (!detailRes.ok) throw new Error("Failed to fetch invoice details");
          const detailData = await detailRes.json();
          setDetails(detailData);
        }

        // 3️⃣ Fetch model image if not passed via state
        if (!stateImagePath) {
          const modelId =
            headerData?.ModelId || stateModelId || (headerData?.model && headerData.model.ModelId);
          if (modelId) {
            const modelRes = await fetch(
              `https://localhost:7000/api/models/${modelId}`
            );
            if (modelRes.ok) {
              const modelInfo = await modelRes.json();
              if (modelInfo?.ImagePath) {
                setModelImageUrl(`https://localhost:7000${modelInfo.ImagePath}`);
              }
            }
          }
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [id, invoiceData, stateImagePath, stateModelId]);

  const handleEmailSend = async () => {
    if (!invoiceData || details.length === 0) {
      alert("Invoice data or details missing.");
      return;
    }

    const modelId =
      invoiceData.ModelId ||
      (invoiceData.model && invoiceData.model.ModelId) ||
      stateModelId ||
      0;

    try {
      const res = await fetch(
        `https://localhost:7000/api/invoicedetail/sendemail`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoiceHeader: invoiceData,
            invoiceDetails: details,
            modelId: modelId,
          }),
        }
      );

      if (!res.ok) throw new Error("Email sending failed");

      const msg = await res.text();
      alert(msg);
    } catch (err) {
      console.error("Error:", err);
      alert("Error sending invoice email.");
    }
  };

  if (!id) return <div>Error: Invoice ID not found.</div>;
  if (loading) return <div>Loading invoice...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  const custDetailsParsed = parseCustDetails(invoiceData.CustDetails);

  return (
    <div style={pageContainer}>
      <h1 style={pageTitle}>📄 Invoice</h1>

      <div style={invoiceCard}>
        {modelImageUrl && (
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <img
              src={modelImageUrl}
              alt="Selected Model"
              style={{
                maxWidth: "100%",
                maxHeight: "300px",
                borderRadius: "8px",
                objectFit: "contain",
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/images/default-car.jpg";
              }}
            />
          </div>
        )}

        <div style={{ marginBottom: "1rem" }}>
          <strong>Customer Details:</strong>
          <ul style={{ paddingLeft: "1.2rem" }}>
            {custDetailsParsed.map(({ key, value }, idx) => (
              <li key={idx}>
                <strong>{key}:</strong> {value}
              </li>
            ))}
          </ul>
        </div>

        <p>
          <strong>Date:</strong> {new Date(invoiceData.InvDate).toLocaleString()}
        </p>
        <p>
          <strong>Quantity:</strong> {invoiceData.Quantity}
        </p>

        <ul style={{ paddingLeft: "1.2rem" }}>
          {details.length === 0 ? (
            <li>No components found in invoice.</li>
          ) : (
            details.map((item) => {
              const compName = item.Component?.CompName || "Unknown Component";
              const isAlt = item.IsAlternate === "Y";
              const delta = item.DeltaPrice;

              return (
                <li key={item.InvDtlId}>
                  {compName}
                  {isAlt && (
                    <span>
                      {" "}
                      (Alternate
                      {item.Component?.CompName ? `: ${item.Component.CompName}` : ""}
                      {delta != null ? ` | ₹${delta}` : ""})
                    </span>
                  )}
                </li>
              );
            })
          )}
        </ul>

        <hr style={{ margin: "1rem 0" }} />
        <p>Subtotal: ₹{invoiceData.FinalAmount?.toLocaleString()}</p>
        <p>GST: ₹{invoiceData.Tax?.toLocaleString()}</p>
        <h3>Total: ₹{invoiceData.TotalAmount?.toLocaleString()}</h3>
      </div>

      <div style={buttonGroup}>
        <button
          onClick={() =>
            navigate("/configure", { state: { modelId: invoiceData.ModelId } })
          }
          style={cancelButtonStyle}
        >
          Cancel
        </button>
        <button onClick={handleEmailSend} style={confirmButtonStyle}>
          Send Email
        </button>
        <button onClick={() => window.print()} style={printButtonStyle}>
          Print
        </button>
      </div>
    </div>
  );
}

// -- Styling (unchanged) --

const pageContainer = {
  minHeight: "100vh",
  width: "100vw",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#f5f5f5",
  fontFamily: "Arial, sans-serif",
  paddingTop: "7rem",
  paddingBottom: "2rem",
};

const pageTitle = {
  fontSize: "2rem",
  color: "#222",
  marginBottom: "1.5rem",
};

const invoiceCard = {
  backgroundColor: "#fff",
  padding: "2rem",
  borderRadius: "10px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  color: "#333",
  maxWidth: "800px",
  width: "95%",
};

const buttonGroup = {
  display: "flex",
  gap: "1rem",
  marginTop: "1.5rem",
};

const baseButton = {
  padding: "0.8rem 1.5rem",
  borderRadius: "6px",
  border: "none",
  fontWeight: "bold",
  color: "#fff",
  fontSize: "1rem",
  cursor: "pointer",
  transition: "background-color 0.3s",
};

const cancelButtonStyle = {
  ...baseButton,
  backgroundColor: "#ccc",
  color: "#000",
};

const confirmButtonStyle = {
  ...baseButton,
  backgroundColor: "#28a745",
};

const printButtonStyle = {
  ...baseButton,
  backgroundColor: "#007bff",
};

export default InvoicePage;
