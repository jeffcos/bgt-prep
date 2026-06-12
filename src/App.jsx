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
import MgrApp from './components/MgrApp';
import { PrintModal, EditEventModal } from './components/modals';

// ─── STAFF APP ───
function StaffApp({events,ops,ING,RECIPES,onGear,userName,userEmail,isOwner,isMgr,onSignOut}){
  const [view,setView]=useState("dashboard");
  const [activeId,setActiveId]=useState(null);
  const [pendingSelections,setPendingSelections]=useState([]);
  const [pendingCalcItems,setPendingCalcItems]=useState([]);
  const [showPrintModal,setShowPrintModal]=useState(false);
  const [showEditModal,setShowEditModal]=useState(false);
  const [printMode,setPrintMode]=useState(null);
  const [showUserMenu,setShowUserMenu]=useState(false);
  const userMenuRef=useRef(null);

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
    <>
      <header className="nav-new glass-panel">
        <Logo onClick={()=>setView("dashboard")}/>
        <nav className="nav-items-new">
          {[
            {v:"dashboard",l:"Dashboard"},
            {v:"calendar",l:"Calendar"},
            ...((view==="sheet"||view==="menu")?[{v:"sheet",l:"Sheet"},{v:"menu",l:"Menu"}]:[]),
            ...((view==="sheet"||view==="menu")?[]:[{v:"past",l:"Past Events"}]),
          ].map(({v,l})=>(
            <button key={v} className={`nav-item-new ${view===v?"on":""}`} onClick={()=>setView(v)}>{l}</button>
          ))}
        </nav>
        <div className="nav-right-new">
          <div className="avatar-menu-wrap" ref={userMenuRef}>
            <div className={`avatar-new${showUserMenu?" avatar-active":""}`} style={{cursor:"pointer"}} onClick={()=>setShowUserMenu(v=>!v)}>
              {userName?userName.trim().split(/\s+/).map(w=>w[0].toUpperCase()).slice(0,2).join(""):"?"}
            </div>
            {showUserMenu&&(
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <div className="user-dropdown-name">{userName||"User"}</div>
                </div>
                {isMgr&&onGear&&(
                  <>
                    <div className="user-dropdown-divider"/>
                    <button className="user-dropdown-item" onClick={()=>{setShowUserMenu(false);onGear();}}>⚙ Admin panel</button>
                  </>
                )}
                <div className="user-dropdown-divider"/>
                <button className="user-dropdown-item user-dropdown-signout" onClick={()=>{setShowUserMenu(false);onSignOut();}}>↪ Sign out</button>
              </div>
            )}
          </div>
        </div>
      </header>

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
        <div className="wiz-layout">
          <aside className="wiz-rail">
            <div className="wiz-eyebrow">New event</div>
            <div className="wiz-heading">Set the <em>basics.</em></div>
            <StepRail current={0}/>
            <div className="wiz-footer">All fields can be edited later from the prep sheet.</div>
          </aside>
          <main className="wiz-main">
            <EventForm onSubmit={handleCreate} onCancel={()=>setView("dashboard")}/>
          </main>
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

      {showPrintModal&&<PrintModal onClose={()=>setShowPrintModal(false)} onPrint={setPrintMode}/>}
      {showEditModal&&active&&(
        <EditEventModal
          event={active}
          onSave={async p=>{await ops.updateEvent(active.id,p,active.name);setShowEditModal(false);}}
          onClose={()=>setShowEditModal(false)}
        />
      )}
    </>
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
    <>
      {showMgr&&isMgr?(
        <MgrApp
          devData={devData} mutDev={mutDev} ING={ING} RECIPES={RECIPES}
          onExit={()=>setShowMgr(false)}
          isOwner={isOwner} events={events} ops={ops}
          onSignOut={()=>signOut(auth)}
          userProfile={userProfile}
          currentUserId={user?.uid||""}
        />
      ):(
        <StaffApp
          events={events} ops={ops} ING={ING} RECIPES={RECIPES}
          onGear={isMgr?()=>setShowMgr(true):null}
          userName={userName} userEmail={userEmail} isOwner={isOwner} isMgr={isMgr}
          onSignOut={()=>signOut(auth)}
        />
      )}
    </>
  );
}
