import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const BbmDost = () => {
  const [editingDost, setEditingDost] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone_no: "",
    email: "",
    role: "",
    pincode: "",
    district: "",
    state: "",
    organization_name: "",
    gst_no: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [dosts, setDosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch all Dosts
  const fetchDosts = async () => {
    try {
      const res = await axios.get("https://ecommerce-8342.onrender.com/api/bbm-dost/all");
      setDosts(res.data.dosts || []);
    } catch (err) {
      console.error("Failed to fetch BBM Dosts:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete Dost
  const deleteDost = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this Dost?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`https://ecommerce-8342.onrender.com/api/bbm-dost/${id}`);
      await fetchDosts();
    } catch (err) {
      alert("Failed to delete BBM Dost");
      console.error(err);
    }
  };

  // ✅ Download Excel
  const downloadExcel = () => {
    if (dosts.length === 0) {
      alert("No data to download");
      return;
    }

    // Prepare data for Excel
    const excelData = dosts.map((dost) => ({
      ID: dost.id,
      Name: dost.name,
      Phone: dost.phone_no,
      Email: dost.email,
      Role: dost.role,
      Pincode: dost.pincode || "-",
      District: dost.district || "-",
      State: dost.state || "-",
      Organization: dost.organization_name || "-",
      GST: dost.gst_no || "-",
      "Created At": dost.created_at ? new Date(dost.created_at).toLocaleString() : "-",
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BBM Dosts");

    // Generate filename with current date
    const fileName = `BBM_Dosts_${new Date().toISOString().split("T")[0]}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, fileName);
  };

  // ✅ Add / Update Dost
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingDost) {
        await axios.put(`https://ecommerce-8342.onrender.com/api/bbm-dost/${editingDost.id}`, form);
      } else {
        await axios.post("https://ecommerce-8342.onrender.com/api/bbm-dost/add", form);
      }

      await fetchDosts();
      setShowForm(false);
      resetForm();
    } catch (err) {
      alert("Failed to save BBM Dost");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Reset Form
  const resetForm = () => {
    setForm({
      name: "",
      phone_no: "",
      email: "",
      role: "",
      pincode: "",
      district: "",
      state: "",
      organization_name: "",
      gst_no: "",
    });
    setEditingDost(null);
  };

  // ✅ Edit Dost
  const handleEdit = (dost) => {
    setEditingDost(dost);
    setForm({ ...dost });
    setShowForm(true);
  };

  useEffect(() => {
    fetchDosts();
  }, []);

  // ✅ Conditional Fields
  const isCustomer = form.role === "Customer";
  const isVendor = form.role === "Vendor";

  return (
    <div className="p-4 sm:p-6 max-w-screen-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">BBM Dosts</h1>

      {/* Add/Edit Form & Download Button */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => {
            setShowForm(!showForm);
            resetForm();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "➕ Add BBM Dost"}
        </button>

        <button
          onClick={downloadExcel}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
        >
          📥 Download Excel
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 p-4 bg-gray-100 rounded shadow space-y-4"
        >
          <h2 className="text-lg font-bold mb-4">
            {editingDost ? "Edit BBM Dost" : "Add BBM Dost"}
          </h2>

          {/* Common Fields */}
          <input
            type="text"
            placeholder="Full Name"
            className="w-full border px-3 py-2 rounded text-sm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Phone Number"
            className="w-full border px-3 py-2 rounded text-sm"
            value={form.phone_no}
            onChange={(e) => setForm({ ...form, phone_no: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full border px-3 py-2 rounded text-sm"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          {/* Role Selection */}
          <select
            className="w-full border px-3 py-2 rounded text-sm"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            required
          >
            <option value="">Select Role</option>
            <option value="Customer">Customer</option>
            <option value="Vendor">Vendor</option>
          </select>

          {/* Conditional Fields */}
          {isCustomer && (
            <>
              <input
                type="text"
                placeholder="Pincode"
                className="w-full border px-3 py-2 rounded text-sm"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              />
              <input
                type="text"
                placeholder="District"
                className="w-full border px-3 py-2 rounded text-sm"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
              />
              <input
                type="text"
                placeholder="State"
                className="w-full border px-3 py-2 rounded text-sm"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </>
          )}

          {isVendor && (
            <>
              <input
                type="text"
                placeholder="Organization Name"
                className="w-full border px-3 py-2 rounded text-sm"
                value={form.organization_name}
                onChange={(e) =>
                  setForm({ ...form, organization_name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="GST Number"
                className="w-full border px-3 py-2 rounded text-sm"
                value={form.gst_no}
                onChange={(e) => setForm({ ...form, gst_no: e.target.value })}
              />
            </>
          )}

          {/* Submit Button */}
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting
                ? "Saving..."
                : editingDost
                ? "Save Changes"
                : "Add Dost"}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      {loading ? (
        <p className="text-gray-500">Loading BBM Dosts...</p>
      ) : dosts.length === 0 ? (
        <p className="text-gray-500">No BBM Dosts found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow text-sm md:text-base">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Phone</th>
                <th className="py-2 px-4">Email</th>
                <th className="py-2 px-4">Role</th>
                <th className="py-2 px-4">Details</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dosts.map((dost) => (
                <tr key={dost.id} className="border-t">
                  <td className="py-2 px-4">{dost.id}</td>
                  <td className="py-2 px-4">{dost.name}</td>
                  <td className="py-2 px-4">{dost.phone_no}</td>
                  <td className="py-2 px-4">{dost.email}</td>
                  <td className="py-2 px-4">{dost.role}</td>
                  <td className="py-2 px-4">
                    {dost.role === "Customer" ? (
                      <>
                        <p>Pincode: {dost.pincode || "-"}</p>
                        <p>District: {dost.district || "-"}</p>
                        <p>State: {dost.state || "-"}</p>
                      </>
                    ) : (
                      <>
                        <p>Org: {dost.organization_name || "-"}</p>
                        <p>GST: {dost.gst_no || "-"}</p>
                      </>
                    )}
                  </td>
                  <td className="py-2 px-4 space-x-2">
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      onClick={() => handleEdit(dost)}
                    >
                      ✏️
                    </button>
                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      onClick={() => deleteDost(dost.id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BbmDost;