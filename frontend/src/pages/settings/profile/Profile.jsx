
import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  Brain,
  Zap,
  Clock,
  FireExtinguisher,
  Trophy,
  Edit,
  Sunrise,
  Lock,
  LogOut,
  AlertTriangle,
  Bell,
  Volume2,
  Target,
  Unlock,
} from "lucide-react";

import { AuthContext } from '../../../context/AuthContext';



//  * MOCK / INITIAL DATA

const ACCENTS = {
  green: "#00ff99",
  blue: "#00ccff",
  orange: "#ffaa00",
  purple: "#ee00ff",
};

const INITIAL_USER_DATA = {
  name: "MR Rahad Patwary",
  email: "rahad@example.com",
  level: 6,
  rank: "Ironmind Novice",
  completion: 72,
  progress: 45,
  motto: "Discipline is doing what needs to be done",
  timezone: "Asia/Riyadh",
  country: "Saudi Arabia",
  focusType: "Morning",
  // some numeric fields used by StatCard
  totalMinutes: 12345,
  tasksCompleted: 342,
};

const STATS_DATA = [
  { id: 1, label: "Minutes Focused", value: INITIAL_USER_DATA.totalMinutes, icon: Clock, color: "text-neon-green" },
  { id: 2, label: "Tasks Completed", value: INITIAL_USER_DATA.tasksCompleted, icon: Zap, color: "text-blue" },
  { id: 3, label: "Streak", value: 7, icon: FireExtinguisher, color: "text-orange" },
  { id: 4, label: "Trophies", value: 3, icon: Trophy, color: "text-purple" },
  { id: 5, label: "Deep Sessions", value: 24, icon: Brain, color: "text-neon-green" },
];

const ACHIEVEMENTS_DATA = [
  {
    name: "7-day streak",
    earned: true,
    icon: FireExtinguisher,
    unlock: "Achieve a 7-day perfect streak.",
  },
  {
    name: "Complete 100 tasks",
    earned: true,
    icon: Zap,
    unlock: "Complete 100 tasks.",
  },
  {
    name: "Early Riser",
    earned: false,
    icon: Sunrise,
    unlock: "Start your first task before 6am for 14 consecutive days",
  },
  {
    name: "No Distractions Master",
    earned: false,
    icon: Target,
    unlock: "Complete 10 deep work sessions with 0 distractions.",
  },
];

const TASK_SUMMARY_DATA = [
  { title: "Project Alpha", date: "10/26/2023", duration: "2h 30m", status: "Done", color: "success" },
  { title: "Morning Routine", date: "06/25/2023", duration: "1h 00m", status: "Done", color: "success" },
  { title: "Workout Session", date: "Daily discipline summary", duration: "Skipped", status: "Failed", color: "danger" },
];

const QUOTE = "Discipline is doing what needs to be done, even when you don't feel like it.";

//  MOCK TTS API CALL

const MOCK_TTS_API_CALL = async (text, voice = "Kore") => {
  console.log(`TTS API Call (mock): text="${text}" voice="${voice}"`);
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve({ ok: true, message: `Mocked audio for: ${text}` });
    }, 900)
  );
};


//  * Reusable Subcomponents


// ToggleSwitch (properly returns JSX)
const ToggleSwitch = ({ label, enabled, setEnabled }) => {
  return (
    <div className="d-flex align-items-center justify-content-between p-2">
      <div className={`small fw-light ${enabled ? "text-neon-green" : "text-secondary"} d-flex align-items-center`}>
        <Bell className="me-2" />
        <span>{label}</span>
      </div>

      <button
        type="button"
        onClick={() => setEnabled((prev) => !prev)}
        aria-pressed={enabled}
        className={`toggle-switch-custom rounded-pill d-inline-flex align-items-center position-relative p-1 border-0`}
        style={{ width: 54, height: 28 }}
      >
        <div
          className={`toggle-handle rounded-circle bg-white position-relative`}
          style={{
            width: 22,
            height: 22,
            transition: "margin-left 0.22s",
            marginLeft: enabled ? 30 : 3,
            boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
          }}
        />
      </button>
    </div>
  );
};

// GlassCard wrapper 
const GlassCard = ({ children, className = "" }) => {
  return <div className={`glass-card p-3 p-md-4 rounded-4 ${className}`.trim()}>{children}</div>;
};

