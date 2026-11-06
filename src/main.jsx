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
  {id:'base-1',title:'মিষ্টি',category:'Foods',image:'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600',options:[{size:'৫০০ গ্রাম',price:280},{size:'১ কেজি',price:550}]},
  {id:'base-2',title:'রসমালাই',category:'Foods',image:'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600',options:[{size:'৫০০ গ্রাম',price:280},{size:'১ কেজি',price:550}]},
  {id:'base-3',title:'সন্দেশ',category:'Foods',image:'https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=600',options:[{size:'৫০০ গ্রাম',price:180},{size:'১ কেজি',price:350}]},
  {id:'base-4',title:'দেশি লাল চিনি',category:'Foods',image:'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=600',options:[{size:'৫০০ গ্রাম',price:135},{size:'১ কেজি',price:260}]},
  {id:'base-5',title:'বাদামের খাজা',category:'Foods',image:'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600',options:[{size:'২৫০ গ্রাম',price:130},{size:'৫০০ গ্রাম',price:250}]},
  {id:'base-6',title:'রেশমি সনপাপড়ি',category:'Foods',image:'https://images.unsplash.com/photo-1605197584325-3b1e3e9e4f6b?w=600',options:[{size:'২৫০ গ্রাম',price:130},{size:'৫০০ গ্রাম',price:250}]},
  {id:'base-7',title:'খাঁটি নারিকেল তেল',category:'Foods',image:'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600',options:[{size:'২৫০ গ্রাম',price:650},{size:'৫০০ গ্রাম',price:1200}]}
];

