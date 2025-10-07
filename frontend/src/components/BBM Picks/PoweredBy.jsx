import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { getAllSavingZones } from "../../utils/supabaseApi";

export default function HomeFestivalGrid({ forceShow = false }) {
  const [savingZone, setSavingZone] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllSavingZones();
        setSavingZone(data || []);
      } catch (err) {
        console.error("Error fetching Saving Zones:", err.message);
        setSavingZone([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (!forceShow && location.pathname !== "/") {
    return null;
  }

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (savingZone.length === 0) {
    return;
  }

  return (
    <div className="flex flex-col items-center py-4 px-4 md:hidden bg-gradient-to-b from-[#e6e5d5] via-orange-100 to-white">
      {/* Header */}
      <div className="w-full max-w-xl mb-4 flex justify-center items-center">
        <h2 className="text-lg font-bold text-amber-700 mr-2">Corporate Celebration</h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-2xl">
        {/* First grid item spans 2 rows */}
        <Link to={`/saving-zone/${savingZone[0].id}`} key={savingZone[0].id} className="row-span-2 flex flex-col items-center bg-gradient-to-b from-amber-200 via-orange-100 to-amber-100 rounded-xl shadow-md justify-center">
        <div>
          <p className="text-sm font-extrabold text-center text-amber-700">
            {savingZone[0]?.name}
          </p>
          <img
            src={savingZone[0]?.image_url}
            alt={savingZone[0]?.name}
            className="w-full h-full object-contain"
          />
        </div>
        </Link>

        {/* Other grid items */}
        {savingZone.slice(1).map((zone) => (
          <Link to={`/saving-zone/${zone.id}`} key={zone.id} className="bg-gradient-to-b from-amber-200 via-orange-100 to-amber-100 rounded-xl shadow-md flex flex-col items-center justify-center">
          <div
            key={zone.id || zone.name}
            className="bg-gradient-to-b from-amber-200 via-orange-100 to-amber-100 rounded-xl shadow-md flex flex-col items-center justify-center"
          >
            <p className="text-sm font-extrabold text-center text-amber-700">
              {zone.name}
            </p>
            <img
              src={zone.image_url}
              alt={zone.name}
              className="w-30 h-30 object-contain"
            />
          </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
