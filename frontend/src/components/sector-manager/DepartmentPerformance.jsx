import React from "react";
import { FiStar, FiTrendingUp, FiAward } from "react-icons/fi";

const DepartmentPerformance = ({ departments }) => {
  if (!departments || departments.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-gray-500 font-medium">
          No department data available
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Feedback will appear here once submitted
        </p>
      </div>
    );
  }

  // Calculate statistics
  const totalFeedback = departments.reduce(
    (sum, d) => sum + (d.feedbackCount || 0),
    0,
  );
  const avgRating = (
    departments.reduce((sum, d) => sum + d.rating, 0) / departments.length
  ).toFixed(1);
  const topPerformer = [...departments].sort((a, b) => b.rating - a.rating)[0];
  const lowestPerformer = [...departments].sort(
    (a, b) => a.rating - b.rating,
  )[0];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 text-center border border-emerald-100">
          <div className="text-2xl font-bold text-emerald-600">
            {departments.length}
          </div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">
            Departments
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 text-center border border-amber-100">
          <div className="text-2xl font-bold text-amber-600">{avgRating} ★</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">
            Avg Rating
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center border border-blue-100">
          <div className="text-2xl font-bold text-blue-600">
            {totalFeedback}
          </div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">
            Total Feedback
          </div>
        </div>
      </div>

      {/* Top & Bottom Performers */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <FiAward size={16} className="text-yellow-300" />
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
              Top Performer
            </span>
          </div>
          <div className="font-bold text-lg truncate">{topPerformer.name}</div>
          <div className="flex items-center gap-1 mt-1">
            <FiStar size={12} className="fill-yellow-300 text-yellow-300" />
            <span className="text-sm font-semibold">
              {topPerformer.rating} ★
            </span>
            <span className="text-xs opacity-80 ml-2">
              ({topPerformer.feedbackCount} feedback)
            </span>
          </div>
        </div>
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <FiTrendingUp size={16} className="text-orange-300" />
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
              Needs Improvement
            </span>
          </div>
          <div className="font-bold text-lg truncate">
            {lowestPerformer.name}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <FiStar size={12} className="fill-orange-300 text-orange-300" />
            <span className="text-sm font-semibold">
              {lowestPerformer.rating} ★
            </span>
            <span className="text-xs opacity-80 ml-2">
              ({lowestPerformer.feedbackCount} feedback)
            </span>
          </div>
        </div>
      </div>

      {/* Department List Header */}
      <div className="flex items-center justify-between pt-2">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
          All Departments
        </h3>
        <span className="text-[10px] text-gray-400">Rating</span>
      </div>

      {/* Department List */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {departments.map((dept, index) => {
          const ratingColor =
            dept.rating >= 4.5
              ? "green"
              : dept.rating >= 4
                ? "blue"
                : dept.rating >= 3
                  ? "yellow"
                  : "red";
          const ratingBg = {
            green:  "bg-green-500",
            blue:   "bg-blue-500",
            yellow: "bg-yellow-500",
            red:    "bg-red-500",
          }[ratingColor];

          return (
            <div key={dept.id} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 w-5">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-800 text-sm truncate max-w-[150px]">
                    {dept.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    <FiStar
                      size={10}
                      className="fill-amber-400 text-amber-400"
                    />
                    <span className="text-xs font-bold text-gray-700">
                      {dept.rating}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 w-16 text-right">
                    {dept.feedbackCount} fb
                  </span>
                </div>
              </div>
              <div className="relative">
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`${ratingBg} h-2 rounded-full transition-all duration-500 group-hover:opacity-80`}
                    style={{ width: `${(dept.rating / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DepartmentPerformance;
