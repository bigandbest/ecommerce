import React, { useEffect, useState } from "react";
import axios from "axios";
import { supabaseAdmin } from "../../utils/supabase"; // 👈 import your supabase client

export default function Notification() {
    const [notifications, setNotifications] = useState([]);
    const [form, setForm] = useState({
        heading: "",
        description: "",
        expiry_date: "",
        imageFile: null,
    });
    const [preview, setPreview] = useState(null);
    const [editingId, setEditingId] = useState(null);

    // ✅ Fetch notifications
    const fetchNotifications = async () => {
        try {
            const res = await axios.get("https://ecommerce-8342.onrender.com/api/notifications/collect");
            setNotifications(res.data.notifications);
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // ✅ Upload image to Supabase
    const uploadImage = async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { error: uploadError } = await supabaseAdmin.storage
            .from("notifications") // 👈 bucket name in Supabase
            .upload(fileName, file);

        if (uploadError) {
            console.error("Upload error:", uploadError.message);
            return null;
        }

        const { data } = supabaseAdmin.storage.from("notifications").getPublicUrl(fileName);
        return data.publicUrl; // 👈 return public URL
    };

    // ✅ Handle form submit (create or update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let imageUrl = null;

            if (form.imageFile) {
                imageUrl = await uploadImage(form.imageFile);
            }

            const payload = {
                heading: form.heading,
                description: form.description,
                expiry_date: form.expiry_date,
                image_url: imageUrl, // 👈 send only URL
            };

            if (editingId) {
                await axios.put(`https://ecommerce-8342.onrender.com/api/notifications/update/${editingId}`, payload);
            } else {
                await axios.post("https://ecommerce-8342.onrender.com/api/notifications/create", payload);
            }

            setForm({ heading: "", description: "", expiry_date: "", imageFile: null });
            setPreview(null);
            setEditingId(null);
            fetchNotifications();
        } catch (err) {
            console.error("Submit error:", err);
        }
    };

    // ✅ Delete
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this notification?")) return;
        try {
            await axios.delete(`https://ecommerce-8342.onrender.com/api/notifications/delete/${id}`);
            fetchNotifications();
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    // ✅ Load notification into form for editing
    const handleEdit = (notif) => {
        setForm({
            heading: notif.heading,
            description: notif.description,
            expiry_date: notif.expiry_date.split("T")[0],
            imageFile: null, // editing won’t auto re-upload, admin can upload a new one
        });
        setPreview(notif.image_url || null);
        setEditingId(notif.id);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Manage Notifications</h1>

            {/* Add/Edit Form */}
            <form onSubmit={handleSubmit} className="mb-6 space-y-3 bg-gray-100 p-4 rounded">
                <input
                    type="text"
                    placeholder="Heading"
                    value={form.heading}
                    onChange={(e) => setForm({ ...form, heading: e.target.value })}
                    className="w-full border rounded p-2"
                    required
                />
                <textarea
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border rounded p-2"
                    required
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        setForm({ ...form, imageFile: file });
                        setPreview(URL.createObjectURL(file));
                    }}
                    className="w-full border rounded p-2"
                />
                {preview && (
                    <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded mb-2" />
                )}
                <input
                    type="date"
                    value={form.expiry_date}
                    onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                    className="w-full border rounded p-2"
                    required
                />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                    {editingId ? "Update Notification" : "Add Notification"}
                </button>
            </form>

            {/* Notification List */}
            <table className="w-full border-collapse border">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border px-4 py-2">Image</th>
                        <th className="border px-4 py-2">Heading</th>
                        <th className="border px-4 py-2">Description</th>
                        <th className="border px-4 py-2">Expiry Date</th>
                        <th className="border px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {notifications.map((notif) => (
                        <tr key={notif.id}>
                            <td className="border px-4 py-2">
                                {notif.image_url ? (
                                    <img src={notif.image_url} alt="notif" className="w-20 h-20 object-cover" />
                                ) : (
                                    "No image"
                                )}
                            </td>
                            <td className="border px-4 py-2">{notif.heading}</td>
                            <td className="border px-4 py-2">{notif.description}</td>
                            <td className="border px-4 py-2">
                                {new Date(notif.expiry_date).toLocaleDateString()}
                            </td>
                            <td className="border px-4 py-2 flex gap-2">
                                <button
                                    onClick={() => handleEdit(notif)}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(notif.id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
