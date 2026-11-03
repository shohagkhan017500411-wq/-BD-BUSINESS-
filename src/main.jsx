async function signup(){
  if(!db){
    M('Supabase সংযোগ পাওয়া যায়নি');
    return;
  }
  if(!email || !password){
    M('ইমেইল ও পাসওয়ার্ড দিন');
    return;
  }
  if(password.length < 6){
    M('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
    return;
  }
  const r = await db.auth.signUp({email, password});
  M(r.error ? r.error.message : 'অ্যাকাউন্ট তৈরি হয়েছে। ইমেইল যাচাই করুন।');
} import React, {useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {createClient} from '@supabase/supabase-js';
import './style.css';

const url=import.meta.env.VITE_SUPABASE_URL;
const key=import.meta.env.VITE_SUPABASE_ANON_KEY;
const db=url&&key?createClient(url,key):null;

function App(){
const [session,S]=useState(null);
const [email,E]=useState('');
const [password,P]=useState('');
const [products,PR]=useState([]);
const [admin,A]=useState(false);
const [apps,AP]=useState([]);
const [pending,PN]=useState([]);
const [msg,M]=useState('');
const [shop,SH]=useState('');
const [contact,C]=useState('');
const [phone,PH]=useState('');
const [title,T]=useState('');
const [price,PP]=useState('');
const [category,CA]=useState('খাবার ও মিষ্টি');
const [desc,D]=useState('');

async function load(){
if(!db){M('Netlify environment variables সেট হয়নি।');return}
let r=await db.from('market_products').select('*').eq('status','approved').order('created_at',{ascending:false});
if(r.error)M(r.error.message);
else PR(r.data||[]);
}

async function check(u){
if(!u)return;
let r=await db.from('admin_users').select('user_id').eq('user_id',u.id).maybeSingle();
A(!!r.data);
if(r.data){
let a=await db.from('seller_applications').select('*').eq('status','pending');
let p=await db.from('market_products').select('*').eq('status','pending');
AP(a.data||[]);
PN(p.data||[]);
}
}

useEffect(()=>{
load();
if(db){
db.auth.getSession().then(({data})=>{
S(data.session);
check(data.session?.user);
});
let {data:{subscription}}=db.auth.onAuthStateChange((_e,s)=>{
S(s);
check(s?.user);
});
return ()=>subscription.unsubscribe();
}
},[]);

async function signup(){
let r=await db.auth.signUp({email,password});
M(r.error?.message||'অ্যাকাউন্ট তৈরি হয়েছে। ইমেইল যাচাই লাগতে পারে।');
}

async function login(){
let r=await db.auth.signInWithPassword({email,password});
M(r.error?.message||'লগইন হয়েছে।');
}

async function apply(e){
e.preventDefault();
let r=await db.from('seller_applications').insert({
user_id:session.user.id,
shop_name:shop,
contact_name:contact,
phone
});
M(r.error?.message||'বিক্রেতার আবেদন জমা হয়েছে। অনুমোদনের অপেক্ষা করুন।');
}

async function add(e){
e.preventDefault();
let r=await db.from('market_products').insert({
seller_user_id:session.user.id,
title,
price:Number(price),
category,
description:desc,
status:'pending'
});
M(r.error?.message||'পণ্য অনুমোদনের জন্য জমা হয়েছে।');
}

async function review(table,id,status){
let r=await db.from(table).update({
status,
reviewed_by:session.user.id,
reviewed_at:new Date().toISOString()
}).eq('id',id);
M(r.error?.message||'পর্যালোচনা সম্পন্ন');
check(session.user);
load();
}

return <>
<header>
<b>🛍️ BD BUSINESS</b>
<span>খাবার • মিষ্টি • বাইক পার্টস • সার্ভিসিং</span>
</header>

<main>
<section className="hero">
<h1>এক জায়গায় সব কেনাকাটা</h1>
<p>খাবার ও মিষ্টি এবং মদিনা বাইক সার্ভিসিং সেন্টার এন্ড বাইক গ্যালারি</p>
</section>

<section className="panel">
<h2>অ্যাকাউন্ট</h2>
{session?<>
<p>{session.user.email}</p>
<button onClick={()=>db.auth.signOut()}>লগআউট</button>
</>:<>
<input placeholder="ইমেইল" value={email} onChange={e=>E(e.target.value)}/>
<input type="password" placeholder="পাসওয়ার্ড" value={password} onChange={e=>P(e.target.value)}/>
<button onClick={login}>লগইন</button>
<button className="alt" onClick={signup}>নতুন অ্যাকাউন্ট</button>
</>}
</section>

{session&&<>
<section className="panel">
<h2>বিক্রেতা নিবন্ধন</h2>
<form onSubmit={apply}>
<input required placeholder="দোকানের নাম" value={shop} onChange={e=>SH(e.target.value)}/>
<input placeholder="মালিকের নাম" value={contact} onChange={e=>C(e.target.value)}/>
<input placeholder="মোবাইল নম্বর" value={phone} onChange={e=>PH(e.target.value)}/>
<button>আবেদন জমা দিন</button>
</form>
</section>

<section className="panel">
<h2>পণ্য জমা দিন</h2>
<form onSubmit={add}>
<input required placeholder="পণ্যের নাম" value={title} onChange={e=>T(e.target.value)}/>
<input required type="number" min="0" placeholder="দাম (টাকা)" value={price} onChange={e=>PP(e.target.value)}/>
<select value={category} onChange={e=>CA(e.target.value)}>
<option>খাবার ও মিষ্টি</option>
<option>বাইক পার্টস</option>
<option>বাইক সার্ভিসিং</option>
<option>অন্যান্য</option>
</select>
<textarea placeholder="বিবরণ" value={desc} onChange={e=>D(e.target.value)}/>
<button>অনুমোদনের জন্য জমা দিন</button>
</form>
</section>
</>}

{admin&&<section className="panel">
<h2>অ্যাডমিন অনুমোদন</h2>
<h3>বিক্রেতা</h3>
{apps.map(x=><article key={x.id}>
{x.shop_name} {x.phone}
<button onClick={()=>review('seller_applications',x.id,'approved')}>অনুমোদন</button>
<button className="red" onClick={()=>review('seller_applications',x.id,'rejected')}>বাতিল</button>
</article>)}
<h3>পণ্য</h3>
{pending.map(x=><article key={x.id}>
{x.title} ৳{x.price}
<button onClick={()=>review('market_products',x.id,'approved')}>অনুমোদন</button>
<button className="red" onClick={()=>review('market_products',x.id,'rejected')}>বাতিল</button>
</article>)}
</section>}

<h2>অনুমোদিত পণ্য</h2>
<div className="products">
{products.map(p=><article className="product" key={p.id}>
<b>{p.title}</b>
<p>{p.category}</p>
<strong>৳{p.price}</strong>
<p>{p.description}</p>
</article>)}
</div>

{msg&&<p className="message">{msg}</p>}
<p className="hint">বাস্তব ব্যবহারের আগে অভিভাবক/প্রকল্প-মালিকের সাহায্যে নিরাপত্তা যাচাই করুন। ছবি, কার্ট, অর্ডার, ডেলিভারি ও পেমেন্ট এখনো যুক্ত হয়নি।</p>
</main>

<footer>© BD BUSINESS</footer>
</>;
}

createRoot(document.getElementById('root')).render(<App/>);
