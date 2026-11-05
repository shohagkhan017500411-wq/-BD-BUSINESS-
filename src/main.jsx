import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const db = url && key ? createClient(url, key) : null;

const BKASH = '01793798125';
const WHATSAPP = '01750041156';
const FACEBOOK = 'https://www.facebook.com/share/1DpyTMXEc6/';

const categories = ['Clothing', 'Oil & Soap', 'Parts', 'Foods'];

const defaultProducts = [
  {
    id: 'base-1',
    title: 'মিষ্টি',
    category: 'Foods',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600',
    options: [
      { size: '৫০০ গ্রাম', price: 280 },
      { size: '১ কেজি', price: 550 }
    ]
  },
  {
    id: 'base-2',
    title: 'রসমালাই',
    category: 'Foods',
    image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600',
    options: [
      { size: '৫০০ গ্রাম', price: 280 },
      { size: '১ কেজি', price: 550 }
    ]
  },
  {
    id: 'base-3',
    title: 'সন্দেশ',
    category: 'Foods',
    image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=600',
    options: [
      { size: '৫০০ গ্রাম', price: 180 },
      { size: '১ কেজি', price: 350 }
    ]
  },
  {
    id: 'base-4',
    title: 'দেশি লাল চিনি',
    category: 'Foods',
    image: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=600',
    options: [
      { size: '৫০০ গ্রাম', price: 135 },
      { size: '১ কেজি', price: 260 }
    ]
  },
  {
    id: 'base-5',
    title: 'বাদামের খাজা',
    category: 'Foods',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600',
    options: [
      { size: '২৫০ গ্রাম', price: 130 },
      { size: '৫০০ গ্রাম', price: 250 }
    ]
  },
  {
    id: 'base-6',
    title: 'রেশমি সনপাপড়ি',
    category: 'Foods',
    image: 'https://images.unsplash.com/photo-1605197584325-3b1e3e9e4f6b?w=600',
    options: [
      { size: '২৫০ গ্রাম', price: 130 },
      { size: '৫০০ গ্রাম', price: 250 }
    ]
  },
  {
    id: 'base-7',
    title: 'খাঁটি নারিকেল তেল',
    category: 'Foods',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600',
    options: [
      { size: '২৫০ গ্রাম', price: 650 },
      { size: '৫০০ গ্রাম', price: 1200 }
    ]
  }
];

/* ---------------- LOCATION MAP ---------------- */

function MapPicker({ onSelect }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    let script;
    let css;
    let cancelled = false;

    function initializeMap() {
      if (cancelled || !mapRef.current || !window.L || mapInstance.current) {
        return;
      }

      const L = window.L;
      const map = L.map(mapRef.current).setView([23.8103, 90.4125], 7);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      map.on('click', event => {
        const point = {
          lat: event.latlng.lat,
          lng: event.latlng.lng
        };

        if (markerRef.current) {
          markerRef.current.setLatLng(event.latlng);
        } else {
          markerRef.current = L.marker(event.latlng).addTo(map);
        }

        onSelectRef.current(point);
      });

      mapInstance.current = map;
      setReady(true);
      window.setTimeout(() => map.invalidateSize(), 250);
    }

    css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);

    if (window.L) {
      initializeMap();
    } else {
      script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initializeMap;
      script.onerror = () => alert('ম্যাপ লোড হয়নি। ইন্টারনেট সংযোগ পরীক্ষা করুন।');
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerRef.current = null;
      }
      if (css) css.remove();
      if (script) script.remove();
    };
  }, []);

  function chooseCurrentLocation() {
    if (!navigator.geolocation) {
      alert('এই ফোনে লোকেশন সুবিধা পাওয়া যাচ্ছে না।');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const point = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        if (mapInstance.current && window.L) {
          const location = [point.lat, point.lng];
          mapInstance.current.setView(location, 16);

          if (markerRef.current) {
            markerRef.current.setLatLng(location);
          } else {
            markerRef.current = window.L.marker(location)
              .addTo(mapInstance.current);
          }
        }

        onSelectRef.current(point);
      },
      () => {
        alert('ফোনের Location permission দিন, অথবা ম্যাপে পিন বসান।');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }

  return (
    <section className="map-picker">
      <button type="button" onClick={chooseCurrentLocation}>
        📍 বর্তমান লোকেশন নিন
      </button>

      <p>অথবা ম্যাপে চাপ দিয়ে ডেলিভারির জায়গায় পিন বসান।</p>

      <div ref={mapRef} className="map-area" />

      {!ready && <p>ম্যাপ লোড হচ্ছে...</p>}
    </section>
  );
}

