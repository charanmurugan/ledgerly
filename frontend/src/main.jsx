import React, {useMemo, useState} from "react";
import {createRoot} from "react-dom/client";
import {AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, XAxis, CartesianGrid} from "recharts";
import {LayoutDashboard, ReceiptText, Repeat2, CreditCard, WalletCards, Target, FileText, Tags, Settings, Upload, Plus, Search, Bell, Menu, ChevronDown, ArrowUpRight, ArrowDownRight, MoreHorizontal, CircleDollarSign, Sparkles, Trash2, Check, X, SlidersHorizontal} from "lucide-react";
import "./styles.css";

const starterCategories=["Housing","Groceries","Shopping","Dining","Transportation","Utilities","Subscriptions","Insurance","Health","Entertainment","Income","Needs review","Other"];
const starterAccounts=["Main Checking","Everyday Visa","Rewards Card","Cash"];
const nav=[
  ["Dashboard",LayoutDashboard],["Transactions",ReceiptText],["Recurring",Repeat2],["Subscriptions",CreditCard],
  ["Budgets",WalletCards],["Goals",Target],["Documents",FileText],["Rules",Tags],["Settings",Settings]
];

const emptyData = {
  transactions:[], goals:[], budgets:[], subscriptions:[], recurring:[], rules:[], tags:[],
  categories:starterCategories, accounts:starterAccounts, assets:0, liabilities:0, netWorthConfigured:false,
  period:"all-time"
};