function App() {
  const [page,setPage] = useState(
    window.location.pathname==='/secret-admin' ? 'login' : 'home'
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
  const [assignSeller,setAssignSeller] = useState({});
  const [riderCodes,setRiderCodes] = useState({});
  const [voucherAmounts,setVoucherAmounts] = useState({});
  const [newSellerProduct,setNewSellerProduct] = useState({title:'',category:'Foods',details:'',price:''});

  function notify(text) {
    setMessage(text);
    window.setTimeout(()=>setMessage(''),3500);
  }

  async function checkUser() {
    if (!db) return false;
    const {data} = await db.auth.getSession();
    const current = data?.session?.user || null;
    setUser(current);
    if (!current) {
      setIsAdmin(false);
      return false;
    }
    const {data:admin,error} = await db.from('admin_users')
      .select('user_id').eq('user_id',current.id).maybeSingle();
    const allowed = !error && !!admin;
    setIsAdmin(allowed);
    return allowed;
  }

  useEffect(()=>{
    if (!db) {
      notify('Supabase সংযোগ পাওয়া যায়নি।');
      return;
    }
    async function start() {
      const {data} = await db.auth.getSession();
      if (!data?.session && window.location.pathname!=='/secret-admin') {
        const {error} = await db.auth.signInAnonymously();
        if (error) notify(error.message);
      }
      await checkUser();
    }
    start();
    const {data:listener} = db.auth.onAuthStateChange(()=>{
      checkUser();
    });
    return ()=>listener.subscription.unsubscribe();
  },[]);

  async function signIn() {
    if (!db) return notify('Supabase সংযোগ নেই।');
    const {error} = await db.auth.signInWithPassword({email,password});
    if (error) return notify(error.message);
    const admin = await checkUser();
    if (!admin) {
      await db.auth.signOut();
      setIsAdmin(false);
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
    const {error} = await db.auth.signInAnonymously();
    if (error) notify(error.message);
    else notify('লগআউট হয়েছে।');
  }

  async function loadProducts() {
    if (!db) return;
    const {data,error} = await db.from('products').select('*').order('id');
    if (error) return notify('পণ্য লোড হয়নি: '+error.message);
    if (!data?.length) return setProducts(defaultProducts);
    setProducts(data.map(p=>({...p,image:p.image_url})));
  }

  useEffect(()=>{loadProducts();},[isAdmin]);

  async function uploadImage(file) {
    if (!file || !db) return null;
    const ext=file.name.split('.').pop()||'jpg';
    const path=`${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const {error}=await db.storage.from('product-images').upload(path,file,{upsert:true});
    if (error) throw error;
    return db.storage.from('product-images').getPublicUrl(path).data.publicUrl;
  }

  function parseOptions() {
    return productOptions.split(',').map(part=>{
      const [size,price]=part.split(':');
      return {size:size?.trim(),price:Number(price?.trim())};
    }).filter(x=>x.size&&Number.isFinite(x.price)&&x.price>0);
  }

  async function saveProduct() {
    if (!db||!isAdmin) return notify('অ্যাডমিন অনুমতি প্রয়োজন।');
    if (!productTitle.trim()) return notify('পণ্যের নাম লিখুন।');
    const options=parseOptions();
    if (!options.length) return notify('ওজন ও দাম সঠিকভাবে লিখুন।');
    try {
      let imageUrl=editingProduct?.image_url||editingProduct?.image||null;
      if (productImage) imageUrl=await uploadImage(productImage);
      const values={title:productTitle.trim(),category:productCategory,image_url:imageUrl,options};
      const result=editingProduct
        ? await db.from('products').update(values).eq('id',editingProduct.id)
        : await db.from('products').insert(values);
      if (result.error) return notify(result.error.message);
      setProductTitle('');setProductCategory('Foods');setProductImage(null);
      setProductOptions('৫০০ গ্রাম:100, ১ কেজি:200');setEditingProduct(null);
      await loadProducts();notify('পণ্য সংরক্ষণ হয়েছে।');
    } catch(e) {notify('পণ্য সংরক্ষণ হয়নি: '+e.message);}
  }

  function startEditProduct(product) {
    if (String(product.id).startsWith('base-')) return notify('আগে ডাটাবেজে পণ্য যোগ করুন।');
    setEditingProduct(product);setProductTitle(product.title);
    setProductCategory(product.category);
    setProductOptions((product.options||[]).map(o=>`${o.size}:${o.price}`).join(', '));
    setProductImage(null);setPage('add-product');
  }

  async function deleteProduct(product) {
    if (!db||!isAdmin) return;
    if (String(product.id).startsWith('base-')) return notify('এই পণ্যটি ডাটাবেজে নেই।');
    if (!window.confirm('পণ্যটি মুছে ফেলবেন?')) return;
    const {error}=await db.from('products').delete().eq('id',product.id);
    if (error) return notify(error.message);
    await loadProducts();notify('পণ্য মুছে ফেলা হয়েছে।');
  }

  function addToCart(product,option) {
    const cartId=`${product.id}-${option.size}`;
    setCart(old=>{
      const found=old.find(x=>x.cartId===cartId);
      if (found) return old.map(x=>x.cartId===cartId?{...x,quantity:x.quantity+1}:x);
      return [...old,{cartId,id:product.id,title:product.title,category:product.category,size:option.size,price:option.price,quantity:1}];
    });
    notify('কার্টে যোগ হয়েছে।');
  }

  function changeQuantity(cartId,amount) {
    setCart(old=>old.map(x=>x.cartId===cartId?{...x,quantity:x.quantity+amount}:x).filter(x=>x.quantity>0));
  }

  const total=cart.reduce((sum,x)=>sum+x.price*x.quantity,0);

  async function placeOrder() {
    if (!db||!user) return notify('লগইন তৈরি হয়নি।');
    if (!cart.length) return notify('কার্ট খালি।');
    if (!customerName.trim()||!customerPhone.trim()||!address.trim()) return notify('নাম, ফোন ও ঠিকানা পূরণ করুন।');
    if (!/^01[0-9]{9}$/.test(customerPhone.trim())) return notify('ফোন নম্বর ১১ সংখ্যার হতে হবে।');
    if (paymentMethod==='bkash'&&(!transactionId.trim()||!/^01[0-9]{9}$/.test(senderBkash.trim()))) return notify('বিকাশ নম্বর ও Transaction ID দিন।');
    const items=cart.map(x=>({title:x.title,size:x.size,price:x.price,quantity:x.quantity,category:x.category,delivery_hours:x.category==='Foods'?4:48}));
    const {error}=await db.from('market_orders').insert({
      user_id:user.id,customer_name:customerName.trim(),phone:customerPhone.trim(),
      address:address.trim(),items,total,status:'pending',
      payment_method:paymentMethod==='bkash'?'bKash Personal':'Cash on Delivery',
      payment_number:paymentMethod==='bkash'?senderBkash.trim():null,
      transaction_id:paymentMethod==='bkash'?transactionId.trim():null,
      payment_status:paymentMethod==='bkash'?'pending_verification':'cash_on_delivery'
    });
    if (error) return notify(error.message);
    setCart([]);setCustomerName('');setCustomerPhone('');setAddress('');
    setTransactionId('');setSenderBkash('');setPage('my-orders');
    await loadMyOrders();notify('অর্ডার জমা হয়েছে।');
  }

  async function loadOrders() {
    if (!db||!isAdmin) return;
    const {data,error}=await db.from('market_orders').select('*').order('id',{ascending:false});
    if (error) return notify(error.message);
    setOrders(data||[]);
  }

  async function loadMyOrders() {
    if (!db||!user) return;
    const {data,error}=await db.from('market_orders').select('*').eq('user_id',user.id).order('id',{ascending:false});
    if (error) return notify(error.message);
    setMyOrders(data||[]);
  }

  async function updateOrder(id,values) {
    if (!db||!isAdmin) return;
    const {error}=await db.from('market_orders').update(values).eq('id',id);
    if (error) return notify(error.message);
    await loadOrders();notify('অর্ডার পরিবর্তন হয়েছে।');
  }

  async function loadCustomerChat() {
    if (!db||!user) return;
    const {data,error}=await db.from('chat_messages').select('*').eq('user_id',user.id).order('created_at');
    if (error) return notify(error.message);
    setChatMessages(data||[]);
  }

  async function sendCustomerMessage() {
    if (!db||!user||!chatText.trim()) return;
    const {error}=await db.from('chat_messages').insert({
      user_id:user.id,sender:'customer',sender_user_id:user.id,message:chatText.trim()
    });
    if (error) return notify(error.message);
    setChatText('');await loadCustomerChat();
  }

  async function editCustomerMessage(item) {
    if (!db||!user||item.sender!=='customer'||item.sender_user_id!==user.id) return;
    const revised=window.prompt('মেসেজটি সম্পাদনা করুন:',item.message);
    if (revised===null||!revised.trim()) return;
    const {error}=await db.from('chat_messages').update({
      message:revised.trim(),edited_at:new Date().toISOString()
    }).eq('id',item.id).eq('sender_user_id',user.id);
    if (error) return notify(error.message);
    await loadCustomerChat();notify('মেসেজ সম্পাদনা হয়েছে।');
  }

  async function loadChatCustomers() {
    if (!db||!isAdmin) return;
    const {data,error}=await db.from('chat_messages').select('user_id,created_at').order('created_at',{ascending:false});
    if (error) return notify(error.message);
    const unique=[];
    (data||[]).forEach(row=>{if(!unique.some(x=>x.user_id===row.user_id)) unique.push(row);});
    setChatCustomers(unique);
    if (!selectedCustomer&&unique.length) setSelectedCustomer(unique[0].user_id);
  }

  async function loadAdminChat(id) {
    if (!db||!isAdmin||!id) return;
    const {data,error}=await db.from('chat_messages').select('*').eq('user_id',id).order('created_at');
    if (error) return notify(error.message);
    setChatMessages(data||[]);
  }

  async function sendAdminMessage() {
    if (!db||!isAdmin||!selectedCustomer||!chatText.trim()) return;
    const {error}=await db.from('chat_messages').insert({user_id:selectedCustomer,sender:'admin',message:chatText.trim()});
    if (error) return notify(error.message);
    setChatText('');await loadAdminChat(selectedCustomer);
  }

  async function registerSeller() {
    if (!db||!user) return notify('সেশন তৈরি হয়নি।');
    if (!sellerShop.trim()||!sellerContact.trim()||!sellerPhone.trim()||!sellerDescription.trim()) return notify('সব তথ্য পূরণ করুন।');
    if (!/^01[0-9]{9}$/.test(sellerPhone.trim())) return notify('সঠিক ১১ সংখ্যার ফোন নম্বর দিন।');
    const {error}=await db.from('seller_applications').insert({
      user_id:user.id,shop_name:sellerShop.trim(),contact_name:sellerContact.trim(),
      phone:sellerPhone.trim(),description:sellerDescription.trim(),status:'pending'
    });
    if (error) return notify(error.message);
    setSellerShop('');setSellerContact('');setSellerPhone('');setSellerDescription('');
    setPage('home');notify('সেলার নিবন্ধনের আবেদন জমা হয়েছে।');
  }

  async function loadSellerApplications() {
    if (!db||!isAdmin) return;
    const {data,error}=await db.from('seller_applications').select('*').order('created_at',{ascending:false});
    if (error) return notify(error.message);
    setSellerApplications(data||[]);
  }

  async function loadSellers() {
    if (!db||!isAdmin) return;
    const {data,error}=await db.from('seller_profiles').select('*').order('created_at',{ascending:false});
    if (error) return notify(error.message);
    setSellerList(data||[]);
  }

  async function reviewSellerApplication(app,approved) {
    if (!db||!isAdmin) return;
    const {error}=await db.from('seller_applications').update({
      status:approved?'approved':'rejected',reviewed_at:new Date().toISOString(),reviewed_by:user.id
    }).eq('id',app.id);
    if (error) return notify(error.message);
    if (approved) {
      const generatedId='SELLER-'+String(Date.now()).slice(-7);
      const {error:profileError}=await db.from('seller_profiles').upsert({
        user_id:app.user_id,full_name:app.contact_name,phone:app.phone,
        seller_id:generatedId,status:'approved'
      });
      if (profileError) return notify('আবেদন অনুমোদিত, কিন্তু প্রোফাইল তৈরি হয়নি: '+profileError.message);
    }
    await loadSellerApplications();await loadSellers();
    notify(approved?'সেলার অনুমোদিত হয়েছে।':'আবেদন বাতিল হয়েছে।');
  }

  async function sellerLogin() {
    if (!db) return notify('Supabase সংযোগ নেই।');
    if (!sellerId.trim()||!sellerPassword) return notify('সেলার আইডি ও পাসওয়ার্ড দিন।');
    const {data,error}=await db.functions.invoke('seller-login',{body:{seller_id:sellerId.trim(),password:sellerPassword}});
    if (error||!data?.access_token||!data?.refresh_token) return notify('সেলার লগইন হয়নি। আইডি/পাসওয়ার্ড যাচাই করুন।');
    const {error:sessionError}=await db.auth.setSession({access_token:data.access_token,refresh_token:data.refresh_token});
    if (sessionError) return notify(sessionError.message);
    const {data:userData,error:userError}=await db.auth.getUser();
    if (userError||!userData?.user) return notify('সেলার সেশন পাওয়া যায়নি।');
    const currentUser=userData.user;
    setUser(currentUser);setIsAdmin(false);
    await loadSellerProfile(currentUser);
    setPage('seller');notify('সেলার লগইন সফল হয়েছে।');
  }

  async function loadSellerProfile(currentUser=user) {
    if (!db||!currentUser) return;
    const {data,error}=await db.from('seller_profiles').select('*').eq('user_id',currentUser.id).maybeSingle();
    if (error) return notify(error.message);
    setSellerProfile(data||null);
  }

  async function loadSellerData() {
    if (!db||!user) return;
    const [o,p,m,w]=await Promise.all([
      db.from('market_orders').select('*').eq('assigned_seller_id',user.id).order('id',{ascending:false}),
      db.from('seller_products').select('*').eq('seller_user_id',user.id).order('created_at',{ascending:false}),
      db.from('seller_messages').select('*').eq('seller_user_id',user.id).order('created_at'),
      db.from('seller_withdrawals').select('*').eq('seller_user_id',user.id).order('created_at',{ascending:false})
    ]);
    if(o.error) notify(o.error.message); else setSellerOrders(o.data||[]);
    if(p.error) notify(p.error.message); else setSellerProducts(p.data||[]);
    if(m.error) notify(m.error.message); else setSellerMessages(m.data||[]);
    if(w.error) notify(w.error.message); else setSellerWithdrawals(w.data||[]);
  }

  async function sendSellerMessage() {
    if (!db||!user||!sellerMessageText.trim()) return;
    const {error}=await db.from('seller_messages').insert({
      seller_user_id:user.id,sender_role:'seller',message:sellerMessageText.trim()
    });
    if (error) return notify(error.message);
    setSellerMessageText('');await loadSellerData();
  }

  async function sellerReady(order) {
    if (!db||!user) return;
    const {error}=await db.rpc('seller_mark_order_ready',{p_order_id:order.id});
    if (error) return notify('অর্ডার Ready হয়নি: '+error.message);
    await loadSellerData();notify('অর্ডার প্রস্তুত হিসেবে চিহ্নিত হয়েছে।');
  }

  async function addSellerProduct() {
    if (!db||!user) return;
    const p=newSellerProduct;
    if (!p.title.trim()||!p.price||Number(p.price)<=0) return notify('পণ্যের নাম ও সঠিক দাম দিন।');
    const {error}=await db.from('seller_products').insert({
      seller_user_id:user.id,title:p.title.trim(),category:p.category,
      details:p.details.trim(),price:Number(p.price),status:'pending'
    });
    if (error) return notify(error.message);
    setNewSellerProduct({title:'',category:'Foods',details:'',price:''});
    await loadSellerData();notify('পণ্য অনুমোদনের জন্য পাঠানো হয়েছে।');
  }

  async function requestWithdrawal() {
    if (!db||!user) return;
    const amount=Number(withdrawAmount);
    if (!amount||amount<=0||!/^01[0-9]{9}$/.test(withdrawNumber.trim())) return notify('সঠিক টাকার পরিমাণ ও ১১ সংখ্যার নম্বর দিন।');
    const {error}=await db.from('seller_withdrawals').insert({
      seller_user_id:user.id,amount,payment_number:withdrawNumber.trim(),
      payment_method:withdrawMethod,status:'pending'
    });
    if (error) return notify(error.message);
    setWithdrawAmount('');setWithdrawNumber('');
    await loadSellerData();notify('টাকা তোলার আবেদন পাঠানো হয়েছে।');
  }

  async function assignOrder(order) {
    if (!db||!isAdmin) return;
    const seller=assignSeller[order.id];
    if (!seller) return notify('সেলার নির্বাচন করুন।');
    const {error}=await db.from('market_orders').update({
      assigned_seller_id:seller,status:'assigned'
    }).eq('id',order.id);
    if (error) return notify(error.message);
    await loadOrders();notify('অর্ডার সেলারকে দেওয়া হয়েছে।');
  }

  async function createRiderCode(order) {
    if (!db||!isAdmin) return;
    const {data,error}=await db.rpc('create_rider_code',{p_order_id:order.id});
    if (error) return notify('রাইডার কোড তৈরি হয়নি: '+error.message);
    if (!data) return notify('কোড তৈরি হয়নি।');
    const {error:msgError}=await db.from('seller_messages').insert({
      seller_user_id:order.assigned_seller_id,sender_role:'admin',
      message:`আপনার অর্ডার #${order.id} এর রাইডার কোড: ${data}`
    });
    if (msgError) return notify('কোড তৈরি হয়েছে, কিন্তু সেলার ইনবক্সে পাঠানো যায়নি।');
    await loadOrders();notify('রাইডার কোড সেলার ইনবক্সে পাঠানো হয়েছে।');
  }

  async function verifyRiderCode(order) {
    if (!db||!isAdmin) return;
    const entered=riderCodes[order.id];
    if (!entered) return notify('রাইডারের দেওয়া কোড লিখুন।');
    const {error}=await db.rpc('verify_rider_code',{
      p_order_id:order.id,p_code:entered
    });
    if (error) return notify('রাইডার কোড সঠিক নয় বা যাচাই হয়নি।');
    await loadOrders();notify('রাইডার কোড যাচাই হয়েছে।');
  }

  async function approveSellerProduct(product,approved) {
    if (!db||!isAdmin) return;
    const {error}=await db.from('seller_products').update({
      status:approved?'approved':'rejected',reviewed_at:new Date().toISOString()
    }).eq('id',product.id);
    if (error) return notify(error.message);
    await loadSellerData();notify('সেলার পণ্যের অবস্থা পরিবর্তন হয়েছে।');
  }

  async function sendSellerAdminMessage(sellerUserId,textValue) {
    if (!db||!isAdmin||!textValue.trim()) return;
    const {error}=await db.from('seller_messages').insert({
      seller_user_id:sellerUserId,sender_role:'admin',message:textValue.trim()
    });
    if (error) return notify(error.message);
    notify('সেলার ইনবক্সে মেসেজ পাঠানো হয়েছে।');
  }

  async function updateWithdrawal(item,status) {
    if (!db||!isAdmin) return;
    const {error}=await db.from('seller_withdrawals').update({status}).eq('id',item.id);
    if (error) return notify(error.message);
    if (status==='paid') {
      const {error:msgError}=await db.from('seller_messages').insert({
        seller_user_id:item.seller_user_id,sender_role:'admin',
        message:`আপনার ${item.payment_method||'পেমেন্ট'} মাধ্যমে টাকা তোলার আবেদন ৳${item.amount} পরিশোধ করা হয়েছে।`
      });
      if (msgError) notify('পরিশোধের অবস্থা হয়েছে, তবে ইনবক্স মেসেজ পাঠানো যায়নি।');
    }
    await loadWithdrawals();notify('টাকা তোলার আবেদনের অবস্থা পরিবর্তন হয়েছে।');
  }

  async function loadWithdrawals() {
    if (!db||!isAdmin) return;
    const {data,error}=await db.from('seller_withdrawals').select('*').order('created_at',{ascending:false});
    if (error) return notify(error.message);
    setSellerWithdrawals(data||[]);
  }

  async function saveVoucher(order) {
    if (!db||!isAdmin) return;
    const amount=Number(voucherAmounts[order.id]);
    if (!Number.isFinite(amount)||amount<0) return notify('সঠিক চূড়ান্ত টাকা লিখুন।');
    const {error}=await db.from('market_orders').update({
      voucher_original_price:order.total,voucher_seller_amount:amount
    }).eq('id',order.id);
    if (error) return notify(error.message);
    await loadOrders();notify('ভাউচার সংরক্ষণ হয়েছে।');
  }

  useEffect(()=>{
    if (page==='admin'&&isAdmin) {
      loadOrders();loadChatCustomers();loadSellerApplications();loadSellers();
    }
    if (page==='my-orders') loadMyOrders();
    if (page==='chat'&&!isAdmin) loadCustomerChat();
    if (page==='admin-chat'&&isAdmin) {
      loadChatCustomers();
      if (selectedCustomer) loadAdminChat(selectedCustomer);
    }
    if (page==='seller'&&user&&!isAdmin) {
      loadSellerProfile(user);loadSellerData();
    }
    if (page==='seller-applications'&&isAdmin) loadSellerApplications();
    if (page==='seller-management'&&isAdmin) loadSellers();
    if (page==='withdraw-management'&&isAdmin) loadWithdrawals();
  },[page,isAdmin,user,selectedCustomer]);

  const whatsappLink=`https://wa.me/88${WHATSAPP}?text=${encodeURIComponent('BD BUSINESS-এ স্বাগতম। পণ্য সম্পর্কে জানতে চাই।')}`;
  const visibleProducts=products.filter(p=>
    p.category===category&&p.title.toLowerCase().includes(search.toLowerCase())&&
    (!p.approval_status||p.approval_status==='approved')
  );
  const isFood=item=>item.category==='Foods';
  const deliveryLabel=item=>isFood(item)?'৪ ঘণ্টার মধ্যে':'৪৮ ঘণ্টার মধ্যে';return (
    <>
      <style>{`
        *{box-sizing:border-box}
        body{margin:0;font-family:Arial,sans-serif;background:#f4f6f8;color:#222;padding-bottom:75px}
        button{border:0;border-radius:7px;padding:10px 12px;background:#087b58;color:white;cursor:pointer;margin:3px}
        button.secondary{background:#34495e}
        button.danger{background:#bd3434}
        button.warning{background:#bd7b13}
        header{background:#073b32;color:white;padding:14px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10}
        header h1{margin:0;font-size:23px}
        .header-button{font-size:24px;background:transparent;padding:5px 10px}
        .menu{position:absolute;top:55px;left:8px;background:white;color:#222;padding:10px;border-radius:10px;box-shadow:0 3px 12px #0003;z-index:20}
        .menu a{display:block;padding:10px;color:#073b32;text-decoration:none}
        main{max-width:1000px;margin:auto;padding:12px}
        .card{background:white;border-radius:12px;padding:13px;margin:10px 0;box-shadow:0 2px 8px #00000012;min-width:0}
        .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
        .product-image{width:100%;height:130px;object-fit:cover;border-radius:8px;background:#eee}
        .product-card h3{font-size:16px;margin:8px 0;overflow-wrap:anywhere}
        .price{color:#087b58;font-size:14px;font-weight:bold;margin:7px 0}
        input,textarea,select{display:block;width:100%;padding:12px;border:1px solid #ccc;border-radius:7px;margin:9px 0 14px;font-size:16px;background:white}
        input[type=radio],input[type=file]{width:auto;display:inline-block}
        textarea{min-height:75px}
        h2{color:#073b32;font-size:21px}
        .message{position:sticky;top:55px;background:#fff2c7;padding:11px;text-align:center;z-index:9}
        .categories{display:flex;overflow-x:auto;gap:8px;background:white;padding:10px}
        .categories button{white-space:nowrap;background:#e7efec;color:#073b32}
        .categories button.active{background:#087b58;color:white}
        .bottom-nav{position:fixed;bottom:0;left:0;right:0;display:grid;grid-template-columns:repeat(4,1fr);background:white;border-top:1px solid #ddd;z-index:15;padding:5px 0}
        .bottom-nav button{background:transparent;color:#073b32;font-size:12px;padding:7px 2px}
        .chat-message{padding:10px;margin:7px 0;border-radius:10px;max-width:85%;overflow-wrap:anywhere}
        .customer-message{background:#d9f5e5;margin-left:auto}
        .admin-message{background:#eee}
        .row{display:flex;gap:5px;align-items:center}
        .row input{flex:1;min-width:0}
        .status{padding:5px 9px;border-radius:6px;background:#e7efec;display:inline-block}
        footer{text-align:center;padding:20px;background:#073b32;color:white;margin-top:25px}
        footer a{color:white}
        .bkash-box{background:#fff1f3;border:1px solid #e8a3b1;padding:12px;border-radius:10px;margin:10px 0}
        .bkash-logo{display:inline-block;background:#d12053;color:white;font-weight:bold;border-radius:6px;padding:7px 15px}
        @media(min-width:650px){.product-image{height:190px}.grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
      `}</style>

      <header>
        <button className="header-button" onClick={()=>setMenuOpen(!menuOpen)}>⋮</button>
        <h1>BD BUSINESS</h1>
        <button className="header-button" onClick={()=>setSearchOpen(!searchOpen)}>⌕</button>
        {menuOpen&&(
          <div className="menu">
            <a href="#" onClick={e=>{e.preventDefault();setPage('seller-register');setMenuOpen(false)}}>সেলার নিবন্ধন</a>
            <a href="#" onClick={e=>{e.preventDefault();setPage('seller-login');setMenuOpen(false)}}>সেলার আইডি লগইন</a>
            <a href={whatsappLink} target="_blank" rel="noreferrer">WhatsApp</a>
            <a href={FACEBOOK} target="_blank" rel="noreferrer">Facebook Page</a>
          </div>
        )}
      </header>

      {searchOpen&&<div className="card"><input placeholder="পণ্য খুঁজুন..." value={search} onChange={e=>setSearch(e.target.value)}/></div>}
      {message&&<div className="message">{message}</div>}

      {page==='home'&&<>
        <div className="categories">
          {categories.map(item=><button key={item} className={category===item?'active':''} onClick={()=>setCategory(item)}>{item}</button>)}
        </div>
        <main>
          <section className="card"><h2>স্বাগতম BD BUSINESS-এ</h2><p>পছন্দের পণ্য বেছে নিয়ে অর্ডার করুন।</p></section>
          <h2>{category}</h2>
          <div className="grid">
            {visibleProducts.map(product=>(
              <div className="card product-card" key={product.id}>
                <img className="product-image" src={product.image||'https://placehold.co/600x400?text=BD+BUSINESS'} alt={product.title} onError={e=>{e.currentTarget.src='https://placehold.co/600x400?text=BD+BUSINESS'}}/>
                <h3>{product.title}</h3>
                {(product.options||[]).map((option,index)=><div key={index}><p className="price">{option.size} — ৳{option.price}</p><button onClick={()=>addToCart(product,option)}>কার্টে যোগ</button></div>)}
              </div>
            ))}
          </div>
          {!visibleProducts.length&&<section className="card">এই ক্যাটাগরিতে এখনো কোনো পণ্য নেই।</section>}
        </main>
      </>}

      {page==='cart'&&<main><section className="card">
        <h2>কার্ট</h2>
        {!cart.length&&<p>কার্ট খালি।</p>}
        {cart.map(item=><div className="card" key={item.cartId}>
          <b>{item.title} — {item.size}</b><p>৳{item.price} × {item.quantity}</p>
          <button onClick={()=>changeQuantity(item.cartId,-1)}>−</button>
          <button onClick={()=>changeQuantity(item.cartId,1)}>+</button>
          <p>ডেলিভারি: {deliveryLabel(item)}</p>
        </div>)}
        <h2>মোট: ৳{total}</h2>
        {cart.length>0&&<>
          <h2>পেমেন্ট পদ্ধতি</h2>
          <label><input type="radio" name="payment" checked={paymentMethod==='bkash'} onChange={()=>setPaymentMethod('bkash')}/> বিকাশ পেমেন্ট</label><br/>
          <label><input type="radio" name="payment" checked={paymentMethod==='cod'} onChange={()=>setPaymentMethod('cod')}/> ক্যাশ অন ডেলিভারি</label>
          {paymentMethod==='bkash'&&<div className="bkash-box">
            <div className="bkash-logo">bKash</div><h3>বিকাশ নম্বর: {BKASH}</h3>
            <button onClick={()=>{navigator.clipboard?.writeText(BKASH);notify('বিকাশ নম্বর কপি হয়েছে।')}}>নম্বর কপি করুন</button>
            <p>পেমেন্ট করার পর আপনার বিকাশ নম্বর ও Transaction ID লিখুন।</p>
            <input placeholder="যে বিকাশ নম্বর থেকে টাকা পাঠিয়েছেন" value={senderBkash} onChange={e=>setSenderBkash(e.target.value)} inputMode="numeric" maxLength={11}/>
            <input placeholder="Transaction ID" value={transactionId} onChange={e=>setTransactionId(e.target.value)}/>
          </div>}
          <h2>অর্ডারের তথ্য</h2>
          <input placeholder="ক্রেতার নাম" value={customerName} onChange={e=>setCustomerName(e.target.value)}/>
          <input placeholder="১১ সংখ্যার ফোন নম্বর" value={customerPhone} maxLength={11} inputMode="numeric" onChange={e=>setCustomerPhone(e.target.value)}/>
          <textarea placeholder="ডেলিভারির ঠিকানা" value={address} onChange={e=>setAddress(e.target.value)}/>
          <button onClick={placeOrder}>অর্ডার জমা দিন</button>
        </>}
      </section></main>}

      {page==='my-orders'&&<main><section className="card">
        <h2>আমার অর্ডার</h2><button onClick={loadMyOrders}>রিফ্রেশ</button>
        {!myOrders.length&&<p>আপনার কোনো অর্ডার পাওয়া যায়নি।</p>}
        {myOrders.map(order=><div className="card" key={order.id}>
          <b>অর্ডার #{order.id}</b><p>মোট: ৳{order.total}</p><p>অবস্থা: {order.status}</p><p>ঠিকানা: {order.address}</p>
          {(order.items||[]).map((item,i)=><p key={i}>{item.title} ({item.size}) × {item.quantity} — ডেলিভারি {item.delivery_hours===4?'৪ ঘণ্টা':'৪৮ ঘণ্টা'}</p>)}
          {order.rider_code_status==='verified'&&<p>রাইডার কোড যাচাই হয়েছে।</p>}
          {order.voucher_seller_amount!=null&&<p>ভাউচার চূড়ান্ত মূল্য: ৳{order.voucher_seller_amount}</p>}
        </div>)}
      </section></main>}

      {page==='chat'&&<main><section className="card">
        <h2>কাস্টমার চ্যাট</h2><button onClick={loadCustomerChat}>মেসেজ রিফ্রেশ</button>
        {chatMessages.map(item=><div key={item.id} className={'chat-message '+(item.sender==='customer'?'customer-message':'admin-message')}>
          <b>{item.sender==='admin'?'অ্যাডমিন':'আপনি'}</b><div>{item.message}</div>
          {item.sender==='customer'&&item.sender_user_id===user?.id&&<button className="secondary" onClick={()=>editCustomerMessage(item)}>এডিট</button>}
        </div>)}
        <div className="row"><input placeholder="মেসেজ লিখুন..." value={chatText} onChange={e=>setChatText(e.target.value)}/><button onClick={sendCustomerMessage}>পাঠান</button></div>
      </section></main>}

      {page==='seller-register'&&<main><section className="card">
        <h2>সেলার নিবন্ধন</h2>
        <label>দোকানের নাম</label><input value={sellerShop} onChange={e=>setSellerShop(e.target.value)} placeholder="দোকানের নাম"/>
        <label>যোগাযোগকারীর নাম</label><input value={sellerContact} onChange={e=>setSellerContact(e.target.value)} placeholder="আপনার নাম"/>
        <label>ফোন নম্বর</label><input value={sellerPhone} maxLength={11} inputMode="numeric" onChange={e=>setSellerPhone(e.target.value)} placeholder="১১ সংখ্যার ফোন নম্বর"/>
        <label>দোকানের বিবরণ</label><textarea value={sellerDescription} onChange={e=>setSellerDescription(e.target.value)} placeholder="দোকানের বিবরণ"/>
        <button onClick={registerSeller}>নিবন্ধনের আবেদন পাঠান</button><button className="secondary" onClick={()=>setPage('home')}>ফিরে যান</button>
      </section></main>}

      {page==='seller-login'&&<main><section className="card">
        <h2>সেলার আইডি লগইন</h2>
        <input placeholder="সেলার আইডি" value={sellerId} onChange={e=>setSellerId(e.target.value)}/>
        <input type="password" placeholder="পাসওয়ার্ড" value={sellerPassword} onChange={e=>setSellerPassword(e.target.value)}/>
        <button onClick={sellerLogin}>সেলার লগইন</button><button className="secondary" onClick={()=>setPage('home')}>ফিরে যান</button>
      </section></main>}

      {page==='seller'&&<main>
        <section className="card">
          <h2>সেলার প্যানেল</h2>
          {sellerProfile&&<><p>দোকান/সেলার: {sellerProfile.full_name}</p><p>সেলার আইডি: {sellerProfile.seller_id}</p><p>অবস্থা: {sellerProfile.status}</p></>}
          <button onClick={loadSellerData}>রিফ্রেশ</button><button className="secondary" onClick={signOut}>লগআউট</button>
        </section>
        <section className="card">
          <h2>আমার অর্ডার</h2>
          {!sellerOrders.length&&<p>আপনার নামে কোনো অর্ডার দেওয়া হয়নি।</p>}
          {sellerOrders.map(order=><div className="card" key={order.id}>
            <b>অর্ডার #{order.id}</b><p>ক্রেতা: {order.customer_name}</p><p>ফোন: {order.phone}</p><p>ঠিকানা: {order.address}</p><p>অবস্থা: {order.status}</p>
            {(order.items||[]).map((item,i)=><p key={i}>{item.title} ({item.size}) × {item.quantity}</p>)}
            {order.status!=='ready'&&order.status!=='handed_over'&&<button onClick={()=>sellerReady(order)}>অর্ডার প্রস্তুত / Ready</button>}
          </div>)}
        </section>
        <section className="card">
          <h2>নতুন পণ্য যোগ করুন</h2>
          <input placeholder="পণ্যের নাম" value={newSellerProduct.title} onChange={e=>setNewSellerProduct({...newSellerProduct,title:e.target.value})}/>
          <select value={newSellerProduct.category} onChange={e=>setNewSellerProduct({...newSellerProduct,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select>
          <textarea placeholder="পণ্যের বিবরণ" value={newSellerProduct.details} onChange={e=>setNewSellerProduct({...newSellerProduct,details:e.target.value})}/>
          <input type="number" placeholder="দাম" value={newSellerProduct.price} onChange={e=>setNewSellerProduct({...newSellerProduct,price:e.target.value})}/>
          <button onClick={addSellerProduct}>অনুমোদনের জন্য পাঠান</button><h3>আমার পণ্য</h3>
          {sellerProducts.map(p=><div className="card" key={p.id}><b>{p.title}</b><p>দাম: ৳{p.price}</p><p>অনুমোদন: {p.status}</p></div>)}
        </section>
        <section className="card">
          <h2>সেলার ইনবক্স</h2>
          {sellerMessages.map(m=><div className="chat-message admin-message" key={m.id}><b>{m.sender_role==='admin'?'অ্যাডমিন':'আপনি'}</b><p>{m.message}</p></div>)}
          <div className="row"><input placeholder="অ্যাডমিনকে মেসেজ লিখুন" value={sellerMessageText} onChange={e=>setSellerMessageText(e.target.value)}/><button onClick={sendSellerMessage}>পাঠান</button></div>
        </section>
        <section className="card">
          <h2>টাকা তোলার আবেদন</h2>
          <select value={withdrawMethod} onChange={e=>setWithdrawMethod(e.target.value)}><option>bKash</option><option>Rocket</option></select>
          <input placeholder="বিকাশ / রকেট নম্বর" value={withdrawNumber} maxLength={11} onChange={e=>setWithdrawNumber(e.target.value)}/>
          <input type="number" placeholder="টাকার পরিমাণ" value={withdrawAmount} onChange={e=>setWithdrawAmount(e.target.value)}/>
          <button onClick={requestWithdrawal}>আবেদন পাঠান</button>
          <p>আবেদন অ্যাডমিন যাচাই করে নির্ধারিত সময়ে পরিশোধ করবেন।</p>
          {sellerWithdrawals.map(w=><div className="card" key={w.id}><p>৳{w.amount} — {w.payment_method||'পেমেন্ট পদ্ধতি নেই'} — {w.status}</p></div>)}
        </section>
      </main>}

      {page==='login'&&<main><section className="card">
        <h2>অ্যাডমিন লগইন</h2>
        <input type="email" placeholder="অ্যাডমিন ইমেইল" value={email} onChange={e=>setEmail(e.target.value)}/>
        <input type="password" placeholder="পাসওয়ার্ড" value={password} onChange={e=>setPassword(e.target.value)}/>
        <button onClick={signIn}>লগইন</button>
      </section></main>}

      {page==='admin'&&<main>
        {!isAdmin?<section className="card">অ্যাডমিন অনুমতি প্রয়োজন।</section>:<>
          <section className="card">
            <h2>অ্যাডমিন প্যানেল</h2>
            <button onClick={()=>{setEditingProduct(null);setProductTitle('');setProductCategory('Foods');setProductImage(null);setProductOptions('৫০০ গ্রাম:100, ১ কেজি:200');setPage('add-product')}}>+ Add Product</button>
            <button onClick={()=>setPage('admin-chat')}>কাস্টমার চ্যাট ইনবক্স</button>
            <button onClick={()=>{loadSellerApplications();setPage('seller-applications')}}>সেলার নিবন্ধন আবেদন</button>
            <button onClick={()=>{loadSellers();setPage('seller-management')}}>সেলার পরিচালনা</button>
            <button onClick={()=>setPage('seller-product-review')}>সেলার পণ্য অনুমোদন</button>
            <button onClick={()=>setPage('withdraw-management')}>টাকা তোলার আবেদন</button>
            <button onClick={loadOrders}>অর্ডার রিফ্রেশ</button>
            <button className="secondary" onClick={signOut}>লগআউট</button>
          </section>
          <section className="card">
            <h2>পণ্য পরিচালনা</h2>
            {products.map(p=><div className="card" key={p.id}><b>{p.title}</b><p>{p.category}</p><button onClick={()=>startEditProduct(p)}>এডিট</button><button className="danger" onClick={()=>deleteProduct(p)}>ডিলিট</button></div>)}
          </section>
          <section className="card">
            <h2>অর্ডার তালিকা</h2>
            {!orders.length&&<p>কোনো অর্ডার নেই।</p>}
            {orders.map(order=><div className="card" key={order.id}>
              <h3>{order.customer_name}</h3><p>ফোন: {order.phone}</p><p>ঠিকানা: {order.address}</p><p>মোট: ৳{order.total}</p>
              <p>পেমেন্ট: {order.payment_method}</p><p>বিকাশ নম্বর: {order.payment_number||'নেই'}</p><p>Transaction ID: {order.transaction_id||'নেই'}</p><p>পেমেন্ট অবস্থা: {order.payment_status}</p><p>অর্ডার অবস্থা: {order.status}</p>
              {(order.items||[]).map((item,i)=><p key={i}>{item.title} ({item.size}) × {item.quantity}</p>)}
              <button onClick={()=>updateOrder(order.id,{payment_status:order.payment_method==='bKash Personal'?'verified':'cash_on_delivery',status:'confirmed'})}>অর্ডার নিশ্চিত</button>
              <button className="danger" onClick={()=>updateOrder(order.id,{status:'cancelled'})}>বাতিল</button>
              <h3>সেলার নির্বাচন</h3>
              <select value={assignSeller[order.id]||''} onChange={e=>setAssignSeller({...assignSeller,[order.id]:e.target.value})}>
                <option value="">সেলার নির্বাচন করুন</option>
                {sellerList.filter(s=>s.status==='approved').map(s=><option key={s.user_id} value={s.user_id}>{s.seller_id} — {s.full_name}</option>)}
              </select>
              <button onClick={()=>assignOrder(order)}>সেলারকে অর্ডার দিন</button>
              {order.status==='ready'&&<button onClick={()=>createRiderCode(order)}>রাইডার কোড তৈরি ও পাঠান</button>}
              {order.rider_code_status!=='verified'&&order.status==='rider_code_sent'&&<>
                <input placeholder="রাইডারের দেওয়া কোড লিখুন" value={riderCodes[order.id]||''} onChange={e=>setRiderCodes({...riderCodes,[order.id]:e.target.value})}/>
                <button onClick={()=>verifyRiderCode(order)}>কোড যাচাই</button>
              </>}
              {order.rider_code_status==='verified'&&<p>রাইডার কোড যাচাই সম্পন্ন।</p>}
              <h3>ভাউচার</h3>
              {order.voucher_original_price!=null&&<p><s>মূল দাম: ৳{order.voucher_original_price}</s></p>}
              <input type="number" placeholder="সেলারকে দেওয়া চূড়ান্ত টাকা" value={voucherAmounts[order.id]??''} onChange={e=>setVoucherAmounts({...voucherAmounts,[order.id]:e.target.value})}/>
              <button onClick={()=>saveVoucher(order)}>ভাউচার সংরক্ষণ</button>
            </div>)}
          </section>
        </>}
      </main>}

      {page==='seller-applications'&&<main><section className="card">
        <h2>সেলার নিবন্ধনের আবেদন</h2><button onClick={loadSellerApplications}>রিফ্রেশ</button>
        {sellerApplications.map(app=><div className="card" key={app.id}>
          <b>{app.shop_name}</b><p>নাম: {app.contact_name}</p><p>ফোন: {app.phone}</p><p>বিবরণ: {app.description}</p><p>অবস্থা: {app.status}</p>
          {app.status==='pending'&&<><button onClick={()=>reviewSellerApplication(app,true)}>অনুমোদন</button><button className="danger" onClick={()=>reviewSellerApplication(app,false)}>বাতিল</button></>}
        </div>)}
        <button className="secondary" onClick={()=>setPage('admin')}>অ্যাডমিন প্যানেলে ফিরুন</button>
      </section></main>}

      {page==='seller-management'&&<main><section className="card">
        <h2>সেলার পরিচালনা</h2><button onClick={loadSellers}>রিফ্রেশ</button>
        {sellerList.map(s=><div className="card" key={s.user_id}>
          <b>{s.full_name}</b><p>সেলার আইডি: {s.seller_id}</p><p>ফোন: {s.phone}</p><p>অবস্থা: {s.status}</p>
          <button onClick={async()=>{
            const next=s.status==='approved'?'inactive':'approved';
            const {error}=await db.from('seller_profiles').update({status:next}).eq('user_id',s.user_id);
            if(error) notify(error.message);else loadSellers();
          }}>{s.status==='approved'?'নিষ্ক্রিয় করুন':'সক্রিয় করুন'}</button>
          <div className="row"><input placeholder="সেলারকে মেসেজ লিখুন" id={`seller-msg-${s.user_id}`}/><button onClick={()=>{
            const el=document.getElementById(`seller-msg-${s.user_id}`);
            sendSellerAdminMessage(s.user_id,el?.value||'');if(el) el.value='';
          }}>পাঠান</button></div>
        </div>)}
        <button className="secondary" onClick={()=>setPage('admin')}>ফিরে যান</button>
      </section></main>}

      {page==='seller-product-review'&&<main><section className="card">
        <h2>সেলার পণ্য অনুমোদন</h2>
        <button onClick={async()=>{
          const {data,error}=await db.from('seller_products').select('*').order('created_at',{ascending:false});
          if(error) notify(error.message);else setSellerProducts(data||[]);
        }}>পণ্য লোড করুন</button>
        {sellerProducts.map(p=><div className="card" key={p.id}>
          <b>{p.title}</b><p>দাম: ৳{p.price}</p><p>{p.details}</p><p>অবস্থা: {p.status}</p>
          {p.status==='pending'&&<><button onClick={()=>approveSellerProduct(p,true)}>অনুমোদন</button><button className="danger" onClick={()=>approveSellerProduct(p,false)}>বাতিল</button></>}
        </div>)}
        <button className="secondary" onClick={()=>setPage('admin')}>ফিরে যান</button>
      </section></main>}

      {page==='withdraw-management'&&<main><section className="card">
        <h2>সেলার টাকা তোলার আবেদন</h2><button onClick={loadWithdrawals}>আবেদন লোড করুন</button>
        {sellerWithdrawals.map(w=><div className="card" key={w.id}>
          <p>সেলার: {w.seller_user_id}</p><p>পরিমাণ: ৳{w.amount}</p><p>পেমেন্ট পদ্ধতি: {w.payment_method||'তথ্য নেই'}</p><p>নম্বর: {w.payment_number}</p><p>অবস্থা: {w.status}</p>
          <button onClick={()=>updateWithdrawal(w,'approved')}>অনুমোদন</button>
          <button onClick={()=>updateWithdrawal(w,'paid')}>পরিশোধ হয়েছে</button>
          <button className="danger" onClick={()=>updateWithdrawal(w,'rejected')}>বাতিল</button>
        </div>)}
        <button className="secondary" onClick={()=>setPage('admin')}>ফিরে যান</button>
      </section></main>}

      {page==='add-product'&&<main><section className="card">
        <h2>{editingProduct?'পণ্য এডিট':'নতুন পণ্য যোগ করুন'}</h2>
        <label>পণ্যের নাম</label><input value={productTitle} onChange={e=>setProductTitle(e.target.value)}/>
        <label>ক্যাটাগরি</label><select value={productCategory} onChange={e=>setProductCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select>
        <label>ছবি নির্বাচন করুন</label><input type="file" accept="image/*" onChange={e=>setProductImage(e.target.files?.[0]||null)}/>
        <label>ওজন ও দাম</label><textarea value={productOptions} onChange={e=>setProductOptions(e.target.value)}/>
        <p>উদাহরণ: ৫০০ গ্রাম:280, ১ কেজি:550</p>
        <button onClick={saveProduct}>সংরক্ষণ করুন</button><button className="secondary" onClick={()=>setPage('admin')}>ফিরে যান</button>
      </section></main>}

      {page==='admin-chat'&&<main><section className="card">
        <h2>অ্যাডমিন চ্যাট ইনবক্স</h2><button onClick={loadChatCustomers}>ইনবক্স রিফ্রেশ</button>
        {chatCustomers.map(item=><button className="secondary" key={item.user_id} onClick={()=>setSelectedCustomer(item.user_id)}>কাস্টমার: {item.user_id.slice(0,8)}</button>)}
        {selectedCustomer&&<>
          <p>নির্বাচিত কাস্টমার: {selectedCustomer.slice(0,12)}</p>
          {chatMessages.map(item=><div key={item.id} className={'chat-message '+(item.sender==='admin'?'customer-message':'admin-message')}><b>{item.sender==='admin'?'অ্যাডমিন':'কাস্টমার'}</b><div>{item.message}</div></div>)}
          <div className="row"><input placeholder="উত্তর লিখুন..." value={chatText} onChange={e=>setChatText(e.target.value)}/><button onClick={sendAdminMessage}>পাঠান</button></div>
        </>}
        <button className="secondary" onClick={()=>setPage('admin')}>অ্যাডমিন প্যানেলে ফিরুন</button>
      </section></main>}

      {page!=='login'&&page!=='admin'&&page!=='add-product'&&page!=='admin-chat'&&
       page!=='seller-applications'&&page!=='seller-management'&&
       page!=='seller-product-review'&&page!=='withdraw-management'&&
       page!=='seller'&&page!=='seller-register'&&page!=='seller-login'&&(
        <nav className="bottom-nav">
          <button onClick={()=>setPage('my-orders')}>📦<br/>My Orders</button>
          <button onClick={()=>setPage('cart')}>🛒<br/>Cart ({cart.length})</button>
          <button onClick={()=>setPage('chat')}>💬<br/>Chat</button>
          <button onClick={()=>setPage('home')}>🏠<br/>Home</button>
        </nav>
      )}

      <footer>
        <h3>BD BUSINESS</h3><p>খাবার ও পণ্যের অনলাইন দোকান</p>
        <a href={FACEBOOK} target="_blank" rel="noreferrer">Facebook Page</a>
        <p><a href={whatsappLink} target="_blank" rel="noreferrer">WhatsApp-এ যোগাযোগ করুন</a></p>
      </footer>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
