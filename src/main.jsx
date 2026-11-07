import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import "./style.css";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const db = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const BKASH_NUMBER = "01793798125";
const WHATSAPP_NUMBER = "01750041156";
const FACEBOOK_PAGE = "https://www.facebook.com/share/1DpyTMXEc6/";

const DEFAULT_PRODUCTS = [
  { id: "seed-1", title: "মিষ্টি", category: "Foods", image: "", options: [{ size: "৫০০ গ্রাম", price: 280 }, { size: "১ কেজি", price: 550 }] },
  { id: "seed-2", title: "রসমালাই", category: "Foods", image: "", options: [{ size: "৫০০ গ্রাম", price: 280 }, { size: "১ কেজি", price: 550 }] },
  { id: "seed-3", title: "সন্দেশ", category: "Foods", image: "", options: [{ size: "৫০০ গ্রাম", price: 180 }, { size: "১ কেজি", price: 350 }] },
  { id: "seed-4", title: "দেশি লাল চিনি", category: "Foods", image: "", options: [{ size: "৫০০ গ্রাম", price: 135 }, { size: "১ কেজি", price: 260 }] },
  { id: "seed-5", title: "বাদামের খাজা", category: "Foods", image: "", options: [{ size: "২৫০ গ্রাম", price: 130 }, { size: "৫০০ গ্রাম", price: 250 }] },
  { id: "seed-6", title: "রেশমি সনপাপড়ি", category: "Foods", image: "", options: [{ size: "২৫০ গ্রাম", price: 130 }, { size: "৫০০ গ্রাম", price: 250 }] },
  { id: "seed-7", title: "খাঁটি নারিকেল তেল", category: "Foods", image: "", options: [{ size: "২৫০ গ্রাম", price: 650 }, { size: "৫০০ গ্রাম", price: 1200 }] }
];

const css = `
*{box-sizing:border-box}body{margin:0;background:#f4f6f8;color:#17202a;font-family:Arial,'Noto Sans Bengali',sans-serif}
button,input,textarea,select{font:inherit}button{cursor:pointer;border:0;border-radius:9px;padding:10px 14px;background:#126b48;color:white}
button.secondary{background:#e8edf0;color:#17202a}button.danger{background:#b42318}button:disabled{opacity:.55;cursor:not-allowed}
input,textarea,select{width:100%;padding:11px;border:1px solid #cbd5dc;border-radius:8px;background:white;margin:5px 0 12px}
label{display:block;font-weight:600;font-size:14px}.wrap{max-width:1050px;margin:auto;padding:16px}
header{background:#0d5039;color:white;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
header h2{margin:0;font-size:20px}.actions{display:flex;gap:8px;flex-wrap:wrap}.card{background:white;border:1px solid #e1e6e9;border-radius:13px;padding:16px;margin:12px 0;box-shadow:0 2px 8px #00000008}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}.product img,.preview{width:100%;height:150px;object-fit:cover;border-radius:9px;background:#edf1f2}
.muted{color:#65727b;font-size:13px}.row{display:flex;gap:9px;align-items:center;flex-wrap:wrap}.row>*{flex:1}.status{display:inline-block;padding:4px 9px;border-radius:20px;background:#fff2cc;color:#805b00;font-size:12px}
.status.approved{background:#d8f5e4;color:#126b48}.status.rejected{background:#fee4e2;color:#b42318}
.center{text-align:center}.seller-wall{background:linear-gradient(135deg,#073b2a,#16845b);color:white;border-radius:18px;padding:28px 16px;text-align:center;margin:12px 0}
.logo{width:76px;height:76px;border-radius:50%;display:grid;place-items:center;margin:14px auto;background:#fff;color:#0d5039;font-size:24px;font-weight:800;border:4px solid #d6b65c}
.menu{display:flex;gap:8px;flex-wrap:wrap}.menu button{background:#fff;color:#124b37;border:1px solid #dce5df}
hr{border:0;border-top:1px solid #e5e9eb;margin:15px 0}
@media(max-width:600px){.wrap{padding:10px}header{align-items:flex-start}header h2{font-size:17px}}
`;

