import React, { useState } from "react";
import { RECIPE_CATS } from "../../data/constants";
import { getRecipeImpact } from "./utils";

export function RecipeEditor({ recipeKey, recipe, ING, onSave, onDelete, onCancel, isOwner, events }) {
  const [label, setLabel] = useState(recipe?.label || "");
  const [cat, setCat] = useState(recipe?.cat || "TACOS");
  const [sw, setSw] = useState(recipe?.servingWord || "serving");
  const [ings, setIngs] = useState(recipe?.ingredients?.map(i => ({ ...i, type: "oz" in i ? "oz" : "ea" })) || []);
  
  const addIng = () => setIngs(p => [...p, { name: "", oz: 0, type: "oz" }]);
  const delIng = i => setIngs(p => p.filter((_, j) => j !== i));
  const updIng = (i, k, v) => setIngs(p => p.map((ing, j) => j !== i ? ing : { ...ing, [k]: v }));
  const setType = (i, t) => setIngs(p => p.map((ing, j) => j !== i ? ing : { name: ing.name, type: t, [t]: parseFloat(ing[ing.type] || 0) || 0 }));
  
  const handleSave = () => {
    if (!label) return;
    const key = recipeKey || label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const cleanIngs = ings.filter(i => i.name).map(i => { const out = { name: i.name }; if (i.type === "oz") out.oz = parseFloat(i.oz) || 0; else out.ea = parseFloat(i.ea) || 0; return out; });
    onSave(key, { label, cat, servingWord: sw, ingredients: cleanIngs });
  };
  
  const ingNames = Object.keys(ING);
  
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-4">
        <button className="bg-transparent border-none text-accent font-bold text-[13px] cursor-pointer hover:bg-black/5 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1" onClick={onCancel}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          Back
        </button>
        <div><div className="text-3xl font-extrabold text-carbon-300 leading-tight mb-2">{recipeKey && recipeKey !== "new" ? "Edit Recipe" : "New Recipe"}</div></div>
      </div>
      <div className="bg-white border border-bd rounded-2xl p-6 shadow-sm mb-6">
        <div className="grid grid-cols-[1fr_1fr] gap-4 mb-6">
          <div className="flex flex-col gap-1.5 col-span-full"><label className="text-[10px] font-bold text-muted uppercase tracking-widest">Recipe Name *</label><input className="w-full box-border px-3.5 py-2.5 rounded-xl border border-bd bg-white text-[13px] outline-none focus:border-accent transition-colors" placeholder="e.g. Lobster Taco" value={label} onChange={e => setLabel(e.target.value)} /></div>
          <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-muted uppercase tracking-widest">Category</label><select className="w-full box-border px-3.5 py-2.5 rounded-xl border border-bd bg-white text-[13px] outline-none focus:border-accent transition-colors" value={cat} onChange={e => setCat(e.target.value)}>{RECIPE_CATS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-muted uppercase tracking-widest">Serving Word</label><input className="w-full box-border px-3.5 py-2.5 rounded-xl border border-bd bg-white text-[13px] outline-none focus:border-accent transition-colors" placeholder="taco, bowl, piece…" value={sw} onChange={e => setSw(e.target.value)} /></div>
        </div>
        <div className="text-[13px] font-bold mb-2.5 text-carbon-300">Ingredients <span className="text-[11px] font-normal text-muted">— amounts per 1 serving</span></div>
        <div className="grid grid-cols-[2fr_1fr_100px_40px] gap-2 mb-2 text-[10px] font-extrabold text-muted uppercase tracking-widest px-2"><span>Ingredient</span><span>Amount</span><span>Unit Type</span><span /></div>
        {ings.map((ing, i) => (
          <div key={i} className="grid grid-cols-[2fr_1fr_100px_40px] gap-2 mb-2 items-center">
            <input list={`il-${i}`} className="w-full box-border px-2 py-1.5 rounded-xl border border-bd bg-white text-xs outline-none focus:border-accent transition-colors" placeholder="Ingredient name…" value={ing.name} onChange={e => updIng(i, "name", e.target.value)} />
            <datalist id={`il-${i}`}>{ingNames.map(n => <option key={n} value={n} />)}</datalist>
            <input className="w-full box-border px-2 py-1.5 rounded-xl border border-bd bg-white text-xs text-center outline-none focus:border-accent transition-colors" type="number" min="0" step="0.1" value={ing[ing.type] || ""} onChange={e => updIng(i, ing.type, e.target.value)} />
            <div className="flex bg-bg rounded-lg p-1 border border-bd">
              <button className={`flex-1 border-none bg-transparent rounded-md text-[10px] font-bold cursor-pointer transition-colors py-1.5 ${ing.type === "oz" ? "bg-white text-carbon-300 shadow-sm" : "text-muted"}`} onClick={() => setType(i, "oz")}>oz</button>
              <button className={`flex-1 border-none bg-transparent rounded-md text-[10px] font-bold cursor-pointer transition-colors py-1.5 ${ing.type === "ea" ? "bg-white text-carbon-300 shadow-sm" : "text-muted"}`} onClick={() => setType(i, "ea")}>ea</button>
            </div>
            <button className="w-7 h-7 rounded-full border-none bg-transparent text-muted cursor-pointer font-bold text-lg hover:bg-red hover:text-white transition-colors flex items-center justify-center mx-auto" onClick={() => delIng(i)}>×</button>
          </div>
        ))}
        <button className="w-full border-2 border-dashed border-bd rounded-xl py-3 mt-2 mb-6 bg-transparent text-carbon-100 font-bold text-[13px] cursor-pointer hover:border-carbon-100 hover:text-carbon-300 transition-colors" onClick={addIng}>+ Add Ingredient</button>
        <div className="flex gap-3 justify-end pt-5 border-t border-carbon-08">
          {onDelete && <button className="bg-red-bg border border-red text-red px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-red hover:text-white transition-colors" onClick={() => {
            const affected = getRecipeImpact(recipeKey, events);
            const msg = affected.length > 0
              ? `This recipe is on ${affected.length} active event${affected.length !== 1 ? "s" : ""}:\n${affected.slice(0, 5).join(", ")}\n\nDeleting removes it from the menu builder but won't affect existing prep sheets. Continue?`
              : "Delete this recipe? This cannot be undone.";
            if (confirm(msg)) onDelete();
          }}>Delete</button>}
          <button className="bg-white border border-[#D4CCC2] text-carbon-300 px-4 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer hover:bg-black/5 shadow-sm transition-colors" onClick={onCancel}>Cancel</button>
          <button className="bg-accent text-white border-none px-4 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer hover:bg-carbon-300 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleSave} disabled={!label}>Save Recipe</button>
        </div>
      </div>
    </div>
  );
}
