import { useState } from "react";
import { EVENT_COLORS, STICKER } from "../data/constants";
import { TimeSmart } from "./EventForm";

// ─── PIN MODAL ───
export function PinModal({correctPin,ownerPin,onSuccess,onSuccessOwner,onCancel}){
  const [val,setVal]=useState(""); const [err,setErr]=useState(false);
  const tryPin=()=>{
    if(val===ownerPin&&onSuccessOwner){onSuccessOwner();return;}
    if(val===correctPin){onSuccess();return;}
    setErr(true);setVal("");
  };
  return(
    <div className="fixed inset-0 bg-carbon-300/60 backdrop-blur-[2px] flex items-center justify-center p-5 z-50" onClick={e=>{if(e.target===e.currentTarget)onCancel();}}>
      <div className="bg-white rounded-2xl p-8 w-full max-w-[440px] shadow-custom relative">
        <div className="text-[28px] font-extrabold text-carbon-300 leading-tight tracking-[-.02em] mb-1.5">Manager Access</div>
        <div className="text-[13px] font-medium text-carbon-50 mb-8">Enter your PIN to access the manager interface</div>
        <input className="w-full text-center text-[32px] tracking-[.5em] font-extrabold text-carbon-300 py-4 px-5 border-2 border-carbon-12 rounded-xl bg-bg outline-none focus:border-[#E08A75] transition-colors mb-6 shadow-sm" type="password" maxLength={8} placeholder="••••" value={val} onChange={e=>{setVal(e.target.value);setErr(false);}} onKeyDown={e=>e.key==="Enter"&&tryPin()} autoFocus/>
        {err&&<div className="text-sm font-bold text-red text-center -mt-3 mb-6 bg-red/10 py-2 rounded-lg">Incorrect PIN. Try again.</div>}
        <div className="flex gap-3 justify-end pt-6 border-t border-carbon-08">
          <button className="bg-white border border-[#D4CCC2] text-carbon-300 px-5 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer hover:bg-black/5 shadow-sm transition-colors" onClick={onCancel}>Cancel</button>
          <button className="bg-[#E08A75] text-white border-none px-6 py-2.5 rounded-xl text-[13px] font-bold shadow-custom transition-colors hover:bg-clay-600 cursor-pointer" onClick={tryPin}>Enter</button>
        </div>
      </div>
    </div>
  );
}

