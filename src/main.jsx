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
  { id:'base-1', title:'মিষ্টি', category:'Foods',
    image:'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600',
    options:[{size:'৫০০ গ্রাম',price:280},{size:'১ কেজি',price:550}] },
  { id:'base-2', title:'রসমালাই', category:'Foods',
    image:'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600',
    options:[{size:'৫০০ গ্রাম',price:280},{size:'১ কেজি',price:550}] },
  { id:'base-3', title:'সন্দেশ', category:'Foods',
    image:'https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=600',
    options:[{size:'৫০০ গ্রাম',price:180},{size:'১ কেজি',price:350}] },
  { id:'base-4', title:'দেশি লাল চিনি', category:'Foods',
    image:'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=600',
    options:[{size:'৫০০ গ্রাম',price:135},{size:'১ কেজি',price:260}] },
  { id:'base-5', title:'বাদামের খাজা', category:'Foods',
    image:'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600',
    options:[{size:'২৫০ গ্রাম',price:130},{size:'৫০০ গ্রাম',price:250}] },
  { id:'base-6', title:'রেশমি সনপাপড়ি', category:'Foods',
    image:'https://images.unsplash.com/photo-1605197584325-3b1e3e9e4f6b?w=600',
    options:[{size:'২৫০ গ্রাম',price:130},{size:'৫০০ গ্রাম',price:250}] },
  { id:'base-7', title:'খাঁটি নারিকেল তেল', category:'Foods',
    image:'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600',
    options:[{size:'২৫০ গ্রাম',price:650},{size:'৫০০ গ্রাম',price:1200}] }
];

