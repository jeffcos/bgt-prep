import { useState, useEffect } from "react";
import { EVENT_COLORS, STICKER } from "../data/constants";

/* ── Segmented h:mm AM/PM time input ── */
export function TimeSmart({value,onChange}){
  const fmt=(v)=>{if(!v)return"";const[hh,mm]=v.split(":");const hr=parseInt(hh,10);return`${hr%12||12}:${mm}${hr>=12?"pm":"am"}`;};
  const [txt,setTxt]=useState(()=>fmt(value));
  useEffect(()=>setTxt(fmt(value)),[value]);
  const parse=(raw)=>{
    const s=raw.trim().toLowerCase().replace(/\s/g,"");
    if(!s)return"";
    const ispm=s.includes("p");const isam=s.includes("a");
    const digits=s.replace(/[^0-9:]/g,"");
    let h,m;
    if(digits.includes(":")){[h,m]=digits.split(":");}
    else if(digits.length<=2){h=digits;m="00";}
    else if(digits.length===3){h=digits[0];m=digits.slice(1);}
    else{h=digits.slice(0,2);m=digits.slice(2,4);}
    h=parseInt(h,10);m=parseInt(m||0,10);
    if(isNaN(h)||h<0||h>23)return"";
    if(ispm&&h!==12)h+=12;
    if(isam&&h===12)h=0;
    if(!ispm&&!isam&&h<7)h+=12;
    h=Math.min(h,23);m=Math.min(m,59);
    return`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
  };
  return(
    <input className="w-full box-border px-4 py-3 rounded-xl border border-carbon-20 bg-white text-[13px] font-medium outline-none focus:border-[#E08A75] transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.03)]" value={txt} placeholder="e.g. 1:30pm or 130p" onChange={e=>setTxt(e.target.value)} onBlur={()=>{const v=parse(txt);if(v){onChange(v);setTxt(fmt(v));}else if(!txt.trim()){onChange("");setTxt("");}}}/>
  );
}

export function EventForm({onSubmit,onCancel}){
  const [f,setF]=useState({name:"",truck:"",date:"",guests:"",startTime:"",orderReadyBy:"",loadBy:"",color:""});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  return(
    <div className="w-full max-w-[800px]">
      <div className="mb-8">
        <div>
          <div className="text-[10px] font-extrabold text-[#E08A75] uppercase tracking-[.15em] mb-1.5">Step 1 of 3</div>
          <div className="text-[32px] font-extrabold text-carbon-300 leading-tight tracking-[-.02em]">Enter event details</div>
        </div>
      </div>
      <div className="bg-white border border-bd rounded-2xl p-8 shadow-custom-md">
        <div className="grid grid-cols-[1fr_1fr] gap-x-6 gap-y-5 mb-8">
          <div className="flex flex-col gap-1.5 col-span-full"><label className="text-[11px] font-extrabold text-muted uppercase tracking-[.12em]">Event Name *</label><input className="w-full box-border px-4 py-3 rounded-xl border border-carbon-20 bg-white text-[13px] font-medium outline-none focus:border-[#E08A75] transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.03)]" placeholder="e.g. Smith Wedding · Google HQ Catering" value={f.name} onChange={e=>s("name",e.target.value)}/></div>
          <div className="flex flex-col gap-1.5"><label className="text-[11px] font-extrabold text-muted uppercase tracking-[.12em]">Location</label><input className="w-full box-border px-4 py-3 rounded-xl border border-carbon-20 bg-white text-[13px] font-medium outline-none focus:border-[#E08A75] transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.03)]" value={f.truck} placeholder="e.g. Border Grill Truck" onChange={e=>s("truck",e.target.value)}/></div>
          <div className="flex flex-col gap-1.5"><label className="text-[11px] font-extrabold text-muted uppercase tracking-[.12em]">Date</label><input className="w-full box-border px-4 py-3 rounded-xl border border-carbon-20 bg-white text-[13px] font-medium outline-none focus:border-[#E08A75] transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.03)]" type="date" value={f.date} onChange={e=>s("date",e.target.value)}/></div>
          <div className="flex flex-col gap-1.5"><label className="text-[11px] font-extrabold text-muted uppercase tracking-[.12em]">Guest Count</label><input className="w-full box-border px-4 py-3 rounded-xl border border-carbon-20 bg-white text-[13px] font-medium outline-none focus:border-[#E08A75] transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.03)]" type="text" inputMode="numeric" placeholder="200" value={f.guests} onChange={e=>s("guests",e.target.value.replace(/\D/g,""))}/></div>
          <div className="flex flex-col gap-1.5"><label className="text-[11px] font-extrabold text-muted uppercase tracking-[.12em]">Event Start Time</label><TimeSmart value={f.startTime||""} onChange={v=>s("startTime",v)}/></div>
          <div className="flex flex-col gap-1.5"><label className="text-[11px] font-extrabold text-muted uppercase tracking-[.12em]">Order Ready By</label><TimeSmart value={f.orderReadyBy||""} onChange={v=>s("orderReadyBy",v)}/></div>
          <div className="flex flex-col gap-1.5"><label className="text-[11px] font-extrabold text-muted uppercase tracking-[.12em]">Load By</label><TimeSmart value={f.loadBy||""} onChange={v=>s("loadBy",v)}/></div>
          <div className="flex flex-col gap-1.5 col-span-full">
            <label className="text-[11px] font-extrabold text-muted uppercase tracking-[.12em]">Event Color <span className="font-normal opacity-70">— matches your sticker roll</span></label>
            <div className="flex gap-2.5 items-center mt-1" role="radiogroup" aria-label="Event Color">
              {EVENT_COLORS.map(c=>(
                <button key={c.hex} role="radio" aria-checked={f.color===c.hex} aria-label={`Select color ${c.name}`} className={`w-7 h-7 rounded-full border-[3px] cursor-pointer transition-transform hover:scale-110 ${f.color===c.hex?"border-carbon-300 scale-110 shadow-sm":"border-transparent"}`} style={{background:STICKER[c.hex]?.dot||c.hex}} title={c.name} onClick={e=>{e.preventDefault();s("color",f.color===c.hex?"":c.hex);}}/>
              ))}
              {f.color&&<span className="text-xs text-muted ml-2">Selected: {EVENT_COLORS.find(c=>c.hex===f.color)?.name}</span>}
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center pt-6 border-t border-carbon-08 mt-6">
          <button className="bg-white border border-[#D4CCC2] text-carbon-300 px-5 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer hover:bg-black/5 shadow-sm transition-colors" onClick={onCancel}>Cancel</button>
          <button className="bg-[#E08A75] text-white border-none px-6 py-3 rounded-xl text-sm font-bold cursor-pointer hover:opacity-90 shadow-custom transition-colors disabled:opacity-50 disabled:cursor-not-allowed" onClick={()=>{if(f.name)onSubmit(f);}} disabled={!f.name}>Next: Build Menu →</button>
        </div>
      </div>
    </div>
  );
}
