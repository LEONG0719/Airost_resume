import axios from "axios";
import CryptoJS from "crypto-js";
import { startOfToday, subDays, subMonths, subYears } from "date-fns";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import Datepicker from "../components/Datepicker";
import Switcher1 from "../components/Switcher1";
import Header from "../partials/Header";
import Sidebar from "../partials/Sidebar";

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [page, setPage] = useState(1);
  const [fuzzyEnabled, setFuzzyEnabled] = useState(false);
  const [personInfo, setPersonInfo] = useState(null);
  const [customRange, setCustomRange] = useState({ from: null, to: null });

  const AES_KEY = "qE0S4wgKLC3RUP1dLXlkSGKj1xUeQYRG";

  const options = [
    {
      id: 0,
      period: "Today",
      getRange: () => [startOfToday(), startOfToday()],
    },
    {
      id: 1,
      period: "Last 7 Days",
      getRange: () => [subDays(startOfToday(), 6), startOfToday()],
    },
    {
      id: 2,
      period: "Last Month",
      getRange: () => [subMonths(startOfToday(), 1), startOfToday()],
    },
    {
      id: 3,
      period: "Last 12 Months",
      getRange: () => [subYears(startOfToday(), 1), startOfToday()],
    },
    {
      id: 4,
      period: "All Time",
      getRange: () => [new Date(2000, 0, 1), startOfToday()],
    },
  ];

  const encryptPayload = (payload) => {
    const key = CryptoJS.enc.Utf8.parse(AES_KEY);
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
  };

  const fetchLogsWithPage = (pageNo) => {
    const dateId = parseInt(Cookies.get("date_range_id") || "2");
    const [start, end] = options[dateId].getRange();
    const rawPayload = {
      pageNo,
      pageSize: 10,
      startCheckTime: start.toISOString(),
      endCheckTime: end.toISOString(),
    };
    const encryptedPayload = encryptPayload(rawPayload);
    sendEncryptedLogRequest(encryptedPayload);
  };

  const fetchLogsByRange = (start, end, pageNo = 1) => {
    const rawPayload = {
      pageNo,
      pageSize: 10,
      startCheckTime: start.toISOString(),
      endCheckTime: end.toISOString(),
    };
    const encryptedPayload = encryptPayload(rawPayload);
    sendEncryptedLogRequest(encryptedPayload);
  };

  useEffect(() => {
    const cookie = document.cookie;
    const roleMatch = cookie.match(/role=(admin|user)/);
    const dateId = parseInt(Cookies.get("date_range_id") || "2");
    const [start, end] = options[dateId].getRange();
    Cookies.set("date_range_start", start.toISOString(), { expires: 7 });
    Cookies.set("date_range_end", end.toISOString(), { expires: 7 });

    if (roleMatch) setRole(roleMatch[1]);

    if (roleMatch?.[1] === "admin" && !fuzzyEnabled) {
      setPage(1);
      fetchLogsWithPage(1);
    }
  }, [fuzzyEnabled]);

  const decryptResponse = (base64) => {
    try {
      const key = CryptoJS.enc.Utf8.parse(AES_KEY);
      const decrypted = CryptoJS.AES.decrypt(base64, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });
      const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(plaintext);
    } catch (err) {
      console.error("Failed to decrypt:", err);
      return null;
    }
  };

  const sendEncryptedLogRequest = async (encryptedPayload) => {
    try {
      const res = await axios.post(
        "https://whohk.olgtx.dpdns.org/chengfeng-attendance",
        {
          mode: "log",
          encryptedPayload,
        },
      );
      const decrypted = decryptResponse(res.data.data);
      if (decrypted?.page?.result) {
        setAttendanceLogs(decrypted.page.result);
      } else {
        setAttendanceLogs([]);
      }
    } catch (err) {
      console.error("Encrypted log fetch failed:", err);
    }
  };

  const fuzzyCheck = async (keyword) => {
    try {
      const res = await axios.post(
        "https://whohk.olgtx.dpdns.org/chengfeng-attendance",
        {
          mode: "search",
          fuzzyName: keyword,
        },
      );
      const decryptedSearch = decryptResponse(res.data.data);
      if (
        !decryptedSearch ||
        !decryptedSearch.result ||
        decryptedSearch.result.length === 0
      ) {
        setAttendanceLogs([]);
        return;
      }

      const person = decryptedSearch.result[0];
      const { name, internalNum } = person;

      setPersonInfo({ name, internalNum });

      const dateId = parseInt(Cookies.get("date_range_id") || "2");
      const [start, end] = options[dateId].getRange();

      let allResults = [];
      let pageNo = 1;
      let keepFetching = true;

      while (keepFetching) {
        const searchDetailPayload = {
          pageNo,
          pageSize: 10,
          startCheckTime: start.toISOString(),
          endCheckTime: new Date(end.getTime() + 86399999).toISOString(),
          name,
          internalNum,
        };

        const encryptedPayload = encryptPayload(searchDetailPayload);

        const res2 = await axios.post(
          "https://whohk.olgtx.dpdns.org/chengfeng-attendance",
          {
            mode: "search_detail",
            encryptedPayload,
          },
        );

        const decryptedDetail = decryptResponse(res2.data.data);
        const pageResult = decryptedDetail?.page?.result || [];

        allResults = allResults.concat(pageResult);

        if (pageResult.length < 10) {
          keepFetching = false;
        } else {
          pageNo++;
        }
      }

      setPage(1);
      setAttendanceLogs(allResults);
    } catch (err) {
      console.error("Fuzzy check failed:", err);
      setAttendanceLogs([]);
    }
  };

  const handleAdminSearch = () => {
    if (searchName) fuzzyCheck(searchName);
  };

  const applyCustomRange = () => {
    if (customRange.from && customRange.to) {
      setPage(1);
      if (!fuzzyEnabled && role === "admin") {
        const end = new Date(customRange.to.getTime() + 86399999);
        fetchLogsByRange(customRange.from, end, 1);
      }
    }
  };

  const paginatedLogs = attendanceLogs;

  return (
    <div className="flex h-screen overflow-hidden text-gray-800 dark:text-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Datepicker align="right" onChange={setCustomRange} />
            <button className="btn btn-primary" onClick={applyCustomRange}>
              Apply
            </button>
          </div>
          <h2 className="text-2xl font-bold mb-6">Attendance Check</h2>

          {role === "admin" && (
            <div className="mb-6 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Switcher1
                  isChecked={fuzzyEnabled}
                  onToggle={() => setFuzzyEnabled((prev) => !prev)}
                />
                <span className="text-sm">Enable Fuzzy Search</span>
                {fuzzyEnabled && personInfo && (
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Matched Person:</strong> 🧑‍💼{personInfo.name} 🪪
                    {personInfo.internalNum}
                  </div>
                )}
              </div>
              {fuzzyEnabled && (
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdminSearch()}
                    placeholder="Search by Name"
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleAdminSearch}
                  >
                    Fuzzy Search
                  </button>
                </div>
              )}
            </div>
          )}

          {attendanceLogs.length > 0 && (
            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <table className="min-w-full text-sm table-auto">
                <thead className="bg-gray-100 dark:bg-gray-700 text-left">
                  <tr>
                    <th className="px-4 py-3 border-b font-semibold">Time</th>
                    <th className="px-4 py-3 border-b font-semibold">Status</th>
                    <th className="px-4 py-3 border-b font-semibold">Device</th>
                    <th className="px-4 py-3 border-b font-semibold">
                      Location
                    </th>
                    <th className="px-4 py-3 border-b font-semibold">
                      Snapshot / Avatar
                    </th>
                    <th className="px-4 py-3 border-b font-semibold">Age</th>
                    <th className="px-4 py-3 border-b font-semibold">Type</th>
                    <th className="px-4 py-3 border-b font-semibold">Reason</th>
                    <th className="px-4 py-3 border-b font-semibold">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.map((log, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-3 border-t">
                        {new Date(log.checkTimeDate).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 border-t font-medium flex items-center gap-2">
                        {log.passStatus === "PASSED" ? (
                          <>
                            <span className="text-green-500">✔️</span>
                            <span className="text-green-600 dark:text-green-400">
                              PASSED
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-red-500">❌</span>
                            <span className="text-red-600 dark:text-red-400">
                              {log.passStatus === "DENYED"
                                ? "DENIED"
                                : log.passStatus}
                            </span>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 border-t">{log.deviceName}</td>
                      <td className="px-4 py-3 border-t">
                        {log.deviceLocation === "北京市海淀区马连洼街道"
                          ? "Johor"
                          : log.deviceLocation}
                      </td>
                      <td className="px-4 py-3 border-t">
                        <div className="flex items-center gap-2">
                          {log.snapshotPath ? (
                            <img
                              src={log.snapshotPath}
                              alt="Snapshot"
                              className="h-16 w-16 rounded object-cover border"
                            />
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                          {log.passStatus === "PASSED" && log.avatarPath && (
                            <img
                              src={log.avatarPath}
                              alt="Avatar"
                              className="h-10 w-10 rounded-full border-2 border-green-500"
                              title="Identity Avatar"
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 border-t">{log.age || "—"}</td>
                      <td className="px-4 py-3 border-t flex items-center gap-2">
                        {log.checkType === "FACE" && <span>🧑‍💼</span>}
                        {log.checkType === "CARD" && <span>🪪</span>}
                        {log.checkType === "QR" && <span>📱</span>}
                        {!["FACE", "CARD", "QR"].includes(log.checkType) && (
                          <span>🛠️</span>
                        )}
                        <span>{log.checkType}</span>
                      </td>
                      <td className="px-4 py-3 border-t">
                        {log.noPassReason || "—"}
                      </td>
                      <td className="px-4 py-3 border-t">
                        {log.similarityScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination always visible */}
              <div className="mt-6 flex justify-between items-center p-4">
                <button
                  onClick={() => {
                    const prev = Math.max(1, page - 1);
                    setPage(prev);
                    if (!fuzzyEnabled && role === "admin")
                      fetchLogsWithPage(prev);
                  }}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded">
                  Page {page}
                </span>
                <button
                  onClick={() => {
                    const next = page + 1;
                    setPage(next);
                    if (!fuzzyEnabled && role === "admin")
                      fetchLogsWithPage(next);
                  }}
                  disabled={!fuzzyEnabled && attendanceLogs.length < 10}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
