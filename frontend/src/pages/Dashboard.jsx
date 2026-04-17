import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import DashboardShell from "../layouts/DashboardShell";
import api from "../api/api";
import FeedbackPanel from "../components/FeedbackPanel";
import LoadingSpinner from "../components/LoadingSpinner";
import { fallbackFeedback } from "../utils/sampleFeedback";
import { useAuth } from "../context/AuthContext";
import { getAllFeedback, getDepartmentFeedback } from "../services/feedbackService";

function Dashboard() {
  const location = useLocation();
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const deptPromise = api.get("/departments");
        const feedbackPromise =
          user?.role === "department_manager"
            ? user?.departmentId
              ? getDepartmentFeedback(user.departmentId)
              : Promise.resolve([])
            : getAllFeedback();

        const [deptRes, feedbackRes] = await Promise.allSettled([deptPromise, feedbackPromise]);

        const deptData = deptRes.status === "fulfilled" ? deptRes.value.data?.departments || [] : [];
        setDepartments(deptData);

        if (feedbackRes.status === "fulfilled" && Array.isArray(feedbackRes.value)) {
          setFeedback(feedbackRes.value);
        } else {
          setFeedback(fallbackFeedback);
        }
      } catch (error) {
        setDepartments([]);
        setFeedback(fallbackFeedback);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.role, user?.departmentId]);

  const stats = useMemo(() => {
    const totalFeedback = feedback.length;
    const averageRating = totalFeedback
      ? (feedback.reduce((sum, item) => sum + (Number(item.rating) || 0), 0) / totalFeedback).toFixed(1)
      : "0.0";

    return [
      { label: "Total Departments", value: String(departments.length), gradient: "from-mint-500 to-emerald-600" },
      { label: "Total Feedback", value: String(totalFeedback), gradient: "from-cyan-500 to-blue-600" },
      { label: "Average Rating", value: averageRating, gradient: "from-amber-500 to-orange-600" }
    ];
  }, [departments, feedback]);

  const isFeedbackRoute = location.pathname.endsWith("/feedback");

  return (
    <DashboardShell
      title="Manager Dashboard"
      subtitle="Department and feedback performance overview"
      basePath="/dashboard"
    >
      {loading ? <LoadingSpinner label="Loading dashboard..." /> : null}

      {!loading && !isFeedbackRoute ? (
        <>
          <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((item) => (
              <article key={item.label} className={`rounded-2xl bg-gradient-to-r ${item.gradient} p-5 text-white shadow`}>
                <p className="text-sm font-medium/none opacity-90">{item.label}</p>
                <p className="mt-2 text-3xl font-black">{item.value}</p>
              </article>
            ))}
          </section>

          <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-[920px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Identifier</th>
                  <th className="px-4 py-3">Building</th>
                  <th className="px-4 py-3">Floor</th>
                  <th className="px-4 py-3">Office</th>
                  <th className="px-4 py-3">Contact / Email</th>
                </tr>
              </thead>
              <tbody>
                {departments.length === 0 ? (
                  <tr>
                    <td className="px-4 py-5 text-slate-500" colSpan={6}>
                      No data found
                    </td>
                  </tr>
                ) : (
                  departments.map((department) => (
                    <tr key={department._id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-semibold text-slate-800">{department.name}</td>
                      <td className="px-4 py-3 text-slate-600">{department.specialIdentifier || "-"}</td>
                      <td className="px-4 py-3 text-slate-600">{department.building}</td>
                      <td className="px-4 py-3 text-slate-600">{department.floor}</td>
                      <td className="px-4 py-3 text-slate-600">{department.officeNumber}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {department.departmentContactNo || "-"}
                        {department.departmentEmail ? ` / ${department.departmentEmail}` : ""}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        </>
      ) : null}

      {!loading && isFeedbackRoute ? (
        <FeedbackPanel
          feedbackItems={feedback}
          canRespond
          canSubmit={false}
          loading={false}
          departmentId={user?.departmentId || departments?.[0]?._id || ""}
          userRole={user?.role || ""}
          userDepartmentId={user?.departmentId || ""}
        />
      ) : null}
    </DashboardShell>
  );
}

export default Dashboard;
