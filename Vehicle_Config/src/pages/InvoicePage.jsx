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
  const { invoice, invoiceId } = location.state || {};
  const id = invoiceId || invoice?.InvId;

  const [invoiceData, setInvoiceData] = useState(invoice || null);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id && !invoiceData) {
          const headerRes = await fetch(
            `https://localhost:7000/api/invoiceheader/${id}`
          );
          if (!headerRes.ok) throw new Error("Failed to fetch invoice header");
          const headerData = await headerRes.json();
          setInvoiceData(headerData);
        }

        if (id) {
          const detailRes = await fetch(
            `https://localhost:7000/api/invoicedetail/byinvoice/${id}`
          );
          if (!detailRes.ok) throw new Error("Failed to fetch invoice details");
          const detailData = await detailRes.json();
          setDetails(detailData);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [id, invoiceData]);

  const handleEmailSend = async () => {
    if (!invoiceData || details.length === 0) {
      alert("Invoice data or details missing.");
      return;
    }

    const modelId = invoiceData.ModelId || (invoiceData.model && invoiceData.model.ModelId) || 0;

    try {
      const res = await fetch(`https://localhost:7000/api/invoicedetail/sendemail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceHeader: invoiceData,
          invoiceDetails: details,
          modelId: modelId,
        }),
      });

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
    <div style={pageStyle}>
      <h1>Invoice</h1>
      <div id="invoice-content" style={invoiceStyle}>
        <div>
          <strong>Customer Details:</strong>
          <ul>
            {custDetailsParsed.map(({ key, value }, idx) => (
              <li key={idx}>
                <strong>{key}:</strong> {value}
              </li>
            ))}
          </ul>
        </div>

        <p>
          <strong>Date:</strong>{" "}
          {new Date(invoiceData.InvDate).toLocaleString()}
        </p>
        <p>
          <strong>Quantity:</strong> {invoiceData.Quantity}
        </p>

        <ul>
          {details.length === 0 ? (
            <li>No components found in invoice.</li>
          ) : (
            details.map((item) => (
              <li key={item.InvDtlId}>
                {item.Component?.CompName ?? "Unknown Component"}
                {item.IsAlternate === "Y" ? " (Alternate)" : ""}
              </li>
            ))
          )}
        </ul>

        <hr />
        <p>Subtotal: ₹{invoiceData.FinalAmount?.toLocaleString()}</p>
        <p>GST: ₹{invoiceData.Tax?.toLocaleString()}</p>
        <h3>Total: ₹{invoiceData.TotalAmount?.toLocaleString()}</h3>
      </div>

      <div style={buttonContainer}>
        <button onClick={() => navigate("/configure")} style={buttonStyle}>
          Cancel
        </button>
        <button
          onClick={handleEmailSend}
          style={{ ...buttonStyle, backgroundColor: "#28a745", color: "#fff" }}
        >
          Confirm
        </button>

        <button
          onClick={() => window.print()}
          style={{ ...buttonStyle, backgroundColor: "#007bff", color: "#fff" }}
        >
          Print
        </button>
      </div>
    </div>
  );
}

const pageStyle = {
  padding: "2rem",
  fontFamily: "Arial, sans-serif",
  backgroundColor: "#f4f4f4",
  minHeight: "100vh",
};

const invoiceStyle = {
  backgroundColor: "#fff",
  padding: "1rem",
  borderRadius: "8px",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
};

const buttonContainer = {
  marginTop: "1rem",
  display: "flex",
  gap: "1rem",
};

const buttonStyle = {
  padding: "0.8rem 1.5rem",
  borderRadius: "4px",
  border: "none",
  cursor: "pointer",
};

export default InvoicePage;
