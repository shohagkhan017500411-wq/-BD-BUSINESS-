import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import './style.css';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const db = url && key ? createClient(url, key) : null;

function App() {
  const [session, setSession] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [applications, setApplications] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [customer, setCustomer] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Food and sweets');
  const [description, setDescription] = useState('');

  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  async function loadProducts() {
    if (!db) return;

    const { data, error } = await db
      .from('market_products')
      .select('*')
      .eq('status', 'approved');

    if (error) setMessage(error.message);
    else setProducts(data || []);
  }

  async function checkAdmin(user) {
    if (!db || !user) return;

    const { data } = await db
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    const admin = !!data;
    setIsAdmin(admin);

    if (admin) {
      const [a, p, o] = await Promise.all([
        db.from('seller_applications').select('*').eq('status', 'pending'),
        db.from('market_products').select('*').eq('status', 'pending'),
        db.from('market_orders').select('*').order('created_at', { ascending: false })
      ]);

      setApplications(a.data || []);
      setPendingProducts(p.data || []);
      setOrders(o.data || []);
    }
  }

  useEffect(() => {
    loadProducts();

    if (!db) {
      setMessage('Supabase সংযোগ পাওয়া যায়নি');
      return;
    }

    db.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) checkAdmin(data.session.user);
    });

    const { data: listener } = db.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        if (currentSession) checkAdmin(currentSession.user);
        else setIsAdmin(false);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function login(e) {
    e.preventDefault();
    const { error } = await db.auth.signInWithPassword({
      email,
      password
    });
    setMessage(error ? error.message : 'লগইন সফল');
  }

  async function signup(e) {
    e.preventDefault();
    const { error } = await db.auth.signUp({
      email,
      password
    });
    setMessage(error ? error.message : 'নিবন্ধন সফল');
  }

  async function logout() {
    await db.auth.signOut();
    setMessage('লগআউট হয়েছে');
  }

  async function apply(e) {
    e.preventDefault();

    const { error } = await db.from('seller_applications').insert({
      user_id: session.user.id,
      seller_name: sellerName,
      phone: sellerPhone,
      status: 'pending'
    });

    setMessage(error ? error.message : 'বিক্রেতার আবেদন জমা হয়েছে');
  }

  async function submitProduct(e) {
    e.preventDefault();

    const { error } = await db.from('market_products').insert({
      seller_user_id: session.user.id,
      title,
      price: Number(price),
      category,
      description,
      status: 'pending'
    });

    setMessage(error ? error.message : 'পণ্য জমা হয়েছে');
                                                      }function addToCart(product) {
    setCart(old => {
      const found = old.find(item => item.id === product.id);
      if (found) {
        return old.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...old, {
        id: product.id,
        title: product.title,
        price: Number(product.price),
        quantity: 1
      }];
    });
    setMessage('কার্টে যোগ হয়েছে');
  }

  function changeQuantity(id, amount) {
    setCart(old =>
      old.map(item =>
        item.id === id
          ? { ...item, quantity: item.quantity + amount }
          : item
      ).filter(item => item.quantity > 0)
    );
  }

  async function placeOrder(e) {
    e.preventDefault();

    if (!db || !cart.length) {
      setMessage('কার্ট খালি অথবা সংযোগ নেই');
      return;
    }

    if (!customer.trim() || !customerPhone.trim() || !address.trim()) {
      setMessage('নাম, ফোন ও ঠিকানা দিন');
      return;
    }

    const { error } = await db.from('market_orders').insert({
      customer_name: customer,
      phone: customerPhone,
      address,
      items: cart,
      total,
      status: 'pending'
    });

    if (error) {
      setMessage('অর্ডার হয়নি: ' + error.message);
    } else {
      setMessage('অর্ডার জমা হয়েছে');
      setCart([]);
      setCustomer('');
      setCustomerPhone('');
      setAddress('');
    }
  }

  async function refreshAdmin() {
    if (session) await checkAdmin(session.user);
  }

  async function reviewOrder(id, status) {
    const { error } = await db
      .from('market_orders')
      .update({ status })
      .eq('id', id);

    setMessage(error ? error.message : 'অর্ডার আপডেট হয়েছে');
    if (!error) await refreshAdmin();
  }

  async function reviewProduct(id, status) {
    const { error } = await db
      .from('market_products')
      .update({ status })
      .eq('id', id);

    setMessage(error ? error.message : 'পণ্য আপডেট হয়েছে');
    if (!error) {
      await refreshAdmin();
      await loadProducts();
    }
  }

  async function reviewSeller(id, status) {
    const { error } = await db
      .from('seller_applications')
      .update({ status })
      .eq('id', id);

    setMessage(error ? error.message : 'আবেদন আপডেট হয়েছে');
    if (!error) await refreshAdmin();
      }return (
    <>
      <header className="panel">
        <h1>BD BUSINESS</h1>
        <p>অনলাইন মার্কেটপ্লেস</p>
        {session && <button onClick={logout}>লগআউট</button>}
      </header>

      <main>
        {message && <p className="message">{message}</p>}

        {!session && (
          <section className="panel">
            <h2>লগইন / নিবন্ধন</h2>
            <form onSubmit={login}>
              <input type="email" placeholder="ইমেইল"
                value={email} onChange={e => setEmail(e.target.value)} required />
              <input type="password" placeholder="পাসওয়ার্ড"
                value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="submit">লগইন</button>
            </form>
            <button onClick={signup}>নতুন অ্যাকাউন্ট খুলুন</button>
          </section>
        )}

        {session && (
          <>
            <section className="panel">
              <h2>বিক্রেতা নিবন্ধন</h2>
              <form onSubmit={apply}>
                <input placeholder="বিক্রেতার নাম"
                  value={sellerName} onChange={e => setSellerName(e.target.value)} required />
                <input placeholder="মোবাইল নম্বর"
                  value={sellerPhone} onChange={e => setSellerPhone(e.target.value)} required />
                <button type="submit">আবেদন জমা দিন</button>
              </form>
            </section>

            <section className="panel">
              <h2>নতুন পণ্য যোগ করুন</h2>
              <form onSubmit={submitProduct}>
                <input placeholder="পণ্যের নাম"
                  value={title} onChange={e => setTitle(e.target.value)} required />
                <input type="number" placeholder="দাম"
                  value={price} onChange={e => setPrice(e.target.value)} required />
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  <option>Food and sweets</option>
                  <option>Bike Parts</option>
                  <option>Bike servicing</option>
                  <option>Other</option>
                </select>
                <textarea placeholder="পণ্যের বিবরণ"
                  value={description} onChange={e => setDescription(e.target.value)} />
                <button type="submit">পণ্য জমা দিন</button>
              </form>
            </section>
          </>
        )}

        <section className="panel">
          <h2>আমাদের পণ্য</h2>
          {products.map(product => (
            <article className="product" key={product.id}>
              <h3>{product.title}</h3>
              <p>{product.category}</p>
              <p>{product.description}</p>
              <strong>{product.price} টাকা</strong>
              <button onClick={() => addToCart(product)}>কার্টে যোগ করুন</button>
            </article>
          ))}
          {!products.length && <p>এখনো কোনো অনুমোদিত পণ্য নেই।</p>}
        </section>

        <section className="panel">
          <h2>আপনার কার্ট</h2>
          {cart.map(item => (
            <div key={item.id}>
              <p>{item.title} — {item.price} টাকা</p>
              <button onClick={() => changeQuantity(item.id, -1)}>−</button>
              {' '}{item.quantity}{' '}
              <button onClick={() => changeQuantity(item.id, 1)}>+</button>
            </div>
          ))}
          <h3>মোট: {total} টাকা</h3>
          <form onSubmit={placeOrder}>
            <input placeholder="আপনার নাম" value={customer}
              onChange={e => setCustomer(e.target.value)} required />
            <input placeholder="মোবাইল নম্বর" value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)} required />
            <textarea placeholder="সম্পূর্ণ ঠিকানা" value={address}
              onChange={e => setAddress(e.target.value)} required />
            <button type="submit" disabled={!cart.length}>অর্ডার নিশ্চিত করুন</button>
          </form>
        </section>

        {isAdmin && (
          <section className="panel">
            <h2>অ্যাডমিন প্যানেল</h2>
            <button onClick={refreshAdmin}>রিফ্রেশ করুন</button>

            <h3>গ্রাহকের অর্ডার</h3>
            {orders.map(order => (
              <article className="product" key={order.id}>
                <p>নাম: {order.customer_name}</p>
                <p>ফোন: {order.phone}</p>
                <p>ঠিকানা: {order.address}</p>
                <p>পণ্য: {JSON.stringify(order.items)}</p>
                <p>মোট: {order.total} টাকা</p>
                <p>অবস্থা: {order.status}</p>
                {order.status === 'pending' && (
                  <>
                    <button onClick={() => reviewOrder(order.id, 'approved')}>Approve</button>
                    <button onClick={() => reviewOrder(order.id, 'rejected')}>Reject</button>
                  </>
                )}
              </article>
            ))}

            <h3>বিক্রেতার আবেদন</h3>
            {applications.map(item => (
              <article className="product" key={item.id}>
                <p>{item.seller_name} — {item.phone}</p>
                <button onClick={() => reviewSeller(item.id, 'approved')}>Approve</button>
                <button onClick={() => reviewSeller(item.id, 'rejected')}>Reject</button>
              </article>
            ))}

            <h3>পণ্যের অনুমোদন</h3>
            {pendingProducts.map(item => (
              <article className="product" key={item.id}>
                <p>{item.title} — {item.price} টাকা</p>
                <button onClick={() => reviewProduct(item.id, 'approved')}>Approve</button>
                <button onClick={() => reviewProduct(item.id, 'rejected')}>Reject</button>
              </article>
            ))}
          </section>
        )}
      </main>

      <footer className="panel">
        <p>BD BUSINESS © 2026</p>
        <p>মদিনা বাইক সার্ভিসিং সেন্টার এন্ড বাইক গ্যালারি</p>
      </footer>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
