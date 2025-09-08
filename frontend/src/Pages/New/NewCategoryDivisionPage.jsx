import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getSubcategoriesByCategory, getAllGroups } from "../../utils/supabaseApi.js";

export default function NewCategoryDivisionPage() {
    const { id, name } = useParams(); // category id + name from route
    const [subcategories, setSubcategories] = useState([]);
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        (async () => {
            const subsRes = await getSubcategoriesByCategory(id);
            if (subsRes.success) setSubcategories(subsRes.subcategories);

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
        <div className="min-h-screen mt-[-40px] bg-gray-50">
            {/* Banner */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 py-8 text-center text-white">
                <h1 className="text-2xl font-bold">{name}</h1>
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
                                            className="w-28 h-28 object-cover rounded-md"
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
