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
  { id:'base-1', title:'মিষ্টি', category:'Foods', image:'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600', options:[{size:'৫০০ গ্রাম',price:280},{size:'১ কেজি',price:550}] },
  { id:'base-2', title:'রসমালাই', category:'Foods', image:'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600', options:[{size:'৫০০ গ্রাম',price:280},{size:'১ কেজি',price:550}] },
  { id:'base-3', title:'সন্দেশ', category:'Foods', image:'https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=600', options:[{size:'৫০০ গ্রাম',price:180},{size:'১ কেজি',price:350}] },
  { id:'base-4', title:'দেশি লাল চিনি', category:'Foods', image:'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=600', options:[{size:'৫০০ গ্রাম',price:135},{size:'১ কেজি',price:260}] },
  { id:'base-5', title:'বাদামের খাজা', category:'Foods', image:'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600', options:[{size:'২৫০ গ্রাম',price:130},{size:'৫০০ গ্রাম',price:250}] },
  { id:'base-6', title:'রেশমি সনপাপড়ি', category:'Foods', image:'https://images.unsplash.com/photo-1605197584325-3b1e3e9e4f6b?w=600', options:[{size:'২৫০ গ্রাম',price:130},{size:'৫০০ গ্রাম',price:250}] },
  { id:'base-7', title:'খাঁটি নারিকেল তেল', category:'Foods', image:'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600', options:[{size:'২৫০ গ্রাম',price:650},{size:'৫০০ গ্রাম',price:1200}] }
];