function App() {
  const [page,setPage] = useState(
    window.location.pathname === '/secret-admin' ? 'login' : 'home'
  );
  const [user,setUser] = useState(null);
  const [isAdmin,setIsAdmin] = useState(false);
  const [message,setMessage] = useState('');

  const [products,setProducts] = useState(defaultProducts);
  const [category,setCategory] = useState('Foods');
  const [search,setSearch] = useState('');
  const [searchOpen,setSearchOpen] = useState(false);
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
  const [senderBkash,setSenderBkash] = useState('');
  const [paymentMethod,setPaymentMethod] = useState('bkash');

  const [productTitle,setProductTitle] = useState('');
  const [productCategory,setProductCategory] = useState('Foods');
  const [productImage,setProductImage] = useState(null);
  const [productOptions,setProductOptions] = useState('৫০০ গ্রাম:100, ১ কেজি:200');
  const [editingProduct,setEditingProduct] = useState(null);

  const [chatText,setChatText] = useState('');
  const [chatMessages,setChatMessages] = useState([]);
  const [chatCustomers,setChatCustomers] = useState([]);
  const [selectedCustomer,setSelectedCustomer] = useState('');
  const [editingChatId,setEditingChatId] = useState(null);

  const [sellerShop,setSellerShop] = useState('');
  const [sellerContact,setSellerContact] = useState('');
  const [sellerPhone,setSellerPhone] = useState('');
  const [sellerDescription,setSellerDescription] = useState('');
  const [sellerId,setSellerId] = useState('');
  const [sellerPassword,setSellerPassword] = useState('');
  const [sellerProfile,setSellerProfile] = useState(null);
  const [sellerApplications,setSellerApplications] = useState([]);
  const [sellerList,setSellerList] = useState([]);
  const [sellerMessages,setSellerMessages] = useState([]);
  const [sellerMessageText,setSellerMessageText] = useState('');
  const [sellerOrders,setSellerOrders] = useState([]);
  const [sellerProducts,setSellerProducts] = useState([]);
  const [sellerWithdrawals,setSellerWithdrawals] = useState([]);
  const [withdrawAmount,setWithdrawAmount] = useState('');
  const [withdrawNumber,setWithdrawNumber] = useState('');
  const [withdrawMethod,setWithdrawMethod] = useState('bKash');
  const [adminNote,setAdminNote] = useState('');
  const [assignSeller,setAssignSeller] = useState({});
  const [riderCodes,setRiderCodes] = useState({});
  const [voucherAmounts,setVoucherAmounts] = useState({});
  const [newSellerProduct,setNewSellerProduct] = useState({
    title:'', category:'Foods', details:'', price:''
  });

  function notify(text) {
    setMessage(text);
    window.setTimeout(() => setMessage(''),3500);
  }

  async function checkUser() {
    if (!db) return false;

    const {data:sessionData} = await db.auth.getSession();
    const current = sessionData?.session?.user || null;
    setUser(current);

    if (!current) {
      setIsAdmin(false);
      return false;
    }

    const {data:admin,error} = await db.from('admin_users')
      .select('user_id')
      .eq('user_id',current.id)
      .maybeSingle();

    const allowed = !error && !!admin;
    setIsAdmin(allowed);
    return allowed;
  }

  useEffect(() => {
    if (!db) {
      notify('Supabase সংযোগ পাওয়া যায়নি।');
      return;
    }

    let active = true;

    async function start() {
      const {data} = await db.auth.getSession();

      if (!data?.session &&
          window.location.pathname !== '/secret-admin') {
        const {error} = await db.auth.signInAnonymously();
        if (error) notify(error.message);
      }

      if (active) await checkUser();
    }

    start();

    const {data:listener} = db.auth.onAuthStateChange(() => {
      if (active) checkUser();
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signIn() {
    if (!db) return notify('Supabase সংযোগ নেই।');
    if (window.location.pathname !== '/secret-admin')
      return notify('অ্যাডমিন লগইনের অনুমতি নেই।');

    const {error} = await db.auth.signInWithPassword({email,password});
    if (error) return notify(error.message);

    const admin = await checkUser();

    if (!admin) {
      await db.auth.signOut();
      setIsAdmin(false);
      setUser(null);
      return notify('এই অ্যাকাউন্ট অ্যাডমিন নয়।');
    }

    setPage('admin');
    notify('অ্যাডমিন লগইন সফল হয়েছে।');
  }

  async function signOut() {
    if (!db) return;

    await db.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setSellerProfile(null);
    setPage('home');

    if (window.location.pathname !== '/secret-admin') {
      const {error} = await db.auth.signInAnonymously();
      if (error) notify(error.message);
    }

    notify('লগআউট হয়েছে।');
  }

  async function loadProducts() {
    if (!db) return;

    const {data,error} = await db.from('products')
      .select('*').order('id',{ascending:true});

    if (error) return notify('পণ্য লোড হয়নি: '+error.message);

    if (!data?.length) {
      setProducts(defaultProducts);
      return;
    }

    setProducts(data.map(p => ({...p,image:p.image_url})));
  }

  useEffect(() => {
    loadProducts();
  },[isAdmin]);

  async function uploadImage(file) {
    if (!file || !db) return null;

    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const {error} = await db.storage.from('product-images')
      .upload(path,file,{upsert:true});

    if (error) throw error;

    return db.storage.from('product-images')
      .getPublicUrl(path).data.publicUrl;
  }

  function parseOptions() {
    return productOptions.split(',').map(part => {
      const [size,price] = part.split(':');
      return {size:size?.trim(),price:Number(price?.trim())};
    }).filter(x => x.size && Number.isFinite(x.price) && x.price>0);
  }

  async function saveProduct() {
    if (!db || !isAdmin) return notify('অ্যাডমিন অনুমতি প্রয়োজন।');
    if (!productTitle.trim()) return notify('পণ্যের নাম লিখুন।');

    const options = parseOptions();
    if (!options.length) return notify('ওজন ও দাম সঠিকভাবে লিখুন।');

    try {
      let imageUrl = editingProduct?.image_url || editingProduct?.image || null;
      if (productImage) imageUrl = await uploadImage(productImage);

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

      setProductTitle('');
      setProductCategory('Foods');
      setProductImage(null);
      setProductOptions('৫০০ গ্রাম:100, ১ কেজি:200');
      setEditingProduct(null);

      await loadProducts();
      notify('পণ্য সংরক্ষণ হয়েছে।');
    } catch (e) {
      notify('পণ্য সংরক্ষণ হয়নি: '+e.message);
    }
  }

  function startEditProduct(product) {
    if (String(product.id).startsWith('base-'))
      return notify('আগে ডাটাবেজে পণ্য যোগ করুন।');

    setEditingProduct(product);
    setProductTitle(product.title);
    setProductCategory(product.category);
    setProductOptions((product.options||[])
      .map(o=>`${o.size}:${o.price}`).join(', '));
    setProductImage(null);
    setPage('add-product');
  }

  async function deleteProduct(product) {
    if (!db || !isAdmin) return;

    if (String(product.id).startsWith('base-'))
      return notify('এই পণ্যটি ডাটাবেজে নেই।');

    if (!window.confirm('পণ্যটি মুছে ফেলবেন?')) return;

    const {error} = await db.from('products').delete().eq('id',product.id);
    if (error) return notify(error.message);

    await loadProducts();
    notify('পণ্য মুছে ফেলা হয়েছে।');
  }

  function addToCart(product,option) {
    const cartId = `${product.id}-${option.size}`;

    setCart(old => {
      const found = old.find(x=>x.cartId===cartId);

      if (found) {
        return old.map(x=>x.cartId===cartId
          ? {...x,quantity:x.quantity+1}:x);
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

  function changeQuantity(cartId,amount) {
    setCart(old=>old.map(x=>x.cartId===cartId
      ? {...x,quantity:x.quantity+amount}:x)
      .filter(x=>x.quantity>0));
  }

  const total = cart.reduce((sum,x)=>sum+x.price*x.quantity,0);

  async function placeOrder() {
    if (!db || !user) return notify('লগইন তৈরি হয়নি।');
    if (!cart.length) return notify('কার্ট খালি।');

    if (!customerName.trim() || !customerPhone.trim() || !address.trim())
      return notify('নাম, ফোন ও ঠিকানা পূরণ করুন।');

    if (!/^01[0-9]{9}$/.test(customerPhone.trim()))
      return notify('ফোন নম্বর ১১ সংখ্যার হতে হবে।');

    if (paymentMethod==='bkash' &&
        (!transactionId.trim() || !/^01[0-9]{9}$/.test(senderBkash.trim()))) {
      return notify('বিকাশ নম্বর ও Transaction ID দিন।');
    }

    const items = cart.map(x=>({
      title:x.title,
      size:x.size,
      price:x.price,
      quantity:x.quantity,
      category:x.category,
      delivery_hours:x.category==='Foods'?4:48
    }));

    const {error} = await db.from('market_orders').insert({
      user_id:user.id,
      customer_name:customerName.trim(),
      phone:customerPhone.trim(),
      address:address.trim(),
      items,
      total,
      status:'pending',
      payment_method:paymentMethod==='bkash'
        ? 'bKash Personal' : 'Cash on Delivery',
      payment_number:paymentMethod==='bkash'
        ? senderBkash.trim() : null,
      transaction_id:paymentMethod==='bkash'
        ? transactionId.trim() : null,
      payment_status:paymentMethod==='bkash'
        ? 'pending_verification' : 'cash_on_delivery'
    });

    if (error) return notify(error.message);

    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setAddress('');
    setTransactionId('');
    setSenderBkash('');
    setPage('my-orders');

    await loadMyOrders();
    notify('অর্ডার জমা হয়েছে।');
  }

  async function loadOrders() {
    if (!db || !isAdmin) return;

    const {data,error} = await db.from('market_orders')
      .select('*').order('id',{ascending:false});

    if (error) return notify(error.message);
    setOrders(data||[]);
  }

  async function loadMyOrders() {
    if (!db || !user) return;

    const {data,error} = await db.from('market_orders')
      .select('*').eq('user_id',user.id)
      .order('id',{ascending:false});

    if (error) return notify(error.message);
    setMyOrders(data||[]);
  }

  async function updateOrder(id,values) {
    if (!db || !isAdmin) return;

    const {error} = await db.from('market_orders')
      .update(values).eq('id',id);

    if (error) return notify(error.message);

    await loadOrders();
    notify('অর্ডার পরিবর্তন হয়েছে।');
  }

  async function loadCustomerChat() {
    if (!db || !user || isAdmin) return;

    const {data,error} = await db.from('chat_messages')
      .select('*').eq('user_id',user.id).order('created_at');

    if (error) return notify(error.message);
    setChatMessages(data||[]);
  }

  async function sendCustomerMessage() {
    if (!db || !user || isAdmin || !chatText.trim()) return;

    const {error} = await db.from('chat_messages').insert({
      user_id:user.id,
      sender:'customer',
      sender_user_id:user.id,
      message:chatText.trim()
    });

    if (error) return notify(error.message);

    setChatText('');
    await loadCustomerChat();
  }

  async function editCustomerMessage(item) {
    if (!db || !user || isAdmin || item.sender!=='customer' ||
        item.sender_user_id!==user.id) return;

    const updated = window.prompt('মেসেজ পরিবর্তন করুন:',item.message);
    if (updated===null || !updated.trim()) return;

    const {error} = await db.from('chat_messages')
      .update({message:updated.trim()})
      .eq('id',item.id)
      .eq('user_id',user.id)
      .eq('sender_user_id',user.id);

    if (error) return notify(error.message);

    await loadCustomerChat();
    notify('মেসেজ পরিবর্তন হয়েছে।');
  }

  async function loadChatCustomers() {
    if (!db || !isAdmin) return;

    const {data,error} = await db.from('chat_messages')
      .select('user_id,created_at')
      .order('created_at',{ascending:false});

    if (error) return notify(error.message);

    const unique=[];
    (data||[]).forEach(row=>{
      if (!unique.some(x=>x.user_id===row.user_id))
        unique.push(row);
    });

    setChatCustomers(unique);

    if (!selectedCustomer && unique.length)
      setSelectedCustomer(unique[0].user_id);
  }

  async function loadAdminChat(id) {
    if (!db || !isAdmin || !id) return;

    const {data,error} = await db.from('chat_messages')
      .select('*').eq('user_id',id).order('created_at');

    if (error) return notify(error.message);
    setChatMessages(data||[]);
  }

  async function sendAdminMessage() {
    if (!db || !isAdmin || !selectedCustomer || !chatText.trim()) return;

    const {error} = await db.from('chat_messages').insert({
      user_id:selectedCustomer,
      sender:'admin',
      sender_user_id:user.id,
      message:chatText.trim()
    });

    if (error) return notify(error.message);

    setChatText('');
    await loadAdminChat(selectedCustomer);
  }

  async function registerSeller() {
    if (!db || !user || isAdmin) return notify('সেশন তৈরি হয়নি।');

    if (!sellerShop.trim() || !sellerContact.trim() ||
        !sellerPhone.trim() || !sellerDescription.trim()) {
      return notify('সব তথ্য পূরণ করুন।');
    }

    if (!/^01[0-9]{9}$/.test(sellerPhone.trim()))
      return notify('সঠিক ১১ সংখ্যার ফোন নম্বর দিন।');

    const {error} = await db.from('seller_applications').insert({
      user_id:user.id,
      shop_name:sellerShop.trim(),
      contact_name:sellerContact.trim(),
      phone:sellerPhone.trim(),
      description:sellerDescription.trim(),
      status:'pending'
    });

    if (error) return notify(error.message);

    setSellerShop('');
    setSellerContact('');
    setSellerPhone('');
    setSellerDescription('');
    setPage('home');
    notify('সেলার নিবন্ধনের আবেদন জমা হয়েছে।');
  }

  async function loadSellerApplications() {
    if (!db || !isAdmin) return;

    const {data,error} = await db.from('seller_applications')
      .select('*').order('created_at',{ascending:false});

    if (error) return notify(error.message);
    setSellerApplications(data||[]);
  }

  async function loadSellers() {
    if (!db || !isAdmin) return;

    const {data,error} = await db.from('seller_profiles')
      .select('*').order('created_at',{ascending:false});

    if (error) return notify(error.message);
    setSellerList(data||[]);
  }

  async function reviewSellerApplication(app,approved) {
    if (!db || !isAdmin) return;

    const {error} = await db.from('seller_applications').update({
      status:approved?'approved':'rejected',
      reviewed_at:new Date().toISOString(),
      reviewed_by:user.id
    }).eq('id',app.id);

    if (error) return notify(error.message);

    if (approved) {
      const generatedId = 'SELLER-'+String(Date.now()).slice(-7);

      const {error:profileError} = await db.from('seller_profiles').upsert({
        user_id:app.user_id,
        full_name:app.contact_name,
        email:null,
        phone:app.phone,
        seller_id:generatedId,
        status:'approved'
      });

      if (profileError) {
        return notify('আবেদন অনুমোদিত, কিন্তু প্রোফাইল তৈরি হয়নি: '+
          profileError.message);
      }
    }

    await loadSellerApplications();
    await loadSellers();
    notify(approved?'সেলার অনুমোদিত হয়েছে।':'আবেদন বাতিল হয়েছে।');
  }

  async function sellerLogin() {
    if (!db) return notify('Supabase সংযোগ নেই।');

    if (!sellerId.trim() || !sellerPassword)
      return notify('সেলার আইডি ও পাসওয়ার্ড দিন।');

    const {data,error} = await db.functions.invoke('seller-login',{
      body:{
        seller_id:sellerId.trim(),
        password:sellerPassword
      }
    });

    if (error || !data?.access_token || !data?.refresh_token)
      return notify('সেলার লগইন হয়নি। আইডি/পাসওয়ার্ড যাচাই করুন।');

    const {error:sessionError} = await db.auth.setSession({
      access_token:data.access_token,
      refresh_token:data.refresh_token
    });

    if (sessionError) return notify(sessionError.message);

    const {data:authData} = await db.auth.getUser();
    const currentUser = authData?.user;

    if (!currentUser) return notify('সেলার সেশন পাওয়া যায়নি।');

    setUser(currentUser);
    setIsAdmin(false);

    const {data:profile,error:profileError} = await db.from('seller_profiles')
      .select('*').eq('user_id',currentUser.id).maybeSingle();

    if (profileError) return notify(profileError.message);
    if (!profile || profile.status!=='approved')
      return notify('সেলার অ্যাকাউন্ট অনুমোদিত নয়।');

    setSellerProfile(profile);
    setPage('seller');
    notify('সেলার লগইন সফল হয়েছে।');
  }

  async function loadSellerProfile() {
    if (!db || !user || isAdmin) return;

    const {data,error} = await db.from('seller_profiles')
      .select('*').eq('user_id',user.id).maybeSingle();

    if (error) return notify(error.message);
    setSellerProfile(data||null);
  }

  async function loadSellerData() {
    if (!db || !user || isAdmin) return;

    const [ordersResult,productsResult,messagesResult,withdrawResult] =
      await Promise.all([
        db.from('market_orders').select('*')
          .eq('assigned_seller_id',user.id)
          .order('id',{ascending:false}),
        db.from('seller_products').select('*')
          .eq('seller_user_id',user.id)
          .order('created_at',{ascending:false}),
        db.from('seller_messages').select('*')
          .eq('seller_user_id',user.id)
          .order('created_at',{ascending:true}),
        db.from('seller_withdrawals').select('*')
          .eq('seller_user_id',user.id)
          .order('created_at',{ascending:false})
      ]);

    if (ordersResult.error) notify(ordersResult.error.message);
    else setSellerOrders(ordersResult.data||[]);

    if (productsResult.error) notify(productsResult.error.message);
    else setSellerProducts(productsResult.data||[]);

    if (messagesResult.error) notify(messagesResult.error.message);
    else setSellerMessages(messagesResult.data||[]);

    if (withdrawResult.error) notify(withdrawResult.error.message);
    else setSellerWithdrawals(withdrawResult.data||[]);
  }

  async function sendSellerMessage() {
    if (!db || !user || isAdmin || !sellerMessageText.trim()) return;

    const {error} = await db.from('seller_messages').insert({
      seller_user_id:user.id,
      sender_role:'seller',
      message:sellerMessageText.trim()
    });

    if (error) return notify(error.message);

    setSellerMessageText('');
    await loadSellerData();
  }

  async function sellerReady(order) {
    if (!db || !user || isAdmin) return;

    const {error} = await db.rpc('seller_mark_order_ready',{
      p_order_id:order.id
    });

    if (error) return notify(error.message);

    await loadSellerData();
    notify('অর্ডার প্রস্তুত হিসেবে চিহ্নিত হয়েছে।');
  }

  async function addSellerProduct() {
    if (!db || !user || isAdmin) return;

    const p=newSellerProduct;

    if (!p.title.trim() || !p.price || Number(p.price)<=0)
      return notify('পণ্যের নাম ও সঠিক দাম দিন।');

    const {error} = await db.from('seller_products').insert({
      seller_user_id:user.id,
      title:p.title.trim(),
      category:p.category,
      details:p.details.trim(),
      price:Number(p.price),
      status:'pending'
    });

    if (error) return notify(error.message);

    setNewSellerProduct({title:'',category:'Foods',details:'',price:''});
    await loadSellerData();
    notify('পণ্য অনুমোদনের জন্য পাঠানো হয়েছে।');
  }

  async function requestWithdrawal() {
    if (!db || !user || isAdmin) return;

    const amount=Number(withdrawAmount);

    if (!amount || amount<=0 ||
        !/^01[0-9]{9}$/.test(withdrawNumber.trim())) {
      return notify('সঠিক টাকার পরিমাণ ও ১১ সংখ্যার নম্বর দিন।');
    }

    const {error} = await db.from('seller_withdrawals').insert({
      seller_user_id:user.id,
      amount,
      payment_number:withdrawNumber.trim(),
      payment_method:withdrawMethod,
      status:'pending'
    });

    if (error) return notify(error.message);

    setWithdrawAmount('');
    setWithdrawNumber('');
    await loadSellerData();
    notify('টাকা তোলার আবেদন অ্যাডমিনের কাছে পাঠানো হয়েছে।');
  }

  async function assignOrder(order) {
    if (!db || !isAdmin) return;

    const seller=assignSeller[order.id];
    if (!seller) return notify('সেলার নির্বাচন করুন।');

    const {error} = await db.from('market_orders')
      .update({
        assigned_seller_id:seller,
        status:'assigned'
      }).eq('id',order.id);

    if (error) return notify(error.message);

    await loadOrders();
    notify('অর্ডার সেলারকে দেওয়া হয়েছে।');
  }

  async function createRiderCode(order) {
    if (!db || !isAdmin) return;

    const {error} = await db.rpc('create_rider_code',{
      p_order_id:order.id
    });

    if (error) return notify(error.message);

    await loadOrders();
    notify('রাইডার কোড সেলার ইনবক্সে পাঠানো হয়েছে।');
  }

  async function verifyRiderCode(order) {
    if (!db || !isAdmin) return;

    const entered=(riderCodes[order.id]||'').trim();
    if (!entered) return notify('রাইডারের দেওয়া কোড লিখুন।');

    const {error} = await db.rpc('verify_rider_code',{
      p_order_id:order.id,
      p_code:entered
    });

    if (error) return notify('রাইডার কোড সঠিক নয় অথবা যাচাই করা যায়নি।');

    setRiderCodes(old=>({...old,[order.id]:''}));
    await loadOrders();
    notify('রাইডার কোড যাচাই হয়েছে।');
  }

  async function approveSellerProduct(product,approved) {
    if (!db || !isAdmin) return;

    const {error} = await db.from('seller_products').update({
      status:approved?'approved':'rejected',
      reviewed_at:new Date().toISOString()
    }).eq('id',product.id);

    if (error) return notify(error.message);

    await loadSellerData();
    notify('সেলার পণ্যের অবস্থা পরিবর্তন হয়েছে।');
  }

  async function sendSellerAdminMessage(sellerUserId,textValue) {
    if (!db || !isAdmin || !textValue.trim()) return;

    const {error} = await db.from('seller_messages').insert({
      seller_user_id:sellerUserId,
      sender_role:'admin',
      message:textValue.trim()
    });

    if (error) return notify(error.message);
    notify('সেলার ইনবক্সে মেসেজ পাঠানো হয়েছে।');
  }

  async function updateWithdrawal(item,status) {
    if (!db || !isAdmin) return;

    const {error} = await db.from('seller_withdrawals')
      .update({status}).eq('id',item.id);

    if (error) return notify(error.message);

    if (status==='paid') {
      const {error:messageError} = await db.from('seller_messages').insert({
        seller_user_id:item.seller_user_id,
        sender_role:'admin',
        message:`আপনার ${item.payment_method||'পেমেন্ট'} মাধ্যমে টাকা তোলার আবেদন ৳${item.amount} পরিশোধ করা হয়েছে।`
      });

      if (messageError)
        return notify('পরিশোধের অবস্থা বদলেছে, কিন্তু ইনবক্স মেসেজ পাঠানো যায়নি।');
    }

    const {data,error:reloadError} = await db.from('seller_withdrawals')
      .select('*').order('created_at',{ascending:false});

    if (!reloadError) setSellerWithdrawals(data||[]);

    notify('টাকা তোলার আবেদনের অবস্থা পরিবর্তন হয়েছে।');
  }

  async function saveVoucher(order) {
    if (!db || !isAdmin) return;

    const amount=Number(voucherAmounts[order.id]);

    if (!Number.isFinite(amount) || amount<0)
      return notify('সঠিক চূড়ান্ত টাকা লিখুন।');

    const {error} = await db.from('market_orders')
      .update({
        voucher_original_price:order.total,
        voucher_seller_amount:amount
      }).eq('id',order.id);

    if (error) return notify(error.message);

    await loadOrders();
    notify('ভাউচার সংরক্ষণ হয়েছে।');
  }

  useEffect(() => {
    if (page==='admin' && isAdmin) {
      loadOrders();
      loadChatCustomers();
      loadSellerApplications();
      loadSellers();
    }

    if (page==='my-orders') loadMyOrders();
    if (page==='chat' && !isAdmin) loadCustomerChat();

    if (page==='admin-chat' && isAdmin) {
      loadChatCustomers();
      if (selectedCustomer) loadAdminChat(selectedCustomer);
    }

    if (page==='seller' && user && !isAdmin) {
      loadSellerProfile();
      loadSellerData();
    }

    if (page==='seller-applications' && isAdmin)
      loadSellerApplications();

    if (page==='seller-management' && isAdmin)
      loadSellers();
  },[page,isAdmin,user,selectedCustomer]);

  const whatsappLink =
    `https://wa.me/88${WHATSAPP}?text=${encodeURIComponent(
      'BD BUSINESS-এ স্বাগতম। পণ্য সম্পর্কে জানতে চাই।'
    )}`;

  const visibleProducts=products.filter(p=>
    p.category===category &&
    p.title.toLowerCase().includes(search.toLowerCase()) &&
    (!p.approval_status || p.approval_status==='approved')
  );

  const isFood=item=>item.category==='Foods';
  const deliveryLabel=item=>isFood(item)?'৪ ঘণ্টার মধ্যে':'৪৮ ঘণ্টার মধ্যে';

  return (
