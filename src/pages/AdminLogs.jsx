import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import PageLayout from "../components/PageLayout";
import { BASE_URL } from "../config";

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
      <div className="w-full bg-white shadow-md rounded-xl border overflow-hidden h-[calc(100vh-4rem)] flex flex-col">
        {/* ================= FILTER BAR ================= */}
        <div className="p-4 border-b grid md:grid-cols-5 gap-3 sticky top-0 bg-white z-20 shadow-sm">
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-1 focus:ring-indigo-400 focus:outline-none"
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
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
            className="border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
          />

          <button
            onClick={exportToCSV}
            className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-indigo-700 transition shadow-sm"
          >
            Export CSV
          </button>
        </div>

        {/* ================= TABLE ================= */}
        <div className="flex-1 overflow-auto">
          {loading && (
            <div className="text-center py-10 text-gray-500 text-sm">
              Loading logs...
            </div>
          )}

          {!loading && logs.length > 0 && (
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Message</th>
                  <th className="px-4 py-3 text-left">Method</th>
                  <th className="px-4 py-3 text-left">URL</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {logs.map((log, index) => {
                  const meta = log.meta || {};

                  return (
                    <tr
                      key={log._id || index}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                      }`}
                    >
                      <td className="px-4 py-3">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>

                      <td
                        className={`px-3 py-1 text-center text-sm font-medium ${getTypeColor(meta.type)}`}
                      >
                        {meta.type || "system"}
                      </td>

                      <td className="px-4 py-3 whitespace-pre-wrap wrap-break-words max-w-2xl">
                        {meta.message || "-"}
                      </td>

                      <td className="px-4 py-3 text-indigo-600">
                        {meta.method || "-"}
                      </td>

                      <td className="px-4 py-3 wrap-break-words max-w-xl text-gray-500">
                        {meta.url || "-"}
                      </td>

                      <td
                        className={`px-3 py-1 text-center text-sm font-medium ${getStatusColor(meta.status)}`}
                      >
                        {meta.status || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {!loading && logs.length === 0 && (
            <div className="text-center py-10 text-gray-500 text-sm">
              No logs found.
            </div>
          )}
        </div>

        {/* ================= PAGINATION ================= */}
        {!loading && (
          <div className="flex justify-between items-center px-5 py-4 border-t">
            <button
              onClick={() => fetchLogs(page - 1)}
              disabled={page === 1}
              className="px-4 py-1.5 text-sm border rounded-lg hover:bg-gray-100 disabled:opacity-40 transition"
            >
              ← Previous
            </button>

            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => fetchLogs(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-1.5 text-sm border rounded-lg hover:bg-gray-100 disabled:opacity-40 transition"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
