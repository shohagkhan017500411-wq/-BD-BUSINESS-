import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import "./style.css";

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const db = URL && KEY ? createClient(URL, KEY) : null;

const businessSections = [
  "হোম ড্যাশবোর্ড",
  "অ্যাড প্রোডাক্ট",
  "প্রোডাক্ট ভাউচার",
  "প্রোডাক্ট ম্যানেজমেন্ট",
  "অর্ডার ম্যানেজমেন্ট",
  "সেলার ম্যানেজমেন্ট",
  "রাইডার ম্যানেজমেন্ট",
  "সেলার ইনবক্স",
  "কাস্টমার ইনবক্স",
  "পেমেন্ট ম্যানেজমেন্ট",
  "Ad Management",
  "AI Ad Creator",
  "Banner Management"
];

const gameSections = [
  "Game Dashboard",
  "Player Management",
  "Character Management",
  "Outfit & Skin Management",
  "Weapon Control",
  "Map Management",
  "Game Mode Management",
  "Room & Match Management",
  "Diamond & Coin Management",
  "Game Shop Management",
  "Event & Mission Management",
  "Rank & Leaderboard Management",
  "Chat & Support Management",
  "Notification Management",
  "Intro & Lobby Management",
  "Game Update Management",
  "Security & Reports Management",
  "Game Settings Management",
  "Emote Management",
  "Animation Management",
  "Diamond Send Management"
];

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("হোম ড্যাশবোর্ড");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!db) return;

    const {
      data: { subscription }
    } = db.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setRecovery(true);
        setUser(null);
        setMessage("নতুন পাসওয়ার্ড সেট করুন।");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function login(e) {
    e.preventDefault();

    if (!db) {
      setMessage("Supabase সংযোগ সেটআপ করা হয়নি।");
      return;
    }

    setLoading(true);
    setMessage("");

    const { data, error } =
      await db.auth.signInWithPassword({
        email: email.trim(),
        password
      });

    if (error) {
      setMessage("লগইন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।");
      setLoading(false);
      return;
    }

    const { data: allowed, error: checkError } =
      await db.rpc("is_bd_business_admin");

    if (checkError || allowed !== true) {
      await db.auth.signOut();
      setMessage("আপনার অ্যাডমিন অনুমতি নেই।");
      setLoading(false);
      return;
    }

    setUser(data.user);
    setLoading(false);
  }

  async function sendPasswordReset() {
    if (!db) {
      setMessage("Supabase সংযোগ সেটআপ করা হয়নি।");
      return;
    }

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setMessage("আগে আপনার Gmail লিখুন।");
      return;
    }

    setResetLoading(true);
    setMessage("");

    const { error } =
      await db.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo: window.location.origin
        }
      );

    if (error) {
      setMessage(
        "রিসেট লিংক পাঠানো যায়নি। কিছুক্ষণ পরে আবার চেষ্টা করুন।"
      );
    } else {
      setMessage(
        "আপনার Gmail-এ রিসেট লিংক পাঠানো হয়েছে। Gmail চেক করুন।"
      );
    }

    setResetLoading(false);
  }

  async function updatePassword(e) {
    e.preventDefault();

    if (!db) return;

    if (newPassword.length < 8) {
      setMessage("নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await db.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setMessage("পাসওয়ার্ড পরিবর্তন করা যায়নি। আবার চেষ্টা করুন।");
      setLoading(false);
      return;
    }

    await db.auth.signOut();

    setRecovery(false);
    setNewPassword("");
    setPassword("");
    setMessage("পাসওয়ার্ড পরিবর্তন হয়েছে। নতুন পাসওয়ার্ড দিয়ে লগইন করুন।");
    setLoading(false);
  }

  async function logout() {
    if (db) await db.auth.signOut();
    setUser(null);
    setPassword("");
    setMessage("");
  }

  if (recovery) {
    return (
      <main className="login-page">
        <section className="login-card">
          <div className="logo">BD</div>
          <h1>নতুন পাসওয়ার্ড</h1>
          <p>Set New Password</p>

          <form onSubmit={updatePassword}>
            <label>নতুন পাসওয়ার্ড</label>
            <input
              type="password"
              placeholder="নতুন পাসওয়ার্ড লিখুন"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              minLength={8}
              required
            />

            <button disabled={loading}>
              {loading ? "পরিবর্তন হচ্ছে..." : "পাসওয়ার্ড পরিবর্তন করুন"}
            </button>
          </form>

          {message && <p className="message">{message}</p>}
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="login-page">
        <section className="login-card">
          <div className="logo">BD</div>
          <h1>বিডি এডমিন</h1>
          <p>Admin Login</p>

          <form onSubmit={login}>
            <label>Gmail</label>
            <input
              type="email"
              placeholder="আপনার Gmail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="আপনার পাসওয়ার্ড"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            <button disabled={loading}>
              {loading ? "অপেক্ষা করুন..." : "লগইন করুন"}
            </button>
          </form>

          <button
            type="button"
            className="forgot-password"
            onClick={sendPasswordReset}
            disabled={resetLoading || loading}
          >
            {resetLoading
              ? "রিসেট লিংক পাঠানো হচ্ছে..."
              : "পাসওয়ার্ড ভুলে গেছেন?"}
          </button>

          {message && (
            <p className="message" role="status">{message}</p>
          )}

          <small>
            শুধু অনুমোদিত অ্যাডমিন প্রবেশ করতে পারবেন।
          </small>
        </section>
      </main>
    );
  }

  const isGame = gameSections.includes(active);

  return (
    <div className="dashboard">
      <header>
        <div>
          <h2>বিডি এডমিন</h2>
          <small>Admin Control Panel</small>
        </div>

        <button className="logout" onClick={logout}>
          লগআউট
        </button>
      </header>

      <main className="admin-layout">
        <aside className="admin-sidebar">
          <h3>BD বাণিজ্যিক</h3>

          {businessSections.map(section => (
            <button
              key={section}
              className={active === section ? "selected" : ""}
              onClick={() => setActive(section)}
            >
              {section}
            </button>
          ))}

          <h3 className="game-heading">BD GAME</h3>

          {gameSections.map(section => (
            <button
              key={section}
              className={
                active === section
                  ? "selected game-selected"
                  : ""
              }
              onClick={() => setActive(section)}
            >
              {section}
            </button>
          ))}
        </aside>

        <section className="content">
          <p className="section-label">
            {isGame ? "BD GAME" : "BD বাণিজ্যিক"}
          </p>

          <h2>{active}</h2>

          {active === "হোম ড্যাশবোর্ড" ? (
            <p>BD বাণিজ্যিক অ্যাডমিন ড্যাশবোর্ডে স্বাগতম।</p>
          ) : active === "Game Dashboard" ? (
            <p>
              BD GAME অ্যাডমিন ড্যাশবোর্ডে স্বাগতম।
              এখানে গেমের ২১টি ব্যবস্থাপনা বিভাগ রাখা হয়েছে।
            </p>
          ) : (
            <p>
              এই বিভাগের ডেটাবেস ও কার্যক্রম সংযোগ
              পরবর্তী ধাপে করতে হবে।
            </p>
          )}

          {isGame && (
            <small className="notice">
              আপাতত এটি বিভাগ নির্বাচনের কাঠামো।
              গেমের ডেটা পরিবর্তনের কার্যক্রম এখনো চালু হয়নি।
            </small>
          )}
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
