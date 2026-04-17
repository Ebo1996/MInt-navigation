import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Filter, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import QRCodeBox from "../components/QRCodeBox";
import SkeletonCard from "../components/SkeletonCard";

function LandingPage() {
  const { token } = useAuth();
  const [allDepartments, setAllDepartments] = useState([]);
  const [query, setQuery] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [publicSettings, setPublicSettings] = useState({
    appName: "MInT Smart Visitor Guidance",
    allowPublicFeedback: true,
    announcement: "",
    announcementPriority: "normal"
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get("/departments/public");
        const list = response.data?.departments || [];
        setAllDepartments(list);
        setErrorMessage("");
      } catch (err) {
        setAllDepartments([]);
        setErrorMessage(err.response?.data?.message || "Could not load departments from backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchPublicSettings = async () => {
      try {
        const response = await api.get("/settings/public");
        setPublicSettings((prev) => ({
          ...prev,
          ...(response.data?.settings || {})
        }));
      } catch (error) {
        // keep defaults
      }
    };

    fetchPublicSettings();
  }, []);

  const filteredDepartments = useMemo(() => {
    return allDepartments.filter((item) => {
      const matchesQuery = query
        ? item.name?.toLowerCase().includes(query.toLowerCase()) ||
          item.sector?.toLowerCase().includes(query.toLowerCase())
        : true;

      const matchesBuilding = building ? item.building === building : true;
      const matchesFloor = floor ? String(item.floor) === floor : true;

      return matchesQuery && matchesBuilding && matchesFloor;
    });
  }, [allDepartments, query, building, floor]);
  const floorOptions = building === "A" ? [1, 2] : [1, 2, 3, 4, 5, 6, 7];

  useEffect(() => {
    if (building === "A" && floor && Number(floor) > 2) {
      setFloor("");
    }
  }, [building, floor]);

  useEffect(() => {
    setSelectedDepartment((prev) =>
      prev && filteredDepartments.find((item) => item._id === prev._id) ? prev : filteredDepartments[0] || null
    );
  }, [filteredDepartments]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f2fff9] via-[#eef6ff] to-[#ffffff] px-4 py-6 md:px-8 lg:px-12">
      <div className="pointer-events-none absolute -left-16 top-20 h-72 w-72 rounded-full bg-mint-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-20 h-72 w-72 rounded-full bg-cyan-200/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between rounded-2xl border border-white/40 bg-white/40 px-4 py-3 backdrop-blur md:px-6">
          <h1 className="text-xl font-black text-mint-900 md:text-2xl">{publicSettings.appName || "MInT Smart Visitor Guidance"}</h1>
          {!token ? (
            <Link
              to="/login"
              className="rounded-lg bg-mint-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-mint-800"
            >
              Login
            </Link>
          ) : null}
        </header>

        {publicSettings.announcement ? (
          <section
            className={`mb-5 rounded-2xl border p-3 text-sm font-medium ${
              publicSettings.announcementPriority === "high"
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : publicSettings.announcementPriority === "low"
                ? "border-sky-200 bg-sky-50 text-sky-800"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            {publicSettings.announcement}
          </section>
        ) : null}

        <section className="fade-in mb-8 rounded-3xl border border-white/50 bg-white/35 p-6 shadow-xl backdrop-blur-xl md:p-10">
          <h2 className="text-3xl font-black tracking-tight text-mint-900 md:text-5xl">WELCOME TO MInT</h2>
          <p className="mt-3 max-w-2xl text-sm text-mint-900/80 md:text-base">
            Search departments, filter building and floor, then scan QR for location guidance.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <label className="relative md:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-mint-700" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search department or sector..."
                className="animate-search w-full rounded-xl border border-mint-200 bg-white/90 py-3 pl-10 pr-3 text-sm outline-none transition duration-300 focus:scale-[1.01] focus:ring-2 focus:ring-mint-300"
              />
            </label>

            <label className="relative">
              <Filter className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-mint-700" />
              <select
                value={building}
                onChange={(event) => setBuilding(event.target.value)}
                className="w-full rounded-xl border border-mint-200 bg-white/90 py-3 pl-10 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-mint-300"
              >
                <option value="">Building (All)</option>
                <option value="A">Building A</option>
                <option value="B">Building B</option>
              </select>
            </label>

            <select
              value={floor}
              onChange={(event) => setFloor(event.target.value)}
              className="w-full rounded-xl border border-mint-200 bg-white/90 px-3 py-3 text-sm outline-none transition focus:ring-2 focus:ring-mint-300"
            >
              <option value="">Floor (All)</option>
              {floorOptions.map((num) => (
                <option key={num} value={String(num)}>
                  Floor {num}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : null}

            {!loading && filteredDepartments.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-600">
                {errorMessage || "No data found"}
              </div>
            ) : null}

            {!loading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredDepartments.map((department, index) => (
                  <button
                    type="button"
                    key={department._id}
                    onClick={() => setSelectedDepartment(department)}
                    className="fade-in group rounded-2xl border border-slate-200 bg-white/85 p-5 text-left shadow-sm transition duration-300 hover:scale-105 hover:shadow-md"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-mint-700">{department.sector}</p>
                      {department.specialIdentifier ? (
                        <span className="rounded-full bg-mint-100 px-2 py-0.5 text-[10px] font-bold text-mint-800">
                          {department.specialIdentifier}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-1 text-lg font-bold text-slate-900">{department.name}</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      Building {department.building} | Floor {department.floor} | Office {department.officeNumber}
                    </p>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <QRCodeBox department={selectedDepartment} allowPublicFeedback={publicSettings.allowPublicFeedback} />
        </section>

        <footer className="mt-10 overflow-hidden rounded-sm border-2 border-white/80 bg-[#0f7b87] text-white shadow-lg">
          <div className="grid gap-6 px-5 py-6 text-sm md:grid-cols-2 lg:grid-cols-4 lg:px-8">
            <div>
              <p className="leading-relaxed text-white/95">
                The government merged the former Ministry of Science and Technology and the Ministry of
                Communication and Information Technology to form the Ministry of Innovation and Technology in 2019.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold">Focus Areas</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-white/95">
                <li>Research</li>
                <li>Innovation</li>
                <li>Technology Transfer</li>
                <li>Digitalization</li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold">Contact</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-white/95">
                <li>Tel: +251118132191</li>
                <li>Email: contact@mint.gov.et</li>
                <li>Website: www.mint.gov.et</li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold">Connect to MInT</h3>
              <div className="mt-3 flex gap-3 text-white/95">
                <a href="#" aria-label="Facebook" className="flex h-6 w-6 items-center justify-center rounded-full border border-white/50 text-xs font-bold transition hover:text-white">
                  f
                </a>
                <a href="#" aria-label="Twitter" className="flex h-6 w-6 items-center justify-center rounded-full border border-white/50 text-[10px] font-bold transition hover:text-white">
                  X
                </a>
                <a href="#" aria-label="LinkedIn" className="flex h-6 w-6 items-center justify-center rounded-full border border-white/50 text-[10px] font-bold transition hover:text-white">
                  in
                </a>
                <a href="#" aria-label="Telegram" className="flex h-6 w-6 items-center justify-center rounded-full border border-white/50 text-[10px] font-bold transition hover:text-white">
                  tg
                </a>
                <a href="#" aria-label="YouTube" className="flex h-6 w-6 items-center justify-center rounded-full border border-white/50 text-[10px] font-bold transition hover:text-white">
                  yt
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-2 bg-[#0a6270] px-5 py-3 text-center text-sm text-white md:flex-row md:px-8">
            <p>©2026  MInT.All Rights Reserved</p>
            
          </div>
        </footer>
      </div>
    </main>
  );
}

export default LandingPage;