function App() {
  const [page, setPage] = useState(() => window.location.pathname === "/secret-admin" ? "admin-login" : "home");
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedSizes, setSelectedSizes] = useState({});
  const [orders, setOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);

  const [sellerApp, setSellerApp] = useState(null);
  const [mySellerProducts, setMySellerProducts] = useState([]);
  const [adminApplications, setAdminApplications] = useState([]);
  const [adminSellerProducts, setAdminSellerProducts] = useState([]);
  const [approvedSellers, setApprovedSellers] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [sellerMessages, setSellerMessages] = useState([]);
  const [adminSellerMessages, setAdminSellerMessages] = useState([]);
  const [sellerWithdrawals, setSellerWithdrawals] = useState([]);
  const [adminWithdrawals, setAdminWithdrawals] = useState([]);
  const [sellerMessageText, setSellerMessageText] = useState("");
  const [adminReplyText, setAdminReplyText] = useState({});
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("bKash");
  const [withdrawAccount, setWithdrawAccount] = useState("");
  const [riderInputs, setRiderInputs] = useState({});
  const [voucherInputs, setVoucherInputs] = useState({});

  const [reg, setReg] = useState({ shop_name:"", first_name:"", email:"", password:"", phone:"", product_name:"", product_details:"" });
  const [regImage, setRegImage] = useState(null);
  const [sellerLogin, setSellerLogin] = useState({ seller_id:"", password:"" });
  const [sellerProduct, setSellerProduct] = useState({ title:"", description:"", price:"", category:"Foods" });
  const [sellerProductImage, setSellerProductImage] = useState(null);
  const [editingSellerProduct, setEditingSellerProduct] = useState(null);

  const [adminLogin, setAdminLogin] = useState({ email:"", password:"" });
  const [checkout, setCheckout] = useState({ name:"", phone:"", address:"", payment:"Cash on Delivery", sender_number:"", transaction_id:"" });

  useEffect(() => {
    if (!db) return;
    db.auth.getSession().then(({ data }) => {
      const current = data?.session?.user || null;
      setUser(current);
      if (current) checkAdmin(current);
    });
    const { data: listener } = db.auth.onAuthStateChange((_event, session) => {
      const current = session?.user || null;
      setUser(current);
      if (current) checkAdmin(current);
      else { setIsAdmin(false); setSellerApp(null); }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => {
    if (user && isAdmin) {
      loadAdminApplications(); loadAdminSellerProducts(); loadOrders();
      loadApprovedSellers(); loadAdminSellerMessages(); loadAdminWithdrawals();
    }
  }, [user, isAdmin]);
  useEffect(() => {
    if (user && !isAdmin) { loadSellerApplication(); loadSellerOrders(); loadSellerMessages(); loadSellerWithdrawals(); }
  }, [user, isAdmin]);

  async function checkAdmin(currentUser) {
    if (!db || !currentUser) {
      setIsAdmin(false);
      if (window.location.pathname === "/secret-admin") setPage("admin-login");
      return false;
    }
    try {
      const { data, error } = await db.from("admin_users").select("user_id").eq("user_id", currentUser.id).maybeSingle();
      if (error) throw error;
      const allowed = !!data && data.user_id === currentUser.id;
      setIsAdmin(allowed);
      if (window.location.pathname === "/secret-admin") setPage(allowed ? "admin" : "admin-login");
      return allowed;
    } catch (_error) {
      setIsAdmin(false);
      if (window.location.pathname === "/secret-admin") setPage("admin-login");
      return false;
    }
  }

  async function uploadImage(file, userId) {
    if (!file) return null;
    if (!db || !userId) throw new Error("লগইন পাওয়া যায়নি।");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${userId}/${Date.now()}-${safeName}`;
    const { error } = await db.storage.from("product-images").upload(path, file, { upsert: false });
    if (error) throw error;
    const { data } = db.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  }

  async function loadProducts() {
    if (!db) return;
    const [{ data: adminRows }, { data: sellerRows }] = await Promise.all([
      db.from("products").select("*").order("created_at", { ascending: false }),
      db.from("seller_products").select("*").eq("status", "approved").order("created_at", { ascending: false })
    ]);
    const adminList = (adminRows || []).map(row => ({
      id: row.id, title: row.title, category: row.category || "Foods",
      image: row.image_url || row.image || "",
      options: Array.isArray(row.options) ? row.options : [{ size: "একক", price: Number(row.price || 0) }]
    }));
    const sellerList = (sellerRows || []).map(row => ({
      id: row.id, title: row.title, category: row.category || "Foods",
      image: row.image_url || "", options: [{ size: "একক", price: Number(row.price || 0) }],
      is_seller_product: true, seller_user_id: row.seller_user_id, seller_product_id: row.id
    }));
    setProducts([...adminList, ...sellerList, ...(!adminList.length && !sellerList.length ? DEFAULT_PRODUCTS : [])]);
  }

  async function loadSellerApplication() {
    if (!db || !user) return;
    const { data } = await db.from("seller_applications").select("*").eq("user_id", user.id).maybeSingle();
    setSellerApp(data || null);
    if (data?.status === "approved") { loadMySellerProducts(); loadSellerOrders(); loadSellerMessages(); loadSellerWithdrawals(); }
  }

  async function loadMySellerProducts() {
    if (!db || !user) return;
    const { data, error } = await db.from("seller_products").select("*").eq("seller_user_id", user.id).order("created_at", { ascending: false });
    if (!error) setMySellerProducts(data || []);
  }

  async function loadAdminApplications() {
    if (!db || !isAdmin) return;
    const { data, error } = await db.from("seller_applications").select("*").order("created_at", { ascending: false });
    if (!error) setAdminApplications(data || []);
  }

  async function loadAdminSellerProducts() {
    if (!db || !isAdmin) return;
    const { data, error } = await db.from("seller_products").select("*").order("created_at", { ascending: false });
    if (!error) setAdminSellerProducts(data || []);
  }

  async function loadOrders() {
    if (!db || !isAdmin) return;
    const { data, error } = await db.from("market_orders").select("*").order("created_at", { ascending: false });
    if (!error) setOrders(data || []);
  }

  async function loadMyOrders() {
    if (!db || !user) return;
    const { data, error } = await db.from("market_orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (!error) setMyOrders(data || []);
  }

  async function loadApprovedSellers() {
    if (!db || !isAdmin) return;
    const { data, error } = await db.from("seller_applications").select("user_id,contact_name,phone,seller_code,status").eq("status", "approved").order("created_at", { ascending: false });
    if (!error) setApprovedSellers(data || []);
  }

  async function loadSellerOrders() {
    if (!db || !user || isAdmin || sellerApp?.status !== "approved") return;
    const { data, error } = await db.from("market_orders").select("id,customer_name,phone,address,total,status,items,created_at,voucher_amount,rider_code,rider_code_verified_at")
      .eq("assigned_seller_id", user.id).order("created_at", { ascending: false });
    if (!error) setSellerOrders(data || []);
    }setUser(current);
      let { data: application, error: appError } = await db.from("seller_applications").select("*").eq("user_id", current.id).maybeSingle();
      if (appError) throw appError;
      if (!application && current.user_metadata?.first_name) {
        const meta = current.user_metadata;
        const { data: inserted, error: insertError } = await db.from("seller_applications").insert({
          user_id: current.id, shop_name: meta.shop_name || meta.first_name || "সেলার শপ",
          contact_name: meta.first_name, phone: meta.phone || "", description: `পণ্য: ${meta.product_name || ""}\nবিস্তারিত: ${meta.product_details || ""}`, status: "pending"
        }).select().single();
        if (insertError) throw insertError;
        application = inserted;
      }
      setSellerApp(application || null);
      if (!application) { setPage("seller-register"); notify("এই ইমেইলে বিক্রেতার আবেদন পাওয়া যায়নি।"); }
      else if (application.status === "approved") { setPage("seller-dashboard"); await loadMySellerProducts(); }
      else setPage("seller-status");
    } catch (error) { notify(error.message || "লগইন করা যায়নি।"); }
    finally { setBusy(false); }
  }

  async function saveSellerProduct(event) {
    event.preventDefault();
    if (!db || !user || sellerApp?.status !== "approved") return notify("অনুমোদিত বিক্রেতা হিসেবে লগইন করুন।");
    setBusy(true);
    try {
      let imageUrl = editingSellerProduct?.image_url || null;
      if (sellerProductImage) imageUrl = await uploadImage(sellerProductImage, user.id);
      const payload = {
        title: sellerProduct.title.trim(), details: sellerProduct.description,
        price: Number(sellerProduct.price), category: sellerProduct.category,
        image_url: imageUrl
      };
      if (!payload.title || !payload.price || payload.price <= 0) throw new Error("পণ্যের নাম ও সঠিক দাম দিন।");
      let result;
      if (editingSellerProduct) {
        result = await db.from("seller_products").update(payload).eq("id", editingSellerProduct.id).eq("seller_user_id", user.id);
      } else {
        result = await db.from("seller_products").insert({ ...payload, seller_user_id: user.id, status: "pending" });
      }
      if (result.error) throw result.error;
      setSellerProduct({ title:"", description:"", price:"", category:"Foods" });
      setSellerProductImage(null); setEditingSellerProduct(null);
      await loadMySellerProducts(); await loadProducts();
      setPage("seller-products");
      notify(editingSellerProduct ? "পণ্য আপডেট হয়েছে; আবার অনুমোদনের অপেক্ষায় আছে।" : "পণ্য জমা হয়েছে; অ্যাডমিন অনুমোদনের পর সাইটে দেখা যাবে।");
    } catch (error) { notify(error.message || "পণ্য সংরক্ষণ করা যায়নি।"); }
    finally { setBusy(false); }
  }

  async function deleteSellerProduct(id) {
    if (!db || !user || !window.confirm("এই পণ্যটি মুছে ফেলবেন?")) return;
    const { error } = await db.from("seller_products").delete().eq("id", id).eq("seller_user_id", user.id);
    if (error) notify(error.message); else { await loadMySellerProducts(); await loadProducts(); notify("পণ্য মুছে ফেলা হয়েছে।"); }
  }

  async function reviewApplication(id, decision) {
    if (!db || !isAdmin) return;
    const { error } = await db.rpc("review_seller_application", { application_id: id, decision });
    if (error) notify(error.message);
    else { await loadAdminApplications(); notify(decision === "approved" ? "বিক্রেতার আবেদন অনুমোদন হয়েছে।" : "আবেদন বাতিল হয়েছে।"); }
  }

  async function reviewSellerProduct(id, decision) {
    if (!db || !isAdmin) return;
    const { error } = await db.rpc("review_seller_product", { product_id: id, decision });
    if (error) notify(error.message);
    else { await loadAdminSellerProducts(); await loadProducts(); notify("পণ্যের রিভিউ আপডেট হয়েছে।"); }
  }

  async function adminSignIn(event) {
    event.preventDefault();
    if (window.location.pathname !== "/secret-admin") return notify("অ্যাডমিন প্রবেশের ঠিকানা সঠিক নয়।");
    if (!db) return notify("Supabase সেটিংস যোগ করা হয়নি।");
    setBusy(true);
    try {
      const { data, error } = await db.auth.signInWithPassword(adminLogin);
      if (error) throw error;
      const allowed = await checkAdmin(data.user);
      if (!allowed) {
        await db.auth.signOut();
        setIsAdmin(false);
        setPage("admin-login");
        notify("এই অ্যাকাউন্ট অ্যাডমিন হিসেবে অনুমোদিত নয়।");
        return;
      }
      setPage("admin");
    } catch (error) {
      setIsAdmin(false);
      notify(error.message || "অ্যাডমিন লগইন করা যায়নি।");
    } finally { setBusy(false); }
  }

  async function logout() {
    if (db) await db.auth.signOut();
    setUser(null); setIsAdmin(false); setSellerApp(null); window.history.replaceState({}, "", "/"); setPage("home");
  }

  function addToCart(product) {
    const option = product.options?.[Number(selectedSizes[product.id] || 0)] || product.options?.[0];
    if (!option) return;
    setCart(old => [...old, {
      id: `${product.id}-${Date.now()}`, product_id: product.id, title: product.title,
      size: option.size, price: Number(option.price), quantity: 1, category: product.category,
      is_seller_product: !!product.is_seller_product,
      seller_user_id: product.seller_user_id || null,
      seller_product_id: product.seller_product_id || null
    }]);
    notify("কার্টে যোগ হয়েছে।");
  }

  async function placeOrder(event) {
    event.preventDefault();
    if (!db || !user) return notify("অর্ডার করতে আগে লগইন করুন।");
    if (!cart.length) return notify("কার্ট খালি।");
    const phoneDigits = checkout.phone.replace(/\D/g, "");
    if (!/^\d{11}$/.test(phoneDigits)) return notify("মোবাইল নম্বর অবশ্যই ১১ সংখ্যার হতে হবে।");
    if (checkout.payment === "bKash Personal" && (!/^01[3-9]\d{8}$/.test(checkout.sender_number.replace(/\D/g, "")) || !checkout.transaction_id.trim())) return notify("বিকাশ নম্বর ১১ সংখ্যার এবং Transaction ID দিন।");
    setBusy(true);
    try {
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);const { error } = await db.from("market_orders").insert({
        user_id: user.id, customer_name: checkout.name, phone: checkout.phone,
        address: checkout.address, payment_method: checkout.payment,
        payment_number: checkout.payment === "bKash Personal" ? checkout.sender_number.replace(/\D/g, "") : null, transaction_id: checkout.transaction_id, total, items: cart,
        status: "pending"
      });
      if (error) throw error;
      setCart([]); setPage("my-orders"); await loadMyOrders(); notify("অর্ডার জমা হয়েছে।");
    } catch (error) { notify(error.message || "অর্ডার জমা হয়নি।"); }
    finally { setBusy(false); }
  }

  async function updateOrderStatus(id, status) {
    if (!db || !isAdmin) return notify("অ্যাডমিন অনুমতি প্রয়োজন।");
    const { error } = await db.from("market_orders").update({ status }).eq("id", id);
    if (error) notify(error.message); else loadOrders();
  }

  const filteredProducts = useMemo(() => products.filter(p =>
    (category === "All" || p.category === category) &&
    p.title.toLowerCase().includes(search.toLowerCase())
  ), [products, category, search]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function Header() {
    return <header><h2>BD BUSINESS — বিডি বাণিজ্য</h2><div className="actions">
      <button className="secondary" onClick={() => setPage("home")}>হোম</button>
      <button className="secondary" onClick={() => setPage("cart")}>কার্ট ({cart.length})</button>
      <button className="secondary" onClick={() => setMenuOpen(!menuOpen)}>⋮</button>
    </div>{menuOpen && <div className="menu" style={{width:"100%"}}>
      <button onClick={() => {setPage("seller-register");setMenuOpen(false);}}>সেলার নিবন্ধন</button>
      <button onClick={() => {setPage("seller-login");setMenuOpen(false);}}>সেলার আইডি লগইন</button>
      <button onClick={() => {setPage("my-orders");loadMyOrders();setMenuOpen(false);}}>আমার অর্ডার</button>
      <a href={`https://wa.me/88${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">WhatsApp</a>
      <a href={FACEBOOK_PAGE} target="_blank" rel="noreferrer">Facebook</a>
    </div>}</header>;
  }

  function SellerHeader() {
    return <div className="seller-wall">
      <div style={{fontSize:23,fontWeight:800}}>বিডি বাণিজ্য</div>
      <div className="logo">BD</div>
      <div style={{fontSize:18,fontWeight:700}}>{sellerApp?.contact_name || user?.user_metadata?.first_name || "বিক্রেতা"}</div>
      <div style={{marginTop:6}}>Seller ID: {sellerApp?.seller_code || "অনুমোদনের অপেক্ষায়"}</div>
    </div>;
  }

  return <><style>{css}</style>
    {!(page.startsWith("seller-") || page === "seller-register" || page === "seller-login" || page.startsWith("admin")) && <Header />}
    {message && <div className="wrap"><div className="card">{message}</div></div>}
    <main className="wrap">
      {page === "home" && <>
        <div className="card"><h2>আমাদের পণ্য</h2><input placeholder="পণ্য খুঁজুন..." value={search} onChange={e=>setSearch(e.target.value)} />
          <div className="actions">{["All","Foods","Clothing","Oil & Soap","Parts"].map(c=><button className="secondary" key={c} onClick={()=>setCategory(c)}>{c==="All"?"সব পণ্য":c}</button>)}</div>
        </div>
        <div className="grid">{filteredProducts.map(p=><div className="card product" key={p.id}>
          {p.image ? <img src={p.image} alt={p.title}/> : <div className="preview center" style={{display:"grid",placeItems:"center"}}>BD BUSINESS</div>}
          <h3>{p.title}</h3>{p.is_seller_product && <span className="muted">বিক্রেতার পণ্য</span>}
          <label>সাইজ / প্যাকেট</label><select value={selectedSizes[p.id] || 0} onChange={e=>setSelectedSizes(s=>({...s,[p.id]:e.target.value}))}>
            {p.options.map((o,i)=><option value={i} key={i}>{o.size} — ৳{o.price}</option>)}
          </select><button onClick={()=>addToCart(p)}>কার্টে যোগ করুন</button>
        </div>)}</div>
      </>}

      {page === "seller-register" && <div className="card"><h2>বিক্রেতা নিবন্ধন</h2>
        <form onSubmit={submitSellerApplication}>
          <label>দোকানের নাম</label><input required value={reg.shop_name} onChange={e=>setReg({...reg,shop_name:e.target.value})}/>
          <label>আপনার নাম</label><input required value={reg.first_name} onChange={e=>setReg({...reg,first_name:e.target.value})}/>
          <label>জিমেইল / ইমেইল</label><input type="email" required value={reg.email} onChange={e=>setReg({...reg,email:e.target.value})}/>
          <label>পাসওয়ার্ড</label><input type="password" minLength="6" required value={reg.password} onChange={e=>setReg({...reg,password:e.target.value})}/>
          <label>মোবাইল নম্বর</label><input required value={reg.phone} onChange={e=>setReg({...reg,phone:e.target.value})}/>
          <label>আপনি কোন পণ্য বিক্রি করবেন?</label><input required value={reg.product_name} onChange={e=>setReg({...reg,product_name:e.target.value})}/>
          <label>পণ্যের ছবি</label><input type="file" accept="image/*" onChange={e=>setRegImage(e.target.files?.[0] || null)}/>
          <label>পণ্যের বিস্তারিত</label><textarea required rows="3" value={reg.product_details} onChange={e=>setReg({...reg,product_details:e.target.value})}/>
          <button disabled={busy}>{busy?"জমা হচ্ছে...":"নিবেদন করুন"}</button>
        </form><button className="secondary" onClick={()=>setPage("seller-login")}>আগে নিবন্ধন করেছেন? Seller Login</button>
      </div>}

      {page === "seller-login" && <div className="card"><h2>Seller Login</h2><form onSubmit={sellerSignIn}>
        <label>Seller ID</label><input required value={sellerLogin.seller_id} onChange={e=>setSellerLogin({...sellerLogin,seller_id:e.target.value})}/>
        <label>পাসওয়ার্ড</label><input type="password" required value={sellerLogin.password} onChange={e=>setSellerLogin({...sellerLogin,password:e.target.value})}/>
        <button disabled={busy}>{busy?"লগইন হচ্ছে...":"লগইন"}</button>
      </form><button className="secondary" onClick={()=>setPage("seller-register")}>নতুন বিক্রেতা নিবন্ধন</button></div>}

      {page === "seller-status" && <div className="card center"><h2>বিক্রেতা আবেদনের অবস্থা</h2>
        {sellerApp ? <><p>নাম: {sellerApp.contact_name || sellerApp.first_name || "বিক্রেতা"}</p><p>অবস্থা: <span className={`status ${sellerApp.status}`}>{sellerApp.status==="pending"?"অনুমোদনের অপেক্ষায়":sellerApp.status==="approved"?"অনুমোদিত":"বাতিল"}</span></p>
          {sellerApp.status==="approved" && <button onClick={()=>setPage("seller-dashboard")}>Seller Dashboard</button>}
        </> : <p>আবেদনের তথ্য পাওয়া যায়নি। Seller Login করুন।</p>}
        <button className="secondary" onClick={logout}>লগআউট</button>
      </div>}

      {page === "seller-dashboard" && sellerApp?.status === "approved" && <>
        <SellerHeader />
        <div className="grid"><button onClick={()=>{setEditingSellerProduct(null);setSellerProduct({title:"",description:"",price:"",category:"Foods"});setSellerProductImage(null);setPage("seller-add-product");}}>+ Add Product</button>
          <button onClick={()=>{loadMySellerProducts();setPage("seller-products");}}>My Product</button></div>
        <p className="muted center">এই ড্যাশবোর্ডে অর্ডার বা ক্রেতার তথ্য দেখানো হয় না।</p>
        <div className="center"><button className="secondary" onClick={logout}>লগআউট</button></div>
      </>}{page === "seller-add-product" && sellerApp?.status === "approved" && <div className="card"><h2>{editingSellerProduct?"পণ্য সম্পাদনা":"Add Product"}</h2>
        <form onSubmit={saveSellerProduct}>
          <label>পণ্যের নাম</label><input required value={sellerProduct.title} onChange={e=>setSellerProduct({...sellerProduct,title:e.target.value})}/>
          <label>পণ্যের ছবি</label><input type="file" accept="image/*" onChange={e=>setSellerProductImage(e.target.files?.[0] || null)}/>
          {editingSellerProduct?.image_url && !sellerProductImage && <img className="preview" src={editingSellerProduct.image_url} alt="বর্তমান ছবি"/>}
          <label>পণ্যের বিস্তারিত</label><textarea rows="4" value={sellerProduct.description} onChange={e=>setSellerProduct({...sellerProduct,description:e.target.value})}/>
          <label>দাম (টাকা)</label><input type="number" min="1" required value={sellerProduct.price} onChange={e=>setSellerProduct({...sellerProduct,price:e.target.value})}/>
          <label>ক্যাটাগরি</label><select value={sellerProduct.category} onChange={e=>setSellerProduct({...sellerProduct,category:e.target.value})}><option value="Foods">Foods</option><option value="Clothing">Clothing</option><option value="Oil & Soap">Oil & Soap</option><option value="Parts">Parts</option></select>
          <button disabled={busy}>{busy?"সংরক্ষণ হচ্ছে...":"পণ্য জমা দিন"}</button>
        </form><button className="secondary" onClick={()=>setPage("seller-dashboard")}>ফিরে যান</button>
      </div>}

      {page === "seller-products" && sellerApp?.status === "approved" && <>
        <SellerHeader/><h2>My Product</h2>
        {mySellerProducts.length===0 && <div className="card">এখনো কোনো পণ্য যোগ করেননি।</div>}
        <div className="grid">{mySellerProducts.map(p=><div className="card" key={p.id}>
          {p.image_url && <img className="preview" src={p.image_url} alt={p.title}/>}<h3>{p.title}</h3><p>৳{p.price}</p>
          <span className={`status ${p.status}`}>{p.status==="pending"?"অনুমোদনের অপেক্ষায়":p.status==="approved"?"অনুমোদিত":"বাতিল"}</span>
          <p className="muted">{p.details || p.description}</p>
          <div className="actions"><button className="secondary" onClick={()=>{setEditingSellerProduct(p);setSellerProduct({title:p.title,description:p.details||p.description||"",price:String(p.price),category:p.category||"Foods"});setSellerProductImage(null);setPage("seller-add-product");}}>Edit</button>
          <button className="danger" onClick={()=>deleteSellerProduct(p.id)}>Delete</button></div>
        </div>)}</div>
        <button className="secondary" onClick={()=>setPage("seller-dashboard")}>ফিরে যান</button>
      </>}

      {page === "admin-login" && window.location.pathname === "/secret-admin" && <div className="card"><h2>Admin Login</h2><form onSubmit={adminSignIn}>
        <label>ইমেইল</label><input type="email" required value={adminLogin.email} onChange={e=>setAdminLogin({...adminLogin,email:e.target.value})}/>
        <label>পাসওয়ার্ড</label><input type="password" required value={adminLogin.password} onChange={e=>setAdminLogin({...adminLogin,password:e.target.value})}/>
        <button disabled={busy}>{busy?"যাচাই হচ্ছে...":"লগইন"}</button>
      </form></div>}

      {page === "admin" && isAdmin && <>
        <h2>Admin Panel</h2><div className="actions"><button onClick={()=>{loadAdminApplications();setPage("admin-applications");}}>Seller Applications ({adminApplications.length})</button>
          <button onClick={()=>{loadAdminSellerProducts();setPage("admin-seller-products");}}>Seller Products</button>
          <button onClick={()=>{loadOrders();setPage("admin-orders");}}>Orders</button>
          <button className="secondary" onClick={logout}>লগআউট</button></div>
      </>}

      {page === "admin-applications" && isAdmin && <>
        <h2>Seller Applications</h2><button className="secondary" onClick={loadAdminApplications}>রিফ্রেশ</button>
        {adminApplications.map(a=><div className="card" key={a.id}>
          <h3>{a.contact_name || "বিক্রেতা"}</h3><p>ফোন: {a.phone}</p><p>{a.description}</p>
          <p>অবস্থা: <span className={`status ${a.status}`}>{a.status}</span></p>
          {a.seller_code && <p>Seller ID: {a.seller_code}</p>}
          {a.status==="pending" && <div className="actions"><button onClick={()=>reviewApplication(a.id,"approved")}>Approve</button><button className="danger" onClick={()=>reviewApplication(a.id,"rejected")}>Reject</button></div>}
        </div>)}
        <button className="secondary" onClick={()=>setPage("admin")}>ফিরে যান</button>
      </>}

      {page === "admin-seller-products" && isAdmin && <>
        <h2>Seller Product Approval</h2><button className="secondary" onClick={loadAdminSellerProducts}>রিফ্রেশ</button>
        {adminSellerProducts.map(p=><div className="card" key={p.id}>
          {p.image_url && <img className="preview" src={p.image_url} alt={p.title}/>}<h3>{p.title}</h3><p>দাম: ৳{p.price}</p><p>{p.details || p.description}</p><p>Seller UID: {p.seller_user_id}</p>
          <p>অবস্থা: <span className={`status ${p.status}`}>{p.status}</span></p>
          {p.status==="pending" && <div className="actions"><button onClick={()=>reviewSellerProduct(p.id,"approved")}>Approve</button><button className="danger" onClick={()=>reviewSellerProduct(p.id,"rejected")}>Reject</button></div>}
        </div>)}
        <button className="secondary" onClick={()=>setPage("admin")}>ফিরে যান</button>
      </>}

      {page === "admin-orders" && isAdmin && <>
        <h2>অর্ডার ইনবক্স</h2><button className="secondary" onClick={loadOrders}>রিফ্রেশ</button>
        {orders.map(o=><div className="card" key={o.id}><h3>অর্ডার #{String(o.id).slice(0,8)}</h3>
          <p>ক্রেতা: {o.customer_name} | ফোন: {o.phone}</p><p>ঠিকানা: {o.address}</p><p>পেমেন্ট: {o.payment_method} | প্রেরকের নম্বর: {o.payment_number || "নেই"} | ট্রানজেকশন: {o.transaction_id||"নেই"}</p>
          <p>মোট: ৳{o.total} | অবস্থা: {o.status}</p>
          <ul>{(o.items||[]).map((it,i)=><li key={i}>{it.title} — {it.size} — ৳{it.price} × {it.quantity} · ডেলিভারি {it.category === "Foods" ? "৪ ঘণ্টা" : "৪৮ ঘণ্টা"} {it.is_seller_product?"(Seller product)":""}</li>)}</ul>
          {o.status==="pending" && <div className="actions"><button onClick={()=>updateOrderStatus(o.id,"accepted")}>Accept</button><button className="danger" onClick={()=>updateOrderStatus(o.id,"rejected")}>Reject</button></div>}
        </div>)}
        <button className="secondary" onClick={()=>setPage("admin")}>ফিরে যান</button>
      </>}

      {page === "cart" && <><h2>আপনার কার্ট</h2>{cart.length===0?<div className="card">কার্ট খালি।</div>:<>
        {cart.map(item=><div className="card row" key={item.id}><div><b>{item.title}</b><div className="muted">{item.size} · ৳{item.price} · ডেলিভারি: {item.category === "Foods" ? "৪ ঘণ্টা" : "৪৮ ঘণ্টা"}</div></div><button className="danger" onClick={()=>setCart(c=>c.filter(x=>x.id!==item.id))}>বাদ দিন</button></div>)}
        <div className="card"><b>মোট: ৳{total}</b><button style={{marginLeft:12}} onClick={()=>setPage("checkout")}>অর্ডার করুন</button></div>
      </>}</>}

      {page === "checkout" && <div className="card"><h2>অর্ডার তথ্য</h2><form onSubmit={placeOrder}>
        <label>আপনার নাম</label><input required value={checkout.name} onChange={e=>setCheckout({...checkout,name:e.target.value})}/>
        <label>মোবাইল (১১ সংখ্যা)</label><input required inputMode="numeric" maxLength="11" value={checkout.phone} onChange={e=>setCheckout({...checkout,phone:e.target.value.replace(/\D/g,"").slice(0,11)})}/>
        <label>ঠিকানা</label><textarea required value={checkout.address} onChange={e=>setCheckout({...checkout,address:e.target.value})}/>
        <label>পেমেন্ট</label><select value={checkout.payment} onChange={e=>setCheckout({...checkout,payment:e.target.value})}><option>Cash on Delivery</option><option>bKash Personal</option></select>
        {checkout.payment==="bKash Personal" && <div className="card"><div className="row"><b>বিকাশ নম্বর: {BKASH_NUMBER}</b><button type="button" className="secondary" onClick={copyBkash}>নম্বর কপি</button></div><button type="button" style={{background:"#e2136e",marginBottom:10}} onClick={copyBkash}><b style={{fontSize:18}}>bKash</b> পেমেন্ট নম্বর কপি করুন</button><label>যে বিকাশ নম্বর থেকে পাঠিয়েছেন</label><input inputMode="numeric" maxLength="11" required value={checkout.sender_number} onChange={e=>setCheckout({...checkout,sender_number:e.target.value.replace(/\D/g,"").slice(0,11)})}/><label>Transaction ID</label><input required value={checkout.transaction_id} onChange={e=>setCheckout({...checkout,transaction_id:e.target.value})}/></div>}
        <button disabled={busy}>{busy?"অর্ডার হচ্ছে...":"অর্ডার নিশ্চিত করুন"}</button>
      </form></div>}

      {page === "my-orders" && <><h2>আমার অর্ডার</h2><button className="secondary" onClick={loadMyOrders}>রিফ্রেশ</button>
        {myOrders.map(o=><div className="card" key={o.id}><b>অর্ডার #{String(o.id).slice(0,8)}</b><p>মোট ৳{o.total} · {o.status}</p></div>)}
      </>}

      {page.startsWith("admin") && !isAdmin && page !== "admin-login" && <div className="card">অ্যাক্সেস অনুমোদিত নয়। <button className="secondary" onClick={()=>setPage("home")}>হোমে ফিরুন</button></div>}
      {!db && <div className="card"><b>Supabase সেটিংস প্রয়োজন:</b> `.env` ফাইলে VITE_SUPABASE_URL এবং VITE_SUPABASE_ANON_KEY দিন।</div>}
    </main>
    <footer className="wrap center muted">BD BUSINESS · খাবার ও অন্যান্য পণ্য</footer>
  </>;
}

createRoot(document.getElementById("root")).render(<App />);
