import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { getSubcategoriesByCategory, getAllGroups, getCategoryById } from "../../utils/supabaseApi.js";

export default function NewCategoryDivisionPage() {
    const { id, name } = useParams(); // category id + name from route
    const [subcategories, setSubcategories] = useState([]);
    const navigate = useNavigate();
    const { state } = useLocation();
    const [groups, setGroups] = useState([]);
    const [categoryImage, setCategoryImage] = useState(null);

    useEffect(() => {
        (async () => {
            // 🔹 1. Fetch category by ID → to get image
            const catRes = await getCategoryById(id);
            if (catRes.success) setCategoryImage(catRes.category.image_url);

            // 🔹 2. Fetch subcategories
            const subsRes = await getSubcategoriesByCategory(id);
            if (subsRes.success) setSubcategories(subsRes.subcategories);

            // 🔹 3. Fetch groups
            const groupsRes = await getAllGroups();
            if (groupsRes.success) {
                const subIds = subsRes.subcategories.map((s) => s.id);
                const filtered = groupsRes.groups.filter((g) =>
                    subIds.includes(g.subcategories?.id)
                );
                setGroups(filtered);
            }
        })();
    }, [id]);

    return (
        <div className="min-h-screen mt-[-43px] bg-gray-50">
            {/* Banner */}
            <div className="flex justify-between align-middle bg-gradient-to-r px-5 from-gray-500 to-orange-400 py-8 text-center text-white">
                {/* <button
                    onClick={() =>
                        navigate("/all", {
                            state: {
                                fromAllCategories: true,
                                active: state.active,   // pass the active sidebar button
                                showDrawer: state.showDrawer // pass drawer open state
                            }
                        })
                    }
                >
                    ← Back
                </button> */}
                <h1 className="text-2xl font-bold self-center">{name}</h1>
                <img
                    src={categoryImage || "https://placehold.co/100x100?text=Category"}
                    alt={name}
                    className="w-25 h-25"
                />
            </div>

            <div className="px-4 py-6 space-y-8">
                {subcategories.map((sub) => (
                    <div key={sub.id}>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">{sub.name}</h2>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {groups
                                .filter((g) => g.subcategories?.id === sub.id)
                                .map((grp) => (
                                    <Link
                                        key={grp.id}
                                        to={`/productListing?group=${encodeURIComponent(
                                            grp.name
                                        )}&subcategory=${encodeURIComponent(
                                            sub.name
                                        )}&category=${encodeURIComponent(name)}`}
                                        className="bg-white rounded-lg shadow p-3 flex flex-col items-center hover:shadow-md transition"
                                    >
                                        <img
                                            src={
                                                grp.image_url ||
                                                "https://placehold.co/150x150?text=Group"
                                            }
                                            alt={grp.name}
                                            className="w-34 h-34 object-cover rounded-md"
                                        />
                                        <span className="mt-2 text-sm font-medium text-gray-700">
                                            {grp.name}
                                        </span>
                                    </Link>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
