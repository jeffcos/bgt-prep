import { useState, useRef, useMemo } from "react";
import { GROUPS, GROUP_ORDER, STICKER, getSticker, RECIPE_CATS, RCAT_COLORS } from "../data/constants";
import { TimeSmart } from "./EventForm";
import { uid } from "../utils/calc";

import { ItemRow } from "../features/prepsheet/ItemRow";
import { ManualDrawer } from "../features/prepsheet/ManualDrawer";

export default function PrepSheet({event,ING,RECIPES,onUpdate,onUpdateItem,onRemoveItem,onAddItems,onDelete,onEditMenu,onEdit,onPrint,printMode}){
  const [collapsed,setCollapsed]=useState({});
  const [showDrawer,setShowDrawer]=useState(false);
  const [activeGroup,setActiveGroup]=useState(null);
  const [railCollapsed,setRailCollapsed]=useState(false);
  const catRefs=useRef({});
  const scrollToGroup=g=>{
    setCollapsed(p=>({...p,[g]:false}));
    setTimeout(()=>{const el=catRefs.current[g];if(el)el.scrollIntoView({behavior:"smooth",block:"start"});},50);
  };
  const sc=getSticker(event);
  const bygroup=GROUP_ORDER.reduce((a,g)=>{a[g]=event.items.filter(i=>(i.group||"SPECIALTY")===g);return a;},{});
  const nonEmptyGroups=GROUP_ORDER.filter(g=>bygroup[g]?.length>0);
  const total=event.items.length,prepped=event.items.filter(i=>i.prepped?.trim()).length,loaded=event.items.filter(i=>i.loaded?.trim()).length,returned=event.items.filter(i=>i.returned?.trim()).length;
  const pct=total>0?Math.round(prepped/total*100):0;
  const acc=(()=>{const evs=event.items.filter(i=>parseFloat(i.loaded)>0);if(!evs.length)return null;const totL=evs.reduce((s,i)=>s+(parseFloat(i.loaded)||0),0);const totR=evs.reduce((s,i)=>s+(parseFloat(i.returned)||0),0);return totL>0?Math.round((totR/totL)*100):null;})();
  const msUntil=event.date?(new Date(event.date+(event.startTime?"T"+event.startTime:"T00:00:00"))-new Date()):null;
  const daysUntil=msUntil!==null?Math.round(msUntil/(1000*60*60*24)):null;
  const hoursUntil=msUntil!==null?Math.round(msUntil/(1000*60*60)):null;
  const daysLabel=daysUntil===null?"":daysUntil<=0?"Today":daysUntil===1?"Tomorrow":`In ${daysUntil} days`;
  const fmt=d=>d?new Date(d+"T00:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}):"";
  const fmtShort=d=>d?new Date(d+"T00:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}):"";
  const fmtTime=t=>{if(!t)return"";const[h,m]=t.split(":");const hr=parseInt(h,10);return`${hr%12||12}:${m}${hr>=12?"pm":"am"}`};

  return(
    <>
      <div className={`ps-grid grid h-screen w-full relative transition-all duration-300 ${railCollapsed ? "grid-cols-1" : "grid-cols-[280px_1fr]"}`}>
        {/* ── CONTEXT RAIL ── */}
        <aside className={`ctx-rail bg-card border-r border-bd p-5 overflow-y-auto overflow-x-hidden flex flex-col gap-6 w-[280px] transition-all duration-300 ${railCollapsed ? "hidden" : "flex"}`}>
          <div>
            <div className="text-xl font-extrabold text-carbon-300 leading-tight mb-1">{event.name}</div>
            <div className="text-[13px] font-semibold text-carbon-50">{event.truck}{event.guests?` · ${event.guests} guests`:""}</div>
          </div>
          <div className="bg-white border border-bd rounded-xl p-4 shadow-sm">
            <div className="text-[10px] font-bold tracking-widest text-muted uppercase mb-3">Prep progress</div>
            <div><span className="text-[28px] font-extrabold text-carbon-300 leading-none">{prepped}</span><span className="text-sm text-carbon-50 ml-1 font-semibold"> / {total} items</span></div>
            <div className="h-1.5 bg-carbon-08 rounded-full overflow-hidden mt-3 mb-4"><div className="h-full rounded-full transition-all" style={{width:`${pct}%`,background:sc.bar}}/></div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-muted"><strong>{loaded}</strong> loaded</span>
              <span className="text-[11px] text-muted"><strong>{returned}</strong> returned</span>
              {acc!==null&&<span className="text-[11px] text-muted"><strong>{acc}%</strong> accuracy</span>}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-[.15em] uppercase text-muted mb-3">Jump to category</div>
            {nonEmptyGroups.map(g=>{
              const items=bygroup[g];
              const grpPrepped=items.filter(x=>x.prepped?.trim()).length;
              const grpPct=items.length>0?Math.round(grpPrepped/items.length*100):0;
              return(
                <div key={g} className={`px-3 py-2 -mx-3 rounded-lg cursor-pointer flex flex-wrap items-center justify-between hover:bg-black/5 transition-colors ${activeGroup===g?"bg-black/5":""}`} onClick={()=>{setActiveGroup(g);scrollToGroup(g);}}>
                  <span className="text-[13px] font-semibold text-carbon-300">{GROUPS[g].label}</span>
                  <span className="text-[11px] font-semibold text-carbon-50">{grpPrepped}/{items.length}</span>
                  <div className="w-full h-1 bg-carbon-08 rounded-full overflow-hidden mt-1.5"><div className="h-full rounded-full transition-all" style={{width:`${grpPct}%`,background:sc.bar}}/></div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col gap-2">
            <button className="w-full px-3.5 py-2.5 rounded-lg text-[13px] font-bold cursor-pointer transition-colors border border-[#D4CCC2] bg-transparent text-carbon-300 hover:bg-black/5" onClick={()=>setShowDrawer(true)}>Add Item</button>
            <button className="w-full px-3.5 py-2.5 rounded-lg text-[13px] font-bold cursor-pointer transition-colors border border-[#D4CCC2] bg-transparent text-carbon-300 hover:bg-black/5" onClick={onEditMenu}>Edit Menu</button>
            <button className="w-full px-3.5 py-2.5 rounded-lg text-[13px] font-bold cursor-pointer transition-colors border border-[#D4CCC2] bg-transparent text-carbon-300 hover:bg-black/5" onClick={onEdit}>Edit Event</button>
            <button className="w-full px-3.5 py-2.5 rounded-lg text-[13px] font-bold cursor-pointer transition-colors border border-[#D4CCC2] bg-transparent text-carbon-300 hover:bg-black/5" onClick={onPrint}>Print</button>
            <button className="w-full px-3.5 py-2.5 rounded-lg border-[1.5px] border-red bg-red-bg text-red text-xs font-bold cursor-pointer flex items-center justify-center hover:bg-red hover:text-white transition-colors" onClick={onDelete}>Delete Event</button>
          </div>
        </aside>
        
        {/* Toggle Button */}
        <button 
          className="rail-btn absolute top-6 z-[101] w-6 h-6 rounded-full bg-white border border-bd shadow-sm flex items-center justify-center text-carbon-200 hover:bg-carbon-08 transition-colors text-xs" 
          style={{ left: railCollapsed ? 0 : 280 - 12, marginTop: railCollapsed ? '40px' : '0' }} 
          onClick={()=>setRailCollapsed(!railCollapsed)} 
          title={railCollapsed?"Expand panel":"Collapse panel"}
        >
          {railCollapsed ? '›' : '‹'}
        </button>

        {/* ── WORK AREA ── */}
        <main className="ps-work bg-transparent overflow-y-auto p-6 pb-24">

          {/* Header card */}
          <div className="ps-hdr-card bg-card rounded-2xl border border-bd shadow-custom overflow-hidden flex flex-col mb-6">
            <div className="h-2 w-full" style={{background:sc.bar}}/>
            <div className="p-6 flex flex-col gap-6">
              <div className="flex flex-wrap gap-6 items-start">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold tracking-[.1em] uppercase mb-2" style={{color:sc.bar}}>{event.date?fmtShort(event.date):""}{daysUntil!==null?` · ${daysLabel}`:""}</div>
                  <div className="text-4xl font-extrabold text-carbon-300 leading-[1.1] mb-2">{event.name}</div>
                  <div className="text-[15px] font-semibold text-carbon-50">{event.truck}{event.guests?` · ${event.guests} guests`:""}{event.startTime?` · service at ${fmtTime(event.startTime)}`:""}</div>
                </div>
                <div className="flex flex-col gap-3 w-full sm:w-auto">
                  <div className="grid grid-cols-3 gap-4">
                    {[["Order Ready","orderReadyBy"],["Load Time","loadBy"],["Start Time","startTime"]].map(([lbl,key])=>(
                      <div key={key}>
                        <div className="text-[10px] font-extrabold tracking-widest text-muted uppercase mb-1.5">{lbl}</div>
                        <TimeSmart value={event[key]||""} onChange={v=>onUpdate({[key]:v})}/>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[["Loaded By","loadDriver","text"],["Return By","returnsDriver","text"]].map(([lbl,key])=>(
                      <div key={key}>
                        <div className="text-[10px] font-extrabold tracking-widest text-muted uppercase mb-1.5">{lbl}</div>
                        <input className="w-full bg-transparent border-b border-bd pb-1.5 text-xs font-semibold text-carbon-300 placeholder-muted outline-none focus:border-accent" type="text" value={event[key]||""} onChange={e=>onUpdate({[key]:e.target.value})} placeholder="—"/>
                      </div>
                    ))}
                    <div>
                      <div className="text-[10px] font-extrabold tracking-widest text-muted uppercase mb-1.5">Created</div>
                      <div className="text-xs font-semibold text-carbon-300 border-b border-carbon-08 pb-0.5 mt-0.5">
                        {event.createdAt?new Date(event.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold tracking-widest text-muted uppercase mb-1.5">Created By</div>
                      <div className="text-xs font-semibold text-carbon-300 border-b border-carbon-08 pb-0.5 mt-0.5">
                        {event.createdBy?.name||"—"}
                      </div>
                    </div>
                  </div>
                  {event.updatedAt&&<div className="text-[10px] text-carbon-50 tracking-[.06em]">Last revised: {new Date(event.updatedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})} at {new Date(event.updatedAt).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}</div>}
                </div>
              </div>
              <div className="flex gap-8 pt-6 border-t border-carbon-08">
                {(()=>{
                  const untilLabel=hoursUntil===null?"—":hoursUntil<=0?"Now":hoursUntil<24?`${hoursUntil}h`:`${Math.floor(hoursUntil/24)}d ${hoursUntil%24}h`;
                  return[["Items",total],["Prepped",prepped],["Loaded",loaded],["Categories",nonEmptyGroups.length],["Until Service",untilLabel]].map(([l,v])=>(
                    <div key={l} className="flex flex-col"><div className="text-[22px] font-extrabold text-carbon-300 leading-none mb-1">{v}</div><div className="text-[11px] font-bold text-carbon-50">{l}</div></div>
                  ));
                })()}
              </div>
            </div>
          </div>

          {/* Notes banner */}
          <div className="ps-notes-banner bg-[#FFFBEB] border-2 border-[#F59E0B] rounded-2xl p-4 mb-6 shadow-sm">
            <div className="text-[10px] font-extrabold text-[#B45309] uppercase tracking-widest mb-2 flex items-center gap-2 before:content-['!'] before:bg-[#FEF3C7] before:text-[#92400E] before:w-4 before:h-4 before:flex before:items-center before:justify-center before:rounded-full before:font-black">Event notes &amp; alerts · all staff read</div>
            <textarea className="w-full bg-transparent border-none text-[13px] text-[#92400E] font-medium leading-relaxed outline-none resize-none placeholder-black/40" rows={3} value={event.notes||""} onChange={e=>onUpdate({notes:e.target.value})} placeholder="Add important notes here — allergies, special requests, client instructions…"/>
          </div>

          {/* Menu chips */}
          {event.menuSelections?.length>0&&(
            <div className="ps-menu-bar bg-white border border-bd rounded-xl p-3 px-4 mb-8 shadow-sm">
              <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Auto-calculated from menu</div>
              <div className="flex flex-wrap gap-2 items-center">
                {event.menuSelections.map(s=><span key={s.key} className="text-[11px] font-semibold text-carbon-300 bg-bg px-2 py-1 rounded-md border border-bd">{s.label||(RECIPES[s.key]?.label)||s.key}: {s.qty}</span>)}
                <button className="text-[11px] font-semibold bg-transparent rounded-full px-2.5 py-0.5 cursor-pointer ml-1 hover:opacity-80 transition-opacity" style={{color:sc.bar,border:`1px solid ${sc.bar}`}} onClick={onEditMenu}>Edit menu →</button>
              </div>
            </div>
          )}

          {/* Category sections */}
          {GROUP_ORDER.map((g,gIdx)=>{
            const items=bygroup[g];if(!items.length)return null;
            const open=!collapsed[g];
            const grpPrepped=items.filter(x=>x.prepped?.trim()).length;
            return(
              <div key={g} className="mb-8" ref={el=>catRefs.current[g]=el}>
                <div className="ps-cat-hdr flex items-center p-3 px-4 rounded-xl text-white cursor-pointer select-none mb-2 shadow-md" style={{background:sc.bar}} onClick={()=>setCollapsed(p=>({...p,[g]:!p[g]}))}>
                  <span className="bg-black/20 text-white font-extrabold text-[11px] w-6 h-6 rounded-full flex items-center justify-center mr-3">{String(gIdx+1).padStart(2,"0")}</span>
                  <span className="text-[15px] font-bold tracking-wide flex-1">{GROUPS[g].label}</span>
                  <span className="text-xs font-semibold opacity-90 mr-4">{grpPrepped} of {items.length} prepped</span>
                  <span className={`ps-cat-arr text-sm font-bold transition-transform opacity-70 ${open?"rotate-180":""}`}>▾</span>
                </div>
                {open&&(
                  <div className="bg-white border border-bd rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full border-collapse">
                      <thead><tr className="text-left text-[10px] font-extrabold tracking-[.1em] text-muted uppercase bg-bg">
                        <th className="py-2.5 px-3 border-b border-bd">Ingredient</th>
                        <th className="py-2.5 px-3 border-b border-bd">QTY</th>
                        <th className="py-2.5 px-3 border-b border-bd">Unit</th>
                        <th className="py-2.5 px-3 border-b border-bd w-[7%]">Container</th>
                        <th className="py-2.5 px-3 border-b border-bd w-[32%]">Notes / Variation</th>
                        <th className="py-2.5 px-3 border-b border-bd">Prepped</th>
                        <th className="py-2.5 px-3 border-b border-bd">Loaded</th>
                        <th className="py-2.5 px-3 border-b border-bd">Return…</th>
                        <th className="py-2.5 px-3 border-b border-bd"></th>
                      </tr></thead>
                      <tbody>
                        {items.map(item=>(
                          <ItemRow key={item.id} item={item}
                            onUpdate={(patch)=>onUpdateItem(item.id,patch)}
                            onRemove={()=>onRemoveItem(item.id)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}

          {event.archived&&(
            <div className="mt-12 pt-8 border-t border-bd">
              <div className="text-lg font-extrabold text-carbon-300 mb-4">Post-Event Notes</div>
              <textarea className="w-full p-4 rounded-xl border border-bd bg-white text-[13px] outline-none focus:border-accent resize-none" rows={4} value={event.postNotes||""} onChange={e=>onUpdate({postNotes:e.target.value})} placeholder="How did it go? Notes for next time…"/>
            </div>
          )}
        </main>
      </div>

      {/* ── PRINT UI: MAIN PREP SHEET ── */}
      {(printMode === "prep" || printMode === "both") && (
      <div className="prep-print-only hidden">
        <div className="text-right text-[9px] text-[#A39991] uppercase tracking-widest font-bold mb-2">
          Printed: {new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"})} at {new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}
        </div>
        <div className="print-header">
          <div className="flex items-center gap-4">
            <div className="w-[30px] h-[30px] rounded-full bg-[#1A1714] shrink-0"/>
            <div>
              <div className="text-[16px] font-extrabold tracking-widest leading-none text-[#1A1714]">BORDER GRILL</div>
              <div className="text-[9px] font-bold tracking-widest text-[#54453A] mt-1">TRUCK + CATERING · PREP SHEET</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-extrabold text-[#1A1714] leading-tight mb-1">{event.name}</div>
            <div className="text-xs text-[#54453A] font-semibold">{event.truck}{event.date?` · ${fmt(event.date)}`:""}{event.startTime?` · ${fmtTime(event.startTime)}`:""}{event.guests?` · ${event.guests} guests`:""}</div>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-0 border border-[#E6E1DC] overflow-hidden mb-4 bg-[#FBF9F8]">
          {[
            ["ORDER READY BY", event.orderReadyBy?fmtTime(event.orderReadyBy):""],
            ["LOAD BY",        event.loadBy?fmtTime(event.loadBy):""],
            ["REVISED ON",     event.updatedAt?new Date(event.updatedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):""],
            ["KITCHEN MGR",    event.kitchenManager||""],
            ["LOAD DRIVER",    event.loadDriver||""],
            ["RETURNS DRIVER", event.returnsDriver||""],
          ].map(([lbl,val])=>(
            <div key={lbl} className="p-2.5 px-3 border-r border-[#E6E1DC] last:border-r-0">
              <div className="text-[8px] font-extrabold tracking-widest text-[#A39991] uppercase mb-1">{lbl}</div>
              <div className="text-xs font-bold text-[#1A1714]">{val}</div>
            </div>
          ))}
        </div>

        {event.notes?.trim()&&(
          <div className="border border-[#D97706] bg-[#FFFBEB] p-3 rounded-xl mb-6">
            <div className="text-[9px] font-extrabold tracking-widest text-[#B45309] uppercase mb-1">EVENT NOTES &amp; ALERTS — VISIBLE TO ALL STAFF</div>
            <div className="text-xs text-[#92400E] font-medium leading-relaxed">{event.notes}</div>
          </div>
        )}

        {/* PRINT CATEGORY SECTIONS */}
        {GROUP_ORDER.map(g=>{
          const items=bygroup[g]; if(!items.length)return null;
          return (
            <div key={g} className="mb-6 break-inside-avoid">
              <div className="flex justify-between items-center px-4 py-2 text-white font-extrabold text-[13px] uppercase tracking-widest" style={{background: sc.bar}}>
                <span>{GROUPS[g].label}</span>
                <span className="text-[11px] opacity-90">{items.length} items</span>
              </div>
              <table className="w-full border-collapse text-[10px]">
                <thead>
                  <tr className="text-left font-extrabold tracking-[.1em] text-[#A39991] uppercase bg-[#FBF9F8] border-b border-[#E6E1DC]">
                    <th className="p-1">ITEM</th>
                    <th className="p-1 text-center">QTY</th>
                    <th className="p-1 text-center">UNIT</th>
                    <th className="p-1 w-[10%] text-center">CONTAINER</th>
                    <th className="p-1 w-[32%]">NOTES / VARIATION</th>
                    <th className="p-1 text-center">PREPPED</th>
                    <th className="p-1 text-center">LOADED</th>
                    <th className="p-1 text-center">RETURN...</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item=>(
                    <tr key={item.id} className="border-b border-[#E6E1DC] text-[#1A1714]">
                      <td className="p-1 font-bold text-[11px]">
                        {item.name}
                        {item.variation&&<div className="italic text-[#54453A] text-[9px] font-normal mt-0.5">{item.variation}</div>}
                      </td>
                      <td className="p-1 text-center font-extrabold text-[11px]">{item.quantity||" "}</td>
                      <td className="p-1 text-center text-[#54453A] font-bold">{item.unit||" "}</td>
                      <td className="p-1 text-center text-[#54453A] font-bold">{item.container||" "}</td>
                      <td className="p-1 italic text-[#54453A] font-bold">{item.notes||" "}</td>
                      <td className="p-1 text-center italic text-[#A39991] text-[9px]">{item.prepped?.trim()?item.prepped:"initials"}</td>
                      <td className="p-1 text-center italic text-[#A39991] text-[9px]">{item.loaded?.trim()?item.loaded:"qty"}</td>
                      <td className="p-1 text-center italic text-[#A39991] text-[9px]">{item.returned?.trim()?item.returned:"qty"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })}

        <div className="flex justify-between mt-12 gap-8 break-inside-avoid">
          {[["Kitchen Manager","kitchenManager"],["Load Driver","loadDriver"],["Returns Driver","returnsDriver"]].map(([lbl,key])=>(
            <div key={key} className="flex-1">
              <div className="text-[11px] font-bold text-[#1A1714] mb-5">{lbl}</div>
              <div className="border-b border-[#1A1714]"/>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* ── PRINT UI: PER DISH BREAKDOWN ── */}
      {(printMode === "perdish" || printMode === "both") && (
      <div className="perdish-print hidden">
        <div className="text-right text-[9px] text-[#A39991] uppercase tracking-widest font-bold mb-2">
          Printed: {new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"})} at {new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}
        </div>
        <div className="print-header">
          <div className="flex items-center gap-4">
            <div className="w-[30px] h-[30px] rounded-full bg-[#1A1714] shrink-0"/>
            <div>
              <div className="text-[16px] font-extrabold tracking-widest leading-none text-[#1A1714]">BORDER GRILL</div>
              <div className="text-[9px] font-bold tracking-widest text-[#54453A] mt-1">TRUCK + CATERING · PER DISH BREAKDOWN</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-extrabold text-[#1A1714] leading-tight mb-1">{event.name}</div>
            <div className="text-xs text-[#54453A] font-semibold">{event.truck}{event.date?` · ${fmt(event.date)}`:""}{event.startTime?` · ${fmtTime(event.startTime)}`:""}{event.guests?` · ${event.guests} guests`:""}</div>
          </div>
        </div>
        {event.notes?.trim()&&(
          <div className="border border-[#D97706] bg-[#FFFBEB] p-3 rounded-xl mb-4">
            <div className="text-[9px] font-extrabold tracking-widest text-[#B45309] uppercase mb-1">EVENT NOTES &amp; ALERTS — VISIBLE TO ALL STAFF</div>
            <div className="text-xs text-[#92400E] font-medium leading-relaxed">{event.notes}</div>
          </div>
        )}
        <div className="text-sm font-extrabold uppercase tracking-widest text-[#1A1714] border-b border-[#1A1714] pb-2 mb-4 mt-6">Ingredient Quantities Per Dish</div>
        <div className="grid grid-cols-1 gap-4">
          {(event.menuSelections||[]).map(({key,qty,notes,ingNotes})=>{
            const recipe=RECIPES[key]; if(!recipe)return null;
            const ings=recipe.ingredients.filter(i=>ING[i.name]).map(i=>{
              const cfg=ING[i.name];
              const amount="ea" in i?Math.ceil(i.ea*qty):Math.ceil((i.oz||0)*qty/cfg.opU);
              return{name:i.name,qty:amount,unit:cfg.unit,container:cfg.container||"",note:(ingNotes||{})[i.name]||""};
            });
            return(
              <div key={key} className="border border-[#D4CCC2] rounded-lg overflow-hidden flex flex-col mb-4 break-inside-avoid">
                <div className="flex justify-between items-center px-3 py-2 text-white" style={{background:RCAT_COLORS[recipe.cat]||"#374151"}}>
                  <span className="text-[13px] font-bold leading-tight">{recipe.label}</span>
                  <span className="text-[11px] font-extrabold opacity-90 tracking-wide uppercase bg-black/20 px-2 py-0.5 rounded-full">{qty} {recipe.servingWord}{qty!==1?"s":""}</span>
                </div>
                {notes?.trim()&&(
                  <div className="text-[9px] py-1 px-2.5 bg-[#FFFBEB] border-b border-[#F0B429] italic text-[#92400E]">
                    {notes}
                  </div>
                )}
                <table className="w-full border-collapse text-[10px]">
                  <thead><tr>
                    <th className="text-left text-[9px] font-extrabold tracking-[.1em] text-[#A39991] uppercase p-1 border-b border-[#E6E1DC]">INGREDIENT</th>
                    <th className="text-center text-[9px] font-extrabold tracking-[.1em] text-[#A39991] uppercase p-1 border-b border-[#E6E1DC]">QTY</th>
                    <th className="text-center text-[9px] font-extrabold tracking-[.1em] text-[#A39991] uppercase p-1 border-b border-[#E6E1DC]">UNIT</th>
                    <th className="text-left text-[9px] font-extrabold tracking-[.1em] text-[#A39991] uppercase p-1 border-b border-[#E6E1DC]">CONTAINER</th>
                    <th className="text-left text-[9px] font-extrabold tracking-[.1em] text-[#A39991] uppercase p-1 border-b border-[#E6E1DC]">NOTES</th>
                  </tr></thead>
                  <tbody>
                    {ings.map(i=>(
                      <tr key={i.name}>
                        <td className="text-left font-bold text-[#1A1714] p-1 border-b border-[#E6E1DC]">{i.name}</td>
                        <td className="text-center font-bold text-[#1A1714] p-1 border-b border-[#E6E1DC]">{i.qty}</td>
                        <td className="text-center text-[#54453A] p-1 border-b border-[#E6E1DC]">{i.unit}</td>
                        <td className="text-left text-[#54453A] p-1 border-b border-[#E6E1DC]">{i.container||"—"}</td>
                        <td className="text-left italic text-[#54453A] p-1 border-b border-[#E6E1DC]">{i.note||""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {showDrawer&&<ManualDrawer event={event} ING={ING} onClose={()=>setShowDrawer(false)} onAdd={items=>{onAddItems(items);setShowDrawer(false);}}/>}
    </>
  );
}
