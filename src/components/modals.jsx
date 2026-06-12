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
    <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)onCancel();}}>
      <div className="modal">
        <div className="modal-title">Manager Access</div>
        <div className="modal-sub">Enter your PIN to access the manager interface</div>
        <input className="pin-input" type="password" maxLength={8} placeholder="••••" value={val} onChange={e=>{setVal(e.target.value);setErr(false);}} onKeyDown={e=>e.key==="Enter"&&tryPin()} autoFocus/>
        {err&&<div className="pin-error">Incorrect PIN. Try again.</div>}
        <div className="modal-actions">
          <button className="btn btn-secondary btn-sm" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={tryPin}>Enter</button>
        </div>
      </div>
    </div>
  );
}

// ─── PRINT MODAL ───
export function PrintModal({onClose,onPrint}){
  const doPrint=(mode)=>{ onClose(); onPrint(mode); };
  return(
    <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal" style={{width:400}}>
        <div className="modal-title">Print Options</div>
        <div className="modal-sub">Choose what to print for this event</div>
        <div className="print-modal-opt">
          <button className="print-opt-btn" onClick={()=>doPrint("prep")}>
            <div>
              <div className="print-opt-title">Prep Team Sheet</div>
              <div className="print-opt-desc">All ingredients grouped by category with quantities, containers, tracking columns, and signature lines</div>
            </div>
          </button>
          <button className="print-opt-btn" onClick={()=>doPrint("perdish")}>
            <div>
              <div className="print-opt-title">Per Dish Breakdown</div>
              <div className="print-opt-desc">Each dish with its own ingredient quantities — cooks know exactly what belongs to which dish</div>
            </div>
          </button>
          <button className="print-opt-btn" onClick={()=>doPrint("both")}>
            <div>
              <div className="print-opt-title">Print Both</div>
              <div className="print-opt-desc">Full prep list first, then per dish breakdown starting on a new page</div>
            </div>
          </button>

        </div>
        <div style={{textAlign:"right"}}><button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button></div>
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
    <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="edit-modal">
        <div className="modal-title">Edit Event Details</div>
        <div className="modal-sub">Changes apply immediately to the prep sheet</div>
        <div className="fgrid">
          <div className="fg full">
            <label className="flabel">Event Name *</label>
            <input className="finput" value={f.name} onChange={e=>s("name",e.target.value)} placeholder="Event name"/>
          </div>
          <div className="fg">
            <label className="flabel">Location</label>
            <input className="finput" value={f.truck} placeholder="e.g. Border Grill Truck" onChange={e=>s("truck",e.target.value)}/>
          </div>
          <div className="fg">
            <label className="flabel">Date</label>
            <input className="finput" type="date" value={f.date} onChange={e=>s("date",e.target.value)}/>
          </div>
          <div className="fg">
            <label className="flabel">Guest Count</label>
            <input className="finput" type="text" inputMode="numeric" placeholder="200" value={f.guests} onChange={e=>s("guests",e.target.value.replace(/\D/g,""))}/>
          </div>
          <div className="fg">
            <label className="flabel">Event Start Time</label>
            <TimeSmart value={f.startTime||""} onChange={v=>s("startTime",v)}/>
          </div>
          <div className="fg">
            <label className="flabel">Order Ready By</label>
            <TimeSmart value={f.orderReadyBy||""} onChange={v=>s("orderReadyBy",v)}/>
          </div>
          <div className="fg">
            <label className="flabel">Load By</label>
            <TimeSmart value={f.loadBy||""} onChange={v=>s("loadBy",v)}/>
          </div>
          <div className="fg full">
            <label className="flabel">Event Color — matches your sticker roll</label>
            <div className="color-picker-wrap" role="radiogroup" aria-label="Event Color">
              {EVENT_COLORS.map(c=>(
                <button key={c.hex} role="radio" aria-checked={f.color===c.hex} aria-label={`Select color ${c.name}`} className={`color-dot-btn ${f.color===c.hex?"selected":""}`} style={{background:STICKER[c.hex]?.dot||c.hex}} title={c.name} onClick={e=>{e.preventDefault();s("color",f.color===c.hex?"":c.hex);}}/>
              ))}
              {f.color&&<span style={{fontSize:12,color:"var(--muted)",marginLeft:4}}>{EVENT_COLORS.find(c=>c.hex===f.color)?.name}</span>}
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!f.name}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
