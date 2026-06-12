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
    <input className="finput" value={txt} placeholder="e.g. 1:30pm or 130p" onChange={e=>setTxt(e.target.value)} onBlur={()=>{const v=parse(txt);if(v){onChange(v);setTxt(fmt(v));}else if(!txt.trim()){onChange("");setTxt("");}}}/>
  );
}

export function EventForm({onSubmit,onCancel}){
  const [f,setF]=useState({name:"",truck:"",date:"",guests:"",startTime:"",orderReadyBy:"",loadBy:"",color:""});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  return(
    <div style={{maxWidth:860}}>
      <div className="page-title" style={{marginBottom:3}}>New Event</div>
      <div className="page-sub">Step 1 of 2 — Enter event details</div>
      <div className="fcard">
        <div className="fgrid">
          <div className="fg full"><label className="flabel">Event Name *</label><input className="finput" placeholder="e.g. Smith Wedding · Google HQ Catering" value={f.name} onChange={e=>s("name",e.target.value)}/></div>
          <div className="fg"><label className="flabel">Location</label><input className="finput" value={f.truck} placeholder="e.g. Border Grill Truck" onChange={e=>s("truck",e.target.value)}/></div>
          <div className="fg"><label className="flabel">Date</label><input className="finput" type="date" value={f.date} onChange={e=>s("date",e.target.value)}/></div>
          <div className="fg"><label className="flabel">Guest Count</label><input className="finput" type="text" inputMode="numeric" placeholder="200" value={f.guests} onChange={e=>s("guests",e.target.value.replace(/\D/g,""))}/></div>
          <div className="fg"><label className="flabel">Event Start Time</label><TimeSmart value={f.startTime||""} onChange={v=>s("startTime",v)}/></div>
          <div className="fg"><label className="flabel">Order Ready By</label><TimeSmart value={f.orderReadyBy||""} onChange={v=>s("orderReadyBy",v)}/></div>
          <div className="fg"><label className="flabel">Load By</label><TimeSmart value={f.loadBy||""} onChange={v=>s("loadBy",v)}/></div>
          <div className="fg full">
            <label className="flabel">Event Color <span style={{fontWeight:400,color:"var(--muted)"}}>— matches your sticker roll</span></label>
            <div className="color-picker-wrap" role="radiogroup" aria-label="Event Color">
              {EVENT_COLORS.map(c=>(
                <button key={c.hex} role="radio" aria-checked={f.color===c.hex} aria-label={`Select color ${c.name}`} className={`color-dot-btn ${f.color===c.hex?"selected":""}`} style={{background:STICKER[c.hex]?.dot||c.hex}} title={c.name} onClick={e=>{e.preventDefault();s("color",f.color===c.hex?"":c.hex);}}/>
              ))}
              {f.color&&<span style={{fontSize:12,color:"var(--muted)",marginLeft:4}}>Selected: {EVENT_COLORS.find(c=>c.hex===f.color)?.name}</span>}
            </div>
          </div>
        </div>
        <div className="faction">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>{if(f.name)onSubmit(f);}} disabled={!f.name}>Next: Build Menu →</button>
        </div>
      </div>
    </div>
  );
}