// StatCard
const StatCard = ({ label, value, icon: Icon, color = "text-neon-green" }) => {
  const display = typeof value === "number" ? value.toLocaleString() : value;
  return (
    <GlassCard className="text-center h-100 stat-card-hover cursor-pointer">
      <div className={`d-flex align-items-center justify-content-center mb-3`} style={{ gap: 12 }}>
        <div className={`rounded-3 p-2 neon-shadow-subtle`} style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      <div className="font-orbitron fs-4 fw-bold text-white">{display}</div>
      <div className="small text-secondary text-uppercase letter-spacing-wider">{label}</div>
    </GlassCard>
  );
};

// AchievementBadge (fixed, returns JSX, corrected props)
const AchievementBadge = ({ name, earned, icon: Icon, unlock }) => {
  return (
    <div
      className={`position-relative d-flex flex-column align-items-center justify-content-center p-3 rounded-3 transition-all achievement-badge ${earned ? "opacity-100 neon-hover" : "opacity-50"
        }`}
      style={{ minHeight: 120 }}
    >
      <div className={`w-48 h-48 mb-2 d-flex align-items-center justify-content-center rounded-circle`} style={{ width: 72, height: 72 }}>
        <div style={{ fontSize: 28 }}>{Icon ? <Icon /> : <Trophy />}</div>
      </div>

      <span className="small text-center fw-medium text-white">{name}</span>

      {!earned && (
        <div style={{ position: "absolute", top: 10, right: 10 }}>
          <Lock className="text-light bg-dark p-1 rounded-circle" style={{ height: 22, width: 22 }} />
        </div>
      )}

      <div className="achievement-tooltip bg-dark text-white rounded-3 small p-2" style={{ display: "none" }}>
        {earned ? "Unlocked!" : `Goal: ${unlock}`}
      </div>
    </div>
  );
};


//   Main Profile Component

