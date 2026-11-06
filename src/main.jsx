import React, { useEffect, useState } from 'react';
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
  {title:'মিষ্টি',category:'Foods',image:'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600',options:[{size:'৫০০ গ্রাম',price:280},{size:'১ কেজি',price:550}]},
  {title:'রসমালাই',category:'Foods',image:'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600',options:[{size:'৫০০ গ্রাম',price:280},{size:'১ কেজি',price:550}]},
  {title:'সন্দেশ',category:'Foods',image:'https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=600',options:[{size:'৫০০ গ্রাম',price:180},{size:'১ কেজি',price:350}]},
  {title:'দেশি লাল চিনি',category:'Foods',image:'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=600',options:[{size:'৫০০ গ্রাম',price:135},{size:'১ কেজি',price:260}]},
  {title:'বাদামের খাজা',category:'Foods',image:'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600',options:[{size:'২৫০ গ্রাম',price:130},{size:'৫০০ গ্রাম',price:250}]},
  {title:'রেশমি সনপাপড়ি',category:'Foods',image:'https://images.unsplash.com/photo-1605197584325-3b1e3e9e4f6b?w=600',options:[{size:'২৫০ গ্রাম',price:130},{size:'৫০০ গ্রাম',price:250}]},
  {title:'খাঁটি নারিকেল তেল',category:'Foods',image:'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600',options:[{size:'২৫০ গ্রাম',price:650},{size:'৫০০ গ্রাম',price:1200}]}
];

