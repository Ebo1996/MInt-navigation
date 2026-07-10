import React, { useState } from "react";
import { FiX, FiSend, FiStar, FiMail, FiAlertCircle } from "react-icons/fi";
import { toast } from "react-hot-toast";

const RespondModal = ({ feedback, isOpen, onClose, onSubmit }) => {
  const [response, setResponse] = useState(feedback?.response || "");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !feedback) return null;

  const handleSubmit = async () => {
    if (!response.trim()) {
      toast.error("Please enter a response message");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(feedback._id, response);
      toast.success("Response sent! Email notification delivered.");
      onClose();
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Failed to send response");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 rounded-t-2xl flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-white">
              Respond to Feedback
            </h2>
            <p className="text-emerald-100 text-xs mt-1">
              Reply to visitor feedback
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
        <div className="p-5">
          {/* Original Feedback Preview */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-1 mb-2">
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
            <p className="text-gray-700 text-sm">
              {feedback.comment || "No comment provided"}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              — {feedback.visitor || "Anonymous"}
            </p>
            {feedback.visitorEmail && (
              <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                <FiMail size={10} /> {feedback.visitorEmail}
              </p>
            )}
          </div>

          {/* Response Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Response
            </label>
            <textarea
              rows="5"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              placeholder="Type your response here..."
            />
          </div>

          {/* Email Notification Info */}
          {feedback.visitorEmail ? (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2 border border-blue-100">
              <FiMail
                className="text-blue-600 mt-0.5 flex-shrink-0"
                size={14}
              />
              <p className="text-xs text-blue-700">
                An email notification will be sent to{" "}
                <strong>{feedback.visitorEmail}</strong> when you send this
                response.
              </p>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg flex items-start gap-2 border border-gray-200">
              <FiAlertCircle
                className="text-gray-500 mt-0.5 flex-shrink-0"
                size={14}
              />
              <p className="text-xs text-gray-500">
                No email address provided. Response will be saved but no email
                notification will be sent.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50 font-medium text-sm shadow-sm"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiSend size={14} />
              )}
              {submitting ? "Sending..." : "Send Response"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RespondModal;
