import { useState } from "react";
import { GROUPS, GROUP_ORDER, STICKER, getSticker } from "../data/constants";
import StepRail from "./StepRail";

export default function ReviewScreen({event,selections,calcItems,ING,RECIPES,onGenerate,onSaveDraft,onEditDetails,onEditMenu,onCancel}){
  const [ackAllergy,setAckAllergy]=useState(false);
  const sc=getSticker(event);
  const fmtTime=t=>{if(!t)return"—";const[h,m]=t.split(":");const hr=parseInt(h,10);return`${hr%12||12}:${m}${hr>=12?"pm":"am"}`};
  const fmtDate=d=>d?new Date(d+"T00:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}):"—";
  const daysUntil=event.date?Math.round((new Date(event.date+"T00:00:00")-new Date())/(1000*60*60*24)):null;
  const daysLabel=daysUntil===null?"":daysUntil<=0?"Today":daysUntil===1?"Tomorrow":`In ${daysUntil} days`;

  // Group calc items by group
  const byGroup=GROUP_ORDER.reduce((a,g)=>{
    a[g]=(calcItems||[]).filter(i=>(i.group||"SPECIALTY")===g);
    return a;
  },{});
  const nonEmpty=GROUP_ORDER.filter(g=>byGroup[g].length>0);

  const canGenerate=!event.notes||ackAllergy;
  return(
    <div className="max-w-[800px] w-full mx-auto pb-12">
      <StepRail current={2}/>

      <div className="w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-[10px] font-extrabold text-[#E08A75] uppercase tracking-[.15em] mb-1.5">Step 3 of 3</div>
            <div className="text-[32px] font-extrabold text-carbon-300 leading-tight tracking-[-.02em]">Review &amp; generate</div>
          </div>
          <button className="bg-white border border-[#D4CCC2] text-carbon-300 px-5 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer hover:bg-black/5 shadow-sm transition-colors" onClick={onCancel}>Cancel</button>
        </div>

        {/* What happens next */}
        <div className="bg-cactus-50 border border-cactus-100 p-6 rounded-2xl mb-6 shadow-sm">
          <div className="text-[10px] font-extrabold tracking-[.14em] uppercase text-cactus-700 mb-3">What happens next</div>
          <div className="grid grid-cols-2 gap-4">
            {["Prep sheet is created with all calculated quantities","Quantities can be adjusted on the sheet","Print or share with your team","Track prepped, loaded, and returned"].map((t,i)=>(
              <div key={i} className="flex gap-2.5 items-start">
                <div className="w-5 h-5 rounded-full bg-white border-[1.5px] border-cactus-400 flex items-center justify-center text-[10px] font-extrabold text-cactus-500 shrink-0 mt-0.5">{i+1}</div>
                <div className="text-[13px] font-medium text-carbon-300 leading-tight">{t}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ① Event recap */}
        <div className="bg-white border border-bd rounded-2xl overflow-hidden shadow-custom mb-6">
          <div className="h-1.5 w-full" style={{background:sc.bar}}/>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{background:sc.dot}}/>
                  <span className="text-[10px] font-extrabold tracking-[.16em] uppercase" style={{color:sc.ink}}>{daysLabel}</span>
                </div>
                <div className="text-[26px] font-extrabold tracking-[-.02em] text-carbon-300 leading-tight">{event.name||"Untitled event"}</div>
                <div className="text-[13px] font-medium text-muted mt-1">{event.truck||""}{event.guests?` · ${event.guests} guests`:""}</div>
              </div>
              <button className="bg-white border border-[#D4CCC2] text-carbon-300 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-black/5 transition-colors" onClick={onEditDetails}>Edit details</button>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-5 pt-5 border-t border-carbon-08">
              {[["Date",fmtDate(event.date)],["Guests",event.guests||"—"],["Truck",event.truck||"—"],["Service",fmtTime(event.startTime)],["Order Ready",fmtTime(event.orderReadyBy)],["Load By",fmtTime(event.loadBy)],["Kitchen Mgr",event.kitchenManager||"—"],["Load Driver",event.loadDriver||"—"]].map(([l,v])=>(
                <div key={l}>
                  <div className="text-[9px] font-extrabold tracking-[.1em] uppercase text-carbon-50 mb-1">{l}</div>
                  <div className="text-xs font-bold text-carbon-300">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ② Menu recap */}
        <div className="bg-white border border-bd rounded-2xl p-6 shadow-custom mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] font-extrabold tracking-[.16em] uppercase text-carbon-50">
                Menu · {selections.length} dish{selections.length!==1?"es":""} · {selections.reduce((s,x)=>s+(parseInt(x.qty)||0),0)} covers
              </div>
            </div>
            <button className="bg-white border border-[#D4CCC2] text-carbon-300 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-black/5 transition-colors" onClick={onEditMenu}>Edit menu</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selections.map(s=>(
              <div key={s.key} className="bg-white border border-carbon-12 rounded-full px-3 py-1.5 text-xs font-bold text-carbon-300 shadow-sm flex items-center gap-1.5">
                {s.label||(RECIPES[s.key]?.label)||s.key}
                <span className="text-[10px] font-extrabold text-[#E08A75]">×{s.qty}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ③ Generated prep list summary */}
        <div className="bg-white border border-bd rounded-2xl p-6 shadow-custom mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] font-extrabold tracking-[.16em] uppercase text-carbon-50">
                Generated prep list · {calcItems?.length||0} ingredients
              </div>
              <div className="text-xs font-medium text-muted mt-1">
                auto-merged from {selections.length} dish{selections.length!==1?"es":""}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {nonEmpty.map(g=>(
              <div key={g} className="bg-white border border-bd rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="px-3 py-2 text-[10px] font-extrabold tracking-widest uppercase text-white flex items-baseline justify-between" style={{background:sc.bar}}>
                  {GROUPS[g].label} <span className="opacity-80 font-semibold text-[9px]">({byGroup[g].length})</span>
                </div>
                {byGroup[g].slice(0,6).map(item=>(
                  <div key={item.id} className="flex justify-between items-center px-3 py-2 border-b border-dashed border-carbon-08 last:border-b-0 bg-white">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-carbon-300">{item.name}</span>
                      {item.variation && <span className="text-[9px] italic font-medium text-carbon-50 bg-black/5 px-1 py-0.5 rounded-sm self-start mt-0.5">{item.variation}</span>}
                    </div>
                    <span className="text-xs font-extrabold text-clay-700 ml-2 whitespace-nowrap shrink-0">{item.calculatedQty} {item.unit}</span>
                  </div>
                ))}
                {byGroup[g].length>6&&<div className="px-3 py-1.5 text-[11px] font-medium text-carbon-50 bg-bg text-center">+{byGroup[g].length-6} more</div>}
              </div>
            ))}
          </div>
        </div>

        {/* ④ Notes & allergy ack */}
        {event.notes&&(
          <div className="bg-sol-50 border-[1.5px] border-sol-400 rounded-xl p-5 mb-8">
            <div className="flex gap-3.5 items-start mb-3">
              <div className="w-7 h-7 rounded-full bg-sol-400 text-white font-extrabold flex items-center justify-center shrink-0">!</div>
              <div>
                <div className="text-[10px] font-extrabold tracking-[.16em] uppercase text-sol-700 mb-1.5">Notes & allergy alerts · carried to the prep sheet</div>
                <div className="text-[15px] font-medium text-carbon-300 leading-relaxed whitespace-pre-wrap">{event.notes}</div>
              </div>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer text-[13px] font-bold text-sol-700 pl-[42px]">
              <input type="checkbox" checked={ackAllergy} onChange={e=>setAckAllergy(e.target.checked)} className="w-4 h-4 accent-sol-400 cursor-pointer"/>
              I've read the allergy alerts before generating.
            </label>
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-3 pt-6 border-t border-carbon-08">
          <div className="flex-1">
            <button className="bg-white border border-[#D4CCC2] text-carbon-300 px-5 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer hover:bg-black/5 shadow-sm transition-colors" onClick={onEditMenu}>← Back to menu</button>
          </div>
          <button className="bg-white border border-[#D4CCC2] text-carbon-300 px-5 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer hover:bg-black/5 shadow-sm transition-colors" onClick={onSaveDraft}>Save as draft</button>
          <button className="bg-[#E08A75] text-white border-none px-6 py-3 rounded-xl text-sm font-bold shadow-custom transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-clay-600" onClick={onGenerate} disabled={!canGenerate}>
            Generate prep sheet →
          </button>
        </div>
      </div>
    </div>
  );
}
