import React, { useState } from "react";
import { GROUPS, GROUP_ORDER } from "../../data/constants";
import { getIngredientImpact } from "./utils";

export function IngredientManager({ ING, customKeys, onSave, onUpdate, onDelete, isOwner, RECIPES }) {
  const [filter, setFilter] = useState("ALL");
  const [adding, setAdding] = useState(false);
  const [editingName, setEditingName] = useState(null);
  const [form, setForm] = useState({ name: "", unit: "qt", opU: 32, group: "SALSAS", container: "", notes: "" });
  const [editForm, setEditForm] = useState({});
  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const filtered = Object.entries(ING).filter(([, cfg]) => filter === "ALL" || cfg.group === filter);

  const handleSave = () => {
    if (!form.name) return;
    onSave(form.name, { unit: form.unit, opU: parseFloat(form.opU) || 1, group: form.group, container: form.container, notes: form.notes });
    setAdding(false); setForm({ name: "", unit: "qt", opU: 32, group: "SALSAS", container: "", notes: "" });
  };

  const startEdit = (name, cfg) => {
    setEditingName(name);
    setEditForm({ name, unit: cfg.unit, opU: cfg.opU, group: cfg.group, container: cfg.container || "", notes: cfg.notes || "" });
  };
  
  const saveEdit = () => {
    if (!editForm.name) return;
    onUpdate(editingName, editForm.name, { unit: editForm.unit, opU: parseFloat(editForm.opU) || 1, group: editForm.group, container: editForm.container, notes: editForm.notes });
    setEditingName(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><div className="text-3xl font-extrabold text-carbon-300 leading-tight mb-2">Ingredient Library</div><div className="text-sm font-semibold text-carbon-50 mb-10">{Object.keys(ING).length} ingredients</div></div>
        <button className="bg-accent text-white border-none px-4 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer hover:bg-carbon-300 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => setAdding(true)}>+ Add Ingredient</button>
      </div>

      {adding && (
        <div className="bg-white border border-bd rounded-2xl p-6 shadow-sm mb-6">
          <div className="text-base font-bold text-carbon-300 mb-4">New Ingredient</div>
          <div className="grid grid-cols-[1fr_1fr] gap-4 mb-6">
            <div className="flex flex-col gap-1.5 col-span-full"><label className="text-[10px] font-bold text-muted uppercase tracking-widest">Name *</label><input className="w-full box-border px-3.5 py-2.5 rounded-xl border border-bd bg-white text-[13px] outline-none focus:border-accent transition-colors" placeholder="e.g. Habanero Salsa" value={form.name} onChange={e => sf("name", e.target.value)} /></div>
            <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-muted uppercase tracking-widest">Display Unit</label><input className="w-full box-border px-3.5 py-2.5 rounded-xl border border-bd bg-white text-[13px] outline-none focus:border-accent transition-colors" placeholder="qt, pt, lbs, ea…" value={form.unit} onChange={e => sf("unit", e.target.value)} /></div>
            <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-muted uppercase tracking-widest">oz Per Unit <span className="font-normal text-[10px]">(qt=32, pt=16, lb=16, ea=1)</span></label><input className="w-full box-border px-3.5 py-2.5 rounded-xl border border-bd bg-white text-[13px] outline-none focus:border-accent transition-colors" type="number" value={form.opU} onChange={e => sf("opU", e.target.value)} /></div>
            <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-muted uppercase tracking-widest">Group</label><select className="w-full box-border px-3.5 py-2.5 rounded-xl border border-bd bg-white text-[13px] outline-none focus:border-accent transition-colors" value={form.group} onChange={e => sf("group", e.target.value)}>{GROUP_ORDER.map(g => <option key={g} value={g}>{GROUPS[g].label}</option>)}</select></div>
            <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-muted uppercase tracking-widest">Container</label><input className="w-full box-border px-3.5 py-2.5 rounded-xl border border-bd bg-white text-[13px] outline-none focus:border-accent transition-colors" placeholder="clear quart…" value={form.container} onChange={e => sf("container", e.target.value)} /></div>
            <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-muted uppercase tracking-widest">Notes</label><input className="w-full box-border px-3.5 py-2.5 rounded-xl border border-bd bg-white text-[13px] outline-none focus:border-accent transition-colors" value={form.notes} onChange={e => sf("notes", e.target.value)} /></div>
          </div>
          <div className="flex gap-3 justify-end pt-5 border-t border-carbon-08">
            <button className="bg-white border border-[#D4CCC2] text-carbon-300 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-black/5 transition-colors" onClick={() => setAdding(false)}>Cancel</button>
            <button className="bg-carbon-300 text-white border-none px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleSave} disabled={!form.name}>Save Ingredient</button>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap mb-4">
        {["ALL", ...GROUP_ORDER].map(g => <button key={g} onClick={() => setFilter(g)} className={`px-2.5 py-1 rounded-full border-none cursor-pointer text-[11px] font-bold transition-all ${filter === g ? "text-white" : "bg-bg text-carbon-100 hover:bg-carbon-08"}`} style={filter === g ? { background: GROUPS[g]?.color || "#334155" } : {}}>{g === "ALL" ? "All" : GROUPS[g]?.label.split(" ")[0]}</button>)}
      </div>

      <div className="bg-white border border-bd rounded-2xl shadow-sm mb-6 p-0 overflow-hidden">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead><tr>
            <th className="bg-bg text-[10px] font-extrabold text-muted uppercase tracking-widest py-3 px-4 border-b border-bd">Name</th><th className="bg-bg text-[10px] font-extrabold text-muted uppercase tracking-widest py-3 px-4 border-b border-bd">Unit</th><th className="bg-bg text-[10px] font-extrabold text-muted uppercase tracking-widest py-3 px-4 border-b border-bd">oz/Unit</th><th className="bg-bg text-[10px] font-extrabold text-muted uppercase tracking-widest py-3 px-4 border-b border-bd">Group</th><th className="bg-bg text-[10px] font-extrabold text-muted uppercase tracking-widest py-3 px-4 border-b border-bd">Container</th><th className="bg-bg text-[10px] font-extrabold text-muted uppercase tracking-widest py-3 px-4 border-b border-bd">Notes</th><th className="bg-bg text-[10px] font-extrabold text-muted uppercase tracking-widest py-3 px-4 border-b border-bd w-[90px]"></th>
          </tr></thead>
          <tbody>
            {filtered.map(([name, cfg]) => {
              const custom = customKeys.includes(name);
              const isEditing = editingName === name;
              return (
                <tr key={name} className="hover:bg-black/5 transition-colors">
                  {isEditing ? (
                    <>
                      <td className="py-2 px-3 border-b border-carbon-08"><input className="w-full box-border px-2 py-1.5 rounded-md border border-bd text-xs outline-none focus:border-accent bg-white" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} /></td>
                      <td className="py-2 px-3 border-b border-carbon-08"><input className="w-full box-border px-2 py-1.5 rounded-md border border-bd text-xs outline-none focus:border-accent bg-white" value={editForm.unit} onChange={e => setEditForm(p => ({ ...p, unit: e.target.value }))} /></td>
                      <td className="py-2 px-3 border-b border-carbon-08"><input className="w-full box-border px-2 py-1.5 rounded-md border border-bd text-xs outline-none focus:border-accent bg-white" type="number" value={editForm.opU} onChange={e => setEditForm(p => ({ ...p, opU: e.target.value }))} /></td>
                      <td className="py-2 px-3 border-b border-carbon-08"><select className="w-full box-border px-2 py-1.5 rounded-md border border-bd text-xs outline-none focus:border-accent bg-white" value={editForm.group} onChange={e => setEditForm(p => ({ ...p, group: e.target.value }))}>{GROUP_ORDER.map(g => <option key={g} value={g}>{GROUPS[g].label}</option>)}</select></td>
                      <td className="py-2 px-3 border-b border-carbon-08"><input className="w-full box-border px-2 py-1.5 rounded-md border border-bd text-xs outline-none focus:border-accent bg-white" value={editForm.container} onChange={e => setEditForm(p => ({ ...p, container: e.target.value }))} /></td>
                      <td className="py-2 px-3 border-b border-carbon-08"><input className="w-full box-border px-2 py-1.5 rounded-md border border-bd text-xs outline-none focus:border-accent bg-white" value={editForm.notes} onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))} /></td>
                      <td className="py-2 px-3 border-b border-carbon-08"><div className="flex gap-1">
                        <button className="bg-carbon-300 text-white border-none px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer hover:bg-black transition-colors" onClick={saveEdit}>Save</button>
                        <button className="bg-white border border-[#D4CCC2] text-carbon-300 px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer hover:bg-black/5 transition-colors" onClick={() => setEditingName(null)}>Cancel</button>
                      </div></td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4 border-b border-carbon-08 font-semibold text-carbon-300">{name}</td>
                      <td className="py-3 px-4 border-b border-carbon-08 text-carbon-100">{cfg.unit}</td>
                      <td className="py-3 px-4 border-b border-carbon-08 text-carbon-100">{cfg.opU}</td>
                      <td className="py-3 px-4 border-b border-carbon-08"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: GROUPS[cfg.group]?.color + "22", color: GROUPS[cfg.group]?.color }}>{GROUPS[cfg.group]?.label || cfg.group}</span></td>
                      <td className="py-3 px-4 border-b border-carbon-08 text-carbon-100">{cfg.container || "—"}</td>
                      <td className="py-3 px-4 border-b border-carbon-08 text-[11px] text-carbon-100">{cfg.notes || "—"}</td>
                      <td className="py-3 px-4 border-b border-carbon-08"><div className="flex gap-1">
                        {custom && <button className="bg-white border border-[#D4CCC2] text-carbon-300 px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer hover:bg-black/5 transition-colors" onClick={() => startEdit(name, cfg)}>Edit</button>}
                        {!custom && <button className="bg-white border border-[#D4CCC2] text-carbon-300 px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer hover:bg-black/5 transition-colors" onClick={() => startEdit(name, cfg)} title="Edit built-in ingredient">Edit</button>}
                        {isOwner && <button className="bg-red-bg border border-red text-red px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer hover:bg-red hover:text-white transition-colors" onClick={() => {
                          const affected = getIngredientImpact(name, RECIPES);
                          const msg = affected.length > 0
                            ? `"${name}" is used in ${affected.length} recipe${affected.length !== 1 ? "s" : ""}:\n${affected.slice(0, 5).join(", ")}${affected.length > 5 ? ` and ${affected.length - 5} more` : ""}\n\nDeleting this ingredient will remove it from those recipes. Continue?`
                            : `Delete "${name}"? This cannot be undone.`;
                          if (confirm(msg)) onDelete(name);
                        }}>Delete</button>}
                      </div></td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
