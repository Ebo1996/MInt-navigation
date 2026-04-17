import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Settings, BarChart3, Building2, UserPlus } from "lucide-react";
import DashboardShell from "../layouts/DashboardShell";
import api from "../api/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { getFeedbackAnalyticsSummary } from "../services/feedbackService";

const adminLinks = [
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/create-department", label: "Create Department", icon: Building2 },
  { to: "/dashboard/create-manager", label: "Create Manager", icon: UserPlus },
  { to: "/dashboard/settings", label: "Settings", icon: Settings }
];

const emptyDepartmentForm = {
  name: "",
  sector: "",
  building: "A",
  floor: "1",
  officeNumber: "",
  specialIdentifier: "",
  departmentEmail: "",
  departmentContactNo: "",
  services: "",
  managerName: "",
  managerImage: "",
  managerContactNo: "",
  managerServices: ""
};

const parseCommaSeparated = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const stringifyList = (list = []) => (Array.isArray(list) ? list.join(", ") : "");

const toFormData = (department) => ({
  name: department?.name || "",
  sector: department?.sector || "",
  building: department?.building || "A",
  floor: String(department?.floor ?? 1),
  officeNumber: department?.officeNumber || "",
  specialIdentifier: department?.specialIdentifier || "",
  departmentEmail: department?.departmentEmail || "",
  departmentContactNo: department?.departmentContactNo || "",
  services: stringifyList(department?.services),
  managerName: department?.departmentManager?.name || "",
  managerImage: department?.departmentManager?.image || "",
  managerContactNo: department?.departmentManager?.contactNo || "",
  managerServices: stringifyList(department?.departmentManager?.services)
});

const toPayload = (form) => ({
  name: form.name.trim(),
  sector: form.sector.trim(),
  building: form.building,
  floor: Number(form.floor),
  officeNumber: form.officeNumber.trim(),
  specialIdentifier: form.specialIdentifier.trim(),
  departmentEmail: form.departmentEmail.trim(),
  departmentContactNo: form.departmentContactNo.trim(),
  services: parseCommaSeparated(form.services),
  departmentManager: {
    name: form.managerName.trim(),
    image: form.managerImage.trim(),
    contactNo: form.managerContactNo.trim(),
    services: parseCommaSeparated(form.managerServices)
  }
});

const emptyUserForm = {
  name: "",
  email: "",
  password: "",
  role: "department_manager",
  departmentId: ""
};

