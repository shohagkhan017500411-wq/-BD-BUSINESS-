import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import "./style.css";

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const db = URL && KEY ? createClient(URL, KEY) : null;

const sections = [
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

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("হোম ড্যাশবোর্ড");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
        email,
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

  async function logout() {
    if (db) await db.auth.signOut();
    setUser(null);
    setPassword("");
    setMessage("");
  }

  if (!user) {
    return (
      <main className="login-page">
        <section className="login-card">
          <div className="logo">BD</div>
          <h1>বিডি এডমিট</h1>
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

          {message && <p className="message">{message}</p>}
          <small>শুধু অনুমোদিত অ্যাডমিন প্রবেশ করতে পারবেন।</small>
        </section>
      </main>
    );
  }

  return (
    <div className="dashboard">
      <header>
        <div>
          <h2>বিডি এডমিট</h2>
          <small>Admin Control Panel</small>
        </div>
        <button className="logout" onClick={logout}>
          লগআউট
        </button>
      </header>

      <nav>
        {sections.map(section => (
          <button
            key={section}
            className={active === section ? "selected" : ""}
            onClick={() => setActive(section)}
          >
            {section}
          </button>
        ))}
      </nav>

      <main className="content">
        <h2>{active}</h2>
        {active === "হোম ড্যাশবোর্ড" ? (
          <p>অ্যাডমিন ড্যাশবোর্ডে স্বাগতম।</p>
        ) : (
          <p>
            এই বিভাগের ডেটাবেস ও কার্যক্রম সংযোগ এখনো বাকি।
          </p>
        )}
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