const Profile = () => {
  const [userData, setUserData] = useState(INITIAL_USER_DATA);
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [accentColor, setAccentColor] = useState(ACCENTS.green);
  const [settings, setSettings] = useState({
    reminders: true,
    summary: false,
    quotes: true,
    animations: true,
  });
  const [ttsStatus, setTtsStatus] = useState(null);

  // TTS handler
  const handleTtsClick = useCallback(async () => {
    if (settings.animations) setTtsStatus("loading");
    try {
      const res = await MOCK_TTS_API_CALL(QUOTE);
      console.log(res);
      setTtsStatus("success");
    } catch (err) {
      console.error(err);
      setTtsStatus("error");
    } finally {
      setTimeout(() => setTtsStatus(null), 2200);
    }
  }, [settings.animations]);

  // Inject styles once
  useEffect(() => {
    // document-level style tweaks
    document.body.style.backgroundColor = "#0d0f14";
    document.body.style.fontFamily = "Inter, sans-serif";
    document.documentElement.style.scrollBehavior = "smooth";

    // Bootstrap CSS (CDN)
    const bsLink = document.createElement("link");
    bsLink.rel = "stylesheet";
    bsLink.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";
    document.head.appendChild(bsLink);

    // custom styles
    const styleEl = document.createElement("style");
    styleEl.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;600;700&display=swap');

      :root {
        --neon-color: ${ACCENTS.green};
      }

      .font-orbitron { font-family: 'Orbitron', sans-serif; }
      .font-inter { font-family: 'Inter', sans-serif; }
      .text-neon-green { color: var(--neon-color); }
      .bg-neon-green { background-color: var(--neon-color); }

      .glass-card {
        background-color: rgba(255,255,255,0.04);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(0,255,153,0.08);
        box-shadow: 0 6px 18px rgba(0,0,0,0.6);
        transition: all 0.25s ease;
      }

      .neon-shadow { box-shadow: 0 0 15px var(--neon-color), 0 0 25px rgba(0,255,153,0.08); }
      .neon-shadow-subtle { box-shadow: 0 0 6px rgba(0,255,153,0.12); }

      .stat-card-hover { transition: transform 0.25s ease, box-shadow 0.25s ease; }
      .stat-card-hover:hover { transform: translateY(-6px); box-shadow: 0 8px 30px rgba(0,0,0,0.6); }

      @keyframes pulse-custom {
        0%,100% { opacity: 1; box-shadow: 0 0 10px var(--neon-color); }
        50% { opacity: 0.6; box-shadow: 0 0 22px var(--neon-color); }
      }
      .animate-pulse-custom { animation: pulse-custom 1.5s ease-in-out infinite; }

      .toggle-switch-custom { background-color: #495057; border: none; }
      .toggle-handle { background: white; }

      .achievement-badge { position: relative; }
      .achievement-tooltip {
        position: absolute;
        top: -48px;
        left: 50%;
        transform: translateX(-50%);
        opacity: 0;
        transition: opacity 0.2s;
        pointer-events: none;
        z-index: 100;
      }
      .achievement-badge:hover .achievement-tooltip { opacity: 1; display: block; }

      .task-row-hover { transition: background-color 0.18s, transform 0.18s; }
      .task-row-hover:hover { transform: translateY(-3px); }

      .hover-scale-110:hover { transform: scale(1.06); }

      /* small helpers */
      .w-28 { width: 112px; height: 112px;}
      .w-48 { width: 48px; height: 48px; }

    `;
    document.head.appendChild(styleEl);

    // cleanup
    return () => {
      document.body.style.backgroundColor = "";
      document.body.style.fontFamily = "";
      document.head.removeChild(bsLink);
      document.head.removeChild(styleEl);
    };
  }, []);

  const updateUserData = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const currentAccentClass = accentColor === ACCENTS.green ? "text-neon-green" : "";

  return (
    <div className="min-vh-100 p-4 p-md-5 font-inter text-light" style={{ background: "#0d0f14" }}>
      <header className="position-relative mb-5">
        <div className="h-64 rounded-4 overflow-hidden bg-dark shadow-lg position-relative" style={{ height: 220 }}>
          <div
            className="position-absolute top-0 bottom-0 start-0 end-0"
            style={{
              backgroundImage: `url('https://placehold.co/1200x256/1c1e27/00ff99?text=IRONMIND+NETWORK')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.45,
            }}
          />
          <div className="position-absolute top-0 end-0 p-4">
            <button
              className="btn btn-outline-light btn-sm text-uppercase fw-semibold rounded-pill"
              onClick={() => setIsEditing((s) => !s)}
              style={{ borderColor: accentColor, color: accentColor }}
            >
              {isEditing ? "Save Profile" : "Edit Profile"}
            </button>
          </div>
        </div>

        <div className="position-absolute start-50 translate-middle-x top-100 w-100 px-3 px-md-0" style={{ marginTop: -100, maxWidth: 960 }}>
          <GlassCard className="d-flex flex-column flex-md-row align-items-center justify-content-between p-4 p-md-5">
            <div className="d-flex flex-column flex-md-row align-items-center text-center text-md-start">
              <div className="position-relative w-28 h-28 mb-3 mb-md-0 me-md-4">
                <div
                  className={`w-100 h-100 rounded-circle bg-dark border-4`}
                  style={{
                    borderColor: accentColor,
                    borderWidth: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: settings.animations ? "pulse-custom 1.5s ease-in-out infinite" : "none",
                    boxShadow: settings.animations ? `0 0 14px ${accentColor}` : "none",
                  }}
                >
                  <Brain className="text-neon-green" style={{ width: 64, height: 64, color: accentColor }} />
                </div>
              </div>

              <div>
                <h1 className="fs-2 font-orbitron fw-bold text-white mb-0">{userData.name}</h1>
                <p className={`small fw-semibold text-uppercase letter-spacing-wider mb-0 ${currentAccentClass}`} style={{ color: accentColor }}>
                  LEVEL {userData.level} IRONMIND
                </p>
                <p className="text-secondary mb-0">{userData.rank}</p>
              </div>
            </div>

            <div className="w-100 w-md-auto mt-4 mt-md-0" style={{ maxWidth: 260 }}>
              <p className="small fw-medium mb-1 text-secondary">Profile Progress: {userData.completion}%</p>
              <div className="progress" style={{ height: 10, backgroundColor: "#495057" }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${userData.completion}%`, backgroundColor: accentColor, boxShadow: `0 0 6px ${accentColor}` }}
                  aria-valuenow={userData.completion}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>
            </div>
          </GlassCard>
        </div>
      </header>

      <main className="pt-5 mt-5 container-xl">
        <div className="row g-4 g-lg-5">
          <section className="col-lg-8 d-flex flex-column gap-4">
            <div className="row row-cols-2 row-cols-sm-3 row-cols-lg-5 g-3">
              {STATS_DATA.map((stat) => (
                <div className="col" key={stat.id}>
                  <StatCard {...stat} />
                </div>
              ))}
            </div>

            <GlassCard className="d-flex flex-column gap-4">
              <h2 className={`fs-4 font-orbitron fw-bold mb-3 ${currentAccentClass}`} style={{ color: accentColor }}>
                COMMENCING OBJECTIVES
              </h2>

              <div className="d-flex align-items-center justify-content-between small text-secondary">
                <span className="fw-semibold">LEVEL {userData.level}</span>
                <span className="text-neon-green" style={{ color: accentColor }}>
                  {userData.progress}% to Level {userData.level + 1}
                </span>
                <span className="fw-semibold">LEVEL {userData.level + 1}</span>
              </div>

              <div className="progress" style={{ height: 12, backgroundColor: "#495057" }}>
                <div
                  className="progress-bar neon-shadow"
                  role="progressbar"
                  style={{ width: `${userData.progress}%`, backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
                  aria-valuenow={userData.progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>

              <div className="p-4 rounded-3 border border-secondary border-opacity-25 bg-white bg-opacity-5 position-relative">
                <p className="fs-5 fst-italic text-center text-white mb-0">{QUOTE}</p>
                <div className="d-flex justify-content-center align-items-center mt-3 gap-3">
                  <button
                    className={`btn btn-link p-2 rounded-circle transition-all ${currentAccentClass}`}
                    onClick={handleTtsClick}
                    disabled={ttsStatus === "loading"}
                    style={{ color: accentColor }}
                    aria-label="play quote"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                  <p className="small text-secondary mb-0">
                    {ttsStatus === "loading" ? "Synthesizing Audio..." : ttsStatus === "success" ? "Playback Ready" : ttsStatus === "error" ? "Audio Failed" : "Quote Voice"}
                  </p>
                </div>
              </div>

              <div className="p-3 text-center rounded-3 bg-danger bg-opacity-25 border border-danger border-opacity-50 text-danger fw-semibold d-flex align-items-center justify-content-center">
                <FireExtinguisher className="w-5 h-5 me-2" />
                DAILY CHALLENGE: Complete 3/5 deep focus sessions.
              </div>
            </GlassCard>

            <GlassCard className="d-flex flex-column gap-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="fs-4 font-orbitron fw-bold">TASK HISTORY SUMMARY</h2>
                <select className="form-select w-auto bg-white bg-opacity-10 text-light border border-secondary border-opacity-50 small" style={{ borderColor: accentColor }}>
                  <option>Today</option>
                  <option>This Week</option>
                  <option>All Time</option>
                </select>
              </div>

              <div className="d-grid gap-2">
                {TASK_SUMMARY_DATA.map((task, index) => (
                  <div key={index} className="d-flex align-items-center p-3 rounded-3 bg-dark bg-opacity-50 task-row-hover">
                    <span
                      className={`task-dot rounded-circle me-4 bg-${task.color}`}
                      style={{
                        width: 12,
                        height: 12,
                        boxShadow: task.color === "success" ? `0 0 8px ${ACCENTS.green}` : task.color === "danger" ? `0 0 8px #f87171` : `0 0 8px #facc15`,
                      }}
                    />
                    <p className="flex-grow-1 fw-medium mb-0">{task.title}</p>
                    <p className="small w-25 text-secondary d-none d-sm-block mb-0">{task.date}</p>
                    <p className="small w-20 text-secondary mb-0">{task.duration}</p>
                    <p className={`small w-15 fw-semibold text-end mb-0 text-${task.color}`}>{task.status}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center">
                <a href="#" className={`small fw-semibold text-decoration-none transition-colors ${currentAccentClass}`} style={{ color: accentColor }}>
                  View Full Task History &rarr;
                </a>
              </div>
            </GlassCard>
          </section>

          <section className="col-lg-4 d-flex flex-column gap-4">
            <GlassCard className="position-relative d-flex flex-column gap-3">
              <h2 className="fs-4 font-orbitron fw-bold mb-3">PERSONAL INFORMATION</h2>

              <button
                className="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 m-4 rounded-circle"
                onClick={() => setIsEditing((s) => !s)}
                aria-label="edit profile"
              >
                <Edit className="w-5 h-5" />
              </button>

              <div className="border-bottom border-secondary border-opacity-50 pb-3 mb-3">
                <p className={`small fw-semibold text-uppercase mb-1 ${currentAccentClass}`} style={{ color: accentColor }}>
                  Discipline Motto:
                </p>
                <input
                  type="text"
                  value={userData.motto}
                  onChange={(e) => updateUserData("motto", e.target.value)}
                  readOnly={!isEditing}
                  className={`form-control bg-transparent text-xl font-orbitron fw-bold text-light border-0 p-0 ${isEditing ? "border-bottom border-neon-green" : "pointer-events-none"}`}
                />
              </div>

              <div className="d-grid gap-2">
                {Object.entries({ Name: "name", Email: "email", "Time Zone": "timezone", Country: "country" }).map(([label, key]) => (
                  <div key={key} className="d-flex align-items-center">
                    <label className="small fw-medium w-30 text-secondary me-3" style={{ minWidth: 95 }}>
                      {label}
                    </label>
                    <input
                      type={key === "email" ? "email" : "text"}
                      value={userData[key] || ""}
                      onChange={(e) => updateUserData(key, e.target.value)}
                      readOnly={!isEditing}
                      className={`form-control flex-grow-1 bg-transparent small text-light p-1 border-0 rounded-0 ${isEditing ? "border-bottom border-secondary border-opacity-50" : "pointer-events-none"}`}
                    />
                  </div>
                ))}
                <div className="d-flex align-items-center pt-2">
                  <label className="small fw-medium w-30 text-secondary me-3" style={{ minWidth: 95 }}>
                    Focus Type
                  </label>
                  <span className={`badge rounded-pill p-2 fw-semibold`} style={{ backgroundColor: userData.focusType === "Morning" ? "#00ccff20" : "#ee00ff20", color: userData.focusType === "Morning" ? "#00ccff" : "#ee00ff" }}>
                    {userData.focusType}
                  </span>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="fs-4 font-orbitron fw-bold mb-4">ACHIEVEMENT BADGES</h2>
              <div className="row row-cols-4 g-3 text-center">
                {ACHIEVEMENTS_DATA.map((badge) => (
                  <div className="col" key={badge.name}>
                    <AchievementBadge {...badge} />
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="fs-4 font-orbitron fw-bold mb-3">REMINDER & SYNC</h2>
              <div className="d-grid gap-2">
                <ToggleSwitch label="10-minute pre-task reminders" enabled={settings.reminders} setEnabled={() => setSettings((p) => ({ ...p, reminders: !p.reminders }))} />
                <ToggleSwitch label="Daily discipline summary" enabled={settings.summary} setEnabled={() => setSettings((p) => ({ ...p, summary: !p.summary }))} />
                <ToggleSwitch label="Motivational quote notifications" enabled={settings.quotes} setEnabled={() => setSettings((p) => ({ ...p, quotes: !p.quotes }))} />
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="fs-4 font-orbitron fw-bold mb-3">THEME & PREFERENCES</h2>

              <div className="d-flex justify-content-start align-items-center gap-3 mb-4">
                <p className="small text-secondary mb-0">Accent Color:</p>
                {Object.entries(ACCENTS).map(([key, color]) => (
                  <div
                    key={key}
                    className={`rounded-circle cursor-pointer transition-all`}
                    style={{
                      width: 24,
                      height: 24,
                      backgroundColor: color,
                      border: accentColor === color ? "2px solid rgba(255,255,255,0.12)" : "2px solid transparent",
                      boxShadow: accentColor === color ? `0 0 10px ${color}` : "none",
                    }}
                    onClick={() => setAccentColor(color)}
                    role="button"
                    aria-label={`select accent ${key}`}
                  />
                ))}
              </div>

              <div>
                <ToggleSwitch label="Enable UI Animations (Motion Effects)" enabled={settings.animations} setEnabled={() => setSettings((p) => ({ ...p, animations: !p.animations }))} />
              </div>
            </GlassCard>

            <div className="d-flex justify-content-between align-items-center gap-3">
              <button className="btn btn-dark fw-semibold rounded-3 p-3">
                <LogOut className="d-inline w-4 h-4 me-2" />
                Logout
              </button>
              <GlassCard className="p-3 d-flex align-items-center border-danger border-opacity-50 bg-danger bg-opacity-10 cursor-pointer">
                <AlertTriangle className="w-5 h-5 text-danger me-3" />
                <span className="small fw-semibold text-danger">Delete Account</span>
              </GlassCard>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;