// ─── PRINT MODAL ───
export function PrintModal({onClose,onPrint}){
  const doPrint=(mode)=>{ onClose(); onPrint(mode); };
  return(
    <div className="fixed inset-0 bg-carbon-300/60 backdrop-blur-[2px] flex items-center justify-center p-5 z-50" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="bg-white rounded-2xl p-8 w-full max-w-[440px] shadow-custom relative">
        <div className="text-[28px] font-extrabold text-carbon-300 leading-tight tracking-[-.02em] mb-1.5">Print Options</div>
        <div className="text-[13px] font-medium text-carbon-50 mb-8">Choose what to print for this event</div>
        <div className="flex flex-col gap-3 mb-8">
          <button className="w-full text-left bg-bg border border-carbon-12 rounded-xl p-4 cursor-pointer transition-all hover:border-carbon-20 hover:bg-black/5 flex items-center justify-between group" onClick={()=>doPrint("prep")}>
            <div>
              <div className="text-[15px] font-bold text-carbon-300 mb-1">Prep Team Sheet</div>
              <div className="text-[13px] font-medium text-carbon-50 leading-snug">All ingredients grouped by category with quantities, containers, tracking columns, and signature lines</div>
            </div>
          </button>
          <button className="w-full text-left bg-bg border border-carbon-12 rounded-xl p-4 cursor-pointer transition-all hover:border-carbon-20 hover:bg-black/5 flex items-center justify-between group" onClick={()=>doPrint("perdish")}>
            <div>
              <div className="text-[15px] font-bold text-carbon-300 mb-1">Per Dish Breakdown</div>
              <div className="text-[13px] font-medium text-carbon-50 leading-snug">Each dish with its own ingredient quantities — cooks know exactly what belongs to which dish</div>
            </div>
          </button>
          <button className="w-full text-left bg-bg border border-carbon-12 rounded-xl p-4 cursor-pointer transition-all hover:border-carbon-20 hover:bg-black/5 flex items-center justify-between group" onClick={()=>doPrint("both")}>
            <div>
              <div className="text-[15px] font-bold text-carbon-300 mb-1">Print Both</div>
              <div className="text-[13px] font-medium text-carbon-50 leading-snug">Full prep list first, then per dish breakdown starting on a new page</div>
            </div>
          </button>

        </div>
        <div className="text-right">
          <button className="bg-white border border-[#D4CCC2] text-carbon-300 px-5 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer hover:bg-black/5 shadow-sm transition-colors" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── EDIT EVENT MODAL ───
export function EditEventModal({event,onSave,onClose}){
  const [f,setF]=useState({
    name:event.name||"",
    truck:event.truck||"",
    date:event.date||"",
    guests:event.guests||"",
    startTime:event.startTime||"",
    orderReadyBy:event.orderReadyBy||"",
    loadBy:event.loadBy||"",
    color:event.color||"",
  });
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const handleSave=()=>{ if(!f.name)return; onSave(f); };

  return(
    <div className="fixed inset-0 bg-carbon-300/60 backdrop-blur-[2px] flex items-center justify-center p-5 z-50" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="bg-white rounded-2xl p-8 w-full max-w-[800px] shadow-custom relative max-h-[90vh] overflow-y-auto">
        <div className="text-[28px] font-extrabold text-carbon-300 leading-tight tracking-[-.02em] mb-1.5">Edit Event Details</div>
        <div className="text-[13px] font-medium text-carbon-50 mb-8">Changes apply immediately to the prep sheet</div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-8">
          <div className="flex flex-col gap-1.5 col-span-full">
            <label className="text-[11px] font-extrabold text-muted uppercase tracking-[.12em]">Event Name *</label>
            <input className="w-full box-border px-4 py-3 rounded-xl border border-carbon-20 bg-white text-[13px] font-medium outline-none focus:border-[#E08A75] transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.03)]" value={f.name} onChange={e=>s("name",e.target.value)} placeholder="Event name"/>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold text-muted uppercase tracking-[.12em]">Location</label>
            <input className="w-full box-border px-4 py-3 rounded-xl border border-carbon-20 bg-white text-[13px] font-medium outline-none focus:border-[#E08A75] transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.03)]" value={f.truck} placeholder="e.g. Border Grill Truck" onChange={e=>s("truck",e.target.value)}/>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold text-muted uppercase tracking-[.12em]">Date</label>
            <input className="w-full box-border px-4 py-3 rounded-xl border border-carbon-20 bg-white text-[13px] font-medium outline-none focus:border-[#E08A75] transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.03)]" type="date" value={f.date} onChange={e=>s("date",e.target.value)}/>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold text-muted uppercase tracking-[.12em]">Guest Count</label>
            <input className="w-full box-border px-4 py-3 rounded-xl border border-carbon-20 bg-white text-[13px] font-medium outline-none focus:border-[#E08A75] transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.03)]" type="text" inputMode="numeric" placeholder="200" value={f.guests} onChange={e=>s("guests",e.target.value.replace(/\D/g,""))}/>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold text-muted uppercase tracking-[.12em]">Event Start Time</label>
            <TimeSmart value={f.startTime||""} onChange={v=>s("startTime",v)}/>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold text-muted uppercase tracking-[.12em]">Order Ready By</label>
            <TimeSmart value={f.orderReadyBy||""} onChange={v=>s("orderReadyBy",v)}/>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold text-muted uppercase tracking-[.12em]">Load By</label>
            <TimeSmart value={f.loadBy||""} onChange={v=>s("loadBy",v)}/>
          </div>
          <div className="flex flex-col gap-1.5 col-span-full">
            <label className="text-[11px] font-extrabold text-muted uppercase tracking-[.12em]">Event Color — matches your sticker roll</label>
            <div className="flex gap-2.5 items-center" role="radiogroup" aria-label="Event Color">
              {EVENT_COLORS.map(c=>(
                <button key={c.hex} role="radio" aria-checked={f.color===c.hex} aria-label={`Select color ${c.name}`} className={`w-7 h-7 rounded-full border-[3px] cursor-pointer transition-transform hover:scale-110 ${f.color===c.hex?"border-carbon-300 scale-110 shadow-sm":"border-transparent"}`} style={{background:STICKER[c.hex]?.dot||c.hex}} title={c.name} onClick={e=>{e.preventDefault();s("color",f.color===c.hex?"":c.hex);}}/>
              ))}
              {f.color&&<span className="text-xs text-muted ml-2">{EVENT_COLORS.find(c=>c.hex===f.color)?.name}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-6 border-t border-carbon-08">
          <button className="bg-white border border-[#D4CCC2] text-carbon-300 px-5 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer hover:bg-black/5 shadow-sm transition-colors" onClick={onClose}>Cancel</button>
          <button className="bg-[#E08A75] text-white border-none px-6 py-2.5 rounded-xl text-[13px] font-bold shadow-custom transition-colors hover:bg-clay-600 cursor-pointer disabled:opacity-50" onClick={handleSave} disabled={!f.name}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
