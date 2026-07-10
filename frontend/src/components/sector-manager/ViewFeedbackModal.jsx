import React from "react";
import {
  FiX,
  FiStar,
  FiUser,
  FiMail,
  FiCalendar,
  FiMapPin,
  FiMessageCircle,
  FiCheckCircle,
} from "react-icons/fi";

const ViewFeedbackModal = ({ feedback, isOpen, onClose }) => {
  if (!isOpen || !feedback) return null;

  const date = new Date(feedback.createdAt).toLocaleString();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 p-5 rounded-t-2xl flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-white">Feedback Details</h2>
            <p className="text-emerald-100 text-xs mt-1">
              Case #{feedback._id?.slice(-6).toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Rating */}
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`text-2xl ${
                    star <= feedback.rating
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-2xl font-bold text-gray-800">
              {feedback.rating}.0 / 5.0
            </span>
          </div>

          {/* Comment */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-700 text-base leading-relaxed">
              "{feedback.comment || "No comment provided"}"
            </p>
          </div>

          {/* Visitor Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FiUser className="text-emerald-600" size={18} />
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                  Visitor Name
                </p>
                <p className="font-medium text-gray-800">
                  {feedback.visitor || "Anonymous"}
                </p>
              </div>
            </div>
            {feedback.visitorEmail && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FiMail className="text-emerald-600" size={18} />
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                    Email
                  </p>
                  <p className="font-medium text-gray-800">
                    {feedback.visitorEmail}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FiCalendar className="text-emerald-600" size={18} />
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                  Submitted
                </p>
                <p className="font-medium text-gray-800">{date}</p>
              </div>
            </div>
            {feedback.departmentName && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FiMapPin className="text-emerald-600" size={18} />
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                    Department
                  </p>
                  <p className="font-medium text-gray-800">
                    {feedback.departmentName} • Room {feedback.departmentRoom}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Response Section */}
          {feedback.response ? (
            <div className="bg-emerald-50 rounded-xl p-4 border-l-4 border-emerald-500">
              <div className="flex items-center gap-2 mb-2">
                <FiMessageCircle className="text-emerald-600" size={16} />
                <h3 className="font-semibold text-emerald-800">
                  Your Response
                </h3>
              </div>
              <p className="text-emerald-700">{feedback.response}</p>
              {feedback.respondedAt && (
                <p className="text-[10px] text-emerald-600 mt-2">
                  Responded on:{" "}
                  {new Date(feedback.respondedAt).toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-yellow-50 rounded-xl p-4 border-l-4 border-yellow-500">
              <p className="text-yellow-700 text-sm">
                No response yet. Click "Respond" to reply to this feedback.
              </p>
            </div>
          )}

          {/* Resolved Status */}
          {feedback.resolved && (
            <div className="bg-green-50 rounded-xl p-3 flex items-center gap-2">
              <FiCheckCircle className="text-green-600" size={16} />
              <span className="text-green-700 text-sm">Marked as resolved</span>
              {feedback.resolvedAt && (
                <span className="text-green-600 text-[10px] ml-auto">
                  {new Date(feedback.resolvedAt).toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewFeedbackModal;
