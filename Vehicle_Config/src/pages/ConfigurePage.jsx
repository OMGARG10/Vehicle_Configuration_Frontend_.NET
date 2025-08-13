import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const typeMap = {
  S: "Standard",
  I: "Interior",
  E: "Exterior",
};

function ConfigurePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    modelId,
    quantity: stateQuantity,
    minQuantity: stateMinQuantity,
  } = location.state || {};

  const [minQuantity] = useState(stateMinQuantity ?? 1);
  const [quantity, setQuantity] = useState(stateQuantity ?? minQuantity ?? 1);

  const [defaultComponents, setDefaultComponents] = useState([]);
  const [alternateMap, setAlternateMap] = useState({});
  const [basePrice, setBasePrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedAlternates, setSelectedAlternates] = useState({});
  const [pendingAlternateSelection, setPendingAlternateSelection] = useState({});
  const [selectedType, setSelectedType] = useState("S");

  useEffect(() => {
    if (!modelId) return;

    fetch(`https://localhost:7000/api/models/configurable/${modelId}`)
      .then((res) => res.json())
      .then(setDefaultComponents)
      .catch((err) => console.error("Error fetching default components:", err));

    fetch(`https://localhost:7000/api/models/alternate-components/${modelId}`)
      .then((res) => res.json())
      .then((data) => {
        const map = {};
        for (const typeKey in data) {
          const compGroups = data[typeKey];
          for (const compId in compGroups) {
            if (!map[compId]) map[compId] = [];
            map[compId].push(...compGroups[compId]);
          }
        }
        setAlternateMap(map);
      })
      .catch((err) => console.error("Error fetching alternates:", err));

    fetch(`https://localhost:7000/api/models/price/${modelId}`)
      .then((res) => res.json())
      .then((price) => {
        setBasePrice(price);
        setTotalPrice(price);
        setSelectedAlternates({});
        setPendingAlternateSelection({});
      })
      .catch((err) => console.error("Error fetching base price:", err));
  }, [modelId]);

  const recalcTotalPrice = (newSelectedAlternates) => {
    let newTotal = basePrice;
    for (const [compId, altId] of Object.entries(newSelectedAlternates)) {
      if (!altId) continue;
      const altList = alternateMap[compId] || [];
      const altObj = altList.find((alt) => alt.AltId === altId);
      if (altObj) newTotal += altObj.DeltaPrice;
    }
    setTotalPrice(newTotal);
  };

  const handlePendingChange = (compId, altId) => {
    setPendingAlternateSelection((prev) => ({
      ...prev,
      [compId]: altId,
    }));
  };

  const handleAddAlternate = (compId) => {
    const altId = pendingAlternateSelection[compId];
    if (!altId) {
      alert("Please select an alternate to add");
      return;
    }
    if (selectedAlternates[compId] === altId) {
      alert("This alternate is already added.");
      return;
    }
    const newSelected = {
      ...selectedAlternates,
      [compId]: altId,
    };
    setSelectedAlternates(newSelected);
    recalcTotalPrice(newSelected);

    setPendingAlternateSelection((prev) => ({
      ...prev,
      [compId]: "",
    }));
  };

  const handleRemoveAlternate = (compId) => {
    if (!(compId in selectedAlternates)) return;
    const newSelected = { ...selectedAlternates };
    delete newSelected[compId];
    setSelectedAlternates(newSelected);
    recalcTotalPrice(newSelected);
  };

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value);
    if (isNaN(val) || val < minQuantity) {
      setQuantity(minQuantity);
    } else {
      setQuantity(val);
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>Configure Your Car</h1>

      <div style={mainCardStyle}>
        <div style={centeredTextBlock}>
          <h3 style={subheadingStyle}>
            Base Price: ₹{basePrice} | Total Price: ₹{totalPrice}
          </h3>

          <label style={{ fontWeight: "bold", marginTop: "1rem" }}>
            Quantity :
            <span
              style={{
                marginLeft: "0.5rem",
                padding: "0.3rem 0.6rem",
                borderRadius: "4px",
                backgroundColor: "#2a5298",
                fontWeight: "bold",
                display: "inline-block",
                minWidth: "60px",
                textAlign: "center",
                color: "#fff",
              }}
            >
              {quantity}
            </span>
          </label>

          <div style={typeButtonContainerStyle}>
            {["S", "I", "E"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                style={{
                  ...typeButtonStyle,
                  backgroundColor: selectedType === type ? "#fff" : "#2a5298",
                  color: selectedType === type ? "#2a5298" : "#fff",
                }}
              >
                {typeMap[type]}
              </button>
            ))}
          </div>
        </div>

        {defaultComponents
          .filter(
            (comp) =>
              comp.CompType === selectedType && comp.IsConfigurable === "Y"
          )
          .map((comp) => {
            const compId = comp.Component.CompId.toString();
            const compName = comp.Component.CompName || `Component #${compId}`;
            const selectedAltId = selectedAlternates[compId];
            const alternatesForComp = alternateMap[compId] || [];
            const pendingAltId = pendingAlternateSelection[compId] || "";

            const selectedAltObj = alternatesForComp.find(
              (alt) => alt.AltId === selectedAltId
            );

            return (
              <div key={comp.ConfigId} style={horizontalComponentBlockStyle}>
                <div style={componentNameStyle}>
                  <strong>{compName}</strong>
                </div>

                <div style={alternateBlockStyle}>
                  {alternatesForComp.length === 0 ? (
                    <p>No alternates</p>
                  ) : (
                    <>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <select
                          value={pendingAltId}
                          onChange={(e) =>
                            handlePendingChange(
                              compId,
                              e.target.value ? parseInt(e.target.value) : ""
                            )
                          }
                          style={{
                            ...selectStyle,
                            borderColor: pendingAltId ? "#2a5298" : "#ccc",
                          }}
                        >
                          <option value="">-- Select Alternate --</option>
                          {alternatesForComp.map((alt) => (
                            <option key={alt.AltId} value={alt.AltId}>
                              {alt.AlternateComponentEntity?.CompName} | ₹
                              {alt.DeltaPrice}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAddAlternate(compId)}
                          disabled={!pendingAltId}
                          style={{
                            ...addButtonStyle,
                            cursor: pendingAltId ? "pointer" : "not-allowed",
                          }}
                        >
                          Add
                        </button>
                      </div>

                      {selectedAltObj && (
                        <div style={selectedAltDisplayStyle}>
                          <span>
                            Selected:{" "}
                            {selectedAltObj.AlternateComponentEntity?.CompName} | ₹
                            {selectedAltObj.DeltaPrice}
                          </span>
                          <button
                            onClick={() => handleRemoveAlternate(compId)}
                            style={removeButtonStyle}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      <div style={footerButtonContainerStyle}>
        <button
          onClick={async () => {
            try {
              // Read user info from sessionStorage
              const userIdStr = sessionStorage.getItem("userId");
              const jwtToken = sessionStorage.getItem("jwtToken");

              if (!userIdStr || !jwtToken) {
                alert(
                  "User is not logged in or session expired. Please login again."
                );
                return;
              }

              const userId = parseInt(userIdStr);
              if (isNaN(userId)) {
                alert("Invalid user info. Please login again.");
                return;
              }

              const details = Object.entries(selectedAlternates).map(
                ([compId, altId]) => ({
                  CompId: parseInt(compId),
                  IsAlternate: "Y",
                })
              );

              const baseCompIds = defaultComponents
                .filter((comp) => comp.IsConfigurable === "Y")
                .map((comp) => comp.Component.CompId);

              baseCompIds.forEach((compId) => {
                if (!selectedAlternates[compId]) {
                  details.push({
                    CompId: compId,
                    IsAlternate: "N",
                  });
                }
              });

              const payload = {
                UserId: userId,
                ModelId: modelId,
                Quantity: quantity,
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

              navigate("/invoice", {
                state: {
                  invoice: createdInvoice,
                  modelId,
                  selectedAlternates,
                  defaultComponents,
                  totalPrice,
                  basePrice,
                  quantity,
                },
              });
            } catch (err) {
              console.error("Error creating invoice:", err);
              alert(`Failed to create invoice. ${err.message}`);
            }
          }}
          style={confirmButtonStyle}
        >
          Confirm Order
        </button>

        <button
          onClick={() => navigate("/configuration", { state: { modelId } })}
          style={cancelButtonStyle}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// === Style Objects ===

const containerStyle = {
  minHeight: "80vh",
  width: "100vw",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
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
  color: "#222",
  marginBottom: "1rem",
};

const mainCardStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
  backgroundColor: "rgba(255,255,255,0.9)",
  padding: "2rem",
  borderRadius: "12px",
  width: "100%",
  maxWidth: "1100px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  color: "#333",
};

const subheadingStyle = {
  color: "#333",
  marginBottom: "0.5rem",
  fontSize: "1.2rem",
};

const centeredTextBlock = {
  textAlign: "center",
};

const typeButtonContainerStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "1rem",
  marginTop: "1rem",
};

const typeButtonStyle = {
  padding: "0.6rem 1.2rem",
  borderRadius: "6px",
  border: "none",
  fontWeight: "bold",
  fontSize: "1rem",
  cursor: "pointer",
};

const horizontalComponentBlockStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  padding: "1rem",
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
};

const componentNameStyle = {
  flex: 1,
  marginRight: "1rem",
  fontSize: "1rem",
};

const alternateBlockStyle = {
  flex: 2,
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};

const selectedAltDisplayStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.4rem 0.6rem",
  backgroundColor: "#e9f5ff",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "0.95rem",
};

const selectStyle = {
  padding: "0.5rem",
  borderRadius: "6px",
  border: "2px solid #ccc",
  fontSize: "1rem",
  color: "#333",
  backgroundColor: "#f0f8ff",
};

const addButtonStyle = {
  padding: "0.5rem 1rem",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#2a5298",
  color: "#fff",
  fontWeight: "bold",
};

const removeButtonStyle = {
  padding: "0.4rem 0.8rem",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#b33",
  color: "#fff",
  fontWeight: "bold",
  marginLeft: "1rem",
};

const footerButtonContainerStyle = {
  marginTop: "2rem",
  display: "flex",
  gap: "1rem",
  justifyContent: "center",
};

const confirmButtonStyle = {
  padding: "0.8rem 1.5rem",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#28a745",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};

const cancelButtonStyle = {
  padding: "0.8rem 1.5rem",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#dc3545",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};

export default ConfigurePage;
