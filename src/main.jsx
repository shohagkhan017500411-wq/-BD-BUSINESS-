import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const db = url && key ? createClient(url, key) : null;

const BKASH = '01793798125';
const WHATSAPP = '01750041156';
const FACEBOOK = 'https://www.facebook.com/share/1DpyTMXEc6/';

const products = [
  {
    id: 1,
    title: 'মিষ্টি',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600',
    options: [
      { size: '৫০০ গ্রাম', price: 280 },
      { size: '১ কেজি', price: 550 }
    ]
  },
  {
    id: 2,
    title: 'রসমালাই',
    image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600',
    options: [
      { size: '৫০০ গ্রাম', price: 280 },
      { size: '১ কেজি', price: 550 }
    ]
  },
  {
    id: 3,
    title: 'সন্দেশ',
    image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=600',
    options: [
      { size: '৫০০ গ্রাম', price: 180 },
      { size: '১ কেজি', price: 350 }
    ]
  },
  {
    id: 4,
    title: 'দেশি লাল চিনি',
    image: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=600',
    options: [
      { size: '৫০০ গ্রাম', price: 135 },
      { size: '১ কেজি', price: 260 }
    ]
  },
  {
    id: 5,
    title: 'বাদামের খাজা',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600',
    options: [
      { size: '২৫০ গ্রাম', price: 130 },
      { size: '৫০০ গ্রাম', price: 250 }
    ]
  },
  {
    id: 6,
    title: 'রেশমি সনপাপড়ি',
    image: 'https://images.unsplash.com/photo-1605197584325-3b1e3e9e4f6b?w=600',
    options: [
      { size: '২৫০ গ্রাম', price: 130 },
      { size: '৫০০ গ্রাম', price: 250 }
    ]
  },
  {
    id: 7,
    title: 'খাঁটি নারিকেল তেল',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600',
    options: [
      { size: '২৫০ গ্রাম', price: 650 },
      { size: '৫০০ গ্রাম', price: 1200 }
    ]
  }
];

