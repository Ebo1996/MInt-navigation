import { useEffect, useState } from "react";
import api from "../api/api";
import LoadingSpinner from "./LoadingSpinner";
import StarRating from "./StarRating";
import { submitFeedback } from "../services/feedbackService";

function QRCodeBox({ department, allowPublicFeedback = true }) {
  const [loading, setLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [error, setError] = useState("");
  const [feedbackDraft, setFeedbackDraft] = useState({ rating: 4, comment: "" });
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const departmentId = department?._id;
  const departmentName = department?.name;
  const manager = department?.departmentManager;

  useEffect(() => {
    const fetchQr = async () => {
      if (!departmentId) {
        setQrUrl("");
        setError("");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/qr/${departmentId}`);
        const payload = response.data;
        const image = payload?.qrImage || payload?.qrUrl || payload?.imageUrl || payload?.url;

        if (!image) {
          throw new Error("QR image not found");
        }

        setQrUrl(image);
      } catch (err) {
        setQrUrl("");
        setError(err.response?.data?.message || "QR code unavailable");
      } finally {
        setLoading(false);
      }
    };

    fetchQr();
  }, [departmentId]);

  const handleSubmitFeedback = async (event) => {
    event.preventDefault();
    if (!departmentId || !feedbackDraft.comment.trim()) return;

    setFeedbackMessage("");
    try {
      await submitFeedback({
        departmentId,
        rating: feedbackDraft.rating,
        comment: feedbackDraft.comment.trim(),
        userName: "Visitor"
      });

      setFeedbackDraft({ rating: 4, comment: "" });
      setFeedbackMessage("Thanks! Your feedback was submitted.");
    } catch (submitError) {
      setFeedbackMessage(submitError.response?.data?.message || "Could not submit feedback.");
    }
  };

  return (
    <aside className="fade-in rounded-3xl border border-white/40 bg-white/35 p-6 shadow-xl backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-mint-900">
            {departmentName || "Department Profile"}
          </h3>
          <p className="mt-1 text-sm text-mint-800">
            {departmentName ? `Scan for ${departmentName}` : "Select a department card to view details and QR"}
          </p>
        </div>
        {department?.specialIdentifier ? (
          <span className="rounded-full bg-mint-100 px-3 py-1 text-xs font-bold text-mint-800">
            ID: {department.specialIdentifier}
          </span>
        ) : null}
      </div>

      {department ? (
        <div className="mt-4 rounded-2xl border border-mint-100 bg-white/70 p-4">
          <div className="flex items-center gap-3">
            <img
              src={manager?.image || "https://via.placeholder.com/72x72?text=Mgr"}
              alt={manager?.name || "Manager"}
              className="h-16 w-16 rounded-full border border-mint-200 object-cover"
            />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Department Manager</p>
              <p className="font-semibold text-slate-900">{manager?.name || "N/A"}</p>
              <p className="text-xs text-slate-600">{manager?.contactNo || "No manager contact"}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 text-sm text-slate-700">
            <p>
              <span className="font-semibold">Department:</span> {department.name}
            </p>
            <p>
              <span className="font-semibold">Sector:</span> {department.sector}
            </p>
            <p>
              <span className="font-semibold">Location:</span> Building {department.building} | Floor {department.floor} | Office{" "}
              {department.officeNumber}
            </p>
            {department.departmentContactNo || department.departmentEmail ? (
              <p>
                <span className="font-semibold">Department Contact:</span>{" "}
                {department.departmentContactNo || "-"}
                {department.departmentEmail ? ` | ${department.departmentEmail}` : ""}
              </p>
            ) : null}
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Services</p>
            <div className="flex flex-wrap gap-2">
              {(department.services || []).length > 0 ? (
                department.services.map((service) => (
                  <span
                    key={service}
                    className="rounded-full border border-mint-200 bg-mint-50 px-2.5 py-1 text-xs font-medium text-mint-800"
                  >
                    {service}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">No services listed</span>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex min-h-60 items-center justify-center rounded-2xl border border-mint-100 bg-white/70 p-4">
        {loading ? <LoadingSpinner label="Loading QR code..." /> : null}

        {!loading && qrUrl ? (
          <img src={qrUrl} alt="Department QR code" className="h-52 w-52 rounded-xl object-cover" />
        ) : null}

        {!loading && !qrUrl && !error ? <p className="text-sm text-slate-500">No QR selected</p> : null}
        {!loading && error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </div>

      {department && allowPublicFeedback ? (
        <form onSubmit={handleSubmitFeedback} className="mt-4 rounded-2xl border border-mint-100 bg-white/70 p-4">
          <p className="text-sm font-semibold text-mint-900">Visitor Feedback</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-slate-600">Rating:</span>
            <StarRating
              value={feedbackDraft.rating}
              onChange={(rating) => setFeedbackDraft((prev) => ({ ...prev, rating }))}
            />
          </div>
          <textarea
            rows={3}
            value={feedbackDraft.comment}
            onChange={(event) => setFeedbackDraft((prev) => ({ ...prev, comment: event.target.value }))}
            placeholder="Share your experience..."
            className="mt-2 w-full resize-none rounded-xl border border-mint-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-mint-300"
          />
          <button
            type="submit"
            className="mt-3 rounded-lg bg-mint-700 px-4 py-2 text-sm font-semibold text-white hover:bg-mint-800"
          >
            Submit Feedback
          </button>
          {feedbackMessage ? <p className="mt-2 text-xs text-slate-600">{feedbackMessage}</p> : null}
        </form>
      ) : null}
      {department && !allowPublicFeedback ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800">
          Public feedback is currently disabled by the administrator.
        </div>
      ) : null}
    </aside>
  );
}

export default QRCodeBox;
