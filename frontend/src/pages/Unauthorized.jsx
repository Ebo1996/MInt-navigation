import { Link } from "react-router-dom";

function Unauthorized() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-md rounded-2xl border border-red-100 bg-white/90 p-8 text-center shadow-lg">
        <h1 className="text-2xl font-bold text-red-700">Unauthorized</h1>
        <p className="mt-2 text-sm text-slate-700">You do not have permission to access this page.</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-mint-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-mint-800"
        >
          Go Home
        </Link>
      </section>
    </main>
  );
}

export default Unauthorized;
