import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const db = url && key ? createClient(url, key) : null;

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [page, setPage] = useState('home');
  const [category, setCategory] = useState('সব');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [productCategory, setProductCategory] = useState('Food and sweets');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pendingProducts, setPendingProducts] = useState([]);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [orders, setOrders] = useState([]);

  const notify = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3500);
  };

  async function loadProducts() {
    if (!db) return;
    const { data, error } = await db
      .from('market_products')
      .select('*')
      .eq('status', 'approved')
      .order('id', { ascending: false });

    if (error) {
      notify(error.message);
      return;
    }
    setProducts(data || []);
  }

  async function checkUser() {
    if (!db) return;
    const { data } = await db.auth.getSession();
    const currentUser = data?.session?.user || null;
    setUser(currentUser);

    if (currentUser) {
      const { data: admin } = await db
        .from('admin_users')
        .select('user_id')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      setIsAdmin(!!admin);
    } else {
      setIsAdmin(false);
    }
  }

  useEffect(() => {
    if (!db) {
      notify('Supabase সংযোগ পাওয়া যায়নি।');
      return;
    }

    checkUser();
    loadProducts();

    const { data: listener } = db.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signUp() {
    if (!db) return notify('Supabase সংযোগ নেই।');
    if (!email || !password) return notify('ইমেইল ও পাসওয়ার্ড দিন।');
    if (password.length < 6) return notify('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের দিন।');

    const { error } = await db.auth.signUp({ email, password });
    if (error) return notify(error.message);
    notify('রেজিস্ট্রেশন হয়েছে। ইমেইল যাচাই করতে হতে পারে।');
  }

  async function signIn() {
    if (!db) return notify('Supabase সংযোগ নেই।');
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error) return notify(error.message);
    notify('লগইন সফল হয়েছে।');
    await checkUser();
  }

  async function signOut() {
    if (!db) return;
    await db.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setPage('home');
    notify('লগআউট হয়েছে।');
  }

  async function applySeller() {
    if (!db || !user) return notify('আগে লগইন করুন।');
    if (!sellerName || !phone) return notify('নাম ও ফোন নম্বর দিন।');

    const { error } = await db.from('seller_applications').insert({
      user_id: user.id,
      seller_name: sellerName,
      phone,
      status: 'pending'
    });

    if (error) return notify(error.message);
    notify('সেলার আবেদন জমা হয়েছে।');
    setSellerName('');
    setPhone('');
  }

  async function submitProduct() {
    if (!db || !user) return notify('আগে লগইন করুন।');
    if (!title || !price || Number(price) <= 0) {
      return notify('পণ্যের নাম ও সঠিক দাম দিন।');
    }

    const { error } = await db.from('market_products').insert({
      seller_user_id: user.id,
      title,
      price: Number(price),
      category: productCategory,
      description,
      status: 'pending'
    });

    if (error) return notify(error.message);
    notify('পণ্য অনুমোদনের জন্য জমা হয়েছে।');
    setTitle('');
    setPrice('');
    setDescription('');
  }

  function addToCart(product) {
    setCart(old => {
      const found = old.find(item => item.id === product.id);
      if (found) {
        return old.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...old, { ...product, quantity: 1 }];
    });
    notify('কার্টে যোগ হয়েছে।');
  }

  function changeQuantity(id, amount) {
    setCart(old =>
      old
        .map(item =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  }

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  async function placeOrder() {
    if (!db) return notify('Supabase সংযোগ নেই।');
    if (!cart.length) return notify('কার্ট খালি।');
    if (!customerName || !customerPhone || !address) {
      return notify('নাম, ফোন ও ঠিকানা পূরণ করুন।');
    }

    const items = cart.map(item => ({
      id: item.id,
      title: item.title,
      price: Number(item.price),
      quantity: item.quantity
    }));

    const { error } = await db.from('market_orders').insert({
      customer_name: customerName,
      phone: customerPhone,
      address,
      items,
      total,
      status: 'pending'
    });

    if (error) return notify(error.message);

    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setAddress('');
    setPage('home');
    notify('অর্ডার জমা হয়েছে।');
  }

  async function loadAdmin() {
    if (!db || !isAdmin) return;

    const [p, s, o] = await Promise.all([
      db.from('market_products').select('*').eq('status', 'pending'),
      db.from('seller_applications').select('*').eq('status', 'pending'),
      db.from('market_orders').select('*').order('id', { ascending: false })
    ]);

    if (p.error) notify(p.error.message);
    if (s.error) notify(s.error.message);
    if (o.error) notify(o.error.message);

    setPendingProducts(p.data || []);
    setPendingSellers(s.data || []);
    setOrders(o.data || []);
  }

  async function approveProduct(id, status) {
    if (!db || !isAdmin) return;
    const { error } = await db
      .from('market_products')
      .update({ status })
      .eq('id', id);

    if (error) return notify(error.message);
    notify('পণ্যের অবস্থা পরিবর্তন হয়েছে।');
    await loadAdmin();
    await loadProducts();
  }

  async function approveSeller(id, status) {
    if (!db || !isAdmin) return;
    const { error } = await db
      .from('seller_applications')
      .update({ status })
      .eq('id', id);

    if (error) return notify(error.message);
    notify('সেলারের অবস্থা পরিবর্তন হয়েছে।');
    await loadAdmin();
  }

  async function updateOrder(id, status) {
    if (!db || !isAdmin) return;
    const { error } = await db
      .from('market_orders')
      .update({ status })
      .eq('id', id);

    if (error) return notify(error.message);
    notify('অর্ডারের অবস্থা পরিবর্তন হয়েছে।');
    await loadAdmin();
  }

  useEffect(() => {
    if (page === 'admin' && isAdmin) loadAdmin();
  }, [page, isAdmin]);

  const filteredProducts = products.filter(product =>
    category === 'সব' || product.category === category
  );

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Arial, sans-serif; background: #f4f6f8; color: #222; }
        header { background: #073b32; color: white; padding: 18px 12px; text-align: center; }
        header h1 { margin: 0 0 6px; font-size: 27px; }
        nav { display: flex; flex-wrap: wrap; justify-content: center; gap: 7px; padding: 12px; background: white; }
        button { border: 0; border-radius: 7px; padding: 10px 13px; background: #087b58; color: white; cursor: pointer; }
        button.secondary { background: #34495e; }
        button.danger { background: #bd3434; }
        button:disabled { opacity: .5; }
        main { max-width: 950px; margin: auto; padding: 15px; }
        .card { background: white; border-radius: 12px; padding: 15px; margin: 12px 0; box-shadow: 0 2px 8px #00000012; }
        input, textarea, select { display: block; width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 7px; margin: 8px 0 13px; font-size: 16px; }
        textarea { min-height: 75px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
        .price { color: #087b58; font-size: 20px; font-weight: bold; }
        .muted { color: #666; font-size: 14px; }
        .message { position: sticky; top: 0; background: #fff2c7; padding: 12px; text-align: center; z-index: 5; }
        footer { text-align: center; padding: 25px; background: #073b32; color: white; margin-top: 25px; }
        h2 { color: #073b32; }
      `}</style>

      <header>
        <h1>BD BUSINESS</h1>
        <div>খাবার • মিষ্টি • বাইক পার্টস • সার্ভিসিং</div>
      </header>

      {message && <div className="message">{message}</div>}

      <nav>
        <button onClick={() => setPage('home')}>হোম</button>
        <button onClick={() => { setCategory('Food and sweets'); setPage('home'); }}>খাবার</button>
        <button onClick={() => { setCategory('Bike Parts'); setPage('home'); }}>বাইক পার্টস</button>
        <button onClick={() => setPage('cart')}>কার্ট ({cart.length})</button>
        <button onClick={() => setPage('seller')}>সেলার</button>
        <button onClick={() => setPage('add')}>পণ্য যোগ</button>
        {user
          ? <button className="secondary" onClick={signOut}>লগআউট</button>
          : <button onClick={() => setPage('login')}>লগইন</button>}
        {isAdmin && <button className="secondary" onClick={() => setPage('admin')}>অ্যাডমিন</button>}
      </nav>

      <main>
        {page === 'home' && (
          <>
            <section className="card">
              <h2>BD BUSINESS-এ স্বাগতম</h2>
              <p>এক জায়গায় খাবার ও মিষ্টি, বাইক পার্টস এবং সার্ভিসিং সম্পর্কিত পণ্য দেখুন।</p>
              <p><b>মদিনা বাইক সার্ভিসিং সেন্টার এন্ড বাইক গ্যালারি</b></p>
            </section>

            <section className="card">
              <h2>পণ্যের বিভাগ</h2>
              <button onClick={() => setCategory('সব')}>সব পণ্য</button>{' '}
              <button onClick={() => setCategory('Food and sweets')}>খাবার ও মিষ্টি</button>{' '}
              <button onClick={() => setCategory('Bike Parts')}>বাইক পার্টস</button>{' '}
              <button onClick={() => setCategory('Bike servicing')}>বাইক সার্ভিসিং</button>
            </section>

            <h2>অনুমোদিত পণ্য</h2>
            <div className="grid">
              {filteredProducts.map(product => (
                <div className="card" key={product.id}>
                  <h3>{product.title}</h3>
                  <div className="price">৳ {product.price}</div>
                  <p>{product.category}</p>
                  <p className="muted">{product.description}</p>
                  <button onClick={() => addToCart(product)}>কার্টে যোগ করুন</button>
                </div>
              ))}
            </div>
            {!filteredProducts.length && (
              <p className="card">এখনো কোনো অনুমোদিত পণ্য নেই।</p>
            )}
          </>
        )}

        {page === 'login' && (
          <section className="card">
            <h2>লগইন / রেজিস্ট্রেশন</h2>
            <input type="email" placeholder="ইমেইল" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="পাসওয়ার্ড" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={signIn}>লগইন</button>{' '}
            <button className="secondary" onClick={signUp}>নতুন অ্যাকাউন্ট খুলুন</button>
          </section>
        )}

        {page === 'seller' && (
          <section className="card">
            <h2>সেলার আবেদন</h2>
            {!user ? <p>সেলার আবেদন করতে আগে লগইন করুন।</p> : <>
              <input placeholder="সেলারের নাম" value={sellerName} onChange={e => setSellerName(e.target.value)} />
              <input placeholder="ফোন নম্বর" value={phone} onChange={e => setPhone(e.target.value)} />
              <button onClick={applySeller}>আবেদন জমা দিন</button>
            </>}
          </section>
        )}

        {page === 'add' && (
          <section className="card">
            <h2>নতুন পণ্য যোগ করুন</h2>
            {!user ? <p>পণ্য যোগ করতে আগে লগইন করুন।</p> : <>
              <input placeholder="পণ্যের নাম" value={title} onChange={e => setTitle(e.target.value)} />
              <input type="number" placeholder="দাম (টাকা)" value={price} onChange={e => setPrice(e.target.value)} />
              <select value={productCategory} onChange={e => setProductCategory(e.target.value)}>
                <option>Food and sweets</option>
                <option>Bike Parts</option>
                <option>Bike servicing</option>
              </select>
              <textarea placeholder="পণ্যের বিবরণ" value={description} onChange={e => setDescription(e.target.value)} />
              <button onClick={submitProduct}>অনুমোদনের জন্য জমা দিন</button>
            </>}
          </section>
        )}

        {page === 'cart' && (
          <section className="card">
            <h2>আপনার কার্ট</h2>
            {!cart.length && <p>কার্ট খালি।</p>}
            {cart.map(item => (
              <div className="card" key={item.id}>
                <b>{item.title}</b>
                <p>৳ {item.price} × {item.quantity}</p>
                <button onClick={() => changeQuantity(item.id, -1)}>-</button>{' '}
                <button onClick={() => changeQuantity(item.id, 1)}>+</button>
              </div>
            ))}
            <h3>মোট: ৳ {total}</h3>
            {cart.length > 0 && <>
              <h2>অর্ডারের তথ্য</h2>
              <input placeholder="আপনার নাম" value={customerName} onChange={e => setCustomerName(e.target.value)} />
              <input placeholder="ফোন নম্বর" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
              <textarea placeholder="সম্পূর্ণ ঠিকানা" value={address} onChange={e => setAddress(e.target.value)} />
              <button onClick={placeOrder}>অর্ডার জমা দিন</button>
            </>}
          </section>
        )}

        {page === 'admin' && (
          <section>
            {!isAdmin ? <p className="card">অ্যাডমিন অনুমতি প্রয়োজন।</p> : <>
              <div className="card">
                <h2>অ্যাডমিন প্যানেল</h2>
                <button onClick={loadAdmin}>তথ্য রিফ্রেশ</button>
              </div>

              <div className="card">
                <h2>সেলার আবেদন</h2>
                {pendingSellers.map(item => (
                  <div className="card" key={item.id}>
                    <b>{item.seller_name}</b>
                    <p>{item.phone}</p>
                    <button onClick={() => approveSeller(item.id, 'approved')}>অনুমোদন</button>{' '}
                    <button className="danger" onClick={() => approveSeller(item.id, 'rejected')}>বাতিল</button>
                  </div>
                ))}
                {!pendingSellers.length && <p>নতুন আবেদন নেই।</p>}
              </div>

              <div className="card">
                <h2>পণ্য অনুমোদন</h2>
                {pendingProducts.map(item => (
                  <div className="card" key={item.id}>
                    <b>{item.title}</b>
                    <p>৳ {item.price} | {item.category}</p>
                    <p>{item.description}</p>
                    <button onClick={() => approveProduct(item.id, 'approved')}>অনুমোদন</button>{' '}
                    <button className="danger" onClick={() => approveProduct(item.id, 'rejected')}>বাতিল</button>
                  </div>
                ))}
                {!pendingProducts.length && <p>অনুমোদনের অপেক্ষায় পণ্য নেই।</p>}
              </div>

              <div className="card">
                <h2>অর্ডার তালিকা</h2>
                {orders.map(order => (
                  <div className="card" key={order.id}>
                    <b>{order.customer_name}</b>
                    <p>ফোন: {order.phone}</p>
                    <p>ঠিকানা: {order.address}</p>
                    <p>মোট: ৳ {order.total}</p>
                    <p>অবস্থা: {order.status}</p>
                    <button onClick={() => updateOrder(order.id, 'confirmed')}>নিশ্চিত</button>{' '}
                    <button onClick={() => updateOrder(order.id, 'delivered')}>ডেলিভারি হয়েছে</button>{' '}
                    <button className="danger" onClick={() => updateOrder(order.id, 'cancelled')}>বাতিল</button>
                  </div>
                ))}
                {!orders.length && <p>কোনো অর্ডার নেই।</p>}
              </div>
            </>}
          </section>
        )}
      </main>

      <footer>
        <b>BD BUSINESS</b>
        <p>খাবার ও মিষ্টি | বাইক পার্টস | মদিনা বাইক সার্ভিসিং সেন্টার</p>
      </footer>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