function App(){
  const [page,setPage]=useState("Dashboard");
  const [data,setData]=useState(emptyData);
  const [loading,setLoading]=useState(true);
  React.useEffect(()=>{fetch("/api/transactions").then(r=>r.ok?r.json():[]).then(rows=>{
    setData(d=>({...d,transactions:rows.map(x=>({...x,amount:Number(x.amount)}))}));
  }).catch(()=>{}).finally(()=>setLoading(false))},[]);
  const [mobileMenu,setMobileMenu]=useState(false);
  const [modal,setModal]=useState(null);
  const [toast,setToast]=useState("");
  const [search,setSearch]=useState("");
  const [draft,setDraft]=useState({});

  const notify=(msg)=>{setToast(msg);setTimeout(()=>setToast(""),2200)}
  const save=(next,msg)=>{setData(next); if(msg) notify(msg)}
  const periodLabel={ "all-time":"All time","this-month":"This month","last-month":"Last month","last-3-months":"Last 3 months","last-6-months":"Last 6 months","this-year":"This year"}[data.period];

  const totals=useMemo(()=>{
    const income=data.transactions.filter(t=>t.type==="income").reduce((a,t)=>a+t.amount,0);
    const spending=data.transactions.filter(t=>t.type==="expense").reduce((a,t)=>a+t.amount,0);
    return {income,spending,savings:income?((income-spending)/income)*100:0};
  },[data.transactions]);

  const addTransaction=()=>{
    if(!draft.merchant || !draft.amount){notify("Enter a merchant and amount");return}
    const t={id:crypto.randomUUID(),date:draft.date||new Date().toISOString().slice(0,10),merchant:draft.merchant,amount:Number(draft.amount),type:draft.type||"expense",category:draft.category||"Needs review",account:draft.account||"Main Checking",tags:draft.tags||[]};
    fetch("/api/transactions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)})
      .then(r=>r.ok?r.json():Promise.reject()).then(saved=>{
        save({...data,transactions:[{...saved,amount:Number(saved.amount)},...data.transactions]},"Entry added");
        setModal(null);setDraft({});
      }).catch(()=>notify("Could not save transaction"));
  };

  const filtered=data.transactions.filter(t=>(t.merchant+" "+t.category+" "+(t.tags||[]).join(" ")).toLowerCase().includes(search.toLowerCase()));

  return <div className="app">
    <aside className={"sidebar "+(mobileMenu?"open":"")}>
      <div className="brand"><div className="brandmark"><CircleDollarSign size={21}/></div><span>Ledgerly</span></div>
      <div className="nav">{nav.map(([name,Icon])=><button key={name} className={page===name?"active":""} onClick={()=>{setPage(name);setMobileMenu(false)}}><Icon size={19}/><span>{name}</span></button>)}</div>
      <div className="sidebar-bottom"><div className="privacy"><span className="dot"/> Private workspace</div></div>
    </aside>

    <main>
      <header className="topbar">
        <button className="iconbtn mobile-only" onClick={()=>setMobileMenu(!mobileMenu)}><Menu size={20}/></button>
        <div className="crumb">{page}</div>
        <div className="top-actions">
          <button className="outline" onClick={()=>notify("Drive sync is not connected in this build")}><Repeat2 size={17}/> <span>Drive sync</span></button>
          <button className="outline" onClick={()=>setModal("import")}><Upload size={17}/> <span>Import</span></button>
          <button className="primary" onClick={()=>{setDraft({type:"expense",date:new Date().toISOString().slice(0,10)});setModal("entry")}}><Plus size={17}/> Add entry</button>
          <button className="iconbtn"><Bell size={18}/></button>
          <div className="avatar">CM</div>
        </div>
      </header>

      <section className="content">
        {page==="Dashboard" && <Dashboard data={data} totals={totals} periodLabel={periodLabel} setData={setData} notify={notify}/>}
        {page==="Transactions" && <Transactions data={data} filtered={filtered} search={search} setSearch={setSearch} setData={setData} notify={notify}/>}
        {page==="Recurring" && <Generic title="Recurring payments" icon={Repeat2} description="Confirmed recurring payments and detection suggestions live here." action="Add recurring payment" empty="No recurring payments yet." onAdd={()=>setModal("recurring")}/>}
        {page==="Subscriptions" && <Generic title="Subscriptions" icon={CreditCard} description="Track subscriptions, renewals, and monthly commitments." action="Add subscription" empty="No subscriptions yet." onAdd={()=>setModal("subscription")}/>}
        {page==="Budgets" && <Generic title="Budgets" icon={WalletCards} description="Set category limits and monitor real spending." action="Create budget" empty="No budgets yet. Create your first budget." onAdd={()=>setModal("budget")}/>}
        {page==="Goals" && <Generic title="Goals" icon={Target} description="Track savings targets and progress." action="Create goal" empty="No goals yet. Create your first goal." onAdd={()=>setModal("goal")}/>}
        {page==="Documents" && <Documents notify={notify}/>}
        {page==="Rules" && <Generic title="Rules & tags" icon={Tags} description="Automate future categorization and manage your tags." action="Create rule" empty="No rules yet." onAdd={()=>setModal("rule")}/>}
        {page==="Settings" && <SettingsPage data={data} setData={setData} notify={notify}/>}
      </section>

      <nav className="mobile-nav">{nav.map(([name,Icon])=><button key={name} className={page===name?"active":""} onClick={()=>setPage(name)}><Icon size={18}/><span>{name}</span></button>)}</nav>
      {toast && <div className="toast"><Check size={16}/>{toast}</div>}
      {modal && <Modal type={modal} draft={draft} setDraft={setDraft} close={()=>{setModal(null);setDraft({})}} addTransaction={addTransaction} notify={notify}/>}
    </main>
  </div>
}

function Dashboard({data,totals,periodLabel,setData,notify}){
 const has=data.transactions.length>0;
 const net=data.assets-data.liabilities;
 return <div>
   <div className="pagehead"><div><h1>Good evening</h1><p>Your financial overview, kept simple.</p></div>
     <select value={data.period} onChange={e=>{setData({...data,period:e.target.value});notify("Period saved")}}>{Object.entries({"all-time":"All time","this-month":"This month","last-month":"Last month","last-3-months":"Last 3 months","last-6-months":"Last 6 months","this-year":"This year"}).map(([v,l])=><option value={v} key={v}>{l}</option>)}</select>
   </div>
   <div className="stats">
    <Stat title="Net Worth" value={data.netWorthConfigured?"$"+net.toLocaleString(undefined,{minimumFractionDigits:2}):"Not set"} note={data.netWorthConfigured?"Assets minus liabilities":"Set up your assets & liabilities"} icon={CircleDollarSign} muted={!data.netWorthConfigured}/>
    <Stat title="Income" value={"$"+totals.income.toLocaleString(undefined,{minimumFractionDigits:2})} note={has?"Selected period":"No income yet"} positive/>
    <Stat title="Spending" value={"$"+totals.spending.toLocaleString(undefined,{minimumFractionDigits:2})} note={has?"Selected period":"No spending yet"}/>
    <Stat title="Savings rate" value={totals.savings.toFixed(1)+"%"} note={totals.income?"(Income − spending) ÷ income":"No income yet"} positive/>
   </div>
   <div className="grid2">
    <Card title="Cash flow" subtitle="Monthly income and expenses"><div className="chartbox">{has?<CashChart data={data.transactions}/>:<EmptyChart text="Import or add transactions to see cash flow."/>}</div></Card>
    <Card title="Spending by category" subtitle={periodLabel}><div className="chartbox">{has?<SpendChart data={data.transactions}/>:<EmptyChart text="No spending data yet."/>}</div></Card>
   </div>
   <div className="grid2">
    <Card title="Recent activity" subtitle="Latest saved transactions"><div className="activity">{has?data.transactions.slice(0,5).map(t=><div className="activityrow" key={t.id}><div><b>{t.merchant}</b><small>{t.date} · {t.category}</small></div><strong className={t.type==="income"?"income":""}>{t.type==="income"?"+":"−"}${t.amount.toFixed(2)}</strong></div>):<Empty text="No recent activity yet."/ >}</div></Card>
    <Card title="Ledgerly insight" subtitle="Factual signals from your data"><div className="insight"><Sparkles size={20}/><div><b>{has?`${data.transactions.filter(t=>t.category==="Needs review").length} transactions need review`:"Nothing to analyze yet"}</b><p>{has?"Review uncategorized activity to improve your dashboard.":"Add or import transactions to unlock factual insights."}</p></div></div></Card>
   </div>
 </div>
}
const Stat=({title,value,note,positive,muted})=><div className="stat"><div className="statlabel">{title}</div><div className={"statvalue "+(muted?"muted":"")}>{value}</div><div className="statnote">{note}</div></div>;
const Card=({title,subtitle,children})=><div className="card"><div className="cardhead"><div><h3>{title}</h3><span>{subtitle}</span></div><MoreHorizontal size={19}/></div>{children}</div>;
const Empty=({text})=><div className="empty"><div className="emptyicon"><ReceiptText size={22}/></div><b>{text}</b></div>;
const EmptyChart=({text})=><div className="empty chartempty"><div className="emptyicon"><ArrowUpRight size={20}/></div><b>{text}</b></div>;
function CashChart({data}){const rows=Object.values(data.reduce((a,t)=>{let k=t.date.slice(0,7);a[k]??={month:k,income:0,expense:0};a[k][t.type]+=t.amount;return a},{})).slice(-7);return <ResponsiveContainer width="100%" height="100%"><AreaChart data={rows}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="month"/><Tooltip/><Area type="monotone" dataKey="income" fillOpacity=".12" strokeWidth={2}/><Area type="monotone" dataKey="expense" fillOpacity=".08" strokeWidth={2}/></AreaChart></ResponsiveContainer>}
function SpendChart({data}){const rows=Object.entries(data.filter(t=>t.type==="expense").reduce((a,t)=>(a[t.category]=(a[t.category]||0)+t.amount,a),{})).map(([name,value])=>({name,value}));return <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={rows} dataKey="value" nameKey="name" innerRadius={55} outerRadius={88} paddingAngle={3}>{rows.map((_,i)=><Cell key={i}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer>}

function Transactions({data,filtered,search,setSearch,setData,notify}){
 return <div><div className="pagehead"><div><h1>Transactions</h1><p>Search, review, and categorize your ledger.</p></div><button className="outline"><SlidersHorizontal size={17}/> Filters</button></div>
 <div className="toolbar"><div className="search"><Search size={18}/><input placeholder="Search merchant, category, or tag" value={search} onChange={e=>setSearch(e.target.value)}/></div><span className="resultcount">{filtered.length} transactions</span></div>
 <div className="card tablecard">{filtered.length?<div className="table"><div className="tr th"><span>Date & merchant</span><span>Category</span><span>Account</span><span>Tags</span><span>Amount</span></div>{filtered.map(t=><div className="tr" key={t.id}><span><b>{t.merchant}</b><small>{t.date}</small></span><select value={t.category} onChange={e=>{fetch(`/api/transactions/${t.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...t,category:e.target.value})})
          .then(r=>r.ok?r.json():Promise.reject()).then(saved=>{setData({...data,transactions:data.transactions.map(x=>x.id===t.id?{...saved,amount:Number(saved.amount)}:x)});notify("Category saved")}).catch(()=>notify("Could not save category"))}}>{data.categories.map(c=><option key={c}>{c}</option>)}</select><span>{t.account}</span><span className="pills">{(t.tags||[]).map(x=><i key={x}>{x}</i>)}<button className="tagplus">+</button></span><strong className={t.type==="income"?"income":""}>{t.type==="income"?"+":"−"}${t.amount.toFixed(2)}</strong></div>)}</div>:<Empty text="No transactions yet. Add an entry or import a statement."/ >}</div></div>
}
function Generic({title,icon:Icon,description,action,empty,onAdd}){return <div><div className="pagehead"><div><h1>{title}</h1><p>{description}</p></div><button className="primary" onClick={onAdd}><Plus size={17}/>{action}</button></div><div className="card largeempty"><div className="bigicon"><Icon size={28}/></div><h2>{empty}</h2><p>Ledgerly starts empty—your real data will appear here when you add it.</p><button className="outline" onClick={onAdd}><Plus size={17}/>{action}</button></div></div>}
function Documents({notify}){return <div><div className="pagehead"><div><h1>Documents</h1><p>Keep receipts, statements, invoices, and files organized.</p></div><button className="primary" onClick={()=>notify("Choose a file to import") }><Upload size={17}/> Upload documents</button></div><div className="grid2"><Card title="Upload documents" subtitle="Up to 20 MB per file"><div className="drop"><Upload size={28}/><b>Drop files here</b><span>Receipts, PDFs, images, CSVs and spreadsheets</span><button className="outline">Choose files</button></div></Card><Card title="Google Drive inbox" subtitle="Integration can be connected later"><div className="drivebox"><div className="driveicon">G</div><div><b>Ledgerly Financial Inbox</b><p>Daily sync: 8:00 AM · Not connected</p></div></div></Card></div><div className="card"><div className="cardhead"><div><h3>Document vault</h3><span>Stored documents</span></div></div><Empty text="No documents yet. Upload a file to get started."/></div></div>}
function SettingsPage({data,setData,notify}){const [assets,setAssets]=useState(data.assets),[liab,setLiab]=useState(data.liabilities);return <div><div className="pagehead"><div><h1>Settings</h1><p>Control your financial workspace and preferences.</p></div></div><div className="settingsgrid"><div className="card"><div className="cardhead"><div><h3>Net worth setup</h3><span>Assets minus liabilities</span></div></div><label>Total assets<input type="number" value={assets} onChange={e=>setAssets(e.target.value)}/></label><label>Total liabilities<input type="number" value={liab} onChange={e=>setLiab(e.target.value)}/></label><div className="preview">Preview <b>${(Number(assets||0)-Number(liab||0)).toLocaleString(undefined,{minimumFractionDigits:2})}</b></div><button className="primary" onClick={()=>{setData({...data,assets:Number(assets),liabilities:Number(liab),netWorthConfigured:true});notify("Net worth saved")}}>Save totals</button></div><div className="card"><div className="cardhead"><div><h3>Managed categories</h3><span>{data.categories.length} categories</span></div></div><div className="pills wrap">{data.categories.map(c=><i key={c}>{c}</i>)}</div><button className="outline" onClick={()=>notify("Category management is ready for backend persistence")}>Manage categories</button></div><div className="card"><div className="cardhead"><div><h3>Accounts</h3><span>{data.accounts.length} account definitions</span></div></div><div className="pills wrap">{data.accounts.map(c=><i key={c}>{c}</i>)}</div><button className="outline">Manage accounts</button></div><div className="card danger"><div className="cardhead"><div><h3>Danger zone</h3><span>Remove all Ledgerly data</span></div></div><p>This UI is prepared for the server-side wipe flow specified in the master prompt.</p><button className="dangerbtn" onClick={()=>notify("Connect the server endpoint before using data wipe")}>Erase all Ledgerly data</button></div></div></div>}
function Modal({type,draft,setDraft,close,addTransaction,notify}){const title={entry:"Add entry",import:"Import statement",recurring:"Add recurring payment",subscription:"Add subscription",budget:"Create budget",goal:"Create goal",rule:"Create rule"}[type]||"Ledgerly";return <div className="overlay" onMouseDown={close}><div className="modal" onMouseDown={e=>e.stopPropagation()}><div className="modalhead"><h2>{title}</h2><button className="iconbtn" onClick={close}><X size={19}/></button></div>{type==="entry"?<><div className="seg"><button className={!draft.type||draft.type==="expense"?"sel":""} onClick={()=>setDraft({...draft,type:"expense"})}>Expense</button><button className={draft.type==="income"?"sel":""} onClick={()=>setDraft({...draft,type:"income"})}>Income</button></div><label>Amount<input autoFocus type="number" placeholder="0.00" value={draft.amount||""} onChange={e=>setDraft({...draft,amount:e.target.value})}/></label><label>Merchant or source<input placeholder="Enter merchant" value={draft.merchant||""} onChange={e=>setDraft({...draft,merchant:e.target.value})}/></label><label>Date<input type="date" value={draft.date||""} onChange={e=>setDraft({...draft,date:e.target.value})}/></label><div className="twocol"><label>Category<select value={draft.category||"Needs review"} onChange={e=>setDraft({...draft,category:e.target.value})}>{starterCategories.map(c=><option key={c}>{c}</option>)}</select></label><label>Account<select value={draft.account||starterAccounts[0]} onChange={e=>setDraft({...draft,account:e.target.value})}>{starterAccounts.map(c=><option key={c}>{c}</option>)}</select></label></div><div className="modalactions"><button className="outline" onClick={close}>Cancel</button><button className="primary" onClick={addTransaction}><Check size={17}/>Save entry</button></div></>:type==="import"?<><div className="drop modaldrop"><Upload size={30}/><b>Choose a CSV statement</b><span>Column mapping and duplicate handling are prepared for the full backend.</span><button className="outline" onClick={()=>notify("CSV picker ready for backend integration")}>Choose file</button></div><div className="modalactions"><button className="outline" onClick={close}>Close</button></div></>:<><label>Name<input placeholder="Enter a name" onChange={e=>setDraft({...draft,name:e.target.value})}/></label><label>Amount<input type="number" placeholder="0.00" onChange={e=>setDraft({...draft,amount:e.target.value})}/></label><div className="modalactions"><button className="outline" onClick={close}>Cancel</button><button className="primary" onClick={()=>{notify(`${title} form saved locally in this prototype`);close()}}>Save</button></div></>}</div></div>}
createRoot(document.getElementById("root")).render(<App/>);
