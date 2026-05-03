import React, { useEffect, useMemo, useState, useContext } from "react";
import { MdOutlineCancel } from "react-icons/md";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import './CreateTask.css'
import { TaskContext } from "../../../context/TaskContext";
import { readInjectedDeviceApps, normalizeInstalledAppsList } from "../../../utils/androidAppCatalog";

const CreateTask = () => {
  const { user } = useContext(AuthContext);
  const { URL, showAddTask, setShowAddTask } = useContext(TaskContext);
  const [formData, setFormData] = useState({
    title: "",
    startTime: "",
    endTime: "",
    status: "upcoming",
    proof: "",
    punishment: "",
    punishmentDuration: "",
    reviewedByAI: false,
    useCustomTaskLock: false,
  });
  const [lockedAppsInput, setLockedAppsInput] = useState("");
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [appSearch, setAppSearch] = useState("");
  const [serverCatalogRaw, setServerCatalogRaw] = useState([]);
  const [catalogSyncedAt, setCatalogSyncedAt] = useState(null);
  const [catalogError, setCatalogError] = useState(null);

  useEffect(() => {
    showAddTask
      ? document.body.style.overflow = "hidden"
      : document.body.style.overflow = "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showAddTask]);

  useEffect(() => {
    if (!formData.useCustomTaskLock) {
      setSelectedPackages([]);
      setLockedAppsInput("");
      setAppSearch("");
      setServerCatalogRaw([]);
      setCatalogSyncedAt(null);
      setCatalogError(null);
      return undefined;
    }
    if (!user?.id || !URL) return undefined;

    let cancelled = false;
    const fetchCatalog = async () => {
      try {
        const res = await axios.get(`${URL}/api/lock/device-apps/${user.id}`);
        if (cancelled) return;
        const apps = Array.isArray(res.data?.apps) ? res.data.apps : [];
        setServerCatalogRaw(apps);
        setCatalogSyncedAt(res.data?.syncedAt || null);
        setCatalogError(null);
      } catch (err) {
        if (cancelled) return;
        setCatalogError(err?.response?.data?.message || err.message || "Failed to load app list");
      }
    };

    fetchCatalog();
    const interval = setInterval(fetchCatalog, 2800);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [formData.useCustomTaskLock, user?.id, URL, showAddTask]);

  const baseCatalog = useMemo(() => {
    const fromServer = normalizeInstalledAppsList(serverCatalogRaw);
    if (fromServer.length > 0) return fromServer;
    return readInjectedDeviceApps();
  }, [serverCatalogRaw]);

  const filteredCatalog = useMemo(() => {
    const q = appSearch.trim().toLowerCase();
    if (!q) return baseCatalog;
    return baseCatalog.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.packageName.toLowerCase().includes(q)
    );
  }, [baseCatalog, appSearch]);

  const selectedSet = useMemo(() => new Set(selectedPackages), [selectedPackages]);

  const togglePackage = (packageName) => {
    setSelectedPackages((prev) => {
      const next = new Set(prev);
      if (next.has(packageName)) next.delete(packageName);
      else next.add(packageName);
      return [...next];
    });
  };

  const selectAllFiltered = () => {
    setSelectedPackages((prev) => {
      const next = new Set(prev);
      filteredCatalog.forEach((row) => next.add(row.packageName));
      return [...next];
    });
  };

  const clearSelection = () => setSelectedPackages([]);

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return setMessage("User not found");

    try {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        setMessage("Invalid start or end time.");
        return;
      }
      if (end <= start) {
        setMessage("End time must be after start time.");
        return;
      }

      const fromText = lockedAppsInput
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      const lockedAppsDuringTask = formData.useCustomTaskLock
        ? [...new Set([...selectedPackages, ...fromText])]
        : [];

      const payload = {
        title: formData.title.trim(),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        status: "upcoming",
        proof: formData.proof || "",
        punishment: formData.punishment || "",
        punishmentDuration: Number(formData.punishmentDuration) || 0,
        reviewedByAI: Boolean(formData.reviewedByAI),
        useCustomTaskLock: Boolean(formData.useCustomTaskLock),
        lockedAppsDuringTask,
      };

      const res = await axios.post(
        `${URL}/api/task/create/${user.id}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      setMessage(res.data.message);
      setFormData({
        title: "",
        startTime: "",
        endTime: "",
        status: "upcoming",
        proof: "",
        punishment: "",
        punishmentDuration: "",
        reviewedByAI: false,
        useCustomTaskLock: false,
      });
      setLockedAppsInput("");
      setSelectedPackages([]);
      setAppSearch("");

      setShowAddTask(false);
      
      window.location.reload();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to create task");
      console.error(error.response?.data?.message)
    }
  };

  return (
    <div className="task-container">
      <div className="task-form-container">
        <div className="task-form-header">
          <div>
            <h2>Create Task</h2>
            <p className="task-form-subtitle">Plan your next action with clear deadlines.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddTask(false)}
            className="task-cancel-icon"
            aria-label="Close task form"
          >
            <MdOutlineCancel />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="field-group">
            <label htmlFor="task-title">Task Title</label>
            <input
              id="task-title"
              type="text"
              name="title"
              placeholder="Ex: Morning cardio and stretching"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-row">
            <div className="field-group">
              <label htmlFor="task-start-time">Start Time</label>
              <input
                id="task-start-time"
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field-group">
              <label htmlFor="task-end-time">End Time</label>
              <input
                id="task-end-time"
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="task-proof">Proof</label>
            <input
              id="task-proof"
              type="text"
              name="proof"
              placeholder="URL, notes, or evidence details"
              value={formData.proof}
              onChange={handleChange}
            />
          </div>

          <div className="field-group">
            <label htmlFor="task-punishment">Punishment Description</label>
            <input
              id="task-punishment"
              type="text"
              name="punishment"
              placeholder="What happens if task is missed?"
              value={formData.punishment}
              onChange={handleChange}
            />
          </div>

          <div className="field-group">
            <label htmlFor="task-punishment-duration">Punishment Duration (minutes)</label>
            <input
              id="task-punishment-duration"
              type="number"
              name="punishmentDuration"
              placeholder="Ex: 20"
              value={formData.punishmentDuration}
              onChange={handleChange}
            />
          </div>

          <label className="checkbox-row">
            <span>Lock apps only during this task (Android lock client)</span>
            <input
              type="checkbox"
              name="useCustomTaskLock"
              checked={formData.useCustomTaskLock}
              onChange={handleChange}
            />
          </label>

          {formData.useCustomTaskLock ? (
            <div className="field-group task-lock-field">
              <label id="task-app-picker-label">Apps to block during this task</label>
              <p className="task-lock-hint">
                {baseCatalog.length > 0 ? (
                  <>
                    List comes from your phone (synced via IronMind Lock). Selected:{" "}
                    {selectedPackages.length}
                    {catalogSyncedAt ? (
                      <>
                        {" "}
                        · Last sync: {new Date(catalogSyncedAt).toLocaleString()}
                      </>
                    ) : null}
                  </>
                ) : (
                  <>
                    Your browser cannot read installed apps. Sync from the{" "}
                    <strong>IronMind Lock</strong> Android app (same Base URL and your User ID), then
                    this list updates automatically.
                  </>
                )}
                {" "}
                Leave all unchecked and the manual box empty to block none during this task.
              </p>
              {catalogError ? <p className="task-catalog-error">{catalogError}</p> : null}
              <div className="task-app-picker" role="group" aria-labelledby="task-app-picker-label">
                <div className="task-app-picker-toolbar">
                  <input
                    type="search"
                    className="task-app-search"
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                    placeholder="Search by name or package…"
                    aria-label="Filter apps"
                    disabled={baseCatalog.length === 0}
                  />
                  <button
                    type="button"
                    className="task-app-picker-btn"
                    onClick={selectAllFiltered}
                    disabled={baseCatalog.length === 0}
                  >
                    Select visible
                  </button>
                  <button type="button" className="task-app-picker-btn" onClick={clearSelection}>
                    Clear
                  </button>
                </div>
                {baseCatalog.length === 0 ? (
                  <div className="task-app-empty">
                    <p className="task-app-empty-title">No apps synced yet</p>
                    <ol className="task-app-empty-steps">
                      <li>Open <strong>IronMind Lock</strong> on your Android phone.</li>
                      <li>
                        Set <strong>Base URL</strong> to this backend (e.g. your PC/LAN{" "}
                        <code>http://192.168.x.x:5003</code>).
                      </li>
                      <li>
                        Paste your <strong>User ID</strong> — the same <code>id</code> from your login
                        token (MongoDB user id).
                      </li>
                      <li>
                        Tap <strong>Sync installed apps to web (Create Task)</strong>.
                      </li>
                    </ol>
                    <p className="task-app-empty-note">
                      This page rechecks every few seconds. You can still add package names manually
                      below.
                    </p>
                  </div>
                ) : (
                  <ul className="task-app-picker-list">
                    {filteredCatalog.map((row) => (
                      <li key={row.packageName} className="task-app-picker-row">
                        <label className="task-app-picker-row-label">
                          <input
                            type="checkbox"
                            checked={selectedSet.has(row.packageName)}
                            onChange={() => togglePackage(row.packageName)}
                          />
                          <span className="task-app-picker-name">{row.name}</span>
                          <code className="task-app-picker-pkg">{row.packageName}</code>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <label htmlFor="task-locked-apps" className="task-lock-manual-label">
                Extra package names (optional, one per line)
              </label>
              <textarea
                id="task-locked-apps"
                className="task-lock-apps-input"
                value={lockedAppsInput}
                onChange={(e) => setLockedAppsInput(e.target.value)}
                placeholder={"com.example.app"}
                rows={3}
                spellCheck={false}
              />
            </div>
          ) : null}

          <label className="checkbox-row">
            <span>Reviewed by AI</span>
            <input
              type="checkbox"
              name="reviewedByAI"
              checked={formData.reviewedByAI}
              onChange={handleChange}
            />
          </label>
          <button type="submit">Create Task</button>
        </form>
        {message && <p className="task-message">{message}</p>}
      </div>
    </div>
  );
};

export default CreateTask;