// ম্যাপের ভেতরে সার্চ
function MapPicker({ onSelect }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const callbackRef = useRef(onSelect);

  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    callbackRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    let script;
    let css;
    let cancelled = false;

    function init() {
      if (cancelled || !mapRef.current || !window.L || mapInstance.current) return;

      const L = window.L;
      const map = L.map(mapRef.current).setView([23.8103,90.4125],7);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        attribution:'© OpenStreetMap contributors'
      }).addTo(map);

      map.on('click', e => {
        const p = {lat:e.latlng.lat,lng:e.latlng.lng};

        if (markerRef.current) {
          markerRef.current.setLatLng(e.latlng);
        } else {
          markerRef.current = L.marker(e.latlng).addTo(map);
        }

        callbackRef.current(p);
      });

      mapInstance.current = map;
      setTimeout(() => map.invalidateSize(),300);
    }

    css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);

    if (window.L) {
      init();
    } else {
      script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = init;
      script.onerror = () => alert('ম্যাপ লোড হয়নি।');
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
      mapInstance.current?.remove();
      mapInstance.current = null;
      markerRef.current = null;
      css?.remove();
      script?.remove();
    };
  }, []);

  async function searchPlace() {
    const query = searchText.trim();

    if (!query) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setSearchResults([]);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`
      );

      if (!response.ok) throw new Error('সার্চ করা যাচ্ছে না।');

      const data = await response.json();
      setSearchResults(data || []);

      if (!data?.length) {
        alert('এই জায়গাটি পাওয়া যায়নি। অন্য নাম দিয়ে চেষ্টা করুন।');
      }
    } catch (error) {
      alert('জায়গা খুঁজে পাওয়া যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setSearching(false);
    }
  }

  function choosePlace(place) {
    const lat = Number(place.lat);
    const lng = Number(place.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const point = [lat,lng];

    if (mapInstance.current) {
      mapInstance.current.setView(point,16);

      if (markerRef.current) {
        markerRef.current.setLatLng(point);
      } else if (window.L) {
        markerRef.current = window.L.marker(point).addTo(mapInstance.current);
      }
    }

    callbackRef.current({lat,lng});
    setSearchText(place.display_name || '');
    setSearchResults([]);
  }

  function currentLocation() {
    if (!navigator.geolocation) {
      return alert('লোকেশন সুবিধা পাওয়া যাচ্ছে না।');
    }

    navigator.geolocation.getCurrentPosition(pos => {
      const p = {
        lat:pos.coords.latitude,
        lng:pos.coords.longitude
      };

      const ll = [p.lat,p.lng];
      mapInstance.current?.setView(ll,16);

      if (window.L && mapInstance.current) {
        if (markerRef.current) {
          markerRef.current.setLatLng(ll);
        } else {
          markerRef.current = window.L.marker(ll).addTo(mapInstance.current);
        }
      }

      callbackRef.current(p);
    },() => alert('ফোনের Location permission দিন।'));
  }

  return (
    <section className="map-picker">
      <button type="button" onClick={currentLocation}>
        📍 বর্তমান লোকেশন নিন
      </button>

      <p>অথবা ম্যাপে চাপ দিয়ে ডেলিভারির জায়গায় পিন বসান।</p>

      <div className="map-container">
        <div className="map-search-box">
          <div className="map-search-row">
            <input
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') searchPlace();
              }}
              placeholder="ম্যাপে জায়গার নাম লিখুন..."
            />
            <button type="button" onClick={searchPlace} disabled={searching}>
              {searching ? 'খুঁজছে...' : 'Search'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="map-search-results">
              {searchResults.map((place,index) => (
                <button
                  type="button"
                  key={place.place_id || index}
                  onClick={() => choosePlace(place)}
                >
                  📍 {place.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div ref={mapRef} className="map-area"/>
      </div>
    </section>
  );
}

function App() {
  const [page,setPage] = useState(
    window.location.pathname === '/admin-login' ? 'login' : 'home'
  );

  const [user,setUser] = useState(null);
  const [isAdmin,setIsAdmin] = useState(false);
  const [isSeller,setIsSeller] = useState(false);
  const [sellerApplication,setSellerApplication] = useState(null);
  const [sellerId,setSellerId] = useState('');
  const [message,setMessage] = useState('');

  const [products,setProducts] = useState(defaultProducts);
  const [category,setCategory] = useState('Foods');
  const [menuOpen,setMenuOpen] = useState(false);

  const [cart,setCart] = useState([]);
  const [orders,setOrders] = useState([]);
  const [myOrders,setMyOrders] = useState([]);

  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');

  const [customerName,setCustomerName] = useState('');
  const [customerPhone,setCustomerPhone] = useState('');
  const [address,setAddress] = useState('');
  const [transactionId,setTransactionId] = useState('');
  const [paymentMethod,setPaymentMethod] = useState('bkash');
  const [locationLat,setLocationLat] = useState(null);
  const [locationLng,setLocationLng] = useState(null);

  const [productTitle,setProductTitle] = useState('');
  const [productCategory,setProductCategory] = useState('Foods');
  const [productImage,setProductImage] = useState(null);
  const [productOptions,setProductOptions] = useState('৫০০ গ্রাম:100, ১ কেজি:200');
  const [editingProduct,setEditingProduct] = useState(null);

  const [chatText,setChatText] = useState('');
  const [chatMessages,setChatMessages] = useState([]);
  const [chatCustomers,setChatCustomers] = useState([]);
  const [selectedCustomer,setSelectedCustomer] = useState('');

  const [sellerName,setSellerName] = useState('');
  const [sellerEmail,setSellerEmail] = useState('');
  const [sellerPassword,setSellerPassword] = useState('');
  const [sellerPhone,setSellerPhone] = useState('');
  const [sellerFirstProduct,setSellerFirstProduct] = useState('');
  const [sellerFirstImage,setSellerFirstImage] = useState(null);
  const [sellerDetails,setSellerDetails] = useState('');
  const [sellerProducts,setSellerProducts] = useState([]);
  const [sellerApplications,setSellerApplications] = useState([]);
  const [sellerProductTitle,setSellerProductTitle] = useState('');
  const [sellerProductImage,setSellerProductImage] = useState(null);
  const [sellerProductDetails,setSellerProductDetails] = useState('');
  const [sellerProductPrice,setSellerProductPrice] = useState('');
  const [sellerProductCategory,setSellerProductCategory] = useState('Foods');
  const [editingSellerProduct,setEditingSellerProduct] = useState(null);
  const [pendingSellerProducts,setPendingSellerProducts] = useState([]);

  function notify(t) {
    setMessage(t);
    window.setTimeout(() => setMessage(''),3500);
  }

  async function copyBkashNumber() {
    try {
      await navigator.clipboard.writeText(BKASH);
      notify('বিকাশ নম্বর কপি হয়েছে।');
    } catch {
      const input = document.createElement('textarea');
      input.value = BKASH;
      document.body.appendChild(input);
      input.select();

      try {
        document.execCommand('copy');
        notify('বিকাশ নম্বর কপি হয়েছে।');
      } catch {
        notify('কপি করা যায়নি। নম্বরটি হাতে কপি করুন।');
      }

      input.remove();
    }
  }

  async function checkAdmin(id) {
    if (!db || !id) {
      setIsAdmin(false);
      return false;
    }

    const {data,error} = await db.from('admin_users')
      .select('user_id')
      .eq('user_id',id)
      .maybeSingle();

    const ok = !error && !!data;
    setIsAdmin(ok);
    return ok;
  }

  async function loadSellerAccess(id) {
    if (!db || !id) {
      setIsSeller(false);
      setSellerApplication(null);
      setSellerId('');
      return null;
    }

    const {data,error} = await db.from('seller_applications')
      .select('*')
      .eq('user_id',id)
      .maybeSingle();

    if (error) {
      setSellerApplication(null);
      setIsSeller(false);
      setSellerId('');
      return null;
    }

    setSellerApplication(data || null);
    setIsSeller(data?.status === 'approved');
    setSellerId(data?.seller_id || '');
    return data;
  }

  async function checkUser() {
    if (!db) return null;

    const {data} = await db.auth.getSession();
    const current = data?.session?.user || null;

    setUser(current);

    if (current) {
      await checkAdmin(current.id);
      await loadSellerAccess(current.id);
    } else {
      setIsAdmin(false);
      setIsSeller(false);
      setSellerApplication(null);
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
      const {data} = await db.auth.getSession();

      if (!data?.session && window.location.pathname !== '/admin-login') {
        const {error} = await db.auth.signInAnonymously();

        if (error) {
          notify('কাস্টমার সেশন তৈরি হয়নি: '+error.message);
        }
      }

      if (active) await checkUser();
    }

    start();

    const {data:listener} = db.auth.onAuthStateChange((_event,session) => {
      const current = session?.user || null;
      setUser(current);

      if (!current) {
        setIsAdmin(false);
        setIsSeller(false);
        setSellerApplication(null);
      } else {
        setTimeout(() => {
          if (active) {
            checkAdmin(current.id);
            loadSellerAccess(current.id);
          }
        },0);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  },[]);

  // অ্যাডমিন লগইন
  async function signIn() {
    if (!db) return notify('Supabase সংযোগ নেই।');

    if (window.location.pathname !== '/admin-login') {
      return notify('অ্যাডমিন লগইন অনুমোদিত ঠিকানা থেকে করতে হবে।');
    }

    if (!email.trim() || !password) {
      return notify('ইমেইল ও পাসওয়ার্ড লিখুন।');
    }

    const {data,error} = await db.auth.signInWithPassword({
      email:email.trim(),
      password
    });

    if (error) return notify(error.message);

    const ok = await checkAdmin(data.user.id);

    if (!ok) {
      await db.auth.signOut();
      return notify('এই অ্যাকাউন্ট অ্যাডমিন নয়।');
    }

    setPage('admin');
    notify('অ্যাডমিন লগইন সফল হয়েছে।');
  }

  async function registerSeller() {
    if (!db) return notify('Supabase সংযোগ নেই।');

    if (!sellerName.trim() || !sellerEmail.trim() || !sellerPassword ||
        !sellerPhone.trim() || !sellerFirstProduct.trim() || !sellerDetails.trim()) {
      return notify('সব তথ্য পূরণ করুন।');
    }

    if (sellerPassword.length < 6) {
      return notify('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের দিন।');
    }

    try {
      const {data,error} = await db.auth.signUp({
        email:sellerEmail.trim(),
        password:sellerPassword
      });

      if (error) return notify(error.message);

      const newUser = data.user;

      if (!newUser) {
        return notify('নিবন্ধন হয়েছে। ইমেইল যাচাই করে Seller Login করুন।');
      }

      if (!data.session) {
        return notify('ইমেইল যাচাই করুন। এরপর Seller Login করে আবেদন সম্পন্ন করুন।');
      }

      let imageUrl = null;

      if (sellerFirstImage) {
        imageUrl = await uploadSellerImage(sellerFirstImage,newUser.id);
      }

      const {error:appError} = await db.from('seller_applications').insert({
        user_id:newUser.id,
        full_name:sellerName.trim(),
        email:sellerEmail.trim(),
        phone:sellerPhone.trim(),
        product_name:sellerFirstProduct.trim(),
        product_image:imageUrl,
        product_details:sellerDetails.trim(),
        status:'pending'
      });

      if (appError) {
        return notify('আবেদন জমা হয়নি: '+appError.message);
      }

      setSellerApplication({status:'pending'});
      setPage('seller-pending');
      notify('বিক্রেতার আবেদন জমা হয়েছে।');
    } catch (e) {
      notify('নিবন্ধন হয়নি: '+e.message);
    }
  }

  async function sellerLogin() {
    if (!db) return notify('Supabase সংযোগ নেই।');

    if (!sellerEmail.trim() || !sellerPassword) {
      return notify('Gmail ও Password দিন।');
    }

    const {data,error} = await db.auth.signInWithPassword({
      email:sellerEmail.trim(),
      password:sellerPassword
    });

    if (error) return notify(error.message);

    const admin = await checkAdmin(data.user.id);
    const application = await loadSellerAccess(data.user.id);

    if (admin) {
      await db.auth.signOut();
      return notify('এটি অ্যাডমিন অ্যাকাউন্ট।');
    }

    if (!application) {
      await db.auth.signOut();
      return notify('এই Gmail দিয়ে বিক্রেতার আবেদন পাওয়া যায়নি।');
    }

    if (application.status !== 'approved') {
      setPage('seller-pending');

      return notify(
        application.status === 'rejected'
          ? 'আপনার আবেদন গ্রহণ করা হয়নি।'
          : 'আপনার আবেদন এখনো অনুমোদিত হয়নি।'
      );
    }

    setPage('seller-dashboard');
    notify('Seller Login সফল হয়েছে।');
  }

  async function signOut() {
    if (!db) return;

    await db.auth.signOut();

    setUser(null);
    setIsAdmin(false);
    setIsSeller(false);
    setSellerApplication(null);
    setSellerId('');
    setPage('home');

    const {error} = await db.auth.signInAnonymously();

    if (error) {
      notify('কাস্টমার সেশন তৈরি হয়নি।');
    } else {
      notify('লগআউট হয়েছে।');
    }
  }

  async function uploadProductImage() {
    if (!productImage) return null;

    const ext = productImage.name.split('.').pop() || 'jpg';
    const path = `admin-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const {error} = await db.storage.from('product-images')
      .upload(path,productImage,{upsert:true});

    if (error) throw error;

    return db.storage.from('product-images').getPublicUrl(path).data.publicUrl;
  }

  async function uploadSellerImage(file,ownerId) {
    if (!file || !ownerId) return null;

    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${ownerId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const {error} = await db.storage.from('product-images')
      .upload(path,file,{upsert:true});

    if (error) throw error;

    return db.storage.from('product-images').getPublicUrl(path).data.publicUrl;
  }

  async function loadProducts() {
    if (!db) return;

    const [adminResult,sellerResult] = await Promise.all([
      db.from('products').select('*').order('id',{ascending:true}),
      db.from('seller_products').select('*')
        .eq('status','approved')
        .order('created_at',{ascending:false})
    ]);

    if (adminResult.error) {
      notify('পণ্য লোড হয়নি: '+adminResult.error.message);
      return;
    }

    let adminProducts = adminResult.data || [];

    if (!adminProducts.length && isAdmin) {
      const seed = defaultProducts.map(p => ({
        title:p.title,
        category:p.category,
        image_url:p.image,
        options:p.options
      }));

      const {data,error} = await db.from('products').insert(seed).select('*');

      if (!error && data) adminProducts = data;
    }

    const normalAdmin = adminProducts.map(p => ({
      ...p,
      id:p.id,
      title:p.title,
      category:p.category,
      image:p.image_url || p.image,
      options:p.options || []
    }));

    const normalSeller = (sellerResult.data || []).map(p => ({
      ...p,
      id:`seller-${p.id}`,
      seller_product_id:p.id,
      title:p.title,
      category:p.category,
      image:p.image_url,
      options:[{size:'একক',price:Number(p.price)}]
    }));

    setProducts([...normalAdmin,...normalSeller]);
  }

  useEffect(() => {
    loadProducts();
  },[isAdmin]);

  function parseOptions() {
    return productOptions.split(',').map(part => {
      const [size,price] = part.split(':');

      return {
        size:size?.trim(),
        price:Number(price?.trim())
      };
    }).filter(x => x.size && Number.isFinite(x.price) && x.price > 0);
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

      if (productImage) imageUrl = await uploadProductImage();

      const values = {
        title:productTitle.trim(),
        category:productCategory,
        image_url:imageUrl,
        options
      };

      const result = editingProduct
        ? await db.from('products').update(values).eq('id',editingProduct.id)
        : await db.from('products').insert(values);

      if (result.error) return notify(result.error.message);

      resetProductForm();
      await loadProducts();
      notify('পণ্য সংরক্ষণ হয়েছে।');
      setPage('admin');
    } catch(e) {
      notify('পণ্য সংরক্ষণ হয়নি: '+e.message);
    }
  }

  function resetProductForm() {
    setProductTitle('');
    setProductCategory('Foods');
    setProductImage(null);
    setProductOptions('৫০০ গ্রাম:100, ১ কেজি:200');
    setEditingProduct(null);
  }

  function startEditProduct(p) {
    if (String(p.id).startsWith('base-') || String(p.id).startsWith('seller-')) {
      return notify('এই পণ্যটি অ্যাডমিন পণ্য তালিকা থেকে এডিট করুন।');
    }

    setEditingProduct(p);
    setProductTitle(p.title);
    setProductCategory(p.category);
    setProductOptions((p.options || []).map(x => `${x.size}:${x.price}`).join(', '));
    setProductImage(null);
    setPage('add-product');
  }

  async function deleteProduct(p) {
    if (!db || !isAdmin) return;

    if (String(p.id).startsWith('base-') || String(p.id).startsWith('seller-')) {
      return notify('এই তালিকার পণ্যটি এই বাটন দিয়ে মুছতে পারবেন না।');
    }

    if (!confirm('পণ্যটি মুছে ফেলবেন?')) return;

    const {error} = await db.from('products').delete().eq('id',p.id);

    if (error) return notify(error.message);

    await loadProducts();
    notify('পণ্য মুছে ফেলা হয়েছে।');
  }

  async function loadMySellerProducts() {
    if (!db || !user || !isSeller) return;

    const {data,error} = await db.from('seller_products')
      .select('*')
      .eq('seller_user_id',user.id)
      .order('created_at',{ascending:false});

    if (error) return notify(error.message);

    setSellerProducts(data || []);
  }

  async function saveSellerProduct() {
    if (!db || !user || !isSeller) {
      return notify('অনুমোদিত Seller Login প্রয়োজন।');
    }

    if (!sellerProductTitle.trim() || !sellerProductDetails.trim() ||
        !sellerProductPrice || Number(sellerProductPrice) <= 0) {
      return notify('পণ্যের নাম, বিবরণ ও সঠিক দাম দিন।');
    }

    try {
      let imageUrl = editingSellerProduct?.image_url || null;

      if (sellerProductImage) {
        imageUrl = await uploadSellerImage(sellerProductImage,user.id);
      }

      const values = {
        seller_user_id:user.id,
        title:sellerProductTitle.trim(),
        image_url:imageUrl,
        details:sellerProductDetails.trim(),
        price:Number(sellerProductPrice),
        category:sellerProductCategory
      };

      const result = editingSellerProduct
        ? await db.from('seller_products').update(values)
            .eq('id',editingSellerProduct.id)
            .eq('seller_user_id',user.id)
        : await db.from('seller_products').insert(values);

      if (result.error) return notify(result.error.message);

      resetSellerProductForm();
      await loadMySellerProducts();
      await loadProducts();
      setPage('seller-dashboard');

      notify('পণ্য জমা হয়েছে। অ্যাডমিন অনুমোদনের পর দোকানে দেখা যাবে।');
    } catch(e) {
      notify('পণ্য সংরক্ষণ হয়নি: '+e.message);
    }
  }

  function resetSellerProductForm() {
    setSellerProductTitle('');
    setSellerProductImage(null);
    setSellerProductDetails('');
    setSellerProductPrice('');
    setSellerProductCategory('Foods');
    setEditingSellerProduct(null);
  }

  function editMySellerProduct(p) {
    setEditingSellerProduct(p);
    setSellerProductTitle(p.title);
    setSellerProductDetails(p.details || '');
    setSellerProductPrice(String(p.price));
    setSellerProductCategory(p.category);
    setSellerProductImage(null);
    setPage('seller-add-product');
  }

  async function deleteMySellerProduct(p) {
    if (!db || !user || !isSeller) return;
    if (!confirm('নিজের পণ্যটি মুছে ফেলবেন?')) return;

    const {error} = await db.from('seller_products').delete()
      .eq('id',p.id)
      .eq('seller_user_id',user.id);

    if (error) return notify(error.message);

    await loadMySellerProducts();
    await loadProducts();
    notify('পণ্য মুছে ফেলা হয়েছে।');
  }

  async function loadSellerApplications() {
    if (!db || !isAdmin) return;

    const {data,error} = await db.from('seller_applications')
      .select('*')
      .order('created_at',{ascending:false});

    if (error) return notify(error.message);

    setSellerApplications(data || []);
  }

  async function reviewApplication(id,decision) {
    if (!db || !isAdmin) return;

    const {error} = await db.rpc('review_seller_application',{
      application_id:id,
      decision
    });

    if (error) return notify(error.message);

    await loadSellerApplications();

    notify(
      decision === 'approved'
        ? 'বিক্রেতা অনুমোদিত হয়েছে।'
        : 'আবেদন বাতিল হয়েছে।'
    );
  }

  async function reviewSellerProduct(id,decision) {
    if (!db || !isAdmin) return;

    const {error} = await db.rpc('review_seller_product',{
      product_id:id,
      decision
    });

    if (error) return notify(error.message);

    await loadPendingSellerProducts();
    await loadProducts();
    notify('পণ্যের সিদ্ধান্ত সংরক্ষণ হয়েছে।');
  }

  async function loadPendingSellerProducts() {
    if (!db || !isAdmin) return;

    const {data,error} = await db.from('seller_products')
      .select('*')
      .eq('status','pending')
      .order('created_at',{ascending:false});

    if (error) return notify(error.message);

    setPendingSellerProducts(data || []);
  }

  function addToCart(product,option) {
    const cartId = `${product.id}-${option.size}`;

    setCart(old => {
      const found = old.find(x => x.cartId === cartId);

      if (found) {
        return old.map(x => x.cartId === cartId
          ? {...x,quantity:x.quantity+1}
          : x);
      }

      return [...old,{
        cartId,
        id:product.id,
        title:product.title,
        category:product.category,
        size:option.size,
        price:option.price,
        quantity:1
      }];
    });

    notify('কার্টে যোগ হয়েছে।');
  }

  function changeQuantity(id,amount) {
    setCart(old => old.map(x => x.cartId === id
      ? {...x,quantity:x.quantity+amount}
      : x).filter(x => x.quantity > 0));
  }

  const total = cart.reduce((sum,x) => sum+x.price*x.quantity,0);

  async function placeOrder() {
    if (!db || !user) return notify('লগইন তৈরি হয়নি।');
    if (!cart.length) return notify('কার্ট খালি।');

    if (!customerName.trim() || !customerPhone.trim() ||
        !address.trim() ||
        (paymentMethod === 'bkash' && !transactionId.trim())) {
      return notify('প্রয়োজনীয় সব তথ্য পূরণ করুন।');
    }

    const items = cart.map(x => ({
      title:x.title,
      category:x.category,
      size:x.size,
      price:x.price,
      quantity:x.quantity
    }));

    const {error} = await db.from('market_orders').insert({
      user_id:user.id,
      customer_name:customerName.trim(),
      phone:customerPhone.trim(),
      address:address.trim(),
      items,
      total,
      status:'pending',
      payment_method:paymentMethod === 'bkash'
        ? 'bKash Personal'
        : 'Cash on Delivery',
      payment_number:paymentMethod === 'bkash' ? BKASH : null,
      transaction_id:paymentMethod === 'bkash'
        ? transactionId.trim()
        : null,
      payment_status:paymentMethod === 'bkash'
        ? 'pending_verification'
        : 'cash_on_delivery',
      location_lat:locationLat,
      location_lng:locationLng
    });

    if (error) {
      return notify('অর্ডার জমা হয়নি: '+error.message);
    }

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

    const {data,error} = await db.from('market_orders')
      .select('*')
      .order('id',{ascending:false});

    if (error) return notify(error.message);

    setOrders(data || []);
  }

  async function loadMyOrders() {
    if (!db || !user || user.is_anonymous) return;

    const {data,error} = await db.from('market_orders')
      .select('*')
      .eq('user_id',user.id)
      .order('id',{ascending:false});

    if (error) return notify(error.message);

    setMyOrders(data || []);
  }

  async function updateOrder(id,values) {
    if (!db || !isAdmin) return;

    const {error} = await db.from('market_orders')
      .update(values)
      .eq('id',id);

    if (error) return notify(error.message);

    notify('অর্ডার পরিবর্তন হয়েছে।');
    loadOrders();
  }

  async function loadCustomerChat() {
    if (!db || !user) return;

    const {data,error} = await db.from('chat_messages')
      .select('*')
      .eq('user_id',user.id)
      .order('created_at',{ascending:true});

    if (error) return notify(error.message);

    setChatMessages(data || []);
  }

  async function sendCustomerMessage() {
    if (!db || !user || !chatText.trim()) return;

    const {error} = await db.from('chat_messages').insert({
      user_id:user.id,
      sender:'customer',
      message:chatText.trim()
    });

    if (error) return notify(error.message);

    setChatText('');
    loadCustomerChat();
  }

  async function loadChatCustomers() {
    if (!db || !isAdmin) return;

    const {data,error} = await db.from('chat_messages')
      .select('user_id,created_at')
      .order('created_at',{ascending:false});

    if (error) return notify(error.message);

    const unique = [];

    (data || []).forEach(row => {
      if (!unique.some(x => x.user_id === row.user_id)) {
        unique.push(row);
      }
    });

    setChatCustomers(unique);

    if (!selectedCustomer && unique.length) {
      setSelectedCustomer(unique[0].user_id);
    }
  }

  async function loadAdminChat(id) {
    if (!db || !isAdmin || !id) return;

    const {data,error} = await db.from('chat_messages')
      .select('*')
      .eq('user_id',id)
      .order('created_at',{ascending:true});

    if (error) return notify(error.message);

    setChatMessages(data || []);
  }

  async function sendAdminMessage() {
    if (!db || !isAdmin || !selectedCustomer || !chatText.trim()) return;

    const {error} = await db.from('chat_messages').insert({
      user_id:selectedCustomer,
      sender:'admin',
      message:chatText.trim()
    });

    if (error) return notify(error.message);

    setChatText('');
    loadAdminChat(selectedCustomer);
  }

  useEffect(() => {
    if (page === 'admin' && isAdmin) {
      loadOrders();
      loadChatCustomers();
      loadSellerApplications();
      loadPendingSellerProducts();

      const timer = setInterval(() => {
        loadOrders();
        loadChatCustomers();
        loadSellerApplications();
        loadPendingSellerProducts();
      },15000);

      return () => clearInterval(timer);
    }
  },[page,isAdmin]);

  useEffect(() => {
    if (page === 'my-orders') loadMyOrders();
  },[page,user]);

  useEffect(() => {
    if (page === 'chat' && !isAdmin) loadCustomerChat();
  },[page,user,isAdmin]);

  useEffect(() => {
    if (page === 'admin-chat' && isAdmin) {
      loadChatCustomers();

      if (selectedCustomer) {
        loadAdminChat(selectedCustomer);
      }
    }
  },[page,isAdmin,selectedCustomer]);

  useEffect(() => {
    if (page === 'seller-dashboard' && isSeller) {
      loadMySellerProducts();
    }
  },[page,isSeller]);

  // অ্যাডমিন ছাড়া কেউ অ্যাডমিন পেজে থাকতে পারবে না
  useEffect(() => {
    const adminPages = ['admin','admin-chat','add-product'];

    if (adminPages.includes(page) && !isAdmin) {
      setPage('home');
    }
  },[page,isAdmin]);

  const whatsappLink = `https://wa.me/88${WHATSAPP}?text=${encodeURIComponent('BD BUSINESS-এ স্বাগতম। পণ্য সম্পর্কে জানতে চাই।')}`;

  const visibleProducts = products.filter(p =>
    p.category === category
  );

  function orderStatus(status) {
    return ({
      pending:'অপেক্ষমাণ',
      confirmed:'নিশ্চিত',
      cancelled:'বাতিল'
    })[status] || status || 'অজানা';
  }

  function deliveryInfo(order) {
    const cats = [...new Set(
      (order.items || []).map(x => x.category).filter(Boolean)
    )];

    if (!cats.length) return null;

    const start = new Date(order.created_at || Date.now());

    return (
      <div className="delivery-info">
        <b>সম্ভাব্য ডেলিভারি সময়:</b>

        {cats.map(c => (
          <p key={c}>
            {c}: {new Date(
              start.getTime()+(c === 'Foods' ? 6 : 96)*3600000
            ).toLocaleString('bn-BD')}
          </p>
        ))}

        <small>এটি আনুমানিক সময়।</small>
      </div>
    );
  }

  return (
    <>
      <style>{`
        *{box-sizing:border-box}
        body{
          margin:0;
          font-family:Arial,sans-serif;
          background:#f4f6f8;
          color:#222;
          padding-bottom:75px
        }
        button{
          border:0;
          border-radius:7px;
          padding:10px 12px;
          background:#087b58;
          color:white;
          cursor:pointer;
          margin:3px;
          font-size:14px
        }
        button:disabled{opacity:.6;cursor:not-allowed}
        button.secondary{background:#34495e}
        button.danger{background:#bd3434}
        header{
          background:#073b32;
          color:white;
          padding:12px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          position:sticky;
          top:0;
          z-index:10
        }
        header h1{margin:0;font-size:21px}
        .header-button{
          font-size:24px;
          background:transparent
        }
        .menu{
          position:absolute;
          top:55px;
          left:8px;
          background:white;
          color:#222;
          padding:10px;
          border-radius:10px;
          box-shadow:0 3px 12px #0003;
          z-index:20
        }
        .menu button{
          display:block;
          width:100%;
          text-align:left
        }
        .menu a{
          display:block;
          padding:10px;
          color:#073b32
        }
        main{max-width:1000px;margin:auto;padding:12px}
        .card{
          background:white;
          border-radius:12px;
          padding:13px;
          margin:10px 0;
          box-shadow:0 2px 8px #00000012;
          min-width:0
        }
        .grid{
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:9px
        }
        .product-image{
          width:100%;
          height:130px;
          object-fit:cover;
          border-radius:8px;
          background:#eee
        }
        .product-card h3{
          font-size:16px;
          margin:8px 0;
          overflow-wrap:anywhere
        }
        .price{
          color:#087b58;
          font-weight:bold;
          margin:7px 0
        }
        input,textarea,select{
          display:block;
          width:100%;
          padding:12px;
          border:1px solid #ccc;
          border-radius:7px;
          margin:9px 0 14px;
          font-size:16px;
          background:white
        }
        input[type=radio],input[type=file]{
          width:auto;
          display:inline-block
        }
        textarea{min-height:75px}
        h2{color:#073b32;font-size:21px}
        .message{
          position:sticky;
          top:55px;
          background:#fff2c7;
          padding:11px;
          text-align:center;
          z-index:9
        }
        .categories{
          display:flex;
          overflow-x:auto;
          gap:8px;
          background:white;
          padding:10px
        }
        .categories button{
          white-space:nowrap;
          background:#e7efec;
          color:#073b32
        }
        .categories button.active{
          background:#087b58;
          color:white
        }
        .bottom-nav{
          position:fixed;
          bottom:0;
          left:0;
          right:0;
          display:grid;
          grid-template-columns:repeat(4,1fr);
          background:white;
          border-top:1px solid #ddd;
          z-index:15;
          padding:5px 0
        }
        .bottom-nav button{
          background:transparent;
          color:#073b32;
          font-size:12px;
          padding:7px 2px
        }
        .row{display:flex;gap:5px;align-items:center}
        .row input{flex:1;min-width:0}
        .chat-message{
          padding:10px;
          margin:7px 0;
          border-radius:10px;
          max-width:85%;
          overflow-wrap:anywhere
        }
        .customer-message{
          background:#d9f5e5;
          margin-left:auto
        }
        .admin-message{background:#eee}
        .map-picker{
          background:#f8faf9;
          border:1px solid #dce5e1;
          border-radius:10px;
          padding:10px;
          margin:12px 0
        }
        .map-container{
          position:relative;
          width:100%
        }
        .map-area{
          height:320px;
          width:100%;
          border-radius:10px;
          background:#e8eeee;
          z-index:1
        }
        .map-search-box{
          position:absolute;
          top:10px;
          right:10px;
          width:min(310px,calc(100% - 20px));
          z-index:500;
          background:white;
          padding:7px;
          border-radius:8px;
          box-shadow:0 2px 10px #0003
        }
        .map-search-row{
          display:flex;
          gap:4px;
          align-items:center
        }
        .map-search-row input{
          flex:1;
          min-width:0;
          margin:0;
          padding:9px;
          font-size:14px
        }
        .map-search-row button{
          margin:0;
          white-space:nowrap;
          padding:9px
        }
        .map-search-results{
          max-height:160px;
          overflow-y:auto;
          margin-top:5px
        }
        .map-search-results button{
          display:block;
          width:100%;
          text-align:left;
          background:#f1f5f3;
          color:#173b31;
          margin:3px 0;
          font-size:12px;
          white-space:normal;
          overflow-wrap:anywhere
        }
        .delivery-info{
          background:#f0f7f3;
          border-radius:8px;
          padding:10px;
          margin-top:10px
        }
        .bkash-payment{
          border:1px solid #f0cbd9;
          background:#fff8fb;
          border-radius:10px;
          padding:12px;
          margin:12px 0
        }
        .bkash-number-row{
          display:flex;
          align-items:center;
          gap:8px;
          flex-wrap:wrap;
          margin:8px 0 12px
        }
        .bkash-number{
          font-size:19px;
          font-weight:bold;
          color:#b20c53
        }
        .bkash-copy{
          background:#34495e;
          margin:0
        }
        .bkash-go{
          display:flex;
          align-items:center;
          justify-content:center;
          gap:9px;
          width:100%;
          padding:12px;
          background:#d12053;
          color:white;
          text-decoration:none;
          border-radius:8px;
          font-weight:bold;
          margin:8px 0 12px
        }
        .bkash-logo{
          width:30px;
          height:30px;
          object-fit:contain;
          background:white;
          border-radius:5px;
          padding:2px
        }
        .seller-wall{
          background:linear-gradient(135deg,#073b32,#147b58,#d4a94b);
          color:white;
          min-height:65vh;
          border-radius:18px;
          padding:20px;
          text-align:center
        }
        .seller-arch{
          font-size:25px;
          font-weight:bold;
          letter-spacing:2px;
          border:3px solid #fff;
          border-radius:50% 50% 10px 10px;
          padding:20px 10px 12px;
          max-width:320px;
          margin:12px auto
        }
        .bd-logo{
          width:105px;
          height:105px;
          border-radius:50%;
          border:4px solid white;
          background:#fff;
          color:#087b58;
          display:grid;
          place-items:center;
          font-size:30px;
          font-weight:bold;
          margin:20px auto
        }
        .seller-wall button{
          background:#fff;
          color:#073b32;
          padding:13px 18px;
          font-weight:bold
        }
        footer{
          text-align:center;
          padding:20px;
          background:#073b32;
          color:white;
          margin-top:25px
        }
        footer a{color:white}
        @media(min-width:650px){
          .product-image{height:190px}
          .grid{grid-template-columns:repeat(3,minmax(0,1fr))}
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

        {menuOpen && (
          <div className="menu">
            <button onClick={() => {
              setMenuOpen(false);
              setPage('seller-register');
            }}>
              বিক্রেতা হতে আবেদন
            </button>

            <button onClick={() => {
              setMenuOpen(false);
              setPage('seller-login');
            }}>
              Seller Login
            </button>

            <a href={whatsappLink} target="_blank" rel="noreferrer">
              WhatsApp
            </a>

            <a href={FACEBOOK} target="_blank" rel="noreferrer">
              Facebook Page
            </a>
          </div>
        )}
      </header>

      {message && <div className="message">{message}</div>}

      {page === 'home' && (
        <>
          <div className="categories">
            {categories.map(c => (
              <button
                key={c}
                className={category === c ? 'active' : ''}
                onClick={() => setCategory(c)}
              >
                {c}
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
              {visibleProducts.map(p => (
                <div className="card product-card" key={p.id}>
                  <img
                    className="product-image"
                    src={p.image || 'https://placehold.co/600x400?text=BD+BUSINESS'}
                    alt={p.title}
                  />

                  <h3>{p.title}</h3>

                  {(p.options || []).map((o,i) => (
                    <div key={i}>
                      <p className="price">
                        {o.size} — ৳{o.price}
                      </p>

                      <button onClick={() => addToCart(p,o)}>
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

            {cart.map(x => (
              <div className="card" key={x.cartId}>
                <b>{x.title} — {x.size}</b>
                <p>৳{x.price} × {x.quantity}</p>

                <button onClick={() => changeQuantity(x.cartId,-1)}>
                  −
                </button>

                <button onClick={() => changeQuantity(x.cartId,1)}>
                  +
                </button>
              </div>
            ))}

            <h2>মোট: ৳{total}</h2>

            {!!cart.length && (
              <>
                <h2>পেমেন্ট পদ্ধতি</h2>

                <label>
                  <input
                    type="radio"
                    name="pay"
                    checked={paymentMethod === 'bkash'}
                    onChange={() => setPaymentMethod('bkash')}
                  />
                  {' '}বিকাশ পেমেন্ট
                </label>
                <br/>

                <label>
                  <input
                    type="radio"
                    name="pay"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  {' '}ক্যাশ অন ডেলিভারি
                </label>

                {paymentMethod === 'bkash' && (
                  <div className="bkash-payment">
                    <h3>বিকাশ পেমেন্ট</h3>

                    <p>বিকাশ নম্বর:</p>

                    <div className="bkash-number-row">
                      <span className="bkash-number">{BKASH}</span>

                      <button
                        type="button"
                        className="bkash-copy"
                        onClick={copyBkashNumber}
                      >
                        📋 কপি করুন
                      </button>
                    </div>

                    <a
                      className="bkash-go"
                      href="https://www.bkash.com/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        className="bkash-logo"
                        src="https://download.logo.wine/logo/BKash/BKash-Logo.wine.png"
                        alt="bKash"
                      />
                      বিকাশে যান
                    </a>

                    <label>Transaction ID</label>

                    <input
                      placeholder="Transaction ID লিখুন"
                      value={transactionId}
                      onChange={e => setTransactionId(e.target.value)}
                    />

                    <small>
                      পেমেন্ট করার পর Transaction ID লিখুন।
                    </small>
                  </div>
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

                <h3>ডেলিভারি লোকেশন</h3>
                <p>লোকেশন দেওয়া ঐচ্ছিক।</p>

                <MapPicker
                  onSelect={p => {
                    setLocationLat(p.lat);
                    setLocationLng(p.lng);
                  }}
                />

                {locationLat !== null && (
                  <p>
                    লোকেশন নির্বাচন হয়েছে: {locationLat}, {locationLng}
                  </p>
                )}

                <button onClick={placeOrder}>
                  অর্ডার জমা দিন
                </button>
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

            {!myOrders.length && (
              <p>আপনার কোনো অর্ডার পাওয়া যায়নি।</p>
            )}

            {myOrders.map(o => (
              <div className="card" key={o.id}>
                <b>অর্ডার #{o.id}</b>
                <p>মোট: ৳{o.total}</p>
                <p>অবস্থা: {orderStatus(o.status)}</p>
                <p>ঠিকানা: {o.address}</p>

                {deliveryInfo(o)}

                {o.location_lat != null && (
                  <p>
                    <a
                      href={`https://www.google.com/maps?q=${o.location_lat},${o.location_lng}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      📍 লোকেশন ম্যাপে দেখুন
                    </a>
                  </p>
                )}

                {(o.items || []).map((x,i) => (
                  <p key={i}>
                    {x.title} ({x.size}) × {x.quantity}
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

            <button onClick={loadCustomerChat}>
              মেসেজ রিফ্রেশ
            </button>

            {chatMessages.map(x => (
              <div
                key={x.id}
                className={
                  'chat-message '+
                  (x.sender === 'customer'
                    ? 'customer-message'
                    : 'admin-message')
                }
              >
                <b>{x.sender === 'admin' ? 'অ্যাডমিন' : 'আপনি'}</b>
                <div>{x.message}</div>
              </div>
            ))}

            <div className="row">
              <input
                placeholder="মেসেজ লিখুন..."
                value={chatText}
                onChange={e => setChatText(e.target.value)}
              />

              <button onClick={sendCustomerMessage}>
                পাঠান
              </button>
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
        </main>
      )}

      {page === 'seller-register' && (
        <main>
          <section className="card">
            <h2>বিক্রেতা হতে আবেদন</h2>

            <label>প্রথম নাম</label>
            <input
              placeholder="আপনার প্রথম নাম"
              value={sellerName}
              onChange={e => setSellerName(e.target.value)}
            />

            <label>Gmail</label>
            <input
              type="email"
              placeholder="আপনার Gmail"
              value={sellerEmail}
              onChange={e => setSellerEmail(e.target.value)}
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="কমপক্ষে ৬ অক্ষর"
              value={sellerPassword}
              onChange={e => setSellerPassword(e.target.value)}
            />

            <label>ফোন নম্বর</label>
            <input
              placeholder="ফোন নম্বর"
              value={sellerPhone}
              onChange={e => setSellerPhone(e.target.value)}
            />

            <label>আপনার পণ্যের নাম</label>
            <input
              placeholder="পণ্যের নাম"
              value={sellerFirstProduct}
              onChange={e => setSellerFirstProduct(e.target.value)}
            />

            <label>পণ্যের ছবি (প্রোফাইল ছবি নয়)</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setSellerFirstImage(e.target.files?.[0] || null)}
            />

            <label>পণ্যের বিস্তারিত</label>
            <textarea
              placeholder="পণ্যের বিস্তারিত লিখুন"
              value={sellerDetails}
              onChange={e => setSellerDetails(e.target.value)}
            />

            <button onClick={registerSeller}>
              নিবেদন করুন
            </button>

            <button
              className="secondary"
              onClick={() => setPage('home')}
            >
              ফিরে যান
            </button>
          </section>
        </main>
      )}

      {page === 'seller-login' && (
        <main>
          <section className="card">
            <h2>Seller Login</h2>

            <label>Gmail</label>
            <input
              type="email"
              placeholder="Gmail"
              value={sellerEmail}
              onChange={e => setSellerEmail(e.target.value)}
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Password"
              value={sellerPassword}
              onChange={e => setSellerPassword(e.target.value)}
            />

            <button onClick={sellerLogin}>লগইন</button>

            <button
              className="secondary"
              onClick={() => setPage('seller-register')}
            >
              বিক্রেতা হতে আবেদন
            </button>

            <button
              className="secondary"
              onClick={() => setPage('home')}
            >
              ফিরে যান
            </button>
          </section>
        </main>
      )}

      {page === 'seller-pending' && (
        <main>
          <section className="card">
            <h2>বিক্রেতার আবেদন</h2>

            <p>
              আপনার আবেদন অ্যাডমিনের কাছে জমা হয়েছে।
              অনুমোদন না হওয়া পর্যন্ত Seller Dashboard ব্যবহার করা যাবে না।
            </p>

            <p>
              আবেদনের অবস্থা: {
                sellerApplication?.status === 'rejected'
                  ? 'বাতিল'
                  : 'অপেক্ষমাণ'
              }
            </p>

            <button
              onClick={async () => {
                await loadSellerAccess(user?.id);
                notify('আবেদনের অবস্থা আপডেট হয়েছে।');
              }}
            >
              অবস্থা রিফ্রেশ
            </button>

            <button className="secondary" onClick={signOut}>
              লগআউট
            </button>
          </section>
        </main>
      )}

      {page === 'seller-dashboard' && (
        <main>
          {!isSeller ? (
            <section className="card">
              Seller অনুমোদন প্রয়োজন।
            </section>
          ) : (
            <section className="seller-wall">
              <div className="seller-arch">বিডি বাণিজ্যিক</div>
              <div className="bd-logo">BD</div>

              <h2 style={{color:'white'}}>Seller Dashboard</h2>
              <h3>{sellerApplication?.full_name}</h3>

              <p>
                Seller ID: <b>{sellerId || 'ID পাওয়া যায়নি'}</b>
              </p>

              <button onClick={() => {
                resetSellerProductForm();
                setPage('seller-add-product');
              }}>
                Add Product
              </button>

              <button onClick={() => {
                loadMySellerProducts();
                setPage('seller-my-products');
              }}>
                My Product
              </button>

              <button onClick={signOut}>Logout</button>
            </section>
          )}
        </main>
      )}

      {page === 'seller-add-product' && (
        <main>
          <section className="card">
            <h2>
              {editingSellerProduct ? 'পণ্য এডিট' : 'Add Product'}
            </h2>

            <label>পণ্যের নাম</label>
            <input
              value={sellerProductTitle}
              onChange={e => setSellerProductTitle(e.target.value)}
              placeholder="পণ্যের নাম"
            />

            <label>পণ্যের ছবি</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setSellerProductImage(e.target.files?.[0] || null)}
            />

            <label>পণ্যের বিস্তারিত</label>
            <textarea
              value={sellerProductDetails}
              onChange={e => setSellerProductDetails(e.target.value)}
              placeholder="বিস্তারিত লিখুন"
            />

            <label>দাম (টাকা)</label>
            <input
              type="number"
              value={sellerProductPrice}
              onChange={e => setSellerProductPrice(e.target.value)}
              placeholder="পণ্যের দাম"
            />

            <label>ক্যাটাগরি</label>
            <select
              value={sellerProductCategory}
              onChange={e => setSellerProductCategory(e.target.value)}
            >
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>

            <button onClick={saveSellerProduct}>জমা দিন</button>

            <button
              className="secondary"
              onClick={() => {
                resetSellerProductForm();
                setPage('seller-dashboard');
              }}
            >
              ফিরে যান
            </button>
          </section>
        </main>
      )}

      {page === 'seller-my-products' && (
        <main>
          <section className="card">
            <h2>My Product</h2>

            <button onClick={loadMySellerProducts}>রিফ্রেশ</button>

            {!sellerProducts.length && (
              <p>আপনি এখনো কোনো পণ্য যোগ করেননি।</p>
            )}

            {sellerProducts.map(p => (
              <div className="card" key={p.id}>
                {p.image_url && (
                  <img
                    className="product-image"
                    src={p.image_url}
                    alt={p.title}
                  />
                )}

                <b>{p.title}</b>
                <p>দাম: ৳{p.price}</p>
                <p>ক্যাটাগরি: {p.category}</p>

                <p>
                  অবস্থা: {
                    p.status === 'approved'
                      ? 'অনুমোদিত'
                      : p.status === 'rejected'
                        ? 'বাতিল'
                        : 'অপেক্ষমাণ'
                  }
                </p>

                <button onClick={() => editMySellerProduct(p)}>
                  Edit
                </button>

                <button
                  className="danger"
                  onClick={() => deleteMySellerProduct(p)}
                >
                  Delete
                </button>
              </div>
            ))}

            <button
              className="secondary"
              onClick={() => setPage('seller-dashboard')}
            >
              Dashboard
            </button>
          </section>
        </main>
      )}

      {page === 'admin' && (
        <main>
          {!isAdmin ? (
            <section className="card">
              অ্যাডমিন অনুমতি প্রয়োজন।
            </section>
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
                <button onClick={loadSellerApplications}>
                  Seller আবেদন রিফ্রেশ
                </button>
                <button onClick={loadPendingSellerProducts}>
                  Seller পণ্য রিফ্রেশ
                </button>

                <button className="secondary" onClick={signOut}>
                  লগআউট
                </button>
              </section>

              <section className="card">
                <h2>Seller আবেদন</h2>

                {!sellerApplications.length && <p>কোনো আবেদন নেই।</p>}

                {sellerApplications.map(a => (
                  <div className="card" key={a.id}>
                    <b>{a.full_name}</b>
                    <p>Gmail: {a.email}</p>
                    <p>ফোন: {a.phone}</p>
                    <p>প্রথম পণ্য: {a.product_name}</p>
                    <p>{a.product_details}</p>

                    {a.product_image && (
                      <img
                        className="product-image"
                        src={a.product_image}
                        alt={a.product_name}
                      />
                    )}

                    <p>অবস্থা: {a.status}</p>

                    {a.seller_id && <p>Seller ID: {a.seller_id}</p>}

                    {a.status === 'pending' && (
                      <>
                        <button onClick={() => reviewApplication(a.id,'approved')}>
                          Approve
                        </button>

                        <button
                          className="danger"
                          onClick={() => reviewApplication(a.id,'rejected')}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </section>

              <section className="card">
                <h2>Seller পণ্য অনুমোদন</h2>

                {!pendingSellerProducts.length && (
                  <p>অনুমোদনের অপেক্ষায় পণ্য নেই।</p>
                )}

                {pendingSellerProducts.map(p => (
                  <div className="card" key={p.id}>
                    {p.image_url && (
                      <img
                        className="product-image"
                        src={p.image_url}
                        alt={p.title}
                      />
                    )}

                    <b>{p.title}</b>
                    <p>দাম: ৳{p.price}</p>
                    <p>বিস্তারিত: {p.details}</p>
                    <p>ক্যাটাগরি: {p.category}</p>

                    <button onClick={() => reviewSellerProduct(p.id,'approved')}>
                      Approve
                    </button>

                    <button
                      className="danger"
                      onClick={() => reviewSellerProduct(p.id,'rejected')}
                    >
                      Reject
                    </button>
                  </div>
                ))}
              </section>

              <section className="card">
                <h2>অ্যাডমিন পণ্য পরিচালনা</h2>

                {products
                  .filter(p => !String(p.id).startsWith('seller-'))
                  .map(p => (
                    <div className="card" key={p.id}>
                      <b>{p.title}</b>
                      <p>{p.category}</p>

                      <button onClick={() => startEditProduct(p)}>
                        এডিট
                      </button>

                      <button
                        className="danger"
                        onClick={() => deleteProduct(p)}
                      >
                        ডিলিট
                      </button>
                    </div>
                  ))}
              </section>

              <section className="card">
                <h2>অর্ডার তালিকা</h2>

                {!orders.length && <p>কোনো অর্ডার নেই।</p>}

                {orders.map(o => (
                  <div className="card" key={o.id}>
                    <h3>{o.customer_name}</h3>
                    <p>ফোন: {o.phone}</p>
                    <p>ঠিকানা: {o.address}</p>
                    <p>মোট: ৳{o.total}</p>
                    <p>পেমেন্ট: {o.payment_method}</p>
                    <p>Transaction ID: {o.transaction_id || 'নেই'}</p>
                    <p>পেমেন্ট অবস্থা: {o.payment_status}</p>
                    <p>অর্ডার অবস্থা: {orderStatus(o.status)}</p>

                    {deliveryInfo(o)}

                    {o.location_lat != null && (
                      <p>
                        <a
                          href={`https://www.google.com/maps?q=${o.location_lat},${o.location_lng}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          কাস্টমারের লোকেশন ম্যাপে দেখুন
                        </a>
                      </p>
                    )}

                    {(o.items || []).map((x,i) => (
                      <p key={i}>
                        {x.title} ({x.size}) × {x.quantity}
                      </p>
                    ))}

                    <button onClick={() => updateOrder(o.id,{
                      payment_status:o.payment_method === 'bKash Personal'
                        ? 'verified'
                        : 'cash_on_delivery',
                      status:'confirmed'
                    })}>
                      অর্ডার নিশ্চিত
                    </button>

                    <button
                      className="danger"
                      onClick={() => updateOrder(o.id,{status:'cancelled'})}
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
            <h2>
              {editingProduct ? 'পণ্য এডিট' : 'নতুন পণ্য যোগ করুন'}
            </h2>

            <label>পণ্যের নাম</label>
            <input
              value={productTitle}
              onChange={e => setProductTitle(e.target.value)}
            />

            <label>ক্যাটাগরি</label>
            <select
              value={productCategory}
              onChange={e => setProductCategory(e.target.value)}
            >
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>

            <label>ছবি</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setProductImage(e.target.files?.[0] || null)}
            />

            <label>ওজন ও দাম</label>
            <textarea
              value={productOptions}
              onChange={e => setProductOptions(e.target.value)}
            />

            <p>উদাহরণ: ৫০০ গ্রাম:280, ১ কেজি:550</p>

            <button onClick={saveProduct}>সংরক্ষণ করুন</button>

            <button
              className="secondary"
              onClick={() => {
                resetProductForm();
                setPage('admin');
              }}
            >
              ফিরে যান
            </button>
          </section>
        </main>
      )}

      {page === 'admin-chat' && (
        <main>
          <section className="card">
            <h2>অ্যাডমিন চ্যাট ইনবক্স</h2>

            <button onClick={loadChatCustomers}>
              ইনবক্স রিফ্রেশ
            </button>

            {chatCustomers.map(x => (
              <button
                className="secondary"
                key={x.user_id}
                onClick={() => {
                  setSelectedCustomer(x.user_id);
                  loadAdminChat(x.user_id);
                }}
              >
                কাস্টমার: {x.user_id.slice(0,8)}
              </button>
            ))}

            {selectedCustomer && (
              <>
                <p>
                  নির্বাচিত কাস্টমার: {selectedCustomer.slice(0,12)}
                </p>

                {chatMessages.map(x => (
                  <div
                    key={x.id}
                    className={
                      'chat-message '+
                      (x.sender === 'admin'
                        ? 'customer-message'
                        : 'admin-message')
                    }
                  >
                    <b>{x.sender === 'admin' ? 'অ্যাডমিন' : 'কাস্টমার'}</b>
                    <div>{x.message}</div>
                  </div>
                ))}

                <div className="row">
                  <input
                    placeholder="উত্তর লিখুন..."
                    value={chatText}
                    onChange={e => setChatText(e.target.value)}
                  />

                  <button onClick={sendAdminMessage}>পাঠান</button>
                </div>
              </>
            )}

            <button
              className="secondary"
              onClick={() => setPage('admin')}
            >
              অ্যাডমিন প্যানেলে ফিরুন
            </button>
          </section>
        </main>
      )}

      {![
        'login',
        'admin',
        'add-product',
        'admin-chat',
        'seller-register',
        'seller-login',
        'seller-pending',
        'seller-dashboard',
        'seller-add-product',
        'seller-my-products'
      ].includes(page) && (
        <nav className="bottom-nav">
          <button onClick={() => setPage('my-orders')}>
            📦<br/>My Orders
          </button>

          <button onClick={() => setPage('cart')}>
            🛒<br/>Cart ({cart.length})
          </button>

          <button onClick={() => setPage('chat')}>
            💬<br/>Chat
          </button>

          <button onClick={() => setPage('home')}>
            🏠<br/>Home
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
