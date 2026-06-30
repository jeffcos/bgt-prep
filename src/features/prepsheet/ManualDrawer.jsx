import React, { useState, useMemo } from "react";
import { GROUPS, GROUP_ORDER } from "../../data/constants";
import { uid } from "../../utils/calc";

export function DItem({ item, gkey, checked, already, onToggle }) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl transition-colors hover:bg-black/5" onClick={already ? undefined : onToggle} style={{ opacity: already ? .45 : 1, cursor: already ? "default" : "pointer" }}>
      <input type="checkbox" checked={checked} onChange={onToggle} disabled={already} onClick={e => e.stopPropagation()} />
      <div style={{ flex: 1 }}>
        <div className="text-[13px] font-bold text-carbon-300">{item.name}{already && <span style={{ fontSize: 10, color: "#9CA3AF" }}> (on sheet)</span>}</div>
        <div className="text-[11px] font-semibold text-muted mt-0.5">{item.unit}{item.container ? ` · ${item.container}` : ""}</div>
      </div>
    </div>
  );
}

export function ManualDrawer({ event, ING, onClose, onAdd }) {
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState({});
  const [activeCat, setActiveCat] = useState("PROTEINS");
  const [custom, setCustom] = useState({ show: false, name: "", group: "PROTEINS", unit: "", container: "", notes: "", variation: "" });
  
  const existing = new Set((event.items || []).map(i => (i.name || "").toLowerCase()));
  const toggle = (g, name) => { const k = `${g}::${name}`; setSel(p => ({ ...p, [k]: !p[k] })); };
  const isChecked = (g, name) => !!sel[`${g}::${name}`];
  
  const bygroup = useMemo(() => {
    const out = {};
    GROUP_ORDER.forEach(g => {
      out[g] = Object.entries(ING).filter(([, cfg]) => cfg.group === g).map(([name, cfg]) => ({ name, ...cfg }));
    });
    return out;
  }, [ING]);
  
  const filtered = useMemo(() => {
    if (!search) return null;
    const q = search.toLowerCase();
    const out = {};
    Object.entries(ING).forEach(([name, cfg]) => {
      if (name.toLowerCase().includes(q)) {
        if (!out[cfg.group]) out[cfg.group] = [];
        out[cfg.group].push({ name, ...cfg });
      }
    });
    return out;
  }, [search, ING]);
  
  const selCount = Object.values(sel).filter(Boolean).length;
  const sc = (k, v) => setCustom(p => ({ ...p, [k]: v }));
  
  const handleAdd = () => {
    const toAdd = Object.entries(sel).filter(([, v]) => v).map(([k]) => {
      const [g, name] = k.split("::");
      const cfg = ING[name] || {};
      return { id: uid(), group: g, category: g, name, quantity: "", unit: cfg.unit || "", container: cfg.container || "", notes: cfg.notes || "", variation: "", prepped: "", loaded: "", returned: "", qtyUsed: "" };
    });
    onAdd(toAdd);
  };
  
  const handleCustom = () => {
    if (!custom.name) return;
    onAdd([{ id: uid(), group: custom.group, category: custom.group, name: custom.name, quantity: "", unit: custom.unit, container: custom.container, notes: custom.notes, variation: custom.variation, prepped: "", loaded: "", returned: "", qtyUsed: "" }]);
    setCustom({ show: false, name: "", group: "PROTEINS", unit: "", container: "", notes: "", variation: "" });
  };
  
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex justify-end" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#FBF9F8] w-[440px] max-w-full h-full shadow-[-4px_0_24px_rgba(0,0,0,.15)] flex flex-col">
        <div className="bg-bg p-5 border-b border-bd flex justify-between items-center shrink-0"><div className="text-lg font-extrabold text-carbon-300">Add Items Manually</div><button className="w-8 h-8 rounded-full bg-black/5 border-none text-xl font-bold cursor-pointer hover:bg-black/10 transition-colors flex items-center justify-center leading-none text-carbon-300" onClick={onClose}>×</button></div>
        <div className="flex-1 overflow-y-auto p-5">
          <input className="w-full box-border px-3.5 py-2.5 rounded-xl border border-bd bg-white text-[13px] outline-none focus:border-accent transition-colors mb-4" placeholder="Search ingredients…" value={search} onChange={e => setSearch(e.target.value)} />
          {custom.show ? (
            <div className="bg-[#FFFBEB] border-2 border-[#F0B429] rounded-xl p-4 mb-4">
              <div className="text-[11px] font-extrabold text-[#B45309] uppercase tracking-widest mb-3 flex items-center gap-2 before:content-['+'] before:bg-[#FEF3C7] before:text-[#92400E] before:w-4 before:h-4 before:flex before:items-center before:justify-center before:rounded-full before:font-black">Custom or Variation Item</div>
              <div className="grid grid-cols-[1fr_1fr] gap-3">
                <div className="flex flex-col gap-1.5 col-span-full"><label className="text-[10px] font-bold text-[#B45309] uppercase tracking-widest">Item Name *</label><input className="w-full box-border px-2.5 py-1.5 rounded-lg border border-[#FCD34D] bg-white text-xs outline-none focus:border-[#F59E0B]" placeholder="e.g. Mango Habanero Salsa" value={custom.name} onChange={e => sc("name", e.target.value)} /></div>
                <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-[#B45309] uppercase tracking-widest">Group</label><select className="w-full box-border px-2.5 py-1.5 rounded-lg border border-[#FCD34D] bg-white text-xs outline-none focus:border-[#F59E0B]" value={custom.group} onChange={e => sc("group", e.target.value)}>{GROUP_ORDER.map(g => <option key={g} value={g}>{GROUPS[g].label}</option>)}</select></div>
                <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-[#B45309] uppercase tracking-widest">Unit</label><input className="w-full box-border px-2.5 py-1.5 rounded-lg border border-[#FCD34D] bg-white text-xs outline-none focus:border-[#F59E0B]" placeholder="qt, lb, ea…" value={custom.unit} onChange={e => sc("unit", e.target.value)} /></div>
                <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-[#B45309] uppercase tracking-widest">Container</label><input className="w-full box-border px-2.5 py-1.5 rounded-lg border border-[#FCD34D] bg-white text-xs outline-none focus:border-[#F59E0B]" placeholder="clear quart…" value={custom.container} onChange={e => sc("container", e.target.value)} /></div>
                <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-[#B45309] uppercase tracking-widest">Notes</label><input className="w-full box-border px-2.5 py-1.5 rounded-lg border border-[#FCD34D] bg-white text-xs outline-none focus:border-[#F59E0B]" value={custom.notes} onChange={e => sc("notes", e.target.value)} /></div>
                <div className="flex flex-col gap-1.5 col-span-full"><label className="text-[10px] font-bold text-[#B45309] uppercase tracking-widest">Variation / Special Instruction</label><input className="w-full box-border px-2.5 py-1.5 rounded-lg border border-[#FCD34D] bg-white text-xs outline-none focus:border-[#F59E0B]" placeholder="dairy-free, extra spicy…" value={custom.variation} onChange={e => sc("variation", e.target.value)} /></div>
              </div>
              <div style={{ display: "flex", gap: 7, marginTop: 9 }}>
                <button className="bg-white border border-[#D4CCC2] text-carbon-300 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-black/5 transition-colors" onClick={() => sc("show", false)}>Cancel</button>
                <button className="bg-accent text-white border-none px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-carbon-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleCustom} disabled={!custom.name}>Add to Sheet</button>
              </div>
            </div>
          ) : <button className="bg-white border border-[#D4CCC2] text-carbon-300 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-black/5 transition-colors" style={{ width: "100%", marginBottom: 9 }} onClick={() => sc("show", true)}>+ Add Custom or Variation Item</button>}
          {!search && <div className="flex gap-2 overflow-x-auto pb-3 mb-3 border-b border-bd">{GROUP_ORDER.map(g => <button key={g} className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest cursor-pointer whitespace-nowrap transition-colors border-none ${activeCat === g ? "text-white" : "bg-black/5 text-muted hover:bg-black/10"}`} style={activeCat === g ? { background: GROUPS[g].color } : {}} onClick={() => setActiveCat(g)}>{GROUPS[g].label.split(" ")[0]}</button>)}</div>}
          {search ? (
            filtered && Object.keys(filtered).length > 0 ? Object.entries(filtered).map(([g, items]) => (
              <div key={g}><div className="text-[10px] font-extrabold uppercase tracking-widest mb-2 mt-4" style={{ color: GROUPS[g]?.color }}>{GROUPS[g]?.label || g}</div>
                {items.map(item => <DItem key={item.name} item={item} gkey={g} checked={isChecked(g, item.name)} already={existing.has(item.name.toLowerCase())} onToggle={() => toggle(g, item.name)} />)}</div>
            )) : <div style={{ color: "var(--muted)", fontSize: 13, padding: "10px 0" }}>No items found. Add a custom item above.</div>
          ) : (bygroup[activeCat] || []).map(item => <DItem key={item.name} item={item} gkey={activeCat} checked={isChecked(activeCat, item.name)} already={existing.has(item.name.toLowerCase())} onToggle={() => toggle(activeCat, item.name)} />)}
        </div>
        <div className="bg-white border-t border-bd p-5 shrink-0">
          <div className="text-xs font-semibold text-muted text-center mb-3">{selCount > 0 ? `${selCount} item${selCount !== 1 ? "s" : ""} selected` : "Select items or add a custom item above"}</div>
          <div className="flex gap-3">
            <button className="bg-white border border-[#D4CCC2] text-carbon-300 px-4 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer hover:bg-black/5 shadow-sm transition-colors disabled:opacity-50" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button className="bg-accent text-white border-none px-4 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer hover:bg-carbon-300 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed" style={{ flex: 2 }} onClick={handleAdd} disabled={!selCount}>Add {selCount || ""} Item{selCount !== 1 ? "s" : ""} →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
