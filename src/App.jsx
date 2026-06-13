import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import './index.css';

import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, collection, onSnapshot, updateDoc, getDocs, deleteDoc, addDoc } from "firebase/firestore";
import { auth, db } from './firebase';

import { BASE_ING } from './data/ingredients';
import { BASE_RECIPES } from './data/recipes';
import { calcPrepList, uid } from './utils/calc';

import Logo from './components/Logo';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import PrepSheet from './components/PrepSheet';
import MenuBuilder from './components/MenuBuilder';
import CalendarView from './components/CalendarView';
import { EventForm } from './components/EventForm';
import StepRail from './components/StepRail';
import ReviewScreen from './components/ReviewScreen';
import PastEvents from './components/PastEvents';
import { RecipeList, RecipeEditor, IngredientManager, GuideView, RecycleBinView } from './components/MgrApp';
import UserManagement from './components/UserManagement';
import AuditLog from './components/AuditLog';
import { PrintModal, EditEventModal } from './components/modals';

// ─── STAFF APP ───
function StaffApp({events,ops,ING,RECIPES,userName,userEmail,isOwner,isMgr,onSignOut,devData,mutDev,userProfile,currentUserId}){
  const [view,setView]=useState("dashboard");
  const [activeId,setActiveId]=useState(null);
  const [pendingSelections,setPendingSelections]=useState([]);
  const [pendingCalcItems,setPendingCalcItems]=useState([]);
  const [showPrintModal,setShowPrintModal]=useState(false);
  const [showEditModal,setShowEditModal]=useState(false);
  const [printMode,setPrintMode]=useState(null);
  const [showUserMenu,setShowUserMenu]=useState(false);
  const [editingRecipe,setEditingRecipe]=useState(null);
  const userMenuRef=useRef(null);

  const saveRecipe=(key,recipe)=>{mutDev(p=>({...p,customRecipes:{...p.customRecipes,[key]:recipe}}));setEditingRecipe(null);};
  const deleteRecipe=key=>{mutDev(p=>{const cr={...p.customRecipes};delete cr[key];return{...p,customRecipes:cr};}); };
  const saveIngredient=(name,cfg)=>mutDev(p=>({...p,customIngredients:{...p.customIngredients,[name]:cfg}}));
  const updateIngredient=(oldName,newName,cfg)=>{mutDev(p=>{const ci={...p.customIngredients};if(oldName!==newName)delete ci[oldName];ci[newName]=cfg;return{...p,customIngredients:ci};});};
  const deleteIngredient=name=>{mutDev(p=>{const ci={...p.customIngredients};delete ci[name];return{...p,customIngredients:ci};});};

  useEffect(()=>{
    if(!showUserMenu)return;
    const handler=(e)=>{if(userMenuRef.current&&!userMenuRef.current.contains(e.target))setShowUserMenu(false);};
    document.addEventListener("mousedown",handler);
    return()=>document.removeEventListener("mousedown",handler);
  },[showUserMenu]);

  useEffect(()=>{
    if(!printMode)return;
    document.documentElement.setAttribute("data-pmode",printMode);
    const t=setTimeout(()=>{window.print();document.documentElement.removeAttribute("data-pmode");setPrintMode(null);},150);
    return()=>clearTimeout(t);
  },[printMode]);

  // Keep a ref so the interval always sees the latest events without resetting
  const eventsRef=useRef(events);
  useEffect(()=>{eventsRef.current=events;},[events]);

  useEffect(()=>{
    const run=()=>ops.autoArchive(eventsRef.current);
    run();
    const interval=setInterval(run,5*60*1000);
    return()=>clearInterval(interval);
  },[]);

  const active=events.find(e=>e.id===activeId)||null;

  const goToSheet=id=>{
    setActiveId(id);
    const ev=events.find(e=>e.id===id);
    if(ev?.draft&&ev?.menuSelections?.length>0){
      const ci=calcPrepList(ev.menuSelections,ING,RECIPES);
      setPendingSelections(ev.menuSelections);
      setPendingCalcItems(ci);
      setView("review");
    } else {
      setView("sheet");
    }
  };

  const handleCreate=async(data)=>{
    const ev=await ops.createEvent(data);
    setActiveId(ev.id);
    setTimeout(()=>setView("menu"),50);
  };

  const handleDuplicate=async(id)=>{
    const ev=await ops.duplicateEvent(id,events);
    if(ev){setActiveId(ev.id);setView("sheet");}
  };

  const handleDelete=async(id)=>{
    const ev=events.find(e=>e.id===id);
    await ops.deleteEvent(id,ev?.name);
    setView("dashboard");
  };

  return(
    <div className="app-layout">
      <aside className="app-sidebar glass-panel">
        <div className="sidebar-logo">
          <Logo onClick={()=>setView("dashboard")}/>
        </div>
        <nav className="sidebar-nav">
          {(() => {
            const sidebarItems = [];
            sidebarItems.push({ type: "header", l: "Operations" });
            sidebarItems.push({ v: "dashboard", l: "Dashboard", icon: "❖" });
            sidebarItems.push({ v: "calendar", l: "Calendar", icon: "📅" });
            if (view === "sheet" || view === "menu" || view === "review") {
              sidebarItems.push({ v: "sheet", l: "Prep Sheet", icon: "📋" });
              sidebarItems.push({ v: "menu", l: "Menu Builder", icon: "🍴" });
            } else {
              sidebarItems.push({ v: "past", l: "Past Events", icon: "📁" });
            }
            if (isMgr) {
              sidebarItems.push({ type: "header", l: "Database" });
              sidebarItems.push({ v: "recipes", l: "Recipes", icon: "📖" });
              sidebarItems.push({ v: "ingredients", l: "Ingredients", icon: "🧂" });
              sidebarItems.push({ v: "guide", l: "Guide", icon: "📘" });
              if (isOwner) {
                sidebarItems.push({ type: "header", l: "Admin" });
                sidebarItems.push({ v: "team", l: "Team", icon: "👥" });
                sidebarItems.push({ v: "audit", l: "Audit Log", icon: "📜" });
                sidebarItems.push({ v: "recycle", l: "Recycle Bin", icon: "🗑️" });
              }
            }
            return sidebarItems.map((item, idx) => {
              if (item.type === "header") {
                return (
                  <div key={`hdr-${idx}`} className="sidebar-section-header">
                    {item.l}
                  </div>
                );
              }
              const { v, l, icon, stub } = item;
              return (
                <button key={v} className={`sidebar-nav-item ${view===v?"on":""}`} style={{opacity:stub?0.5:1}} onClick={()=>{if(!stub) { setEditingRecipe(null); setView(v); }}}>
                  <span style={{marginRight:12,fontSize:16,width:20,textAlign:"center"}}>{icon}</span> {l}
                </button>
              );
            });
          })()}
        </nav>
        <div className="sidebar-footer">
          <div className="avatar-menu-wrap" ref={userMenuRef} style={{width:"100%"}}>
            <div className={`avatar-new${showUserMenu?" avatar-active":""}`} style={{cursor:"pointer",width:"100%",borderRadius:12,justifyContent:"flex-start",padding:"8px 12px",background:showUserMenu?"rgba(0,0,0,.08)":"transparent"}} onClick={()=>setShowUserMenu(v=>!v)}>
              <div style={{width:32,height:32,borderRadius:99,background:"var(--carbon-300)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",marginRight:10,flexShrink:0}}>
                {userName?userName.trim().split(/\s+/).map(w=>w[0].toUpperCase()).slice(0,2).join(""):"?"}
              </div>
              <div style={{flex:1,textAlign:"left",overflow:"hidden"}}>
                <div style={{fontSize:13,fontWeight:700,color:"var(--carbon-300)",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{userName||"User"}</div>
                <div style={{fontSize:11,color:"var(--carbon-50)",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{isMgr?"Manager":"Staff"}</div>
              </div>
              <div style={{color:"var(--carbon-50)"}}>⋮</div>
            </div>
            {showUserMenu&&(
              <div className="user-dropdown" style={{bottom:"100%",top:"auto",marginBottom:8,left:0,width:"100%"}}>
                <div className="user-dropdown-header">
                  <div className="user-dropdown-name">{userName||"User"}</div>
                </div>

                <div className="user-dropdown-divider"/>
                <button className="user-dropdown-item user-dropdown-signout" onClick={()=>{setShowUserMenu(false);onSignOut();}}>↪ Sign out</button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="app-main">

      {view==="dashboard"&&(
        <Dashboard
          events={events} userName={userName} isOwner={isOwner}
          onSelect={goToSheet}
          onNew={()=>setView("create")}
          onDuplicate={handleDuplicate}
          onArchive={id=>ops.archiveEvent(id,events)}
          onPrint={id=>{setActiveId(id);setView("sheet");setTimeout(()=>setShowPrintModal(true),100);}}
          onDelete={id=>{if(events.find(e=>e.id===id))handleDelete(id);}}
        />
      )}

      {view==="create"&&(
        <div className="wiz-layout-single">
          <StepRail current={0}/>
          <EventForm onSubmit={handleCreate} onCancel={()=>setView("dashboard")}/>
        </div>
      )}

      {view==="menu"&&active&&(
        <MenuBuilder event={active} RECIPES={RECIPES} ING={ING}
          onApply={(sel,items)=>{setPendingSelections(sel);setPendingCalcItems(items);setView("review");}}
          onSkip={()=>setView("sheet")}
          onBack={()=>setView("create")}
        />
      )}

      {view==="review"&&active&&(
        <ReviewScreen
          event={active} selections={pendingSelections} calcItems={pendingCalcItems}
          ING={ING} RECIPES={RECIPES}
          onGenerate={async()=>{await ops.applyMenu(active.id,pendingSelections,pendingCalcItems,events);await ops.updateEvent(active.id,{draft:false},active.name);setView("sheet");}}
          onSaveDraft={async()=>{await ops.updateEvent(active.id,{draft:true},active.name);setView("dashboard");}}
          onEditDetails={()=>setView("create")}
          onEditMenu={()=>setView("menu")}
          onCancel={()=>setView("dashboard")}
        />
      )}

      {view==="sheet"&&active&&(
        <PrepSheet event={active} ING={ING} RECIPES={RECIPES}
          onUpdate={p=>ops.updateEvent(active.id,p,active.name)}
          onUpdateItem={(iid,p)=>ops.updateItem(active.id,iid,p,events)}
          onRemoveItem={iid=>ops.removeItem(active.id,iid,events)}
          onAddItems={items=>ops.addItems(active.id,items,events)}
          onEdit={()=>setShowEditModal(true)}
          onEditMenu={()=>setView("menu")}
          onPrint={()=>setShowPrintModal(true)}
          onDelete={()=>{if(confirm("Delete this event?"))handleDelete(active.id);}}
          printMode={printMode}
        />
      )}

      {view==="past"&&(
        <div className="wrap">
          <PastEvents
            events={events.filter(ev=>ev.archived&&!ev.deleted)}
            onSelect={goToSheet}
            onDuplicate={handleDuplicate}
            onRestore={id=>ops.archiveEvent(id,events)}
          />
        </div>
      )}

      {view==="calendar"&&(
        <CalendarView
          events={events.filter(ev=>!ev.archived&&!ev.deleted)}
          onSelect={goToSheet}
        />
      )}

      {view==="recipes"&&(
        <div className="wrap" style={{maxWidth:"none",width:"100%"}}>
          {editingRecipe?
            <RecipeEditor recipeKey={editingRecipe==="new"?null:editingRecipe} recipe={editingRecipe==="new"?null:RECIPES[editingRecipe]} ING={ING} onSave={saveRecipe} onDelete={isOwner&&editingRecipe!=="new"?()=>{deleteRecipe(editingRecipe);setEditingRecipe(null);}:null} onCancel={()=>setEditingRecipe(null)} isOwner={isOwner} events={events}/>:
            <RecipeList RECIPES={RECIPES} customKeys={Object.keys(devData.customRecipes)} onEdit={setEditingRecipe} onNew={()=>setEditingRecipe("new")} onDelete={key=>{deleteRecipe(key);setEditingRecipe(null);}} isOwner={isOwner} events={events}/>
          }
        </div>
      )}

      {view==="ingredients"&&(
        <div className="wrap" style={{maxWidth:"none",width:"100%"}}>
          <IngredientManager ING={ING} customKeys={Object.keys(devData.customIngredients||{})} onSave={saveIngredient} onUpdate={updateIngredient} onDelete={deleteIngredient} isOwner={isOwner} RECIPES={RECIPES}/>
        </div>
      )}

      {view==="guide"&&(
        <div className="wrap">
          <GuideView/>
        </div>
      )}

      {view==="team"&&isOwner&&(
        <div className="wrap" style={{maxWidth:"none",width:"100%"}}>
          <UserManagement currentUserId={currentUserId}/>
        </div>
      )}

      {view==="audit"&&isOwner&&(
        <div className="wrap" style={{maxWidth:"none",width:"100%"}}>
          <AuditLog/>
        </div>
      )}

      {view==="recycle"&&isOwner&&(
        <div className="wrap" style={{maxWidth:"none",width:"100%"}}>
          <RecycleBinView events={events} ops={ops}/>
        </div>
      )}

      {showPrintModal&&<PrintModal onClose={()=>setShowPrintModal(false)} onPrint={setPrintMode}/>}
      {showEditModal&&active&&(
        <EditEventModal
          event={active}
          onSave={async p=>{await ops.updateEvent(active.id,p,active.name);setShowEditModal(false);}}
          onClose={()=>setShowEditModal(false)}
        />
      )}
      </main>
    </div>
  );
}

// ─── FIRESTORE EVENT OPERATIONS ───
const AUDIT_FIELD_LABELS={name:"Event name",date:"Date",guests:"Guests",truck:"Truck",startTime:"Start time",orderReadyBy:"Order ready by",loadBy:"Load by",loadDriver:"Load driver",returnsDriver:"Returns driver",notes:"Notes",postNotes:"Post-event notes"};
const AUDIT_ITEM_LABELS={quantity:"Qty",unit:"Unit",container:"Container",notes:"Notes",prepped:"Prepped",loaded:"Loaded",returned:"Returned",variation:"Variation"};

function makeOps(db,getUser){
  const log=async(eventId,eventName,action,detail)=>{
    try{
      const u=getUser()||{};
      await addDoc(collection(db,"auditLogs"),{eventId,eventName,action,detail,userId:u.uid||"",userName:u.name||"Unknown",timestamp:new Date().toISOString()});
    }catch(e){}
  };

  const createEvent=async(data)=>{
    const id=uid();
    const u=getUser()||{};
    const ev={id,...data,items:[],menuSelections:[],createdAt:new Date().toISOString(),createdBy:{uid:u.uid||"",name:u.name||"Unknown"}};
    await setDoc(doc(db,"events",id),ev);
    log(id,data.name||"","event_created","Created event");
    return ev;
  };

  const updateEvent=async(id,patch,eventName)=>{
    await updateDoc(doc(db,"events",id),patch);
    const loggable=Object.entries(patch).filter(([k])=>AUDIT_FIELD_LABELS[k]);
    if(loggable.length){
      const detail=loggable.map(([k,v])=>`${AUDIT_FIELD_LABELS[k]}: ${v}`).join("; ");
      log(id,eventName||"","event_updated",detail);
    } else if(patch.draft===false){
      log(id,eventName||"","event_updated","Finalized prep sheet");
    }
  };

  const deleteEvent=async(id,eventName)=>{
    await updateDoc(doc(db,"events",id),{deleted:true,deletedAt:new Date().toISOString()});
    log(id,eventName||"","event_deleted","Deleted event");
  };

  const archiveEvent=async(id,events)=>{
    const ev=events.find(e=>e.id===id);
    if(!ev)return;
    await updateDoc(doc(db,"events",id),{archived:!ev.archived});
    log(id,ev.name,"event_archived",ev.archived?"Restored event":"Archived event");
  };

  const duplicateEvent=async(id,events)=>{
    const src=events.find(e=>e.id===id);if(!src)return null;
    const newId=uid();
    const u=getUser()||{};
    const ev={...src,id:newId,name:`${src.name} (Copy)`,createdAt:new Date().toISOString(),createdBy:{uid:u.uid||"",name:u.name||"Unknown"},archived:false,
      items:src.items.map(i=>({...i,id:uid(),prepped:"",loaded:"",returned:""}))};
    await setDoc(doc(db,"events",newId),ev);
    log(newId,ev.name,"event_duplicated",`Duplicated from "${src.name}"`);
    return ev;
  };

  const updateItem=async(evId,iid,patch,events)=>{
    const ev=events.find(e=>e.id===evId);if(!ev)return;
    const item=ev.items.find(i=>i.id===iid);
    const items=ev.items.map(i=>i.id===iid?{...i,...patch}:i);
    await updateDoc(doc(db,"events",evId),{items,updatedAt:new Date().toISOString()});
    if(item){
      const changed=Object.entries(patch).filter(([k,v])=>AUDIT_ITEM_LABELS[k]&&String(v||"")!==String(item[k]||""));
      if(changed.length){
        const detail=`${item.name}: `+changed.map(([k,v])=>`${AUDIT_ITEM_LABELS[k]} → ${v||"(cleared)"}`).join(", ");
        log(evId,ev.name,"item_updated",detail);
      }
    }
  };

  const removeItem=async(evId,iid,events)=>{
    const ev=events.find(e=>e.id===evId);if(!ev)return;
    const item=ev.items.find(i=>i.id===iid);
    const items=ev.items.filter(i=>i.id!==iid);
    await updateDoc(doc(db,"events",evId),{items});
    if(item)log(evId,ev.name,"item_removed",`Removed item: ${item.name}`);
  };

  const addItems=async(evId,newItems,events)=>{
    const ev=events.find(e=>e.id===evId);if(!ev)return;
    const existing=new Set(ev.items.map(i=>i.name.toLowerCase()));
    const toAdd=newItems.filter(i=>!existing.has(i.name.toLowerCase()));
    const items=[...ev.items,...toAdd];
    await updateDoc(doc(db,"events",evId),{items});
    if(toAdd.length)log(evId,ev.name,"item_added",`Added ${toAdd.length} item${toAdd.length!==1?"s":""}: ${toAdd.map(i=>i.name).join(", ")}`);
  };

  const applyMenu=async(evId,sel,calcItems,events)=>{
    const ev=events.find(e=>e.id===evId);if(!ev)return;
    const existing=ev.items.filter(i=>!i.fromMenu);
    const ingNotesMap={};
    sel.forEach(({key,qty,ingNotes:din})=>{
      if(!din||!qty)return;
      Object.entries(din).forEach(([ingName,note])=>{
        if(!note?.trim())return;
        if(!ingNotesMap[ingName])ingNotesMap[ingName]=[];
        if(!ingNotesMap[ingName].includes(note))ingNotesMap[ingName].push(note);
      });
    });
    const calc=calcItems.map(ci=>({
      id:uid(),...ci,
      quantity:String(ci.calculatedQty),fromMenu:true,calcQty:ci.calculatedQty,
      prepped:"",loaded:"",returned:"",qtyUsed:"",
      notes:[ci.notes,...(ingNotesMap[ci.name]||[])].filter(Boolean).join(" · "),
      variation:""
    }));
    await updateDoc(doc(db,"events",evId),{menuSelections:sel,items:[...existing,...calc]});
    log(evId,ev.name,"menu_applied",`Applied menu (${calc.length} items)`);
  };

  const autoArchive=async(events)=>{
    const now=new Date();
    const toArchive=events.filter(ev=>{
      if(ev.archived||!ev.date)return false;
      const evDate=new Date(`${ev.date}T${ev.startTime||"23:59"}`);
      return(now-evDate)/(1000*60*60)>=36;
    });
    await Promise.all(toArchive.map(ev=>updateDoc(doc(db,"events",ev.id),{archived:true})));
  };

  const purgeEvent=async(id)=>{
    await deleteDoc(doc(db,"events",id));
  };

  return{createEvent,updateEvent,deleteEvent,archiveEvent,duplicateEvent,updateItem,removeItem,addItems,applyMenu,autoArchive,purgeEvent};
}

// ─── APP ROOT ───
export default function App(){
  const [user,setUser]=useState(undefined);
  const [userProfile,setUserProfile]=useState(null);
  const [showMgr,setShowMgr]=useState(false);
  const [devData,setDevData]=useState({customRecipes:{},customIngredients:{}});
  const [events,setEvents]=useState([]);
  const userRef=useRef(null);
  useEffect(()=>{userRef.current={uid:user?.uid||"",name:userProfile?.name||""};},[user,userProfile]);
  const ops=useMemo(()=>makeOps(db,()=>userRef.current),[]);

  // Firebase Auth listener
  useEffect(()=>{
    const unsub=onAuthStateChanged(auth,async fbUser=>{
      if(fbUser){
        setUser(fbUser);
        const snap=await getDoc(doc(db,"users",fbUser.uid));
        if(snap.exists()){
          setUserProfile(snap.data());
        } else {
          const profile={name:fbUser.email,email:fbUser.email,role:"staff"};
          await setDoc(doc(db,"users",fbUser.uid),profile);
          setUserProfile(profile);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setEvents([]);
      }
    });
    return unsub;
  },[]);

  // Firestore real-time events listener
  useEffect(()=>{
    if(!user)return;
    const unsub=onSnapshot(collection(db,"events"),snap=>{
      setEvents(snap.docs.map(d=>d.data()));
    });
    return unsub;
  },[user]);

  // One-time migration: localStorage → Firestore
  useEffect(()=>{
    if(!user)return;
    const migrate=async()=>{
      try{
        const stored=localStorage.getItem("bgt_events");
        if(!stored)return;
        const localEvs=JSON.parse(stored);
        if(!localEvs.length)return;
        const snap=await getDocs(collection(db,"events"));
        if(!snap.empty)return; // Firestore already has data
        await Promise.all(localEvs.map(ev=>setDoc(doc(db,"events",ev.id),ev)));
        localStorage.removeItem("bgt_events");
        console.log(`Migrated ${localEvs.length} events to Firestore`);
      }catch(e){console.error("Migration error",e);}
    };
    migrate();
  },[user]);

  // Config (custom recipes/ingredients) — real-time from Firestore
  useEffect(()=>{
    if(!user)return;
    const unsub=onSnapshot(doc(db,"config","restaurantData"),snap=>{
      if(snap.exists()){
        setDevData(snap.data());
      } else {
        setDoc(doc(db,"config","restaurantData"),{customRecipes:{},customIngredients:{}});
      }
    });
    return unsub;
  },[user]);

  const mutDev=useCallback(fn=>{
    setDevData(prev=>{
      const next=fn(prev);
      setDoc(doc(db,"config","restaurantData"),next,{merge:true}).catch(console.error);
      return next;
    });
  },[]);

  const ING=useMemo(()=>({...BASE_ING,...(devData.customIngredients||{})}),[devData]);
  const RECIPES=useMemo(()=>({...BASE_RECIPES,...(devData.customRecipes||{})}),[devData]);

  const role=userProfile?.role||"staff";
  const isOwner=role==="owner";
  const isMgr=role==="manager"||role==="owner";
  const userName=userProfile?.name||"";
  const userEmail=userProfile?.email||user?.email||"";

  if(user===undefined){
    return<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",color:"var(--carbon-50)",background:"var(--surface-sidebar)"}}>Loading…</div>;
  }

  if(!user)return<LoginScreen/>;

  return(
    <StaffApp
      events={events} ops={ops} ING={ING} RECIPES={RECIPES}
      userName={userName} userEmail={userEmail} isOwner={isOwner} isMgr={isMgr}
      onSignOut={()=>signOut(auth)}
      devData={devData} mutDev={mutDev}
      userProfile={userProfile}
      currentUserId={user?.uid||""}
    />
  );
}
