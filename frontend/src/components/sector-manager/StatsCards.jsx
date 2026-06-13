import React from "react";
import { FiMessageSquare, FiStar, FiTrendingUp, FiClock } from "react-icons/fi";

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: "Total Feedback",
      value: stats.totalFeedback || 0,
      icon: <FiMessageSquare size={20} />,
      color: "emerald",
    },
    {
      title: "Average Rating",
      value: stats.avgRating || 0,
      suffix: " ★",
      icon: <FiStar size={20} />,
      color: "amber",
    },
    {
      title: "Response Rate",
      value: stats.responseRate || 0,
      suffix: "%",
      icon: <FiTrendingUp size={20} />,
      color: "teal",
    },
    {
      title: "Pending",
      value: stats.pendingCount || 0,
      icon: <FiClock size={20} />,
      color: "orange",
    },
  ];

  const colorClasses = {
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    teal: "bg-teal-100 text-teal-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">{card.title}</p>
              <p className="text-3xl font-bold text-gray-800">
                {card.value}
                {card.suffix && <span className="text-lg">{card.suffix}</span>}
              </p>
            </div>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClasses[card.color]}`}
            >
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
