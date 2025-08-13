import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function RegistrationForm() {
  const navigate = useNavigate();

  const initialForm = {
    companyName: "", address1: "", address2: "", area: "", city: "", state: "", pin: "",
    tel: "", fax: "", holding: "", authorizedPerson: "", designation: "",
    telAuth: "", cell: "", stNo: "", vatNo: "", pan: "",
    email: "", password: ""
  };

  const [form, setForm] = useState(initialForm);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleClear = () => {
    setForm(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      "companyName", "address1", "city", "state", "pin",
      "holding", "authorizedPerson", "designation", "email", "password"
    ];

    for (let field of requiredFields) {
      if (!form[field]) {
        alert("Please fill all mandatory (*) fields.");
        return;
      }
    }

    const payload = {
      company_name: form.companyName,
      add1: form.address1,
      add2: form.address2,
      city: form.city,
      state: form.state,
      pin: parseInt(form.pin),
      tel: form.tel,
      fax: form.fax,
      auth_name: form.authorizedPerson,
      designation: form.designation,
      auth_tel: form.telAuth || "NA",
      cell: form.cell,
      company_st_no: form.stNo || "NA",
      company_vat_no: form.vatNo || "NA",
      tax_pan: form.pan,
      holding_type: form.holding.replace(".", "").replace(" ", "_"),
      email: form.email,
      password: form.password
    };

    try {
      const response = await fetch("https://localhost:7000/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Server error");
      }

      // const savedUser = await response.json();

      alert("Registration Successful!");
      handleClear();
      navigate("/signin"); // Navigate to SignIn page
    } catch (error) {
      console.error("Error:", error);
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "linear-gradient(to right, #1e3c72, #2a5298)",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
        padding: "2rem 1rem",
        overflowY: "auto"
      }}
    >
      <h1 style={{ margin: "2rem 0 1rem", marginTop: "5rem" }}>Company Registration</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          padding: "2rem",
          borderRadius: "8px",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          width: "100%",
          maxWidth: "600px",
          marginTop: "1rem"
        }}
      >
        {[
          { label: "Name of the company *", name: "companyName" },
          { label: "Address Line 1 *", name: "address1" },
          { label: "Address Line 2", name: "address2" },
          { label: "Area / City *", name: "city" },
          { label: "State *", name: "state" },
          { label: "Pin *", name: "pin" },
          { label: "Tel", name: "tel" },
          { label: "Fax", name: "fax" },
          { label: "Name of Authorized Person *", name: "authorizedPerson" },
          { label: "Designation *", name: "designation" },
          { label: "Tel (Authorized)", name: "telAuth" },
          { label: "Cell", name: "cell" },
          { label: "Company's ST No", name: "stNo" },
          { label: "Company VAT Reg. No", name: "vatNo" },
          { label: "I Tax PAN (if needed)", name: "pan" },
          { label: "Email *", name: "email" },
          { label: "Password *", name: "password" }
        ].map(({ label, name }) => (
          <input
            key={name}
            type={name === "password" ? "password" : "text"}
            placeholder={label}
            name={name}
            value={form[name]}
            onChange={handleChange}
            style={{
              padding: "0.8rem",
              borderRadius: "4px",
              border: "none",
              fontSize: "1rem"
            }}
          />
        ))}

        <select
          name="holding"
          value={form.holding}
          onChange={handleChange}
          required
          style={{
            padding: "0.8rem",
            borderRadius: "4px",
            border: "none",
            fontSize: "1rem"
          }}
        >
          <option value="">-- Select Holding Type * --</option>
          <option value="Proprietary">Proprietary</option>
          <option value="Pvt. Ltd">Pvt. Ltd</option>
          <option value="Ltd">Ltd</option>
        </select>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem" }}>
          <button
            type="submit"
            style={{
              padding: "0.8rem 1.5rem",
              borderRadius: "4px",
              border: "none",
              fontWeight: "bold",
              backgroundColor: "#fff",
              color: "#2a5298",
              cursor: "pointer"
            }}
          >
            Submit
          </button>
          <button
            type="button"
            onClick={handleClear}
            style={{
              padding: "0.8rem 1.5rem",
              borderRadius: "4px",
              border: "none",
              fontWeight: "bold",
              backgroundColor: "#ccc",
              color: "#333",
              cursor: "pointer"
            }}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegistrationForm;
