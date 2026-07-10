import React from "react";
import {
  FiStar,
  FiUser,
  FiMail,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiMessageCircle,
} from "react-icons/fi";

const FeedbackCard = ({ feedback, onView, onRespond, onResolve }) => {
  const getStatusBadge = () => {
    if (feedback.resolved) {
      return {
        text: "Resolved",
        icon: <FiCheckCircle size={10} />,
        className: "bg-green-100 text-green-700",
      };
    }
    if (feedback.response) {
      return {
        text: "Responded",
        icon: <FiMail size={10} />,
        className: "bg-blue-100 text-blue-700",
      };
    }
    return {
      text: "Pending",
      icon: <FiClock size={10} />,
      className: "bg-yellow-100 text-yellow-700",
    };
  };

  const status = getStatusBadge();
  const date = new Date(feedback.createdAt).toLocaleDateString();
  const time = new Date(feedback.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-all">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        {/* Left Section - Feedback Content */}
        <div className="flex-1">
          {/* Rating & Status */}
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`text-sm ${
                    star <= feedback.rating
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {feedback.rating}.0
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${status.className}`}
            >
              {status.icon} {status.text}
            </span>
          </div>

          {/* Comment */}
          <p className="text-gray-700 text-sm mb-3">
            {feedback.comment || "No comment provided"}
          </p>

          {/* Visitor Info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <FiUser size={10} /> {feedback.visitor || "Anonymous"}
            </span>
            {feedback.visitorEmail && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FiMail size={10} /> {feedback.visitorEmail}
                </span>
              </>
            )}
            <span>•</span>
            <span>
              {date} at {time}
            </span>
          </div>

          {/* Department Info */}
          {feedback.departmentName && (
            <div className="mt-2 text-xs text-emerald-600">
              📍 {feedback.departmentName} • Room {feedback.departmentRoom}
            </div>
          )}

          {/* Response Preview (if exists) */}
          {feedback.response && (
            <div className="mt-3 pl-3 border-l-2 border-emerald-500 bg-emerald-50 p-2 rounded">
              <p className="text-xs text-emerald-700 font-medium">Response:</p>
              <p className="text-sm text-emerald-600 line-clamp-2">
                {feedback.response}
              </p>
            </div>
          )}
        </div>

        {/* Right Section - Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onView(feedback)}
            className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
            title="View Details"
          >
            <FiEye size={16} />
          </button>
          {!feedback.response && (
            <button
              onClick={() => onRespond(feedback)}
              className="p-2 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition"
              title="Respond"
            >
              <FiMessageCircle size={16} />
            </button>
          )}
          {!feedback.resolved && (
            <button
              onClick={() => onResolve(feedback._id)}
              className="p-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              title="Mark as Resolved"
            >
              <FiCheckCircle size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackCard;
