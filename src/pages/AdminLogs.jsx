import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import PageLayout from "../components/PageLayout";
import { BASE_URL } from "../config";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ScrollText,
} from "lucide-react";

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const token = useMemo(() => localStorage.getItem("token"), []);

  /* ================= FETCH LOGS FROM BACKEND ================= */
  const fetchLogs = useCallback(
    async (p = 1) => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          page: p,
          search,
          type: typeFilter,
          startDate,
          endDate,
        });

        const res = await axios.get(
          `${BASE_URL}/api/logs?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        setLogs(res.data.logs || []);
        setTotalPages(res.data.totalPages || 1);
        setPage(res.data.currentPage || 1);
      } catch (err) {
        console.error("Failed to load logs", err);
      } finally {
        setLoading(false);
      }
    },
    [token, search, typeFilter, startDate, endDate],
  );

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  /* ================= FILTER CHANGE ================= */
  useEffect(() => {
    fetchLogs(1);
  }, [search, typeFilter, startDate, endDate]);

  /* ================= CSV EXPORT ================= */
  const exportToCSV = () => {
    const header = ["Time", "Type", "Message", "Method", "URL", "Status"];

    const rows = logs.map((log) => {
      const meta = log.meta || {};
      return [
        new Date(log.timestamp).toLocaleString(),
        meta.type || "",
        meta.message || "",
        meta.method || "",
        meta.url || "",
        meta.status || "",
      ];
    });

    const csv =
      "data:text/csv;charset=utf-8," +
      [header, ...rows]
        .map((row) =>
          row
            .map((field) => `"${String(field).replace(/"/g, '""')}"`)
            .join(","),
        )
        .join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `logs_page_${page}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ================= STATUS COLOR ================= */
  const getStatusColor = (status) => {
    if (!status) return "text-gray-500 bg-gray-100";

    const code = Number(status);

    if (code >= 200 && code < 300) return "text-green-700 bg-green-100";
    if (code >= 400 && code < 500) return "text-yellow-700 bg-yellow-100";
    if (code >= 500) return "text-red-700 bg-red-100";

    return "text-gray-500 bg-gray-100";
  };

  /* ================= TYPE COLOR ================= */
  const getTypeColor = (type) => {
    switch (type) {
      case "error":
        return "text-red-700 bg-red-100";
      case "action":
        return "text-blue-700 bg-blue-100";
      case "api":
        return "text-indigo-700 bg-indigo-100";
      case "system":
        return "text-gray-700 bg-gray-100";
      default:
        return "text-gray-500 bg-gray-100";
    }
  };

  return (
    <PageLayout title="System Logs">
      <div className="w-full bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden h-[calc(100vh-4rem)] flex flex-col">
        {/* ================= FILTER BAR ================= */}
        <div className="p-4 border-b border-gray-100 grid md:grid-cols-5 gap-3 sticky top-0 bg-white z-20">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
          >
            <option value="">All Types</option>
            <option value="error">Error</option>
            <option value="action">Action</option>
            <option value="api">API</option>
            <option value="system">System</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
          />

          <button
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-4 py-2.5 text-sm hover:from-blue-700 hover:to-indigo-700 transition shadow-sm font-medium"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>

        {/* ================= TABLE ================= */}
        <div className="flex-1 overflow-auto">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-10 text-gray-400 text-sm">
              <Loader2 size={16} className="animate-spin" /> Loading logs...
            </div>
          )}

          {!loading && logs.length > 0 && (
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50/80 text-gray-500 text-[11px] uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Time</th>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Message</th>
                  <th className="px-4 py-3 text-left font-semibold">Method</th>
                  <th className="px-4 py-3 text-left font-semibold">URL</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {logs.map((log, index) => {
                  const meta = log.meta || {};

                  return (
                    <tr
                      key={log._id || index}
                      className={`hover:bg-blue-50/50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium ${getTypeColor(meta.type)}`}
                        >
                          {meta.type || "system"}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-pre-wrap wrap-break-words max-w-2xl text-xs text-gray-700">
                        {meta.message || "-"}
                      </td>

                      <td className="px-4 py-3 text-indigo-600 text-xs font-medium">
                        {meta.method || "-"}
                      </td>

                      <td className="px-4 py-3 wrap-break-words max-w-xl text-gray-400 text-xs">
                        {meta.url || "-"}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium ${getStatusColor(meta.status)}`}
                        >
                          {meta.status || "-"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {!loading && logs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <ScrollText size={32} className="mb-3 text-gray-300" />
              <p className="text-sm">No logs found.</p>
            </div>
          )}
        </div>

        {/* ================= PAGINATION ================= */}
        {!loading && (
          <div className="flex justify-between items-center px-5 py-3.5 border-t border-gray-100">
            <button
              onClick={() => fetchLogs(page - 1)}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition-colors font-medium"
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <span className="text-xs text-gray-500">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => fetchLogs(page + 1)}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition-colors font-medium"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