function MapPicker({onSelect}) {
  const [lat,setLat] = useState('');
  const [lng,setLng] = useState('');

  function choose(latValue,lngValue) {
    setLat(String(latValue));
    setLng(String(lngValue));
    onSelect({lat:Number(latValue),lng:Number(lngValue)});
  }

  function currentLocation() {
    if (!navigator.geolocation) return alert('লোকেশন সুবিধা নেই।');
    navigator.geolocation.getCurrentPosition(
      p => choose(p.coords.latitude,p.coords.longitude),
      () => alert('ফোনের Location permission দিন।')
    );
  }

  return (
    <div className="card">
      <button type="button" onClick={currentLocation}>📍 বর্তমান লোকেশন নিন</button>
      <p>অথবা অক্ষাংশ ও দ্রাঘিমাংশ লিখুন।</p>
      <input placeholder="Latitude" value={lat} onChange={e=>setLat(e.target.value)}/>
      <input placeholder="Longitude" value={lng} onChange={e=>setLng(e.target.value)}/>
      <button type="button" onClick={()=>{
        if(lat && lng && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
          onSelect({lat:Number(lat),lng:Number(lng)});
        } else alert('সঠিক লোকেশন লিখুন।');
      }}>লোকেশন নির্বাচন</button>
      {lat && lng && <p><a target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${lat},${lng}`}>ম্যাপে দেখুন</a></p>}
    </div>
  );
}

function App() {
  const [page,setPage] = useState(window.location.pathname==='/admin-login'?'login':'home');
  const [user,setUser] = useState(null);
  const [isAdmin,setIsAdmin] = useState(false);
  const [isSeller,setIsSeller] = useState(false);
  const [sellerApplication,setSellerApplication] = useState(null);
  const [sellerProfile,setSellerProfile] = useState(null);
  const [sellerId,setSellerId] = useState('');
  const [message,setMessage] = useState('');

  const [products,setProducts] = useState(defaultProducts.map((p,i)=>({...p,id:`base-${i}`})));
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
  const [productOptions,setProductOptions] = useState('৫০০ গ্রাম:280, ১ কেজি:550');
  const [editingProduct,setEditingProduct] = useState(null);

  const [chatText,setChatText] = useState('');
  const [chatMessages,setChatMessages] = useState([]);
  const [chatCustomers,setChatCustomers] = useState([]);
  const [selectedCustomer,setSelectedCustomer] = useState('');

  const [sellerName,setSellerName] = useState('');
  const [sellerShop,setSellerShop] = useState('');
  const [sellerEmail,setSellerEmail] = useState('');
  const [sellerPassword,setSellerPassword] = useState('');
  const [sellerPhone,setSellerPhone] = useState('');
  const [sellerDetails,setSellerDetails] = useState('');

  const [sellerProducts,setSellerProducts] = useState([]);
  const [sellerApplications,setSellerApplications] = useState([]);
  const [pendingSellerProducts,setPendingSellerProducts] = useState([]);

  const [sellerProductTitle,setSellerProductTitle] = useState('');
  const [sellerProductImage,setSellerProductImage] = useState(null);
  const [sellerProductDetails,setSellerProductDetails] = useState('');
  const [sellerProductPrice,setSellerProductPrice] = useState('');
  const [sellerProductCategory,setSellerProductCategory] = useState('Foods');
  const [editingSellerProduct,setEditingSellerProduct] = useState(null);

  const [sellerMessages,setSellerMessages] = useState([]);
  const [sellerMessageText,setSellerMessageText] = useState('');
  const [sellerPayments,setSellerPayments] = useState([]);
  const [sellerWithdrawals,setSellerWithdrawals] = useState([]);
  const [withdrawAmount,setWithdrawAmount] = useState('');
  const [withdrawNumber,setWithdrawNumber] = useState('');

  const [adminSellerMessages,setAdminSellerMessages] = useState([]);
  const [selectedSeller,setSelectedSeller] = useState('');
  const [adminSellerReply,setAdminSellerReply] = useState('');
  const [paymentSellerId,setPaymentSellerId] = useState('');
  const [paymentAmount,setPaymentAmount] = useState('');
  const [paymentDescription,setPaymentDescription] = useState('');

  const [profileName,setProfileName] = useState('');
  const [profilePhone,setProfilePhone] = useState('');

  function notify(t) {
    setMessage(t);
    window.setTimeout(()=>setMessage(''),4000);
  }

  async function copyBkashNumber() {
    try {
      await navigator.clipboard.writeText(BKASH);
      notify('বিকাশ নম্বর কপি হয়েছে।');
    } catch {
      notify('কপি করা যায়নি। নম্বরটি হাতে কপি করুন।');
    }
  }

  async function checkAdmin(id) {
    if (!db || !id) {
      setIsAdmin(false);
      return false;
    }
    const {data,error} = await db.from('admin_users')
      .select('user_id').eq('user_id',id).maybeSingle();
    const ok = !error && !!data;
    setIsAdmin(ok);
    return ok;
  }

  async function loadSellerAccess(id) {
    if (!db || !id) {
      setIsSeller(false);
      setSellerApplication(null);
      setSellerProfile(null);
      setSellerId('');
      return null;
    }

    const [appResult,profileResult] = await Promise.all([
      db.from('seller_applications').select('*').eq('user_id',id)
        .order('created_at',{ascending:false}).limit(1),
      db.from('seller_profiles').select('*').eq('user_id',id).maybeSingle()
    ]);

    const app = appResult.data?.[0] || null;
    const profile = profileResult.data || null;

    setSellerApplication(app);
    setSellerProfile(profile);
    setSellerId(profile?.seller_id || '');
    setIsSeller(profile?.status === 'approved');

    return app;
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
      setSellerProfile(null);
    }
    return current;
  }

  useEffect(()=>{
    if (!db) {
      notify('Supabase সংযোগ পাওয়া যায়নি।');
      return;
    }

    let active = true;

    async function start() {
      const {data} = await db.auth.getSession();
      if (!data?.session && window.location.pathname!=='/admin-login') {
        const {error} = await db.auth.signInAnonymously();
        if (error) notify('কাস্টমার সেশন তৈরি হয়নি: '+error.message);
      }
      if (active) await checkUser();
    }

    start();

    const {data:listener} = db.auth.onAuthStateChange((_event,session)=>{
      const current = session?.user || null;
      setUser(current);
      if (!current) {
        setIsAdmin(false);
        setIsSeller(false);
        setSellerApplication(null);
        setSellerProfile(null);
      } else {
        setTimeout(()=>{
          if (active) {
            checkAdmin(current.id);
            loadSellerAccess(current.id);
          }
        },0);
      }
    });

    return ()=>{
      active=false;
      listener.subscription.unsubscribe();
    };
  },[]);

  async function signIn() {
    if (!db) return notify('Supabase সংযোগ নেই।');
    if (window.location.pathname!=='/admin-login') {
      return notify('অ্যাডমিন লগইন অনুমোদিত ঠিকানা থেকে করতে হবে।');
    }
    if (!email.trim() || !password) return notify('ইমেইল ও পাসওয়ার্ড লিখুন।');

    const {data,error} = await db.auth.signInWithPassword({email:email.trim(),password});
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
    if (!sellerName.trim() || !sellerShop.trim() || !sellerEmail.trim() ||
        !sellerPassword || !sellerPhone.trim()) {
      return notify('সব প্রয়োজনীয় তথ্য পূরণ করুন।');
    }
    if (sellerPassword.length<6) return notify('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের দিন।');

    const {data,error} = await db.auth.signUp({
      email:sellerEmail.trim(),password:sellerPassword
    });
    if (error) return notify(error.message);

    if (!data.user) return notify('নিবন্ধন সম্পন্ন হয়নি। আবার চেষ্টা করুন।');
    if (!data.session) return notify('ইমেইল যাচাই করুন। এরপর Seller Login করুন।');

    const {error:appError} = await db.from('seller_applications').insert({
      user_id:data.user.id,
      shop_name:sellerShop.trim(),
      contact_name:sellerName.trim(),
      phone:sellerPhone.trim(),
      description:sellerDetails.trim(),
      status:'pending'
    });

    if (appError) return notify('আবেদন জমা হয়নি: '+appError.message);

    await loadSellerAccess(data.user.id);
    setPage('seller-pending');
    notify('Seller আবেদন জমা হয়েছে।');
  }

  async function sellerLogin() {
    if (!db) return notify('Supabase সংযোগ নেই।');
    if (!sellerEmail.trim() || !sellerPassword) return notify('Gmail ও Password দিন।');

    const {data,error} = await db.auth.signInWithPassword({
      email:sellerEmail.trim(),password:sellerPassword
    });
    if (error) return notify(error.message);

    const admin = await checkAdmin(data.user.id);
    if (admin) {
      await db.auth.signOut();
      return notify('এটি অ্যাডমিন অ্যাকাউন্ট।');
    }

    const application = await loadSellerAccess(data.user.id);
    if (!application) {
      await db.auth.signOut();
      return notify('এই Gmail দিয়ে Seller আবেদন পাওয়া যায়নি।');
    }

    const {data:profile} = await db.from('seller_profiles')
      .select('*').eq('user_id',data.user.id).maybeSingle();

    if (profile?.status!=='approved') {
      setPage('seller-pending');
      return notify(application.status==='rejected'
        ? 'আপনার আবেদন গ্রহণ করা হয়নি।'
        : 'আপনার আবেদন এখনো অনুমোদিত হয়নি।');
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
    setSellerProfile(null);
    setSellerId('');
    setPage('home');

    const {error} = await db.auth.signInAnonymously();
    if (error) notify('কাস্টমার সেশন তৈরি হয়নি।');
    else notify('লগআউট হয়েছে।');
  }

  async function uploadImage(file,ownerId='admin') {
    if (!file) return null;
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
      db.from('seller_products').select('*').eq('status','approved')
        .order('created_at',{ascending:false})
    ]);

    if (adminResult.error) {
      notify('পণ্য লোড হয়নি: '+adminResult.error.message);
      return;
    }

    let adminProducts = adminResult.data || [];

    if (!adminProducts.length && isAdmin) {
      const seed = defaultProducts.map(p=>({
        title:p.title,category:p.category,image_url:p.image,options:p.options
      }));
      const {data,error} = await db.from('products').insert(seed).select('*');
      if (!error && data) adminProducts=data;
    }

    const normalAdmin = adminProducts.map(p=>({
      ...p,id:p.id,title:p.title,category:p.category,
      image:p.image_url || p.image,options:p.options || []
    }));

    const normalSeller = (sellerResult.data || []).map(p=>({
      ...p,id:`seller-${p.id}`,seller_product_id:p.id,
      title:p.title,category:p.category,image:p.image_url,
      options:[{size:'একক',price:Number(p.price)}]
    }));

    setProducts([...normalAdmin,...normalSeller]);
  }

  useEffect(()=>{loadProducts();},[isAdmin]);

  function parseOptions() {
    return productOptions.split(',').map(part=>{
      const [size,price]=part.split(':');
      return {size:size?.trim(),price:Number(price?.trim())};
    }).filter(x=>x.size && Number.isFinite(x.price) && x.price>0);
  }

  async function saveProduct() {
    if (!db || !isAdmin) return notify('অ্যাডমিন অনুমতি প্রয়োজন।');
    if (!productTitle.trim()) return notify('পণ্যের নাম লিখুন।');
    const options=parseOptions();
    if (!options.length) return notify('ওজন ও দাম সঠিকভাবে লিখুন।');

    try {
      let imageUrl=editingProduct?.image_url || editingProduct?.image || null;
      if (productImage) imageUrl=await uploadImage(productImage);

      const values={
        title:productTitle.trim(),category:productCategory,
        image_url:imageUrl,options
      };

      const result=editingProduct
        ? await db.from('products').update(values).eq('id',editingProduct.id)
        : await db.from('products').insert(values);

      if (result.error) return notify(result.error.message);
      resetProductForm();
      await loadProducts();
      setPage('admin');
      notify('পণ্য সংরক্ষণ হয়েছে।');
    } catch(e) {
      notify('পণ্য সংরক্ষণ হয়নি: '+e.message);
    }
  }

  function resetProductForm() {
    setProductTitle('');
    setProductCategory('Foods');
    setProductImage(null);
    setProductOptions('৫০০ গ্রাম:280, ১ কেজি:550');
    setEditingProduct(null);
  }

  function startEditProduct(p) {
    if (String(p.id).startsWith('base-') || String(p.id).startsWith('seller-')) {
      return notify('এই পণ্যটি এডিট করা যাবে না।');
    }
    setEditingProduct(p);
    setProductTitle(p.title);
    setProductCategory(p.category);
    setProductOptions((p.options||[]).map(x=>`${x.size}:${x.price}`).join(', '));
    setProductImage(null);
    setPage('add-product');
  }

  async function deleteProduct(p) {
    if (!db || !isAdmin) return;
    if (String(p.id).startsWith('base-') || String(p.id).startsWith('seller-')) {
      return notify('এই পণ্যটি ডিলিট করা যাবে না।');
    }
    if (!confirm('পণ্যটি মুছে ফেলবেন?')) return;
    const {error}=await db.from('products').delete().eq('id',p.id);
    if (error) return notify(error.message);
    await loadProducts();
    notify('পণ্য মুছে ফেলা হয়েছে।');
  }

  async function loadMySellerProducts() {
    if (!db || !user || !isSeller) return;
    const {data,error}=await db.from('seller_products').select('*')
      .eq('seller_user_id',user.id).order('created_at',{ascending:false});
    if (error) return notify(error.message);
    setSellerProducts(data||[]);
  }

  async function saveSellerProduct() {
    if (!db || !user || !isSeller) return notify('অনুমোদিত Seller Login প্রয়োজন।');
    if (!sellerProductTitle.trim() || !sellerProductDetails.trim() ||
        !sellerProductPrice || Number(sellerProductPrice)<=0) {
      return notify('পণ্যের নাম, বিবরণ ও সঠিক দাম দিন।');
    }

    try {
      let imageUrl=editingSellerProduct?.image_url || null;
      if (sellerProductImage) imageUrl=await uploadImage(sellerProductImage,user.id);

      const values={
        seller_user_id:user.id,title:sellerProductTitle.trim(),
        image_url:imageUrl,details:sellerProductDetails.trim(),
        price:Number(sellerProductPrice),category:sellerProductCategory
      };

      const result=editingSellerProduct
        ? await db.from('seller_products').update({...values,status:'pending'})
            .eq('id',editingSellerProduct.id).eq('seller_user_id',user.id)
        : await db.from('seller_products').insert({...values,status:'pending'});

      if (result.error) return notify(result.error.message);
      resetSellerProductForm();
      await loadMySellerProducts();
      await loadProducts();
      setPage('seller-dashboard');
      notify('পণ্য জমা হয়েছে। Admin অনুমোদনের পর দোকানে দেখা যাবে।');
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
    setSellerProductDetails(p.details||'');
    setSellerProductPrice(String(p.price));
    setSellerProductCategory(p.category);
    setSellerProductImage(null);
    setPage('seller-add-product');
  }

  async function deleteMySellerProduct(p) {
    if (!db || !user || !isSeller) return;
    if (!confirm('নিজের পণ্যটি মুছে ফেলবেন?')) return;
    const {error}=await db.from('seller_products').delete()
      .eq('id',p.id).eq('seller_user_id',user.id);
    if (error) return notify(error.message);
    await loadMySellerProducts();
    await loadProducts();
    notify('পণ্য মুছে ফেলা হয়েছে।');
  }

  async function loadSellerApplications() {
    if (!db || !isAdmin) return;
    const {data,error}=await db.from('seller_applications').select('*')
      .order('created_at',{ascending:false});
    if (error) return notify(error.message);
    setSellerApplications(data||[]);
  }

  async function reviewApplication(id,decision) {
    if (!db || !isAdmin) return;

    const application=sellerApplications.find(x=>String(x.id)===String(id));
    if (!application) return notify('আবেদন পাওয়া যায়নি।');

    const {error}=await db.from('seller_applications').update({
      status:decision,
      reviewed_by:user.id,
      reviewed_at:new Date().toISOString()
    }).eq('id',id);

    if (error) return notify('আবেদনের সিদ্ধান্ত হয়নি: '+error.message);

    if (decision==='approved') {
      const {error:profileError}=await db.from('seller_profiles').upsert({
        user_id:application.user_id,
        full_name:application.contact_name,
        email:application.email || null,
        phone:application.phone,
        status:'approved'
      },{onConflict:'user_id'});

      if (profileError) {
        return notify('আবেদন অনুমোদিত হয়েছে, কিন্তু Seller Profile তৈরি হয়নি: '+profileError.message);
      }
    } else {
      await db.from('seller_profiles').update({status:'rejected'})
        .eq('user_id',application.user_id);
    }

    await loadSellerApplications();
    notify(decision==='approved'?'বিক্রেতা অনুমোদিত হয়েছে।':'আবেদন বাতিল হয়েছে।');
  }

  async function loadPendingSellerProducts() {
    if (!db || !isAdmin) return;
    const {data,error}=await db.from('seller_products').select('*')
      .eq('status','pending').order('created_at',{ascending:false});
    if (error) return notify(error.message);
    setPendingSellerProducts(data||[]);
  }

  async function reviewSellerProduct(id,decision) {
    if (!db || !isAdmin) return;
    const {error}=await db.from('seller_products').update({
      status:decision,reviewed_at:new Date().toISOString()
    }).eq('id',id);
    if (error) return notify(error.message);
    await loadPendingSellerProducts();
    await loadProducts();
    notify('পণ্যের সিদ্ধান্ত সংরক্ষণ হয়েছে।');
  }

  async function loadSellerInbox() {
    if (!db || !user || !isSeller) return;
    const {data,error}=await db.from('seller_messages').select('*')
      .eq('seller_user_id',user.id).order('created_at',{ascending:true});
    if (error) return notify(error.message);
    setSellerMessages(data||[]);
  }

  async function sendSellerMessage() {
    if (!db || !user || !sellerMessageText.trim()) return;
    const {error}=await db.from('seller_messages').insert({
      seller_user_id:user.id,sender_role:'seller',
      message:sellerMessageText.trim()
    });
    if (error) return notify(error.message);
    setSellerMessageText('');
    await loadSellerInbox();
  }

  async function loadAdminSellerInbox() {
    if (!db || !isAdmin) return;
    const {data,error}=await db.from('seller_messages').select('*')
      .order('created_at',{ascending:false});
    if (error) return notify(error.message);
    setAdminSellerMessages(data||[]);
    if (!selectedSeller && data?.length) setSelectedSeller(data[0].seller_user_id);
  }

  async function sendAdminSellerReply() {
    if (!db || !isAdmin || !selectedSeller || !adminSellerReply.trim()) return;
    const {error}=await db.from('seller_messages').insert({
      seller_user_id:selectedSeller,
      sender_role:'admin',
      message:adminSellerReply.trim()
    });
    if (error) return notify(error.message);
    setAdminSellerReply('');
    await loadAdminSellerInbox();
  }

  async function loadSellerMoney() {
    if (!db || !user || !isSeller) return;

    const [paymentResult,withdrawResult] = await Promise.all([
      db.from('seller_payments').select('*').eq('seller_user_id',user.id)
        .order('created_at',{ascending:false}),
      db.from('seller_withdrawals').select('*').eq('seller_user_id',user.id)
        .order('created_at',{ascending:false})
    ]);

    if (paymentResult.error) notify(paymentResult.error.message);
    else setSellerPayments(paymentResult.data||[]);

    if (withdrawResult.error) notify(withdrawResult.error.message);
    else setSellerWithdrawals(withdrawResult.data||[]);
  }

  async function requestWithdraw() {
    if (!db || !user || !isSeller) return;
    const amount=Number(withdrawAmount);
    if (!amount || amount<=0 || !withdrawNumber.trim()) {
      return notify('সঠিক টাকা ও পেমেন্ট নম্বর দিন।');
    }

    const {error}=await db.from('seller_withdrawals').insert({
      seller_user_id:user.id,
      amount,
      payment_number:withdrawNumber.trim(),
      status:'pending'
    });

    if (error) return notify(error.message);
    setWithdrawAmount('');
    setWithdrawNumber('');
    await loadSellerMoney();
    notify('টাকা তোলার আবেদন জমা হয়েছে।');
  }

  async function updateWithdrawal(id,status) {
    if (!db || !isAdmin) return;
    const {error}=await db.from('seller_withdrawals').update({status}).eq('id',id);
    if (error) return notify(error.message);
    await loadAdminWithdrawals();
    notify('Withdrawal আপডেট হয়েছে।');
  }

  async function loadAdminWithdrawals() {
    if (!db || !isAdmin) return;
    const {data,error}=await db.from('seller_withdrawals').select('*')
      .order('created_at',{ascending:false});
    if (error) return notify(error.message);
    setSellerWithdrawals(data||[]);
  }

  async function addSellerPayment() {
    if (!db || !isAdmin) return;
    if (!paymentSellerId || !Number(paymentAmount) || Number(paymentAmount)<=0) {
      return notify('Seller ID এবং সঠিক টাকা দিন।');
    }
    const {error}=await db.from('seller_payments').insert({
      seller_user_id:paymentSellerId,
      amount:Number(paymentAmount),
      description:paymentDescription.trim() || 'Admin payment'
    });
    if (error) return notify(error.message);
    setPaymentAmount('');
    setPaymentDescription('');
    notify('Seller পেমেন্ট রেকর্ড হয়েছে।');
  }

  async function updateSellerProfile() {
    if (!db || !user || !isSeller) return;
    const {error}=await db.from('seller_profiles').update({
      full_name:profileName.trim(),phone:profilePhone.trim()
    }).eq('user_id',user.id);
    if (error) return notify(error.message);
    await loadSellerAccess(user.id);
    notify('প্রোফাইল আপডেট হয়েছে।');
  }

  async function addToCart(product,option) {
    const cartId=`${product.id}-${option.size}`;
    setCart(old=>{
      const found=old.find(x=>x.cartId===cartId);
      if (found) return old.map(x=>x.cartId===cartId
        ? {...x,quantity:x.quantity+1}:x);
      return [...old,{
        cartId,id:product.id,title:product.title,
        category:product.category,size:option.size,
        price:option.price,quantity:1
      }];
    });
    notify('কার্টে যোগ হয়েছে।');
  }

  function changeQuantity(id,amount) {
    setCart(old=>old.map(x=>x.cartId===id
      ? {...x,quantity:x.quantity+amount}:x).filter(x=>x.quantity>0));
  }

  const total=cart.reduce((sum,x)=>sum+x.price*x.quantity,0);
  const visibleProducts=products.filter(p=>p.category===category);

  async function placeOrder() {
    if (!db || !user) return notify('লগইন তৈরি হয়নি।');
    if (!cart.length) return notify('কার্ট খালি।');
    if (!customerName.trim() || !customerPhone.trim() || !address.trim() ||
        (paymentMethod==='bkash' && !transactionId.trim())) {
      return notify('প্রয়োজনীয় সব তথ্য পূরণ করুন।');
    }

    const items=cart.map(x=>({
      title:x.title,category:x.category,size:x.size,
      price:x.price,quantity:x.quantity
    }));

    const {error}=await db.from('market_orders').insert({
      user_id:user.id,customer_name:customerName.trim(),
      phone:customerPhone.trim(),address:address.trim(),items,total,
      status:'pending',
      payment_method:paymentMethod==='bkash'?'bKash Personal':'Cash on Delivery',
      payment_number:paymentMethod==='bkash'?BKASH:null,
      transaction_id:paymentMethod==='bkash'?transactionId.trim():null,
      payment_status:paymentMethod==='bkash'?'pending_verification':'cash_on_delivery',
      location_lat:locationLat,location_lng:locationLng
    });

    if (error) return notify('অর্ডার জমা হয়নি: '+error.message);

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
    const {data,error}=await db.from('market_orders').select('*')
      .order('id',{ascending:false});
    if (error) return notify(error.message);
    setOrders(data||[]);
  }

  async function loadMyOrders() {
    if (!db || !user || user.is_anonymous) return;
    const {data,error}=await db.from('market_orders').select('*')
      .eq('user_id',user.id).order('id',{ascending:false});
    if (error) return notify(error.message);
    setMyOrders(data||[]);
  }

  async function updateOrder(id,values) {
    if (!db || !isAdmin) return;
    const {error}=await db.from('market_orders').update(values).eq('id',id);
    if (error) return notify(error.message);
    await loadOrders();
    notify('অর্ডার পরিবর্তন হয়েছে।');
  }

  async function loadCustomerChat() {
    if (!db || !user) return;
    const {data,error}=await db.from('chat_messages').select('*')
      .eq('user_id',user.id).order('created_at',{ascending:true});
    if (error) return notify(error.message);
    setChatMessages(data||[]);
  }

  async function sendCustomerMessage() {
    if (!db || !user || !chatText.trim()) return;
    const {error}=await db.from('chat_messages').insert({
      user_id:user.id,sender:'customer',message:chatText.trim()
    });
    if (error) return notify(error.message);
    setChatText('');
    await loadCustomerChat();
  }

  async function loadChatCustomers() {
    if (!db || !isAdmin) return;
    const {data,error}=await db.from('chat_messages').select('user_id,created_at')
      .order('created_at',{ascending:false});
    if (error) return notify(error.message);
    const unique=[];
    (data||[]).forEach(row=>{
      if (!unique.some(x=>x.user_id===row.user_id)) unique.push(row);
    });
    setChatCustomers(unique);
    if (!selectedCustomer && unique.length) setSelectedCustomer(unique[0].user_id);
  }

  async function loadAdminChat(id) {
    if (!db || !isAdmin || !id) return;
    const {data,error}=await db.from('chat_messages').select('*')
      .eq('user_id',id).order('created_at',{ascending:true});
    if (error) return notify(error.message);
    setChatMessages(data||[]);
  }

  async function sendAdminMessage() {
    if (!db || !isAdmin || !selectedCustomer || !chatText.trim()) return;
    const {error}=await db.from('chat_messages').insert({
      user_id:selectedCustomer,sender:'admin',message:chatText.trim()
    });
    if (error) return notify(error.message);
    setChatText('');
    await loadAdminChat(selectedCustomer);
  }

  useEffect(()=>{
    if (page==='admin' && isAdmin) {
      loadOrders();
      loadChatCustomers();
      loadSellerApplications();
      loadPendingSellerProducts();
      loadAdminSellerInbox();
      loadAdminWithdrawals();

      const timer=setInterval(()=>{
        loadOrders();
        loadChatCustomers();
        loadSellerApplications();
        loadPendingSellerProducts();
        loadAdminSellerInbox();
        loadAdminWithdrawals();
      },15000);

      return ()=>clearInterval(timer);
    }
  },[page,isAdmin]);

  useEffect(()=>{if(page==='my-orders') loadMyOrders();},[page,user]);
  useEffect(()=>{if(page==='chat'&&!isAdmin) loadCustomerChat();},[page,user,isAdmin]);
  useEffect(()=>{
    if(page==='admin-chat'&&isAdmin) {
      loadChatCustomers();
      if(selectedCustomer) loadAdminChat(selectedCustomer);
    }
  },[page,isAdmin,selectedCustomer]);
  useEffect(()=>{
    if(page==='seller-dashboard'&&isSeller) loadMySellerProducts();
    if(page==='seller-inbox'&&isSeller) loadSellerInbox();
    if(['seller-income','seller-payments','seller-withdraw'].includes(page)&&isSeller) loadSellerMoney();
  },[page,isSeller]);

  useEffect(()=>{
    if(page==='seller-profile'&&sellerProfile) {
      setProfileName(sellerProfile.full_name||'');
      setProfilePhone(sellerProfile.phone||'');
    }
  },[page,sellerProfile]);

  useEffect(()=>{
    const adminPages=['admin','admin-chat','admin-seller-inbox','admin-payments','add-product'];
    if(adminPages.includes(page)&&!isAdmin) setPage('home');
    const sellerPages=[
      'seller-dashboard','seller-add-product','seller-my-products',
      'seller-inbox','seller-income','seller-payments','seller-withdraw',
      'seller-profile','seller-settings'
    ];
    if(sellerPages.includes(page)&&!isSeller) setPage('home');
  },[page,isAdmin,isSeller]);

  function orderStatus(status) {
    return ({pending:'অপেক্ষমাণ',confirmed:'নিশ্চিত',cancelled:'বাতিল'})[status]||status||'অজানা';
  }

  function deliveryInfo(order) {
    const cats=[...new Set((order.items||[]).map(x=>x.category).filter(Boolean))];
    if (!cats.length) return null;
    const start=new Date(order.created_at||Date.now());
    return <div className="delivery-info">
      <b>সম্ভাব্য ডেলিভারি সময়:</b>
      {cats.map(c=><p key={c}>{c}: {new Date(start.getTime()+(c==='Foods'?6:96)*3600000).toLocaleString('bn-BD')}</p>)}
      <small>এটি আনুমানিক সময়।</small>
    </div>;
  }

  const whatsappLink=`https://wa.me/88${WHATSAPP}?text=${encodeURIComponent('BD BUSINESS-এ স্বাগতম। পণ্য সম্পর্কে জানতে চাই।')}`;return (
    <main className="app">
      <header className="header">
        <h1>BD BUSINESS</h1>
        <button onClick={()=>setMenuOpen(!menuOpen)}>☰ মেনু</button>
      </header>

      {message && <div className="notice">{message}</div>}

      {menuOpen && (
        <nav className="menu">
          <button onClick={()=>{setPage('home');setMenuOpen(false);}}>হোম</button>
          <button onClick={()=>{setPage('my-orders');setMenuOpen(false);}}>আমার অর্ডার</button>
          <button onClick={()=>{setPage('chat');setMenuOpen(false);}}>কাস্টমার ইনবক্স</button>
          <button onClick={()=>{setPage('seller-register');setMenuOpen(false);}}>Seller Registration</button>
          <button onClick={()=>{setPage('seller-login');setMenuOpen(false);}}>Seller Login</button>
          <button onClick={()=>{setPage('login');setMenuOpen(false);}}>Admin Login</button>
          <button onClick={()=>{setPage('cart');setMenuOpen(false);}}>
            কার্ট ({cart.reduce((s,x)=>s+x.quantity,0)})
          </button>
        </nav>
      )}

      {page==='home' && (
        <section>
          <h2>আমাদের অনলাইন দোকানে স্বাগতম</h2>
          <p>আপনার পছন্দের পণ্য বেছে নিন।</p>

          <div className="categories">
            {categories.map(c=>(
              <button key={c} onClick={()=>setCategory(c)}
                className={category===c?'active':''}>
                {c}
              </button>
            ))}
          </div>

          <div className="product-grid">
            {visibleProducts.map(p=>(
              <article className="card" key={p.id}>
                {p.image && <img src={p.image} alt={p.title}/>}
                <h3>{p.title}</h3>
                <p>{p.category}</p>
                {(p.options||[]).map((o,i)=>(
                  <button key={i} onClick={()=>addToCart(p,o)}>
                    {o.size} — ৳{o.price} | কার্টে যোগ
                  </button>
                ))}
              </article>
            ))}
          </div>

          <button onClick={()=>setPage('cart')}>
            🛒 কার্ট দেখুন ({cart.reduce((s,x)=>s+x.quantity,0)})
          </button>
        </section>
      )}

      {page==='cart' && (
        <section className="card">
          <h2>আমার কার্ট</h2>
          {!cart.length && <p>আপনার কার্ট খালি।</p>}

          {cart.map(x=>(
            <div className="cart-row" key={x.cartId}>
              <b>{x.title}</b>
              <p>{x.size} — ৳{x.price}</p>
              <button onClick={()=>changeQuantity(x.cartId,-1)}>−</button>
              <span>{x.quantity}</span>
              <button onClick={()=>changeQuantity(x.cartId,1)}>+</button>
              <p>মোট: ৳{x.price*x.quantity}</p>
            </div>
          ))}

          <h3>সর্বমোট: ৳{total}</h3>
          {cart.length>0 && (
            <button onClick={()=>setPage('checkout')}>অর্ডার করতে এগিয়ে যান</button>
          )}
          <button onClick={()=>setPage('home')}>কেনাকাটা চালিয়ে যান</button>
        </section>
      )}

      {page==='checkout' && (
        <section className="card">
          <h2>অর্ডার সম্পন্ন করুন</h2>

          <label>আপনার নাম</label>
          <input value={customerName} onChange={e=>setCustomerName(e.target.value)}
            placeholder="নাম লিখুন"/>

          <label>মোবাইল নম্বর</label>
          <input value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)}
            placeholder="মোবাইল নম্বর লিখুন"/>

          <label>সম্পূর্ণ ঠিকানা</label>
          <textarea value={address} onChange={e=>setAddress(e.target.value)}
            placeholder="আপনার ঠিকানা লিখুন"/>

          <h3>ডেলিভারি লোকেশন</h3>
          <MapPicker onSelect={v=>{
            setLocationLat(v.lat);
            setLocationLng(v.lng);
          }}/>

          <p>
            {locationLat!==null
              ? `লোকেশন নির্বাচন হয়েছে: ${locationLat}, ${locationLng}`
              : 'লোকেশন নির্বাচন করা হয়নি।'}
          </p>

          <h3>পেমেন্ট পদ্ধতি</h3>
          <label>
            <input type="radio" checked={paymentMethod==='bkash'}
              onChange={()=>setPaymentMethod('bkash')}/>
            বিকাশ
          </label>

          <label>
            <input type="radio" checked={paymentMethod==='cod'}
              onChange={()=>setPaymentMethod('cod')}/>
            ক্যাশ অন ডেলিভারি
          </label>

          {paymentMethod==='bkash' && (
            <div className="card">
              <h3>বিকাশ পেমেন্ট</h3>
              <p>বিকাশ পার্সোনাল নম্বর:</p>
              <h2>{BKASH}</h2>
              <button onClick={copyBkashNumber}>নম্বর কপি করুন</button>
              <p>পেমেন্ট করার পর Transaction ID লিখুন।</p>
              <input value={transactionId}
                onChange={e=>setTransactionId(e.target.value)}
                placeholder="Transaction ID"/>
            </div>
          )}

          <h3>সর্বমোট: ৳{total}</h3>
          <button onClick={placeOrder}>অর্ডার নিশ্চিত করুন</button>
          <button onClick={()=>setPage('cart')}>কার্টে ফিরে যান</button>
        </section>
      )}

      {page==='my-orders' && (
        <section>
          <h2>আমার অর্ডার</h2>
          {!user || user.is_anonymous
            ? <p>অর্ডারের ইতিহাস দেখতে Seller বা Customer অ্যাকাউন্ট প্রয়োজন।</p>
            : myOrders.length===0
              ? <p>এখনো কোনো অর্ডার পাওয়া যায়নি।</p>
              : myOrders.map(o=>(
                <article className="card" key={o.id}>
                  <h3>অর্ডার নম্বর: {o.id}</h3>
                  <p>নাম: {o.customer_name}</p>
                  <p>মোবাইল: {o.phone}</p>
                  <p>ঠিকানা: {o.address}</p>
                  <p>মোট: ৳{o.total}</p>
                  <p>অবস্থা: {orderStatus(o.status)}</p>
                  {deliveryInfo(o)}
                  <button onClick={()=>setPage('chat')}>অ্যাডমিনকে মেসেজ দিন</button>
                </article>
              ))
          }
          <button onClick={()=>setPage('home')}>হোমে ফিরুন</button>
        </section>
      )}

      {page==='chat' && (
        <section className="card">
          <h2>কাস্টমার ইনবক্স</h2>
          <div className="chat-box">
            {chatMessages.map(m=>(
              <p key={m.id}>
                <b>{m.sender==='admin'?'Admin':'আপনি'}:</b> {m.message}
              </p>
            ))}
          </div>
          <textarea value={chatText} onChange={e=>setChatText(e.target.value)}
            placeholder="আপনার মেসেজ লিখুন"/>
          <button onClick={sendCustomerMessage}>মেসেজ পাঠান</button>
          <button onClick={loadCustomerChat}>রিফ্রেশ</button>
        </section>
      )}

      {page==='login' && (
        <section className="card">
          <h2>Admin Login</h2>
          <input type="email" value={email}
            onChange={e=>setEmail(e.target.value)} placeholder="Admin Email"/>
          <input type="password" value={password}
            onChange={e=>setPassword(e.target.value)} placeholder="Password"/>
          <button onClick={signIn}>লগইন</button>
          <button onClick={()=>setPage('home')}>ফিরে যান</button>
        </section>
      )}

      {page==='admin' && isAdmin && (
        <section>
          <h2>Admin Panel</h2>

          <div className="admin-menu">
            <button onClick={()=>setPage('admin')}>Home Dashboard</button>
            <button onClick={loadOrders}>Order Management</button>
            <button onClick={()=>setPage('add-product')}>Product Management</button>
            <button onClick={loadSellerApplications}>Seller Management</button>
            <button onClick={()=>setPage('admin-seller-inbox')}>Seller Inbox</button>
            <button onClick={()=>setPage('admin-chat')}>Customer Inbox</button>
            <button onClick={()=>setPage('admin-payments')}>Payment Management</button>
            <button onClick={signOut}>Logout</button>
          </div>

          <div className="card">
            <h3>Dashboard</h3>
            <p>মোট অর্ডার: {orders.length}</p>
            <p>মোট পণ্য: {products.length}</p>
            <p>Seller আবেদন: {sellerApplications.length}</p>
            <button onClick={loadOrders}>অর্ডার রিফ্রেশ</button>
          </div>

          <h3>অর্ডার ম্যানেজমেন্ট</h3>
          {orders.map(o=>(
            <article className="card" key={o.id}>
              <h3>অর্ডার #{o.id}</h3>
              <p>কাস্টমার: {o.customer_name}</p>
              <p>মোবাইল: {o.phone}</p>
              <p>ঠিকানা: {o.address}</p>
              <p>মোট: ৳{o.total}</p>
              <p>পেমেন্ট: {o.payment_method}</p>
              <p>Transaction ID: {o.transaction_id||'নেই'}</p>
              <p>অর্ডার অবস্থা: {orderStatus(o.status)}</p>
              {deliveryInfo(o)}
              <button onClick={()=>updateOrder(o.id,{status:'confirmed'})}>
                অর্ডার নিশ্চিত
              </button>
              <button onClick={()=>updateOrder(o.id,{status:'cancelled'})}>
                অর্ডার বাতিল
              </button>
              <button onClick={()=>updateOrder(o.id,{payment_status:'verified'})}>
                পেমেন্ট যাচাই
              </button>
            </article>
          ))}

          <h3>পণ্য ম্যানেজমেন্ট</h3>
          {products.map(p=>(
            <article className="card" key={p.id}>
              <b>{p.title}</b>
              <p>{p.category}</p>
              <button onClick={()=>startEditProduct(p)}>এডিট</button>
              <button onClick={()=>deleteProduct(p)}>ডিলিট</button>
            </article>
          ))}

          <h3>Seller আবেদন</h3>
          {sellerApplications.map(a=>(
            <article className="card" key={a.id}>
              <b>{a.shop_name}</b>
              <p>নাম: {a.contact_name}</p>
              <p>ফোন: {a.phone}</p>
              <p>বিবরণ: {a.description}</p>
              <p>অবস্থা: {a.status}</p>
              {a.status==='pending' && (
                <>
                  <button onClick={()=>reviewApplication(a.id,'approved')}>
                    অনুমোদন
                  </button>
                  <button onClick={()=>reviewApplication(a.id,'rejected')}>
                    বাতিল
                  </button>
                </>
              )}
            </article>
          ))}

          <h3>Seller পণ্যের অনুমোদন</h3>
          {pendingSellerProducts.map(p=>(
            <article className="card" key={p.id}>
              <b>{p.title}</b>
              <p>দাম: ৳{p.price}</p>
              <p>{p.details}</p>
              <button onClick={()=>reviewSellerProduct(p.id,'approved')}>
                অনুমোদন
              </button>
              <button onClick={()=>reviewSellerProduct(p.id,'rejected')}>
                বাতিল
              </button>
            </article>
          ))}

          <h3>টাকা তোলার আবেদন</h3>
          {sellerWithdrawals.map(w=>(
            <article className="card" key={w.id}>
              <p>Seller ID: {w.seller_user_id}</p>
              <p>টাকা: ৳{w.amount}</p>
              <p>নম্বর: {w.payment_number}</p>
              <p>অবস্থা: {w.status}</p>
              {w.status==='pending' && (
                <>
                  <button onClick={()=>updateWithdrawal(w.id,'approved')}>
                    অনুমোদন
                  </button>
                  <button onClick={()=>updateWithdrawal(w.id,'rejected')}>
                    বাতিল
                  </button>
                </>
              )}
            </article>
          ))}
        </section>
      )}

      {page==='add-product' && isAdmin && (
        <section className="card">
          <h2>{editingProduct?'পণ্য এডিট':'নতুন পণ্য যোগ করুন'}</h2>
          <input value={productTitle}
            onChange={e=>setProductTitle(e.target.value)}
            placeholder="পণ্যের নাম"/>
          <select value={productCategory}
            onChange={e=>setProductCategory(e.target.value)}>
            {categories.map(c=><option key={c}>{c}</option>)}
          </select>
          <label>পণ্যের ছবি</label>
          <input type="file" accept="image/*"
            onChange={e=>setProductImage(e.target.files?.[0]||null)}/>
          <p>ওজন:দাম লিখুন। যেমন: ৫০০ গ্রাম:280, ১ কেজি:550</p>
          <textarea value={productOptions}
            onChange={e=>setProductOptions(e.target.value)}/>
          <button onClick={saveProduct}>পণ্য সংরক্ষণ</button>
          <button onClick={()=>{resetProductForm();setPage('admin');}}>
            ফিরে যান
          </button>
        </section>
      )}

      {page==='admin-chat' && isAdmin && (
        <section className="card">
          <h2>Customer Inbox</h2>
          <button onClick={loadChatCustomers}>কাস্টমার তালিকা রিফ্রেশ</button>
          <select value={selectedCustomer}
            onChange={e=>setSelectedCustomer(e.target.value)}>
            <option value="">কাস্টমার নির্বাচন করুন</option>
            {chatCustomers.map(c=>(
              <option key={c.user_id} value={c.user_id}>
                {c.user_id}
              </option>
            ))}
          </select>
          <button onClick={()=>loadAdminChat(selectedCustomer)}>মেসেজ দেখুন</button>
          <div className="chat-box">
            {chatMessages.map(m=>(
              <p key={m.id}>
                <b>{m.sender==='admin'?'Admin':'Customer'}:</b> {m.message}
              </p>
            ))}
          </div>
          <textarea value={chatText} onChange={e=>setChatText(e.target.value)}
            placeholder="Reply লিখুন"/>
          <button onClick={sendAdminMessage}>Reply পাঠান</button>
        </section>
      )}

      {page==='admin-seller-inbox' && isAdmin && (
        <section className="card">
          <h2>Seller Inbox</h2>
          <button onClick={loadAdminSellerInbox}>রিফ্রেশ</button>
          <select value={selectedSeller}
            onChange={e=>setSelectedSeller(e.target.value)}>
            <option value="">Seller নির্বাচন করুন</option>
            {[...new Set(adminSellerMessages.map(m=>m.seller_user_id))].map(id=>(
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
          {adminSellerMessages.filter(m=>m.seller_user_id===selectedSeller)
            .map(m=>(
              <p key={m.id}>
                <b>{m.sender_role}:</b> {m.message}
              </p>
            ))}
          <textarea value={adminSellerReply}
            onChange={e=>setAdminSellerReply(e.target.value)}
            placeholder="Seller-কে Reply দিন"/>
          <button onClick={sendAdminSellerReply}>Reply পাঠান</button>
        </section>
      )}

      {page==='admin-payments' && isAdmin && (
        <section className="card">
          <h2>Seller Payment Management</h2>
          <input value={paymentSellerId}
            onChange={e=>setPaymentSellerId(e.target.value)}
            placeholder="Seller User ID"/>
          <input type="number" value={paymentAmount}
            onChange={e=>setPaymentAmount(e.target.value)}
            placeholder="টাকার পরিমাণ"/>
          <input value={paymentDescription}
            onChange={e=>setPaymentDescription(e.target.value)}
            placeholder="পেমেন্টের বিবরণ"/>
          <button onClick={addSellerPayment}>পেমেন্ট রেকর্ড করুন</button>
          <button onClick={loadAdminWithdrawals}>Withdrawal তালিকা</button>
        </section>
      )}

      {page==='seller-register' && (
        <section className="card">
          <h2>Seller Registration</h2>
          <input value={sellerName}
            onChange={e=>setSellerName(e.target.value)}
            placeholder="আপনার নাম"/>
          <input value={sellerShop}
            onChange={e=>setSellerShop(e.target.value)}
            placeholder="দোকানের নাম"/>
          <input type="email" value={sellerEmail}
            onChange={e=>setSellerEmail(e.target.value)}
            placeholder="Gmail"/>
          <input type="password" value={sellerPassword}
            onChange={e=>setSellerPassword(e.target.value)}
            placeholder="Password"/>
          <input value={sellerPhone}
            onChange={e=>setSellerPhone(e.target.value)}
            placeholder="মোবাইল নম্বর"/>
          <textarea value={sellerDetails}
            onChange={e=>setSellerDetails(e.target.value)}
            placeholder="দোকান সম্পর্কে লিখুন"/>
          <button onClick={registerSeller}>আবেদন জমা দিন</button>
          <button onClick={()=>setPage('seller-login')}>Seller Login</button>
        </section>
      )}

      {page==='seller-login' && (
        <section className="card">
          <h2>Seller Login</h2>
          <input type="email" value={sellerEmail}
            onChange={e=>setSellerEmail(e.target.value)}
            placeholder="Gmail"/>
          <input type="password" value={sellerPassword}
            onChange={e=>setSellerPassword(e.target.value)}
            placeholder="Password"/>
          <button onClick={sellerLogin}>লগইন</button>
          <button onClick={()=>setPage('seller-register')}>নতুন Seller আবেদন</button>
        </section>
      )}

      {page==='seller-pending' && (
        <section className="card">
          <h2>Seller আবেদন</h2>
          <p>আপনার আবেদনটি Admin যাচাই করছেন। অনুমোদন না হওয়া পর্যন্ত Seller Dashboard ব্যবহার করা যাবে না।</p>
          <p>আবেদনের অবস্থা: {sellerApplication?.status||'যাচাই চলছে'}</p>
          <button onClick={signOut}>Logout</button>
          <button onClick={()=>setPage('home')}>হোমে ফিরুন</button>
        </section>
      )}

      {page==='seller-dashboard' && isSeller && (
        <section>
          <h2>Seller Dashboard</h2>
          <div className="seller-menu">
            <button onClick={()=>setPage('seller-dashboard')}>Home</button>
            <button onClick={()=>setPage('seller-add-product')}>Add Product</button>
            <button onClick={()=>setPage('seller-my-products')}>My Products</button>
            <button onClick={()=>setPage('seller-inbox')}>Seller Inbox</button>
            <button onClick={()=>setPage('seller-income')}>My Income</button>
            <button onClick={()=>setPage('seller-payments')}>Payment History</button>
            <button onClick={()=>setPage('seller-withdraw')}>Withdraw Request</button>
            <button onClick={()=>setPage('seller-profile')}>Profile Edit</button>
            <button onClick={()=>setPage('seller-settings')}>Settings</button>
            <button onClick={signOut}>Logout</button>
          </div>
          <div className="card">
            <h3>আপনার Seller ID</h3>
            <h2>{sellerId||'অনুমোদনের অপেক্ষায়'}</h2>
            <p>দোকান: {sellerApplication?.shop_name||sellerProfile?.full_name}</p>
            <p>অনুমোদিত পণ্য: {sellerProducts.filter(p=>p.status==='approved').length}</p>
            <button onClick={loadMySellerProducts}>রিফ্রেশ</button>
          </div>
        </section>
      )}

      {page==='seller-add-product' && isSeller && (
        <section className="card">
          <h2>{editingSellerProduct?'পণ্য এডিট':'নতুন পণ্য যোগ করুন'}</h2>
          <input value={sellerProductTitle}
            onChange={e=>setSellerProductTitle(e.target.value)}
            placeholder="পণ্যের নাম"/>
          <textarea value={sellerProductDetails}
            onChange={e=>setSellerProductDetails(e.target.value)}
            placeholder="পণ্যের বিবরণ"/>
          <input type="number" value={sellerProductPrice}
            onChange={e=>setSellerProductPrice(e.target.value)}
            placeholder="দাম"/>
          <select value={sellerProductCategory}
            onChange={e=>setSellerProductCategory(e.target.value)}>
            {categories.map(c=><option key={c}>{c}</option>)}
          </select>
          <label>পণ্যের ছবি</label>
          <input type="file" accept="image/*"
            onChange={e=>setSellerProductImage(e.target.files?.[0]||null)}/>
          <button onClick={saveSellerProduct}>পণ্য জমা দিন</button>
          <button onClick={()=>{resetSellerProductForm();setPage('seller-dashboard');}}>
            ফিরে যান
          </button>
        </section>
      )}

      {page==='seller-my-products' && isSeller && (
        <section>
          <h2>আমার পণ্য</h2>
          <button onClick={loadMySellerProducts}>রিফ্রেশ</button>
          {sellerProducts.map(p=>(
            <article className="card" key={p.id}>
              {p.image_url && <img src={p.image_url} alt={p.title}/>}
              <h3>{p.title}</h3>
              <p>দাম: ৳{p.price}</p>
              <p>অবস্থা: {p.status}</p>
              <button onClick={()=>editMySellerProduct(p)}>এডিট</button>
              <button onClick={()=>deleteMySellerProduct(p)}>ডিলিট</button>
            </article>
          ))}
        </section>
      )}

      {page==='seller-inbox' && isSeller && (
        <section className="card">
          <h2>Seller Inbox</h2>
          <button onClick={loadSellerInbox}>রিফ্রেশ</button>
          <div className="chat-box">
            {sellerMessages.map(m=>(
              <p key={m.id}>
                <b>{m.sender_role==='admin'?'Admin':'আপনি'}:</b> {m.message}
              </p>
            ))}
          </div>
          <textarea value={sellerMessageText}
            onChange={e=>setSellerMessageText(e.target.value)}
            placeholder="Admin-কে মেসেজ লিখুন"/>
          <button onClick={sendSellerMessage}>মেসেজ পাঠান</button>
        </section>
      )}

      {page==='seller-income' && isSeller && (
        <section className="card">
          <h2>My Income</h2>
          <button onClick={loadSellerMoney}>রিফ্রেশ</button>
          <h3>মোট পেমেন্ট: ৳{sellerPayments.reduce((s,p)=>s+Number(p.amount||0),0)}</h3>
          <h3>মোট Withdrawal: ৳{sellerWithdrawals
            .filter(w=>w.status==='approved')
            .reduce((s,w)=>s+Number(w.amount||0),0)}</h3>
        </section>
      )}

      {page==='seller-payments' && isSeller && (
        <section>
          <h2>Payment History</h2>
          <button onClick={loadSellerMoney}>রিফ্রেশ</button>
          {sellerPayments.map(p=>(
            <article className="card" key={p.id}>
              <h3>৳{p.amount}</h3>
              <p>{p.description}</p>
              <p>{new Date(p.created_at).toLocaleString('bn-BD')}</p>
            </article>
          ))}
        </section>
      )}

      {page==='seller-withdraw' && isSeller && (
        <section className="card">
          <h2>Withdraw Request</h2>
          <input type="number" value={withdrawAmount}
            onChange={e=>setWithdrawAmount(e.target.value)}
            placeholder="কত টাকা তুলবেন?"/>
          <input value={withdrawNumber}
            onChange={e=>setWithdrawNumber(e.target.value)}
            placeholder="বিকাশ/পেমেন্ট নম্বর"/>
          <button onClick={requestWithdraw}>আবেদন জমা দিন</button>
          <h3>আগের আবেদন</h3>
          {sellerWithdrawals.map(w=>(
            <p key={w.id}>৳{w.amount} — {w.status}</p>
          ))}
        </section>
      )}

      {page==='seller-profile' && isSeller && (
        <section className="card">
          <h2>Profile Edit</h2>
          <p>Seller ID: {sellerId}</p>
          <input value={profileName}
            onChange={e=>setProfileName(e.target.value)}
            placeholder="আপনার নাম"/>
          <input value={profilePhone}
            onChange={e=>setProfilePhone(e.target.value)}
            placeholder="মোবাইল নম্বর"/>
          <button onClick={updateSellerProfile}>প্রোফাইল সংরক্ষণ</button>
        </section>
      )}

      {page==='seller-settings' && isSeller && (
        <section className="card">
          <h2>Seller Settings</h2>
          <p>Seller ID: {sellerId}</p>
          <p>অ্যাকাউন্টের অবস্থা: {sellerProfile?.status}</p>
          <button onClick={signOut}>Logout</button>
        </section>
      )}

      <footer className="footer">
        <h3>BD BUSINESS</h3>
        <p>যোগাযোগ: {WHATSAPP}</p>
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
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
