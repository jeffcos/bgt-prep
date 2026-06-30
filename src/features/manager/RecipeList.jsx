import React, { useState } from "react";
import { RECIPE_CATS, RCAT_COLORS } from "../../data/constants";
import { getRecipeImpact } from "./utils";

export function RecipeList({ RECIPES, customKeys, onEdit, onNew, onDelete, isOwner, events }) {
  const [filter, setFilter] = useState("ALL");
  const cats = ["ALL", ...RECIPE_CATS];
  const filtered = Object.entries(RECIPES).filter(([, r]) => filter === "ALL" || r.cat === filter);
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><div className="text-3xl font-extrabold text-carbon-300 leading-tight mb-2">Recipe Manager</div><div className="text-sm font-semibold text-carbon-50 mb-10">{Object.keys(RECIPES).length} recipes</div></div>
        <button className="bg-accent text-white border-none px-4 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer hover:bg-carbon-300 shadow-sm transition-colors" onClick={onNew}>+ Add New Recipe</button>
      </div>
      <div className="flex gap-1.5 flex-wrap mb-4">
        {cats.map(c => <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1 rounded-full border-none cursor-pointer text-[11px] font-bold transition-all ${filter === c ? "text-white" : "bg-bg text-carbon-100 hover:bg-carbon-08"}`} style={filter === c ? { background: RCAT_COLORS[c] || "#334155" } : {}}>{c}</button>)}
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
        {filtered.map(([key, r]) => (
          <div key={key} className="bg-white border border-bd rounded-2xl p-5 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,.04)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,.08)] hover:border-[#D4CCC2] transition-all" onClick={() => onEdit(key)}>
            <div className="flex items-start justify-between gap-1 mb-0.5">
              <div className="text-[15px] font-extrabold text-carbon-300 leading-tight">{r.label}</div>
              {isOwner && (
                <button
                  className="shrink-0 bg-transparent border-none cursor-pointer text-[#CCC] text-lg leading-none px-0.5 rounded transition-colors hover:text-[#DC2626]"
                  onClick={e => {
                    e.stopPropagation();
                    const affected = getRecipeImpact(key, events);
                    const msg = affected.length > 0
                      ? `"${r.label}" is currently on ${affected.length} active event${affected.length !== 1 ? "s" : ""}:\n${affected.slice(0, 5).join(", ")}${affected.length > 5 ? ` and ${affected.length - 5} more` : ""}\n\nDeleting this recipe will not affect existing prep sheets but removes it from the menu builder. Continue?`
                      : `Delete "${r.label}"? This cannot be undone.`;
                    if (confirm(msg)) onDelete(key);
                  }}
                  title="Delete recipe"
                >×</button>
              )}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: RCAT_COLORS[r.cat] || "#64748B" }}>{r.cat} · per {r.servingWord}</div>
            <div className="text-xs font-semibold text-muted leading-relaxed">{r.ingredients.slice(0, 3).map(i => i.name).join(", ")}{r.ingredients.length > 3 ? ` +${r.ingredients.length - 3} more` : ""}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
