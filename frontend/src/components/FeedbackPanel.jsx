import { useEffect, useState } from "react";
import { MessageSquarePlus, Send, X } from "lucide-react";
import StarRating from "./StarRating";
import StatusBadge from "./StatusBadge";
import { respondToFeedback, submitFeedback } from "../services/feedbackService";

const ROLES = {
  ADMIN: "admin",
  GENERAL_MANAGER: "general_manager",
  DEPARTMENT_MANAGER: "department_manager"
};

function FeedbackPanel({
  feedbackItems = [],
  loading = false,
  canRespond = false,
  canSubmit = false,
  departmentId = "",
  userRole = "",
  userDepartmentId = ""
}) {
  const [items, setItems] = useState(feedbackItems);
  const [draft, setDraft] = useState({ rating: 4, comment: "" });
  const [modalItem, setModalItem] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setItems(feedbackItems);
  }, [feedbackItems]);

  const handleCreateFeedback = (event) => {
    event.preventDefault();
    setMessage("");
    if (!draft.comment.trim()) return;
    if (!departmentId) {
      setMessage("Select a department before submitting feedback.");
      return;
    }

    submitFeedback({
      departmentId,
      rating: draft.rating,
      comment: draft.comment,
      userName: "Visitor"
    })
      .then((created) => {
        setItems((prev) => [created, ...prev]);
        setDraft({ rating: 4, comment: "" });
        setMessage("Feedback submitted");
      })
      .catch((error) => {
        setMessage(error.response?.data?.message || "Failed to submit feedback");
      });
  };

  const submitResponse = () => {
    if (!modalItem || !responseText.trim()) return;
    setMessage("");

    const id = modalItem._id || modalItem.id;
    respondToFeedback(id, responseText)
      .then((updated) => {
        setItems((prev) =>
          prev.map((entry) =>
            (entry._id || entry.id) === (updated._id || updated.id) ? { ...entry, ...updated } : entry
          )
        );
        setModalItem(null);
        setResponseText("");
        setMessage("Response saved");
      })
      .catch((error) => {
        setMessage(error.response?.data?.message || "Failed to save response");
      });
  };

  const canRespondToItem = (item) => {
    if (!canRespond) return false;
    if (userRole === ROLES.GENERAL_MANAGER) return true;

    if (userRole === ROLES.DEPARTMENT_MANAGER) {
      const feedbackDepartmentId =
        typeof item.departmentId === "string" ? item.departmentId : item.departmentId?._id;
      return Boolean(userDepartmentId) && String(userDepartmentId) === String(feedbackDepartmentId);
    }

    return false;
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur md:p-6">
      <div className="mb-5 flex items-center gap-2">
        <MessageSquarePlus className="h-5 w-5 text-mint-700" />
        <h3 className="text-lg font-bold text-mint-900">Feedback Center</h3>
      </div>

      {canSubmit ? (
        <form onSubmit={handleCreateFeedback} className="mb-6 rounded-2xl border border-mint-100 bg-mint-50/70 p-4">
          <div className="mb-3 flex items-center gap-3">
            <span className="text-sm font-medium text-mint-900">Rating:</span>
            <StarRating value={draft.rating} onChange={(rating) => setDraft((prev) => ({ ...prev, rating }))} />
          </div>
          <textarea
            rows={3}
            value={draft.comment}
            onChange={(event) => setDraft((prev) => ({ ...prev, comment: event.target.value }))}
            placeholder="Write feedback..."
            className="w-full resize-none rounded-xl border border-mint-200 bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-mint-300"
          />
          <button
            type="submit"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-mint-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-mint-800"
          >
            <Send className="h-4 w-4" /> Submit
          </button>
          {message ? <p className="mt-2 text-xs text-slate-600">{message}</p> : null}
        </form>
      ) : null}

      {loading ? <p className="text-sm text-slate-500">Loading feedback...</p> : null}
      {!loading && items.length === 0 ? <p className="text-sm text-slate-500">No data found</p> : null}

      <div className="space-y-4">
        {items.map((item) => (
          <article key={item._id || item.id} className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:scale-[1.01]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">{item.userName || "Anonymous"}</p>
              <StatusBadge status={item.status} />
            </div>

            <div className="mt-2">
              <StarRating value={item.rating || 0} />
            </div>

            <p className="mt-2 text-sm text-slate-700">{item.comment || "No comment"}</p>

            {item.response ? <p className="mt-2 text-xs text-emerald-700">Response: {item.response}</p> : null}

            {canRespondToItem(item) && item.status !== "responded" ? (
              <button
                type="button"
                onClick={() => setModalItem(item)}
                className="mt-3 rounded-lg border border-mint-200 px-3 py-1.5 text-xs font-semibold text-mint-800 transition hover:bg-mint-50"
              >
                Respond
              </button>
            ) : null}
          </article>
        ))}
      </div>

      {modalItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-bold text-slate-900">Respond to feedback</h4>
              <button type="button" onClick={() => setModalItem(null)} className="rounded-md p-1 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              rows={4}
              value={responseText}
              onChange={(event) => setResponseText(event.target.value)}
              placeholder="Type response..."
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-mint-300"
            />
            <button
              type="button"
              onClick={submitResponse}
              className="mt-3 rounded-lg bg-mint-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-mint-800"
            >
              Save Response
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default FeedbackPanel;