function App() {
  const [page, setPage] = useState('home');
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [orders, setOrders] = useState([]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bkash');

  function notify(text) {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3500);
  }

  async function copyBkash() {
    try {
      await navigator.clipboard.writeText(BKASH);
      notify('বিকাশ নম্বর কপি হয়েছে: ' + BKASH);
    } catch {
      notify('বিকাশ নম্বর: ' + BKASH);
    }
  }

  async function checkUser() {
    if (!db) return;

    const { data } = await db.auth.getSession();
    const current = data?.session?.user || null;
    setUser(current);

    if (current) {
      const { data: admin } = await db
        .from('admin_users')
        .select('user_id')
        .eq('user_id', current.id)
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

    const { data: listener } = db.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn() {
    if (!db) return notify('Supabase সংযোগ নেই।');

    const { error } = await db.auth.signInWithPassword({
      email,
      password
    });

    if (error) return notify(error.message);

    await checkUser();
    notify('লগইন সফল হয়েছে।');
    setPage('home');
  }

  async function signOut() {
    if (!db) return;

    await db.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setPage('home');
    notify('লগআউট হয়েছে।');
  }

  function addToCart(product, option) {
    const cartId = `${product.id}-${option.size}`;

    setCart(old => {
      const found = old.find(item => item.cartId === cartId);

      if (found) {
        return old.map(item =>
          item.cartId === cartId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...old,
        {
          cartId,
          id: product.id,
          title: product.title,
          size: option.size,
          price: option.price,
          quantity: 1
        }
      ];
    });

    notify('কার্টে যোগ হয়েছে।');
  }

  function changeQuantity(cartId, amount) {
    setCart(old =>
      old
        .map(item =>
          item.cartId === cartId
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  async function placeOrder() {
    if (!db) return notify('Supabase সংযোগ নেই।');
    if (!cart.length) return notify('কার্ট খালি।');

    if (
      !customerName.trim() ||
      !customerPhone.trim() ||
      !address.trim() ||
      (paymentMethod === 'bkash' && !transactionId.trim())
    ) {
      return notify('প্রয়োজনীয় সব তথ্য পূরণ করুন।');
    }

    const items = cart.map(item => ({
      title: item.title,
      size: item.size,
      price: item.price,
      quantity: item.quantity
    }));

    const { error } = await db.from('market_orders').insert({
      customer_name: customerName.trim(),
      phone: customerPhone.trim(),
      address: address.trim(),
      items,
      total,
      status: 'pending',
      payment_method:
        paymentMethod === 'bkash'
          ? 'bKash Personal'
          : 'Cash on Delivery',
      payment_number: paymentMethod === 'bkash' ? BKASH : null,
      transaction_id:
        paymentMethod === 'bkash' ? transactionId.trim() : null,
      payment_status:
        paymentMethod === 'bkash'
          ? 'pending_verification'
          : 'cash_on_delivery'
    });

    if (error) return notify(error.message);

    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setAddress('');
    setTransactionId('');
    setPaymentMethod('bkash');
    setPage('home');

    notify('অর্ডার জমা হয়েছে।');
  }

  async function loadOrders() {
    if (!db || !isAdmin) return;

    const { data, error } = await db
      .from('market_orders')
      .select('*')
      .order('id', { ascending: false });

    if (error) return notify(error.message);

    setOrders(data || []);
  }

  async function updateOrder(id, values) {
    if (!db || !isAdmin) return;

    const { error } = await db
      .from('market_orders')
      .update(values)
      .eq('id', id);

    if (error) return notify(error.message);

    notify('পরিবর্তন সংরক্ষণ হয়েছে।');
    loadOrders();
  }

  useEffect(() => {
    if (page === 'admin' && isAdmin) loadOrders();
  }, [page, isAdmin]);

  const whatsappLink =
    `https://wa.me/88${WHATSAPP}?text=${encodeURIComponent(
      'BD BUSINESS-এ স্বাগতম। পণ্য সম্পর্কে জানতে চাই।'
    )}`;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: #f4f6f8;
          color: #222;
        }

        header {
          background: #073b32;
          color: white;
          padding: 25px 12px;
          text-align: center;
        }

        header h1 {
          margin: 0 0 8px;
          font-size: 30px;
        }

        .top-buttons {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
          padding: 15px 10px;
          background: white;
        }

        .top-buttons a,
        .top-buttons button {
          display: inline-block;
          text-decoration: none;
          border: 0;
          border-radius: 8px;
          padding: 13px 17px;
          color: white;
          font-size: 15px;
          font-weight: bold;
          cursor: pointer;
          margin: 0;
        }

        .bkash { background: #d92355; }
        .facebook { background: #1877f2; }
        .whatsapp { background: #168b48; }

        nav {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 6px;
          padding: 12px;
          background: white;
        }

        button {
          border: 0;
          border-radius: 7px;
          padding: 11px 14px;
          background: #087b58;
          color: white;
          cursor: pointer;
          margin: 3px;
        }

        button.secondary { background: #34495e; }
        button.danger { background: #bd3434; }

        main {
          max-width: 1000px;
          margin: auto;
          padding: 15px;
        }

        .card {
          background: white;
          border-radius: 12px;
          padding: 15px;
          margin: 12px 0;
          box-shadow: 0 2px 8px #00000012;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(220px, 1fr)
          );
          gap: 12px;
        }

        input, textarea {
          display: block;
          width: 100%;
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 7px;
          margin: 9px 0 14px;
          font-size: 16px;
        }

        input[type="radio"] {
          display: inline-block;
          width: auto;
          margin: 8px;
        }

        textarea { min-height: 75px; }

        .product-image {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-radius: 9px;
          background: #eee;
        }

        .price {
          color: #087b58;
          font-size: 19px;
          font-weight: bold;
        }

        .message {
          position: sticky;
          top: 0;
          background: #fff2c7;
          padding: 12px;
          text-align: center;
          z-index: 5;
        }

        h2 { color: #073b32; }

        footer {
          text-align: center;
          padding: 25px;
          background: #073b32;
          color: white;
          margin-top: 25px;
        }

        footer a { color: white; }
      `}</style>

      <header>
        <h1>BD BUSINESS</h1>
        <div>খাঁটি খাবার ও মিষ্টির অনলাইন দোকান</div>
      </header>

      {message && <div className="message">{message}</div>}

      <section className="top-buttons">
        <button className="bkash" onClick={copyBkash}>
          বিকাশ পেমেন্ট
        </button>

        <a
          className="facebook"
          href={FACEBOOK}
          target="_blank"
          rel="noreferrer"
        >
          Facebook Page
        </a>

        <a
          className="whatsapp"
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp
        </a>
      </section>

      <nav>
        <button onClick={() => setPage('home')}>হোম</button>
        <button onClick={() => setPage('cart')}>
          কার্ট ({cart.length})
        </button>
        <button onClick={() => setPage('login')}>
          অ্যাডমিন লগইন
        </button>

        {isAdmin && (
          <button onClick={() => setPage('admin')}>
            অ্যাডমিন অর্ডার
          </button>
        )}

        {user && (
          <button className="secondary" onClick={signOut}>
            লগআউট
          </button>
        )}
      </nav>

      <main>
        {page === 'home' && (
          <>
            <section className="card">
              <h2>স্বাগতম BD BUSINESS-এ</h2>
              <p>আমাদের খাবার ও মিষ্টির পণ্য বেছে নিন।</p>
              <p>পছন্দের পণ্য কার্টে যোগ করে অর্ডার করুন।</p>
            </section>

            <h2>আমাদের পণ্য</h2>

            <div className="grid">
              {products.map(product => (
                <div className="card" key={product.id}>
                  <img
                    className="product-image"
                    src={product.image}
                    alt={product.title}
                    onError={e => {
                      e.currentTarget.src =
                        'https://placehold.co/600x400?text=BD+BUSINESS';
                    }}
                  />

                  <h3>{product.title}</h3>

                  {product.options.map(option => (
                    <div key={option.size}>
                      <p className="price">
                        {option.size} — ৳{option.price}
                      </p>

                      <button
                        onClick={() => addToCart(product, option)}
                      >
                        কার্টে যোগ করুন
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}

        {page === 'cart' && (
          <section className="card">
            <h2>তোমার কার্ট</h2>

            {!cart.length && <p>কার্ট খালি।</p>}

            {cart.map(item => (
              <div className="card" key={item.cartId}>
                <b>{item.title} — {item.size}</b>
                <p>৳{item.price} × {item.quantity}</p>

                <button
                  onClick={() => changeQuantity(item.cartId, -1)}
                >
                  −
                </button>

                <button
                  onClick={() => changeQuantity(item.cartId, 1)}
                >
                  +
                </button>
              </div>
            ))}

            <h2>মোট: ৳{total}</h2>

            {cart.length > 0 && (
              <>
                <h2>পেমেন্ট পদ্ধতি</h2>

                <label>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'bkash'}
                    onChange={() => setPaymentMethod('bkash')}
                  />
                  বিকাশ পেমেন্ট
                </label>

                <br />

                <label>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  ক্যাশ অন ডেলিভারি
                </label>

                {paymentMethod === 'bkash' && (
                  <>
                    <h2>বিকাশ নম্বর: {BKASH}</h2>

                    <button
                      className="bkash"
                      onClick={copyBkash}
                    >
                      বিকাশ নম্বর কপি করুন
                    </button>

                    <p>
                      বিকাশে টাকা পাঠানোর পর Transaction ID লিখুন।
                    </p>

                    <input
                      placeholder="বিকাশ Transaction ID"
                      value={transactionId}
                      onChange={e =>
                        setTransactionId(e.target.value)
                      }
                    />
                  </>
                )}

                {paymentMethod === 'cod' && (
                  <p>
                    পণ্য হাতে পাওয়ার পর টাকা পরিশোধ করবেন।
                  </p>
                )}

                <h2>অর্ডারের তথ্য</h2>

                <input
                  placeholder="ক্রেতার নাম"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                />

                <input
                  placeholder="ফোন নম্বর"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                />

                <textarea
                  placeholder="ডেলিভারির ঠিকানা"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                />

                <button onClick={placeOrder}>
                  অর্ডার জমা দিন
                </button>
              </>
            )}
          </section>
        )}

        {page === 'login' && (
          <section className="card">
            <h2>অ্যাডমিন লগইন</h2>

            <input
              type="email"
              placeholder="অ্যাডমিন ইমেইল"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="পাসওয়ার্ড"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            <button onClick={signIn}>লগইন</button>
          </section>
        )}

        {page === 'admin' && (
          <section className="card">
            {!isAdmin ? (
              <p>অ্যাডমিন অনুমতি প্রয়োজন।</p>
            ) : (
              <>
                <h2>অর্ডার তালিকা</h2>

                <button onClick={loadOrders}>রিফ্রেশ</button>

                {!orders.length && <p>কোনো অর্ডার নেই।</p>}

                {orders.map(order => (
                  <div className="card" key={order.id}>
                    <h3>{order.customer_name}</h3>
                    <p>ফোন: {order.phone}</p>
                    <p>ঠিকানা: {order.address}</p>
                    <p>মোট: ৳{order.total}</p>

                    <p>
                      পেমেন্ট পদ্ধতি: {order.payment_method}
                    </p>

                    <p>
                      Transaction ID: {order.transaction_id || 'নেই'}
                    </p>

                    <p>
                      পেমেন্ট অবস্থা: {order.payment_status}
                    </p>

                    <p>অর্ডার অবস্থা: {order.status}</p>

                    <b>পণ্য:</b>

                    {(order.items || []).map((item, index) => (
                      <p key={index}>
                        {item.title} ({item.size}) × {item.quantity}
                      </p>
                    ))}

                    <button
                      onClick={() =>
                        updateOrder(order.id, {
                          payment_status:
                            order.payment_method === 'bKash Personal'
                              ? 'verified'
                              : 'cash_on_delivery',
                          status: 'confirmed'
                        })
                      }
                    >
                      অর্ডার নিশ্চিত করুন
                    </button>

                    <button
                      className="danger"
                      onClick={() =>
                        updateOrder(order.id, {
                          status: 'cancelled'
                        })
                      }
                    >
                      অর্ডার বাতিল
                    </button>
                  </div>
                ))}
              </>
            )}
          </section>
        )}
      </main>

      <footer>
        <h3>BD BUSINESS</h3>
        <p>খাবার ও মিষ্টির অনলাইন দোকান</p>
        <p>বিকাশ: {BKASH}</p>

        <p>
          <a href={FACEBOOK} target="_blank" rel="noreferrer">
            Facebook Page
          </a>
        </p>

        <p>
          <a href={whatsappLink} target="_blank" rel="noreferrer">
            WhatsApp-এ যোগাযোগ করুন
          </a>
        </p>
      </footer>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
