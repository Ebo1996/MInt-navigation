import React from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaClock, FaStar } from "react-icons/fa";

const DepartmentCard = ({ department }) => {
  // Floor colors for the floor badge
  const floorColors = {
    1: "bg-red-100 text-red-800 border-red-200",
    2: "bg-blue-100 text-blue-800 border-blue-200",
    3: "bg-green-100 text-green-800 border-green-200",
    4: "bg-purple-100 text-purple-800 border-purple-200",
    5: "bg-orange-100 text-orange-800 border-orange-200",
  };

  // Building colors for the building badge - NOW BEING USED
  const buildingColors = {
    A: "bg-emerald-100 text-emerald-800 border-emerald-200",
    B: "bg-blue-100 text-blue-800 border-blue-200",
  };

  // Ensure we have valid data with fallbacks
  const departmentName = department?.name?.en || "Department";
  const departmentDescription =
    department?.description?.en || "No description available";
  const departmentRoom = department?.room || "N/A";
  const departmentWalkingTime = department?.walkingTime || "N/A";
  const departmentRating = department?.rating?.toFixed(1) || "4.8";
  const departmentImage =
    department?.image ||
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600";
  const departmentFloor = department?.floor || 1;
  const departmentBuilding = department?.building || "A";
  const departmentId = department?.id;

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
      {/* Image Container */}
      <div className="h-44 overflow-hidden relative">
        <img
          src={departmentImage}
          alt={departmentName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600";
          }}
        />

        {/* Building Badge - NOW USING buildingColors */}
        <div
          className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold border ${buildingColors[departmentBuilding]}`}
        >
          {departmentBuilding === "A" ? "🏛️ Building A" : "🏢 Building B"}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title and Floor Badge */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-800 line-clamp-1">
            {departmentName}
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium border ${floorColors[departmentFloor] || "bg-gray-100 text-gray-800 border-gray-200"}`}
          >
            Floor {departmentFloor}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {departmentDescription}
        </p>

        {/* Room and Walking Time */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <FaMapMarkerAlt className="text-emerald-500" /> Room{" "}
            {departmentRoom}
          </span>
          <span className="flex items-center gap-1">
            <FaClock className="text-amber-500" /> {departmentWalkingTime}
          </span>
        </div>

        {/* Rating and View Link */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="flex items-center gap-1 text-sm font-medium text-gray-600">
            <FaStar className="text-yellow-400" /> {departmentRating}
          </span>
          <Link
            to={`/department/${departmentId}`}
            className="text-emerald-600 font-semibold hover:text-emerald-700 transition flex items-center gap-1 group-hover:gap-2"
          >
            View Details
            <span className="text-lg">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DepartmentCard;