function AdminDashboard() {
  const location = useLocation();
  const isCreateDepartmentRoute = location.pathname.endsWith("/create-department");
  const isCreateManagerRoute = location.pathname.endsWith("/create-manager");
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({ totalFeedback: 0, averageRating: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [editingDepartmentId, setEditingDepartmentId] = useState("");
  const [departmentForm, setDepartmentForm] = useState(emptyDepartmentForm);
  const [formMessage, setFormMessage] = useState({ type: "", text: "" });
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [userSaving, setUserSaving] = useState(false);
  const [userMessage, setUserMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [deptRes, usersRes, analyticsRes] = await Promise.allSettled([
          api.get("/departments"),
          api.get("/auth/users"),
          getFeedbackAnalyticsSummary()
        ]);

        const deptData = deptRes.status === "fulfilled" ? deptRes.value.data?.departments || [] : [];
        setDepartments(deptData);

        if (usersRes.status === "fulfilled") {
          setUsers(usersRes.value.data?.users || []);
        } else {
          setUsers([]);
        }

        if (analyticsRes.status === "fulfilled") {
          setAnalytics(analyticsRes.value || { totalFeedback: 0, averageRating: 0 });
        } else {
          setAnalytics({ totalFeedback: 0, averageRating: 0 });
        }
      } catch (error) {
        setDepartments([]);
        setUsers([]);
        setAnalytics({ totalFeedback: 0, averageRating: 0 });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const sectionId = location.pathname.endsWith("/create-manager")
      ? "create-manager-section"
      : location.pathname.endsWith("/create-department")
      ? "create-department-section"
      : "";

    if (!sectionId) return;

    const timer = setTimeout(() => {
      const section = document.getElementById(sectionId);
      section?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const stats = useMemo(() => {
    const totalFeedback = analytics.totalFeedback || 0;
    const averageRating = Number(analytics.averageRating || 0).toFixed(1);

    return [
      { label: "Total Departments", value: String(departments.length), gradient: "from-violet-500 to-indigo-600" },
      { label: "Total Users", value: String(users.length), gradient: "from-fuchsia-500 to-purple-700" },
      { label: "Total Feedback", value: String(totalFeedback), gradient: "from-sky-500 to-blue-700" },
      { label: "Average Rating", value: averageRating, gradient: "from-emerald-500 to-green-700" }
    ];
  }, [analytics.averageRating, analytics.totalFeedback, departments.length, users.length]);

  const isEditing = Boolean(editingDepartmentId);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setDepartmentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStartEdit = (department) => {
    setEditingDepartmentId(department._id);
    setDepartmentForm(toFormData(department));
    setFormMessage({ type: "", text: "" });
  };

  const resetForm = () => {
    setDepartmentForm(emptyDepartmentForm);
    setEditingDepartmentId("");
  };

  const handleSubmitDepartment = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormMessage({ type: "", text: "" });

    const payload = toPayload(departmentForm);

    try {
      if (isEditing) {
        const response = await api.put(`/departments/${editingDepartmentId}`, payload);
        const updatedDepartment = response.data?.department;

        setDepartments((prev) =>
          prev.map((department) => (department._id === editingDepartmentId ? updatedDepartment : department))
        );
        setFormMessage({ type: "success", text: "Department updated successfully." });
      } else {
        const response = await api.post("/departments", payload);
        const createdDepartment = response.data?.department;
        setDepartments((prev) => [createdDepartment, ...prev]);
        setFormMessage({ type: "success", text: "Department created successfully." });
      }

      resetForm();
    } catch (error) {
      setFormMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to save department."
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDepartment = async (departmentId, departmentName) => {
    const shouldDelete = window.confirm(`Delete "${departmentName}"? This action cannot be undone.`);
    if (!shouldDelete) return;

    setDeletingId(departmentId);
    setFormMessage({ type: "", text: "" });

    try {
      await api.delete(`/departments/${departmentId}`);
      setDepartments((prev) => prev.filter((department) => department._id !== departmentId));

      if (editingDepartmentId === departmentId) {
        resetForm();
      }

      setFormMessage({ type: "success", text: "Department deleted successfully." });
    } catch (error) {
      setFormMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to delete department."
      });
    } finally {
      setDeletingId("");
    }
  };

  const handleUserFormChange = (event) => {
    const { name, value } = event.target;
    setUserForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "role" && value === "general_manager" ? { departmentId: "" } : {})
    }));
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setUserSaving(true);
    setUserMessage({ type: "", text: "" });

    const payload = {
      name: userForm.name.trim(),
      email: userForm.email.trim(),
      password: userForm.password,
      role: userForm.role,
      ...(userForm.role === "department_manager" ? { departmentId: userForm.departmentId } : {})
    };

    try {
      const response = await api.post("/auth/register", payload);
      const created = response.data?.data?.user;
      if (created) {
        setUsers((prev) => [created, ...prev]);
      }
      setUserForm(emptyUserForm);
      setUserMessage({ type: "success", text: "Manager account created successfully." });
    } catch (error) {
      setUserMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to create manager account."
      });
    } finally {
      setUserSaving(false);
    }
  };

  const rightSidebar = (
    <div className="space-y-3 text-xs text-slate-600">
      <button
        type="button"
        onClick={() => document.getElementById("create-department-section")?.scrollIntoView({ behavior: "smooth" })}
        className="w-full rounded-lg bg-indigo-50 p-2 text-left font-semibold text-indigo-700 hover:bg-indigo-100"
      >
        Quick Action: Create Department
      </button>
      <button
        type="button"
        onClick={() => document.getElementById("create-manager-section")?.scrollIntoView({ behavior: "smooth" })}
        className="w-full rounded-lg bg-teal-50 p-2 text-left font-semibold text-teal-700 hover:bg-teal-100"
      >
        Quick Action: Create Manager
      </button>
      <p className="rounded-lg bg-slate-50 p-2">Analytics summary is shown on overview cards above.</p>
    </div>
  );

  return (
    <DashboardShell
      title={isCreateDepartmentRoute ? "Create Department" : "Create Manager"}
      subtitle={isCreateDepartmentRoute ? "Manage department records and details" : "Create and assign manager accounts"}
      links={adminLinks}
      rightSidebar={rightSidebar}
    >
      {loading ? <LoadingSpinner label="Loading admin dashboard..." /> : null}

      {!loading ? (
        <>
          <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => (
              <article key={item.label} className={`rounded-2xl bg-gradient-to-r ${item.gradient} p-5 text-white shadow`}>
                <p className="text-sm font-medium/none opacity-90">{item.label}</p>
                <p className="mt-2 text-3xl font-black">{item.value}</p>
              </article>
            ))}
          </section>

          {isCreateDepartmentRoute ? (
            <section id="create-department-section" className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-900">{isEditing ? "Edit Department" : "Add Department"}</h2>
              {isEditing ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>

            {formMessage.text ? (
              <p
                className={`mb-4 rounded-lg px-3 py-2 text-sm ${
                  formMessage.type === "error" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {formMessage.text}
              </p>
            ) : null}

            <form onSubmit={handleSubmitDepartment} className="grid gap-3 md:grid-cols-2">
              <input
                name="name"
                value={departmentForm.name}
                onChange={handleFormChange}
                required
                placeholder="Department Name"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <input
                name="sector"
                value={departmentForm.sector}
                onChange={handleFormChange}
                required
                placeholder="Sector"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <select
                name="building"
                value={departmentForm.building}
                onChange={handleFormChange}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="A">Building A</option>
                <option value="B">Building B</option>
              </select>
              <input
                name="floor"
                value={departmentForm.floor}
                onChange={handleFormChange}
                type="number"
                min="1"
                max="7"
                required
                placeholder="Floor"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <input
                name="officeNumber"
                value={departmentForm.officeNumber}
                onChange={handleFormChange}
                required
                placeholder="Office Number"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <input
                name="specialIdentifier"
                value={departmentForm.specialIdentifier}
                onChange={handleFormChange}
                placeholder="Special Identifier (e.g., MINT-B2-ICTI)"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <input
                name="departmentEmail"
                value={departmentForm.departmentEmail}
                onChange={handleFormChange}
                type="email"
                placeholder="Department Email (optional)"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <input
                name="departmentContactNo"
                value={departmentForm.departmentContactNo}
                onChange={handleFormChange}
                placeholder="Department Contact (optional)"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <input
                name="services"
                value={departmentForm.services}
                onChange={handleFormChange}
                placeholder="Department Services (comma separated)"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <input
                name="managerName"
                value={departmentForm.managerName}
                onChange={handleFormChange}
                required
                placeholder="Manager Name"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <input
                name="managerContactNo"
                value={departmentForm.managerContactNo}
                onChange={handleFormChange}
                required
                placeholder="Manager Contact Number"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <input
                name="managerImage"
                value={departmentForm.managerImage}
                onChange={handleFormChange}
                required
                placeholder="Manager Image URL"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none md:col-span-2"
              />
              <input
                name="managerServices"
                value={departmentForm.managerServices}
                onChange={handleFormChange}
                placeholder="Manager Services (comma separated)"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none md:col-span-2"
              />
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2"
              >
                {saving ? "Saving..." : isEditing ? "Update Department" : "Create Department"}
              </button>
            </form>
            </section>
          ) : null}

          {isCreateManagerRoute ? (
            <section id="create-manager-section" className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Create Manager User</h2>
            {userMessage.text ? (
              <p
                className={`mb-4 rounded-lg px-3 py-2 text-sm ${
                  userMessage.type === "error" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {userMessage.text}
              </p>
            ) : null}

            <form onSubmit={handleCreateUser} className="grid gap-3 md:grid-cols-2">
              <input
                name="name"
                value={userForm.name}
                onChange={handleUserFormChange}
                required
                placeholder="Full Name"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <input
                name="email"
                value={userForm.email}
                onChange={handleUserFormChange}
                type="email"
                required
                placeholder="Email"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <input
                name="password"
                value={userForm.password}
                onChange={handleUserFormChange}
                type="password"
                minLength={6}
                required
                placeholder="Password (min 6 chars)"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <select
                name="role"
                value={userForm.role}
                onChange={handleUserFormChange}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="department_manager">Department Manager</option>
                <option value="general_manager">General Feedback Manager</option>
              </select>

              {userForm.role === "department_manager" ? (
                <select
                  name="departmentId"
                  value={userForm.departmentId}
                  onChange={handleUserFormChange}
                  required
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none md:col-span-2"
                >
                  <option value="">Assign Department</option>
                  {departments.map((department) => (
                    <option key={department._id} value={department._id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              ) : null}

              <button
                type="submit"
                disabled={userSaving}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2"
              >
                {userSaving ? "Creating..." : "Create Manager"}
              </button>
            </form>
            </section>
          ) : null}

          {isCreateDepartmentRoute ? (
            <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-[1200px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Identifier</th>
                  <th className="px-4 py-3">Sector</th>
                  <th className="px-4 py-3">Building</th>
                  <th className="px-4 py-3">Floor</th>
                  <th className="px-4 py-3">Office</th>
                  <th className="px-4 py-3">Contact / Email</th>
                  <th className="px-4 py-3">Manager</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.length === 0 ? (
                  <tr>
                    <td className="px-4 py-5 text-slate-500" colSpan={9}>
                      No data found
                    </td>
                  </tr>
                ) : (
                  departments.map((department) => (
                    <tr key={department._id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-semibold text-slate-800">{department.name}</td>
                      <td className="px-4 py-3 text-slate-600">{department.specialIdentifier || "-"}</td>
                      <td className="px-4 py-3 text-slate-600">{department.sector}</td>
                      <td className="px-4 py-3 text-slate-600">{department.building}</td>
                      <td className="px-4 py-3 text-slate-600">{department.floor}</td>
                      <td className="px-4 py-3 text-slate-600">{department.officeNumber}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {department.departmentContactNo || "-"}
                        {department.departmentEmail ? ` / ${department.departmentEmail}` : ""}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{department.departmentManager?.name || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(department)}
                            className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === department._id}
                            onClick={() => handleDeleteDepartment(department._id, department.name)}
                            className="rounded-md bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {deletingId === department._id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </section>
          ) : null}
        </>
      ) : null}
    </DashboardShell>
  );
}

export default AdminDashboard;
