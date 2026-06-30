import React, { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { useAppContext } from "../context/AppContext";
import SidebarIcon from "./SidebarIcon";
import Logo from "./Logo";
import Dashboard from "./Dashboard";
import PrepSheet from "./PrepSheet";
import MenuBuilder from "./MenuBuilder";
import CalendarView from "./CalendarView";
import { EventForm } from "./EventForm";
import StepRail from "./StepRail";
import ReviewScreen from "./ReviewScreen";
import PastEvents from "./PastEvents";
import { RecipeList, RecipeEditor, IngredientManager, GuideView, RecycleBinView } from "../features/manager/index";
import UserManagement from "./UserManagement";
import AuditLog from "./AuditLog";
import { PrintModal, EditEventModal } from "./modals";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { calcPrepList } from "../utils/calc";

export default function StaffApp() {
  const {
    activeEvents: events,
    ops,
    ING,
    RECIPES,
    userName,
    isOwner,
    isMgr,
    devData,
    mutDev,
    currentUserId
  } = useAppContext();

  const [view, setView] = useState("dashboard");
  const [activeId, setActiveId] = useState(null);
  const [pendingSelections, setPendingSelections] = useState([]);
  const [pendingCalcItems, setPendingCalcItems] = useState([]);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [printMode, setPrintMode] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const check = () => setSidebarCollapsed(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (view === "sheet") {
      setSidebarCollapsed(true);
    } else if (view === "dashboard") {
      setSidebarCollapsed(window.innerWidth < 900);
    }
  }, [view]);

  const saveRecipe = (key, recipe) => { mutDev(p => ({ ...p, customRecipes: { ...p.customRecipes, [key]: recipe } })); setEditingRecipe(null); };
  const deleteRecipe = key => { mutDev(p => { const cr = { ...p.customRecipes }; delete cr[key]; return { ...p, customRecipes: cr }; }); };
  const saveIngredient = (name, cfg) => mutDev(p => ({ ...p, customIngredients: { ...p.customIngredients, [name]: cfg } }));
  const updateIngredient = (oldName, newName, cfg) => { mutDev(p => { const ci = { ...p.customIngredients }; if (oldName !== newName) delete ci[oldName]; ci[newName] = cfg; return { ...p, customIngredients: ci }; }); };
  const deleteIngredient = name => { mutDev(p => { const ci = { ...p.customIngredients }; delete ci[name]; return { ...p, customIngredients: ci }; }); };

  useEffect(() => {
    if (!showUserMenu) return;
    const handler = (e) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showUserMenu]);



  const active = events.find(e => e.id === activeId) || null;

  const goToSheet = id => {
    setActiveId(id);
    const ev = events.find(e => e.id === id);
    if (ev?.draft && ev?.menuSelections?.length > 0) {
      const ci = calcPrepList(ev.menuSelections, ING, RECIPES);
      setPendingSelections(ev.menuSelections);
      setPendingCalcItems(ci);
      setView("review");
    } else {
      setView("sheet");
    }
  };

  const handleCreate = async (data) => {
    const ev = await ops.createEvent(data);
    setActiveId(ev.id);
    setTimeout(() => setView("menu"), 50);
  };

  const handleDuplicate = async (id) => {
    const ev = await ops.duplicateEvent(id, events);
    if (ev) { setActiveId(ev.id); setView("sheet"); }
  };

  const handleDelete = async (id) => {
    const ev = events.find(e => e.id === id);
    await ops.deleteEvent(id, ev?.name);
    setView("dashboard");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden print:block print:h-auto print:overflow-visible">
      <aside className={`print:hidden ${sidebarCollapsed ? 'w-[60px]' : 'w-[220px]'} bg-surface-sidebar border-r border-bd flex flex-col py-6 shrink-0 z-[100] backdrop-blur-md transition-all duration-300 overflow-visible relative`}>
        <button
          className="absolute -right-3 top-6 z-[101] w-6 h-6 rounded-full bg-white border border-bd shadow-sm flex items-center justify-center text-carbon-200 hover:bg-carbon-08 transition-colors text-xs"
          onClick={() => setSidebarCollapsed(v => !v)}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? '›' : '‹'}
        </button>
        <div className={`mb-10 flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-4'}`}>
          {!sidebarCollapsed && <Logo onClick={() => setView("dashboard")} />}
        </div>
        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto no-scrollbar px-2">
          {(() => {
            const sidebarItems = [];
            sidebarItems.push({ type: "header", l: "Operations" });
            sidebarItems.push({ v: "dashboard", l: "Dashboard", icon: "dashboard" });
            sidebarItems.push({ v: "calendar", l: "Calendar", icon: "calendar" });
            if (view === "sheet" || view === "menu" || view === "review") {
              sidebarItems.push({ v: "sheet", l: "Prep Sheet", icon: "sheet" });
              sidebarItems.push({ v: "menu", l: "Menu Builder", icon: "menu" });
            } else {
              sidebarItems.push({ v: "past", l: "Past Events", icon: "past" });
            }
            if (isMgr) {
              sidebarItems.push({ type: "header", l: "Database" });
              sidebarItems.push({ v: "recipes", l: "Recipes", icon: "recipes" });
              sidebarItems.push({ v: "ingredients", l: "Ingredients", icon: "ingredients" });
              sidebarItems.push({ v: "guide", l: "Guide", icon: "guide" });
              if (isOwner) {
                sidebarItems.push({ type: "header", l: "Admin" });
                sidebarItems.push({ v: "team", l: "Team", icon: "team" });
                sidebarItems.push({ v: "audit", l: "Audit Log", icon: "audit" });
                sidebarItems.push({ v: "recycle", l: "Recycle Bin", icon: "recycle" });
              }
            }
            return sidebarItems.map((item, idx) => {
              if (item.type === "header") {
                if (sidebarCollapsed) return <div key={`hdr-${idx}`} className="h-px bg-bd mx-1 my-2 opacity-50" />;
                return (
                  <div key={`hdr-${idx}`} className="text-[9px] font-extrabold text-muted uppercase tracking-[.12em] mx-1 mt-4 mb-1.5 opacity-80">
                    {item.l}
                  </div>
                );
              }
              const { v, l, icon, stub } = item;
              return (
                <button
                  key={v}
                  title={sidebarCollapsed ? l : undefined}
                  className={`border-none py-3 rounded-xl text-[14px] font-bold cursor-pointer transition-all duration-200 flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'px-3 text-left'} ${view === v ? "bg-[#B45F43] text-white shadow-custom" : "bg-transparent text-carbon-200 hover:bg-black/5 hover:text-carbon-300"}`}
                  style={{ opacity: stub ? 0.5 : 1 }}
                  onClick={() => { if (!stub) { setEditingRecipe(null); setView(v); } }}
                >
                  <span className={`${sidebarCollapsed ? '' : 'mr-3.5'} w-5 h-5 inline-flex items-center justify-center shrink-0`}><SidebarIcon name={icon} /></span>
                  {!sidebarCollapsed && l}
                </button>
              );
            });
          })()}
        </nav>
        <div className={`mt-auto pt-4 border-t border-bd ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
          {sidebarCollapsed ? (
            <div className="flex justify-center">
              <div
                className="w-8 h-8 rounded-full bg-carbon-300 text-white flex items-center justify-center cursor-pointer text-[12px] font-bold"
                title={userName || "User"}
                onClick={() => setShowUserMenu(v => !v)}
              >
                {userName ? userName.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join("") : "?"}
              </div>
            </div>
          ) : (
            <div className="w-full relative" ref={userMenuRef}>
              <div className={`cursor-pointer w-full rounded-xl flex items-center justify-start py-2 px-3 transition-colors ${showUserMenu ? "bg-black/10" : "bg-transparent"}`} onClick={() => setShowUserMenu(v => !v)}>
                <div className="w-8 h-8 rounded-full bg-carbon-300 text-white flex items-center justify-center mr-2.5 shrink-0">
                  {userName ? userName.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join("") : "?"}
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <div className="text-[13px] font-bold text-carbon-300 whitespace-nowrap overflow-hidden text-ellipsis">{userName || "User"}</div>
                  <div className="text-[11px] text-carbon-50 whitespace-nowrap overflow-hidden text-ellipsis">{isOwner ? "Admin" : isMgr ? "Manager" : "Staff"}</div>
                </div>
                <div className="text-carbon-50">⋮</div>
              </div>
              {showUserMenu && (
                <div className="absolute bottom-full mb-2 left-0 w-full bg-white border border-[#D4CCC2] rounded-xl z-[9999] shadow-lg min-w-[160px] overflow-hidden">
                  <div className="py-2.5 px-3.5">
                    <div className="font-semibold text-txt text-[13px]">{userName || "User"}</div>
                  </div>
                  <div className="h-px bg-bd my-1" />
                  <button className="flex items-center gap-2 w-full py-2.5 px-3.5 text-[13px] font-medium text-red hover:bg-red-bg transition-colors" onClick={() => { setShowUserMenu(false); signOut(auth); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-transparent print:overflow-visible">

        {view === "dashboard" && (
          <Dashboard
            events={events} userName={userName} isOwner={isOwner}
            compact={sidebarCollapsed}
            onSelect={goToSheet}
            onNew={() => setView("create")}
            onDuplicate={handleDuplicate}
            onArchive={id => ops.archiveEvent(id, events)}
            onPrint={id => { setActiveId(id); setView("sheet"); setTimeout(() => setShowPrintModal(true), 100); }}
            onDelete={id => { if (events.find(e => e.id === id)) handleDelete(id); }}
          />
        )}

        {view === "create" && (
          <div className="max-w-[800px] mx-auto py-12 px-6">
            <StepRail current={0} />
            <EventForm onSubmit={handleCreate} onCancel={() => setView("dashboard")} />
          </div>
        )}

        {view === "menu" && active && (
          <MenuBuilder event={active} RECIPES={RECIPES} ING={ING}
            onApply={(sel, items) => { setPendingSelections(sel); setPendingCalcItems(items); setView("review"); }}
            onSkip={() => setView("sheet")}
            onBack={() => setView("create")}
          />
        )}

        {view === "review" && active && (
          <ReviewScreen
            event={active} selections={pendingSelections} calcItems={pendingCalcItems}
            ING={ING} RECIPES={RECIPES}
            onGenerate={async () => { await ops.applyMenu(active.id, pendingSelections, pendingCalcItems, events); await ops.updateEvent(active.id, { draft: false }, active.name); setView("sheet"); }}
            onSaveDraft={async () => { await ops.updateEvent(active.id, { draft: true }, active.name); setView("dashboard"); }}
            onEditDetails={() => setView("create")}
            onEditMenu={() => setView("menu")}
            onCancel={() => setView("dashboard")}
          />
        )}

        {view === "sheet" && active && (
          <PrepSheet event={active} ING={ING} RECIPES={RECIPES}
            onUpdate={p => ops.updateEvent(active.id, p, active.name)}
            onUpdateItem={(iid, p) => ops.updateItem(active.id, iid, p, events)}
            onRemoveItem={iid => ops.removeItem(active.id, iid, events)}
            onAddItems={items => ops.addItems(active.id, items, events)}
            onEdit={() => setShowEditModal(true)}
            onEditMenu={() => setView("menu")}
            onPrint={() => setShowPrintModal(true)}
            onDelete={() => { if (confirm("Delete this event?")) handleDelete(active.id); }}
            printMode={printMode}
          />
        )}

        {view === "past" && (
          <div className="max-w-[1200px] mx-auto py-6 px-5">
            <PastEvents
              onSelect={goToSheet}
              onDuplicate={handleDuplicate}
            />
          </div>
        )}

        {view === "calendar" && (
          <CalendarView
            events={events}
            onSelect={goToSheet}
          />
        )}

        {view === "recipes" && (
          <div className="max-w-none w-full mx-auto py-6 px-5">
            {editingRecipe ?
              <RecipeEditor recipeKey={editingRecipe === "new" ? null : editingRecipe} recipe={editingRecipe === "new" ? null : RECIPES[editingRecipe]} ING={ING} onSave={saveRecipe} onDelete={isOwner && editingRecipe !== "new" ? () => { deleteRecipe(editingRecipe); setEditingRecipe(null); } : null} onCancel={() => setEditingRecipe(null)} isOwner={isOwner} events={events} /> :
              <RecipeList RECIPES={RECIPES} customKeys={Object.keys(devData.customRecipes)} onEdit={setEditingRecipe} onNew={() => setEditingRecipe("new")} onDelete={key => { deleteRecipe(key); setEditingRecipe(null); }} isOwner={isOwner} events={events} />
            }
          </div>
        )}

        {view === "ingredients" && (
          <div className="max-w-none w-full mx-auto py-6 px-5">
            <IngredientManager ING={ING} customKeys={Object.keys(devData.customIngredients || {})} onSave={saveIngredient} onUpdate={updateIngredient} onDelete={deleteIngredient} isOwner={isOwner} RECIPES={RECIPES} />
          </div>
        )}

        {view === "guide" && (
          <div className="max-w-[1200px] mx-auto py-6 px-5">
            <GuideView />
          </div>
        )}

        {view === "team" && isOwner && (
          <div className="max-w-none w-full mx-auto py-6 px-5">
            <UserManagement currentUserId={currentUserId} />
          </div>
        )}

        {view === "audit" && isOwner && (
          <div className="max-w-none w-full mx-auto py-6 px-5">
            <AuditLog />
          </div>
        )}

        {view === "recycle" && isOwner && (
          <div className="max-w-none w-full mx-auto py-6 px-5">
            <RecycleBinView />
          </div>
        )}

        {showPrintModal && <PrintModal onClose={() => setShowPrintModal(false)} onPrint={(mode) => {
          flushSync(() => {
            setPrintMode(mode);
            setShowPrintModal(false);
          });
          setTimeout(() => {
            window.print();
            setPrintMode(null);
          }, 10); // Small timeout to let browser layout the display:block
        }} />}
        {showEditModal && active && (
          <EditEventModal
            event={active}
            onSave={async p => { await ops.updateEvent(active.id, p, active.name); setShowEditModal(false); }}
            onClose={() => setShowEditModal(false)}
          />
        )}
      </main>
    </div>
  );
}