/* ---------------- MAIN APP ---------------- */

function App() {
  const [page, setPage] = useState(
    window.location.pathname === '/admin-login' ? 'login' : 'home'
  );

  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState('');

  const [products, setProducts] = useState(defaultProducts);
  const [category, setCategory] = useState('Foods');
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bkash');

  const [locationLat, setLocationLat] = useState(null);
  const [locationLng, setLocationLng] = useState(null);

  const [productTitle, setProductTitle] = useState('');
  const [productCategory, setProductCategory] = useState('Foods');
  const [productImage, setProductImage] = useState(null);
  const [productOptions, setProductOptions] = useState('৫০০ গ্রাম:100, ১ কেজি:200');
  const [editingProduct, setEditingProduct] = useState(null);

  const [chatText, setChatText] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatCustomers, setChatCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');

  function notify(text) {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3500);
  }

  async function checkAdmin(userId) {
    if (!db || !userId) {
      setIsAdmin(false);
      return false;
    }

    const { data, error } = await db
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      setIsAdmin(false);
      return false;
    }

    const admin = !!data;
    setIsAdmin(admin);
    return admin;
  }

  async function checkUser() {
    if (!db) return null;

    const { data } = await db.auth.getSession();
    const current = data?.session?.user || null;

    setUser(current);

    if (current) {
      await checkAdmin(current.id);
    } else {
      setIsAdmin(false);
    }

    return current;
  }

  useEffect(() => {
    if (!db) {
      notify('Supabase সংযোগ পাওয়া যায়নি।');
      return;
    }

    let active = true;

    async function start() {
      const { data } = await db.auth.getSession();

      if (!data?.session && window.location.pathname !== '/admin-login') {
        const { error } = await db.auth.signInAnonymously();
        if (error) notify('কাস্টমার সেশন তৈরি হয়নি: ' + error.message);
      }

      if (active) await checkUser();
    }

    start();

    const { data: listener } = db.auth.onAuthStateChange(
      (_event, session) => {
        const current = session?.user || null;
        setUser(current);

        if (!current) {
          setIsAdmin(false);
        } else {
          window.setTimeout(() => {
            if (active) checkAdmin(current.id);
          }, 0);
        }
      }
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signIn() {
    if (!db) return notify('Supabase সংযোগ নেই।');
    if (!email.trim() || !password) {
      return notify('ইমেইল ও পাসওয়ার্ড লিখুন।');
    }

    const { error } = await db.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) return notify(error.message);

    const admin = await checkUser();

    if (!admin || !isAdmin && !user) {
      const { data } = await db.auth.getSession();
      const current = data?.session?.user;
      const { data: adminRow } = await db
        .from('admin_users')
        .select('user_id')
        .eq('user_id', current?.id || '')
        .maybeSingle();

      if (!adminRow) {
        await db.auth.signOut();
        setIsAdmin(false);
        return notify('এই অ্যাকাউন্ট অ্যাডমিন নয়।');
      }
    }

    setPage('admin');
    notify('অ্যাডমিন লগইন সফল হয়েছে।');
  }

  async function signOut() {
    if (!db) return;

    await db.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setPage('home');

    const { error } = await db.auth.signInAnonymously();
    if (error) notify('কাস্টমার সেশন তৈরি হয়নি।');
    else notify('লগআউট হয়েছে।');
  }

  async function loadProducts() {
    if (!db) return;

    const { data, error } = await db
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      notify('পণ্য লোড হয়নি: ' + error.message);
      return;
    }

    if (!data || data.length === 0) {
      if (isAdmin) {
        const seed = defaultProducts.map(product => ({
          title: product.title,
          category: product.category,
          image_url: product.image,
          options: product.options
        }));

        const { data: inserted, error: seedError } = await db
          .from('products')
          .insert(seed)
          .select('*');

        if (!seedError && inserted?.length) {
          setProducts(inserted.map(product => ({
            ...product,
            image: product.image_url
          })));
          return;
        }
      }

      setProducts(defaultProducts);
      return;
    }

    setProducts(data.map(product => ({
      ...product,
      image: product.image_url
    })));
  }

  useEffect(() => {
    loadProducts();
  }, [isAdmin]);

  async function uploadProductImage() {
    if (!productImage) return null;

    const extension = productImage.name.split('.').pop() || 'jpg';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    const { error } = await db.storage
      .from('product-images')
      .upload(path, productImage, { upsert: true });

    if (error) throw error;

    const { data } = db.storage
      .from('product-images')
      .getPublicUrl(path);

    return data.publicUrl;
  }

  function parseOptions() {
    return productOptions.split(',').map(part => {
      const [size, price] = part.split(':');

      return {
        size: size?.trim(),
        price: Number(price?.trim())
      };
    }).filter(item =>
      item.size && Number.isFinite(item.price) && item.price > 0
    );
  }

  async function saveProduct() {
    if (!db || !isAdmin) return notify('অ্যাডমিন অনুমতি প্রয়োজন।');
    if (!productTitle.trim()) return notify('পণ্যের নাম লিখুন।');

    const options = parseOptions();

    if (!options.length) {
      return notify('ওজন ও দাম সঠিকভাবে লিখুন।');
    }

    try {
      let imageUrl = editingProduct?.image_url || editingProduct?.image || null;

      if (productImage) {
        imageUrl = await uploadProductImage();
      }

      const values = {
        title: productTitle.trim(),
        category: productCategory,
        image_url: imageUrl,
        options
      };

      let result;

      if (editingProduct) {
        result = await db
          .from('products')
          .update(values)
          .eq('id', editingProduct.id);
      } else {
        result = await db.from('products').insert(values);
      }

      if (result.error) return notify(result.error.message);

      resetProductForm();
      await loadProducts();
      notify('পণ্য সংরক্ষণ হয়েছে।');
      setPage('admin');
    } catch (error) {
      notify('ছবি বা পণ্য সংরক্ষণ হয়নি: ' + error.message);
    }
  }

  function resetProductForm() {
    setProductTitle('');
    setProductCategory('Foods');
    setProductImage(null);
    setProductOptions('৫০০ গ্রাম:100, ১ কেজি:200');
    setEditingProduct(null);
  }

  function startEditProduct(product) {
    if (String(product.id).startsWith('base-')) {
      return notify('অ্যাডমিন প্যানেল খুলে পণ্য তালিকা লোড হতে দিন।');
    }

    setEditingProduct(product);
    setProductTitle(product.title);
    setProductCategory(product.category);
    setProductOptions(
      (product.options || [])
        .map(option => `${option.size}:${option.price}`)
        .join(', ')
    );
    setProductImage(null);
    setPage('add-product');
  }

  async function deleteProduct(product) {
    if (!db || !isAdmin) return;

    if (String(product.id).startsWith('base-')) {
      return notify('এই পণ্যটি এখনো ডাটাবেসে নেই।');
    }

    if (!window.confirm('এই পণ্যটি মুছে ফেলবেন?')) return;

    const { error } = await db
      .from('products')
      .delete()
      .eq('id', product.id);

    if (error) return notify(error.message);

    await loadProducts();
    notify('পণ্য মুছে ফেলা হয়েছে।');
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
          category: product.category,
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
    if (!db || !user) return notify('লগইন তৈরি হয়নি।');
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
      category: item.category,
      size: item.size,
      price: item.price,
      quantity: item.quantity
    }));

    const { error } = await db.from('market_orders').insert({
      user_id: user.id,
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
          : 'cash_on_delivery',
      location_lat: locationLat,
      location_lng: locationLng
    });

    if (error) return notify('অর্ডার জমা হয়নি: ' + error.message);

    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setAddress('');
    setTransactionId('');
    setLocationLat(null);
    setLocationLng(null);
    setPage('my-orders');

    await loadMyOrders();
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

  async function loadMyOrders() {
    if (!db || !user) return;

    const { data, error } = await db
      .from('market_orders')
      .select('*')
      .eq('user_id', user.id)
      .order('id', { ascending: false });

    if (error) return notify(error.message);
    setMyOrders(data || []);
  }

  async function updateOrder(id, values) {
    if (!db || !isAdmin) return;

    const { error } = await db
      .from('market_orders')
      .update(values)
      .eq('id', id);

    if (error) return notify(error.message);

    notify('অর্ডার পরিবর্তন হয়েছে।');
    loadOrders();
  }

  async function loadCustomerChat() {
    if (!db || !user) return;

    const { data, error } = await db
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) return notify(error.message);
    setChatMessages(data || []);
  }

  async function sendCustomerMessage() {
    if (!db || !user || !chatText.trim()) return;

    const { error } = await db.from('chat_messages').insert({
      user_id: user.id,
      sender: 'customer',
      message: chatText.trim()
    });

    if (error) return notify(error.message);

    setChatText('');
    loadCustomerChat();
  }

  async function loadChatCustomers() {
    if (!db || !isAdmin) return;

    const { data, error } = await db
      .from('chat_messages')
      .select('user_id, created_at')
      .order('created_at', { ascending: false });

    if (error) return notify(error.message);

    const unique = [];

    (data || []).forEach(row => {
      if (!unique.some(item => item.user_id === row.user_id)) {
        unique.push(row);
      }
    });

    setChatCustomers(unique);

    if (!selectedCustomer && unique.length) {
      setSelectedCustomer(unique[0].user_id);
    }
  }

  async function loadAdminChat(customerId) {
    if (!db || !isAdmin || !customerId) return;

    const { data, error } = await db
      .from('chat_messages')
      .select('*')
      .eq('user_id', customerId)
      .order('created_at', { ascending: true });

    if (error) return notify(error.message);
    setChatMessages(data || []);
  }

  async function sendAdminMessage() {
    if (!db || !isAdmin || !selectedCustomer || !chatText.trim()) {
      return;
    }

    const { error } = await db.from('chat_messages').insert({
      user_id: selectedCustomer,
      sender: 'admin',
      message: chatText.trim()
    });

    if (error) return notify(error.message);

    setChatText('');
    loadAdminChat(selectedCustomer);
  }

  useEffect(() => {
    if (page === 'admin' && isAdmin) {
      loadOrders();
      loadChatCustomers();

      const timer = window.setInterval(() => {
        loadOrders();
        loadChatCustomers();
      }, 15000);

      return () => window.clearInterval(timer);
    }
  }, [page, isAdmin]);

  useEffect(() => {
    if (page === 'my-orders') loadMyOrders();
  }, [page, user]);

  useEffect(() => {
    if (page === 'chat' && !isAdmin) loadCustomerChat();
  }, [page, user, isAdmin]);

  useEffect(() => {
    if (page === 'admin-chat' && isAdmin) {
      loadChatCustomers();
      if (selectedCustomer) loadAdminChat(selectedCustomer);
    }
  }, [page, isAdmin, selectedCustomer]);

  const whatsappLink =
    `https://wa.me/88${WHATSAPP}?text=${encodeURIComponent(
      'BD BUSINESS-এ স্বাগতম। পণ্য সম্পর্কে জানতে চাই।'
    )}`;

  const visibleProducts = products.filter(product => {
    const matchesCategory = product.category === category;
    const matchesSearch = product.title
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  function deliveryEstimates(order) {
    const items = order.items || [];
    const uniqueCategories = [
      ...new Set(items.map(item => item.category).filter(Boolean))
    ];

    if (!uniqueCategories.length) return [];

    const start = new Date(order.created_at || Date.now());

    return uniqueCategories.map(itemCategory => {
      const hours = itemCategory === 'Foods' ? 6 : 96;
      const deliveryDate = new Date(start.getTime() + hours * 60 * 60 * 1000);

      return {
        category: itemCategory,
        deliveryDate
      };
    });
  }

  function showDeliveryEstimates(order) {
    const estimates = deliveryEstimates(order);

    if (!estimates.length) return null;

    return (
      <div className="delivery-info">
        <b>সম্ভাব্য ডেলিভারি সময়:</b>
        {estimates.map((estimate, index) => (
          <p key={index}>
            {estimate.category}: {estimate.deliveryDate.toLocaleString('bn-BD')}
          </p>
        ))}
        <small>এটি আনুমানিক সময়; ডেলিভারিতে পরিবর্তন হতে পারে।</small>
      </div>
    );
  }

  function orderStatus(status) {
    const names = {
      pending: 'অপেক্ষমাণ',
      confirmed: 'নিশ্চিত',
      cancelled: 'বাতিল'
    };

    return names[status] || status || 'অজানা';
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: #f4f6f8;
          color: #222;
          padding-bottom: 75px;
        }
        button {
          border: 0;
          border-radius: 7px;
          padding: 10px 12px;
          background: #087b58;
          color: white;
          cursor: pointer;
          margin: 3px;
          font-size: 14px;
        }
        button.secondary { background: #34495e; }
        button.danger { background: #bd3434; }
        header {
          background: #073b32;
          color: white;
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        header h1 { margin: 0; font-size: 21px; }
        .header-button {
          font-size: 24px;
          background: transparent;
          padding: 5px 10px;
        }
        .menu {
          position: absolute;
          top: 55px;
          left: 8px;
          background: white;
          color: #222;
          padding: 10px;
          border-radius: 10px;
          box-shadow: 0 3px 12px #0003;
          z-index: 20;
        }
        .menu a {
          display: block;
          padding: 10px;
          color: #073b32;
          text-decoration: none;
        }
        .search-box { padding: 10px; background: white; }
        main { max-width: 1000px; margin: auto; padding: 12px; }
        .card {
          background: white;
          border-radius: 12px;
          padding: 13px;
          margin: 10px 0;
          box-shadow: 0 2px 8px #00000012;
          min-width: 0;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 9px;
        }
        .product-image {
          width: 100%;
          height: 130px;
          object-fit: cover;
          border-radius: 8px;
          background: #eee;
        }
        .product-card h3 {
          font-size: 16px;
          margin: 8px 0;
          overflow-wrap: anywhere;
        }
        .price {
          color: #087b58;
          font-size: 14px;
          font-weight: bold;
          margin: 7px 0;
        }
        input, textarea, select {
          display: block;
          width: 100%;
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 7px;
          margin: 9px 0 14px;
          font-size: 16px;
          background: white;
        }
        input[type="radio"], input[type="file"] {
          width: auto;
          display: inline-block;
        }
        textarea { min-height: 75px; }
        h2 { color: #073b32; font-size: 21px; }
        .message {
          position: sticky;
          top: 55px;
          background: #fff2c7;
          padding: 11px;
          text-align: center;
          z-index: 9;
        }
        .categories {
          display: flex;
          overflow-x: auto;
          gap: 8px;
          background: white;
          padding: 10px;
        }
        .categories button {
          white-space: nowrap;
          background: #e7efec;
          color: #073b32;
        }
        .categories button.active {
          background: #087b58;
          color: white;
        }
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          background: white;
          border-top: 1px solid #ddd;
          z-index: 15;
          padding: 5px 0;
        }
        .bottom-nav button {
          background: transparent;
          color: #073b32;
          font-size: 12px;
          padding: 7px 2px;
        }
        .chat-message {
          padding: 10px;
          margin: 7px 0;
          border-radius: 10px;
          max-width: 85%;
          overflow-wrap: anywhere;
        }
        .customer-message {
          background: #d9f5e5;
          margin-left: auto;
        }
        .admin-message { background: #eee; }
        .row {
          display: flex;
          gap: 5px;
          align-items: center;
        }
        .row input { flex: 1; min-width: 0; }
        .map-picker {
          background: #f8faf9;
          border: 1px solid #dce5e1;
          border-radius: 10px;
          padding: 10px;
          margin: 12px 0;
        }
        .map-area {
          height: 300px;
          width: 100%;
          border-radius: 10px;
          background: #e8eeee;
          z-index: 1;
        }
        .delivery-info {
          background: #f0f7f3;
          border-radius: 8px;
          padding: 10px;
          margin-top: 10px;
        }
        footer {
          text-align: center;
          padding: 20px;
          background: #073b32;
          color: white;
          margin-top: 25px;
        }
        footer a { color: white; }
        @media (min-width: 650px) {
          .product-image { height: 190px; }
          .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
      `}</style>

      <header>
        <button
          className="header-button"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ⋮
        </button>

        <h1>BD BUSINESS</h1>

        <button
          className="header-button"
          onClick={() => setSearchOpen(!searchOpen)}
          aria-label="Search"
        >
          ⌕
        </button>

        {menuOpen && (
          <div className="menu">
            <a href={whatsappLink} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            <a href={FACEBOOK} target="_blank" rel="noreferrer">
              Facebook Page
            </a>
          </div>
        )}
      </header>

      {searchOpen && (
        <div className="search-box">
          <input
            placeholder="পণ্য খুঁজুন..."
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>
      )}

      {message && <div className="message">{message}</div>}

      {page === 'home' && (
        <>
          <div className="categories">
            {categories.map(item => (
              <button
                key={item}
                className={category === item ? 'active' : ''}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <main>
            <section className="card">
              <h2>স্বাগতম BD BUSINESS-এ</h2>
              <p>পছন্দের পণ্য বেছে নিয়ে অর্ডার করুন।</p>
            </section>

            <h2>{category}</h2>

            <div className="grid">
              {visibleProducts.map(product => (
                <div className="card product-card" key={product.id}>
                  <img
                    className="product-image"
                    src={product.image || 'https://placehold.co/600x400?text=BD+BUSINESS'}
                    alt={product.title}
                    onError={event => {
                      event.currentTarget.src =
                        'https://placehold.co/600x400?text=BD+BUSINESS';
                    }}
                  />

                  <h3>{product.title}</h3>

                  {(product.options || []).map((option, index) => (
                    <div key={index}>
                      <p className="price">
                        {option.size} — ৳{option.price}
                      </p>
                      <button onClick={() => addToCart(product, option)}>
                        কার্টে যোগ
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {!visibleProducts.length && (
              <section className="card">
                এই ক্যাটাগরিতে এখনো কোনো পণ্য নেই।
              </section>
            )}
          </main>
        </>
      )}

      {page === 'cart' && (
        <main>
          <section className="card">
            <h2>কার্ট</h2>

            {!cart.length && <p>কার্ট খালি।</p>}

            {cart.map(item => (
              <div className="card" key={item.cartId}>
                <b>{item.title} — {item.size}</b>
                <p>৳{item.price} × {item.quantity}</p>
                <button onClick={() => changeQuantity(item.cartId, -1)}>
                  −
                </button>
                <button onClick={() => changeQuantity(item.cartId, 1)}>
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
                    <h3>বিকাশ নম্বর: {BKASH}</h3>
                    <p>টাকা পাঠানোর পর Transaction ID লিখুন।</p>
                    <input
                      placeholder="Transaction ID"
                      value={transactionId}
                      onChange={event => setTransactionId(event.target.value)}
                    />
                  </>
                )}

                <h2>অর্ডারের তথ্য</h2>

                <input
                  placeholder="ক্রেতার নাম"
                  value={customerName}
                  onChange={event => setCustomerName(event.target.value)}
                />

                <input
                  placeholder="ফোন নম্বর"
                  value={customerPhone}
                  onChange={event => setCustomerPhone(event.target.value)}
                />

                <textarea
                  placeholder="ডেলিভারির ঠিকানা"
                  value={address}
                  onChange={event => setAddress(event.target.value)}
                />

                <h3>ডেলিভারি লোকেশন</h3>
                <p>লোকেশন দেওয়া ঐচ্ছিক। ঠিকানা লিখে অর্ডারও করতে পারবেন।</p>

                <MapPicker
                  onSelect={point => {
                    setLocationLat(point.lat);
                    setLocationLng(point.lng);
                  }}
                />

                {locationLat !== null && locationLng !== null && (
                  <p>
                    <b>লোকেশন নির্বাচন হয়েছে।</b>
                    <br />
                    Latitude: {locationLat}
                    <br />
                    Longitude: {locationLng}
                  </p>
                )}

                <button onClick={placeOrder}>অর্ডার জমা দিন</button>
              </>
            )}
          </section>
        </main>
      )}

      {page === 'my-orders' && (
        <main>
          <section className="card">
            <h2>আমার অর্ডার</h2>
            <button onClick={loadMyOrders}>রিফ্রেশ</button>

            {!myOrders.length && <p>আপনার কোনো অর্ডার পাওয়া যায়নি।</p>}

            {myOrders.map(order => (
              <div className="card" key={order.id}>
                <b>অর্ডার #{order.id}</b>
                <p>মোট: ৳{order.total}</p>
                <p>অবস্থা: {orderStatus(order.status)}</p>
                <p>ঠিকানা: {order.address}</p>

                {showDeliveryEstimates(order)}

                {order.location_lat != null && order.location_lng != null && (
                  <p>
                    📍 <a
                      href={`https://www.google.com/maps?q=${order.location_lat},${order.location_lng}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      আমার লোকেশন ম্যাপে দেখুন
                    </a>
                  </p>
                )}

                {(order.items || []).map((item, index) => (
                  <p key={index}>
                    {item.title} ({item.size}) × {item.quantity}
                  </p>
                ))}
              </div>
            ))}
          </section>
        </main>
      )}

      {page === 'chat' && (
        <main>
          <section className="card">
            <h2>কাস্টমার চ্যাট</h2>
            <button onClick={loadCustomerChat}>মেসেজ রিফ্রেশ</button>

            <div>
              {chatMessages.map(item => (
                <div
                  key={item.id}
                  className={
                    'chat-message ' +
                    (item.sender === 'customer'
                      ? 'customer-message'
                      : 'admin-message')
                  }
                >
                  <b>{item.sender === 'admin' ? 'অ্যাডমিন' : 'আপনি'}</b>
                  <div>{item.message}</div>
                </div>
              ))}
            </div>

            <div className="row">
              <input
                placeholder="মেসেজ লিখুন..."
                value={chatText}
                onChange={event => setChatText(event.target.value)}
              />
              <button onClick={sendCustomerMessage}>পাঠান</button>
            </div>
          </section>
        </main>
      )}

      {page === 'login' && (
        <main>
          <section className="card">
            <h2>অ্যাডমিন লগইন</h2>

            <input
              type="email"
              placeholder="অ্যাডমিন ইমেইল"
              value={email}
              onChange={event => setEmail(event.target.value)}
            />

            <input
              type="password"
              placeholder="পাসওয়ার্ড"
              value={password}
              onChange={event => setPassword(event.target.value)}
            />

            <button onClick={signIn}>লগইন</button>
          </section>
        </main>
      )}

      {page === 'admin' && (
        <main>
          {!isAdmin ? (
            <section className="card">অ্যাডমিন অনুমতি প্রয়োজন।</section>
          ) : (
            <>
              <section className="card">
                <h2>অ্যাডমিন প্যানেল</h2>

                <button onClick={() => {
                  resetProductForm();
                  setPage('add-product');
                }}>
                  + Add Product
                </button>

                <button onClick={() => setPage('admin-chat')}>
                  কাস্টমার চ্যাট ইনবক্স
                </button>

                <button onClick={loadOrders}>অর্ডার রিফ্রেশ</button>

                <button className="secondary" onClick={signOut}>
                  লগআউট
                </button>
              </section>

              <section className="card">
                <h2>পণ্য পরিচালনা</h2>

                {products.map(product => (
                  <div className="card" key={product.id}>
                    <b>{product.title}</b>
                    <p>{product.category}</p>

                    <button onClick={() => startEditProduct(product)}>
                      এডিট
                    </button>

                    <button
                      className="danger"
                      onClick={() => deleteProduct(product)}
                    >
                      ডিলিট
                    </button>
                  </div>
                ))}
              </section>

              <section className="card">
                <h2>অর্ডার তালিকা</h2>

                {!orders.length && <p>কোনো অর্ডার নেই।</p>}

                {orders.map(order => (
                  <div className="card" key={order.id}>
                    <h3>{order.customer_name}</h3>
                    <p>ফোন: {order.phone}</p>
                    <p>ঠিকানা: {order.address}</p>
                    <p>মোট: ৳{order.total}</p>
                    <p>পেমেন্ট: {order.payment_method}</p>
                    <p>Transaction ID: {order.transaction_id || 'নেই'}</p>
                    <p>পেমেন্ট অবস্থা: {order.payment_status}</p>
                    <p>অর্ডার অবস্থা: {orderStatus(order.status)}</p>

                    {showDeliveryEstimates(order)}

                    {order.location_lat != null && order.location_lng != null ? (
                      <p>
                        📍 <a
                          href={`https://www.google.com/maps?q=${order.location_lat},${order.location_lng}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          কাস্টমারের লোকেশন ম্যাপে দেখুন
                        </a>
                      </p>
                    ) : (
                      <p>কাস্টমার লোকেশন দেননি।</p>
                    )}

                    {(order.items || []).map((item, index) => (
                      <p key={index}>
                        {item.title} ({item.size}) × {item.quantity}
                      </p>
                    ))}

                    <button onClick={() => updateOrder(order.id, {
                      payment_status:
                        order.payment_method === 'bKash Personal'
                          ? 'verified'
                          : 'cash_on_delivery',
                      status: 'confirmed'
                    })}>
                      অর্ডার নিশ্চিত
                    </button>

                    <button
                      className="danger"
                      onClick={() => updateOrder(order.id, {
                        status: 'cancelled'
                      })}
                    >
                      বাতিল
                    </button>
                  </div>
                ))}
              </section>
            </>
          )}
        </main>
      )}

      {page === 'add-product' && (
        <main>
          <section className="card">
            <h2>{editingProduct ? 'পণ্য এডিট' : 'নতুন পণ্য যোগ করুন'}</h2>

            <label>পণ্যের নাম</label>
            <input
              placeholder="পণ্যের নাম"
              value={productTitle}
              onChange={event => setProductTitle(event.target.value)}
            />

            <label>ক্যাটাগরি</label>
            <select
              value={productCategory}
              onChange={event => setProductCategory(event.target.value)}
            >
              {categories.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <label>গ্যালারি থেকে ছবি নির্বাচন করুন</label>
            <input
              type="file"
              accept="image/*"
              onChange={event => setProductImage(event.target.files?.[0] || null)}
            />

            {productImage && <p>নির্বাচিত ছবি: {productImage.name}</p>}

            <label>ওজন ও দাম লিখুন</label>
            <textarea
              value={productOptions}
              onChange={event => setProductOptions(event.target.value)}
            />

            <p>উদাহরণ: ৫০০ গ্রাম:280, ১ কেজি:550</p>

            <button onClick={saveProduct}>সংরক্ষণ করুন</button>

            <button className="secondary" onClick={() => {
              resetProductForm();
              setPage('admin');
            }}>
              ফিরে যান
            </button>
          </section>
        </main>
      )}

      {page === 'admin-chat' && (
        <main>
          <section className="card">
            <h2>অ্যাডমিন চ্যাট ইনবক্স</h2>
            <button onClick={loadChatCustomers}>ইনবক্স রিফ্রেশ</button>

            {chatCustomers.map(item => (
              <button
                key={item.user_id}
                className="secondary"
                onClick={() => {
                  setSelectedCustomer(item.user_id);
                  setChatMessages([]);
                  loadAdminChat(item.user_id);
                }}
              >
                কাস্টমার: {item.user_id.slice(0, 8)}
              </button>
            ))}

            {selectedCustomer && (
              <>
                <p>নির্বাচিত কাস্টমার: {selectedCustomer.slice(0, 12)}</p>

                {chatMessages.map(item => (
                  <div
                    key={item.id}
                    className={
                      'chat-message ' +
                      (item.sender === 'admin'
                        ? 'customer-message'
                        : 'admin-message')
                    }
                  >
                    <b>{item.sender === 'admin' ? 'অ্যাডমিন' : 'কাস্টমার'}</b>
                    <div>{item.message}</div>
                  </div>
                ))}

                <div className="row">
                  <input
                    placeholder="উত্তর লিখুন..."
                    value={chatText}
                    onChange={event => setChatText(event.target.value)}
                  />
                  <button onClick={sendAdminMessage}>পাঠান</button>
                </div>
              </>
            )}

            <button className="secondary" onClick={() => setPage('admin')}>
              অ্যাডমিন প্যানেলে ফিরুন
            </button>
          </section>
        </main>
      )}

      {page !== 'login' &&
        page !== 'admin' &&
        page !== 'add-product' &&
        page !== 'admin-chat' && (
          <nav className="bottom-nav">
            <button onClick={() => setPage('my-orders')}>
              📦<br />My Orders
            </button>

            <button onClick={() => setPage('cart')}>
              🛒<br />Cart ({cart.length})
            </button>

            <button onClick={() => setPage('chat')}>
              💬<br />Chat
            </button>

            <button onClick={() => setPage('home')}>
              🏠<br />Home
            </button>
          </nav>
        )}

      <footer>
        <h3>BD BUSINESS</h3>
        <p>খাবার ও পণ্যের অনলাইন দোকান</p>

        <a href={FACEBOOK} target="_blank" rel="noreferrer">
          Facebook Page
        </a>

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
