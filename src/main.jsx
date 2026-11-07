import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import "./style.css";

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const db = URL && KEY ? createClient(URL, KEY) : null;

const categories = [
  "Bike Gallery", "Bike Parts", "Bike Service", "Daily Needs",
  "Fashion", "Food", "Oil & Soap", "Others"
];

const menuItems = [
  "সেলার আবেদন", "সেলার আইডি", "ফেসবুক পেজ",
  "টিক টক পেজ", "হোয়াটসঅ্যাপ", "মাই আবেদন"
];

function App() {
  const [page, setPage] = useState("হোম");
  const [menu, setMenu] = useState(false);
  const [category, setCategory] = useState("সব");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  const [application, setApplication] = useState({
    name: "", phone: "", password: "", email: "", product: ""
  });

  const [login, setLogin] = useState({
    email: "", phone: "", password: ""
  });

  function notify(text) {
    setMessage(text);
    setTimeout(() => setMessage(""), 3500);
  }

  useEffect(() => {
    if (!db) return;

    db.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });

    const { data } = db.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user || null)
    );

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!db) return;

    db.from("products")
      .select("id,name,category,description,price,image_url,is_active")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => setProducts(data || []));
  }, []);

  async function submitApplication(e) {
    e.preventDefault();

    if (!/^[0-9]{11}$/.test(application.phone)) {
      return notify("মোবাইল নম্বর ১১ সংখ্যার হতে হবে।");
    }

    if (!db) return notify("Supabase সংযোগ করা নেই।");

    const { data, error } = await db.auth.signUp({
      email: application.email,
      password: application.password,
      options: {
        data: {
          full_name: application.name,
          phone: application.phone
        }
      }
    });

    if (error) return notify(error.message);
    if (!data.user) return notify("ইমেইল নিশ্চিত করে আবার চেষ্টা করুন।");

    const { error: insertError } = await db
      .from("seller_applications")
      .insert({
        user_id: data.user.id,
        contact_name: application.name,
        phone: application.phone,
        email: application.email,
        product_name: application.product,
        status: "pending"
      });

    if (insertError) return notify(insertError.message);

    setApplication({
      name: "", phone: "", password: "", email: "", product: ""
    });

    notify("সেলার আবেদন জমা হয়েছে।");
    setPage("মাই আবেদন");
  }

  async function sellerLogin(e) {
    e.preventDefault();

    if (!/^[0-9]{11}$/.test(login.phone)) {
      return notify("মোবাইল নম্বর ১১ সংখ্যার হতে হবে।");
    }

    if (!db) return notify("Supabase সংযোগ করা নেই।");

    const { error } = await db.auth.signInWithPassword({
      email: login.email,
      password: login.password
    });

    if (error) return notify(error.message);

    const { data: authData } = await db.auth.getUser();

    const { data, error: profileError } = await db
      .from("seller_applications")
      .select("status,seller_code")
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (profileError) return notify(profileError.message);

    if (!data || data.status !== "approved") {
      await db.auth.signOut();
      return notify("আপনার আবেদন এখনো অনুমোদিত হয়নি।");
    }

    notify("লগইন সফল হয়েছে।");
    setPage("সেলার ড্যাশবোর্ড");
  }

  async function logout() {
    if (db) await db.auth.signOut();
    setPage("হোম");
    notify("লগআউট হয়েছে।");
  }

  const shownProducts = products.filter(p =>
    (category === "সব" || p.category === category) &&
    (p.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app">
      <header className="topbar">
        <button onClick={() => setMenu(!menu)}>⋮</button>
        <h1>বিডি বাণিজ্য</h1>
        <button onClick={() =>
          document.getElementById("product-search")?.focus()
        }>⌕</button>
      </header>

      {menu && (
        <div className="menuPanel">
          {menuItems.map(item => (
            <button key={item} onClick={() => {
              setPage(item);
              setMenu(false);
            }}>
              {item}
            </button>
          ))}
        </div>
      )}

      <main>
        <div className="adSlot">বিজ্ঞাপন</div>

        {page === "হোম" && (
          <>
            <input
              id="product-search"
              placeholder="প্রোডাক্ট খুঁজুন..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            <div className="categoryRow">
              <button onClick={() => setCategory("সব")}>সব</button>
              {categories.map(c => (
                <button key={c} onClick={() => setCategory(c)}>
                  {c}
                </button>
              ))}
            </div>

            <div className="productGrid">
              {shownProducts.map(p => (
                <article className="product" key={p.id}>
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} />
                    : <div className="imagePlaceholder">ছবি নেই</div>}
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  <strong>৳ {p.price}</strong>
                  <button onClick={() => setPage("অর্ডার")}>
                    অর্ডার করুন
                  </button>
                </article>
              ))}
            </div>
          </>
        )}

        {page === "সেলার আবেদন" && (
          <section className="panel">
            <h2>সেলার আবেদন</h2>
            <form onSubmit={submitApplication}>
              <label>সেলারের নাম
                <input required value={application.name}
                  onChange={e => setApplication({...application, name:e.target.value})} />
              </label>

              <label>মোবাইল নাম্বার
                <input required inputMode="numeric" maxLength="11"
                  value={application.phone}
                  onChange={e => setApplication({...application, phone:e.target.value.replace(/\D/g,"").slice(0,11)})} />
              </label>

              <label>পাসওয়ার্ড
                <input required type="password" minLength="8"
                  value={application.password}
                  onChange={e => setApplication({...application, password:e.target.value})} />
              </label>

              <label>জিমেইল
                <input required type="email" value={application.email}
                  onChange={e => setApplication({...application, email:e.target.value})} />
              </label>

              <label>প্রোডাক্টের নাম
                <input required value={application.product}
                  onChange={e => setApplication({...application, product:e.target.value})} />
              </label>

              <button type="submit">কনফার্ম</button>
            </form>
          </section>
        )}

        {page === "সেলার আইডি" && (
          <section className="panel">
            <h2>সেলার আইডি লগইন</h2>
            <form onSubmit={sellerLogin}>
              <label>Gmail
                <input required type="email" value={login.email}
                  onChange={e => setLogin({...login,email:e.target.value})} />
              </label>

              <label>মোবাইল নাম্বার
                <input required inputMode="numeric" maxLength="11"
                  value={login.phone}
                  onChange={e => setLogin({...login,phone:e.target.value.replace(/\D/g,"").slice(0,11)})} />
              </label>

              <label>পাসওয়ার্ড
                <input required type="password" value={login.password}
                  onChange={e => setLogin({...login,password:e.target.value})} />
              </label>

              <button type="submit">লগইন</button>
            </form>
          </section>
        )}

        {page === "মাই আবেদন" && (
          <section className="panel">
            <h2>মাই আবেদন</h2>
            <p>{user ? "আপনার আবেদন যাচাই করতে ডেটাবেস সংযোগ প্রয়োজন।" : "লগইন করে নিজের আবেদন দেখুন।"}</p>
          </section>
        )}

        {page === "সেলার ড্যাশবোর্ড" && (
          <section className="panel">
            <h2>সেলার ড্যাশবোর্ড</h2>
            <div className="dashboardGrid">
              {[
                "এড প্রোডাক্ট", "মাই প্রোডাক্ট", "মাই অর্ডার",
                "মেসেজ", "পেমেন্ট আবেদন", "এডমিন হটলাইন"
              ].map(x => <button key={x} onClick={() => setPage(x)}>{x}</button>)}
            </div>
            <button onClick={logout}>লগআউট</button>
          </section>
        )}

        {page === "মাই অর্ডার" && (
          <section className="panel">
            <h2>মাই অর্ডার</h2>
            <div className="statusTabs">
              {["To Pay", "To Ship", "To Receive", "To Review",
                "Returns & Cancellations"].map(x => <button key={x}>{x}</button>)}
            </div>
          </section>
        )}

        {page === "মেসেজ" && <section className="panel"><h2>মেসেজ</h2></section>}
        {page === "কার্ট" && <section className="panel"><h2>কার্ট</h2></section>}
        {page === "অর্ডার" && <section className="panel"><h2>অর্ডার</h2></section>}
        {page === "ফেসবুক পেজ" && <section className="panel"><h2>ফেসবুক পেজ</h2></section>}
        {page === "টিক টক পেজ" && <section className="panel"><h2>টিক টক পেজ</h2></section>}

        {page === "হোয়াটসঅ্যাপ" && (
          <section className="panel">
            <h2>হোয়াটসঅ্যাপ</h2>
            <a href="https://wa.me/8801750041156">অ্যাডমিন হটলাইন</a>
          </section>
        )}
      </main>

      <nav className="bottomNav">
        {["হোম", "মাই অর্ডার", "মেসেজ", "কার্ট"].map(item => (
          <button key={item} onClick={() => setPage(item)}>{item}</button>
        ))}
      </nav>

      {message && <div className="toast">{message}</div>}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
