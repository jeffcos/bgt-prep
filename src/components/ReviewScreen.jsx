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
    <div className="wiz-layout-single">
      <StepRail current={2}/>

      <div style={{width:"100%"}}>
        <div className="wiz-hdr">
          <div>
            <div className="wiz-step-eyebrow">Step 3 of 3</div>
            <div className="wiz-title">Review &amp; generate</div>
          </div>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </div>

        {/* What happens next */}
        <div className="wiz-card" style={{background:"var(--cactus-50)",border:"1px solid var(--cactus-100)",padding:"20px 24px",marginBottom:20}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:"var(--cactus-700)",marginBottom:12}}>What happens next</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {["Prep sheet is created with all calculated quantities","Quantities can be adjusted on the sheet","Print or share with your team","Track prepped, loaded, and returned"].map((t,i)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <div style={{width:20,height:20,borderRadius:"50%",background:"#fff",border:"1.5px solid var(--cactus-400)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"var(--cactus-500)",flexShrink:0,marginTop:1}}>{i+1}</div>
                <div style={{fontSize:13,color:"var(--carbon-50)",lineHeight:1.4}}>{t}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ① Event recap */}
        <div className="wiz-card" style={{padding:0,overflow:"hidden"}}>
          <div style={{height:6,background:sc.bar}}/>
          <div style={{padding:"20px 24px"}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:sc.dot,flexShrink:0}}/>
                  <span style={{fontSize:10,fontWeight:700,letterSpacing:".16em",textTransform:"uppercase",color:sc.ink}}>{daysLabel}</span>
                </div>
                <div style={{fontSize:26,fontWeight:700,letterSpacing:"-.02em",color:"var(--carbon-300)",lineHeight:1.1}}>{event.name||"Untitled event"}</div>
                <div style={{fontSize:13,fontFamily:"var(--font-serif)",color:"var(--carbon-50)",marginTop:3}}>{event.truck||""}{event.guests?` · ${event.guests} guests`:""}</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={onEditDetails}>Edit details</button>
            </div>
            <div className="review-meta-grid">
              {[["Date",fmtDate(event.date)],["Guests",event.guests||"—"],["Truck",event.truck||"—"],["Service",fmtTime(event.startTime)],["Order Ready",fmtTime(event.orderReadyBy)],["Load By",fmtTime(event.loadBy)],["Kitchen Mgr",event.kitchenManager||"—"],["Load Driver",event.loadDriver||"—"]].map(([l,v])=>(
                <div key={l}><div className="review-meta-label">{l}</div><div className="review-meta-val">{v}</div></div>
              ))}
            </div>
          </div>
        </div>

        {/* ② Menu recap */}
        <div className="wiz-card">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:".16em",textTransform:"uppercase",color:"var(--carbon-50)"}}>
                Menu · {selections.length} dish{selections.length!==1?"es":""} · {selections.reduce((s,x)=>s+(parseInt(x.qty)||0),0)} covers
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={onEditMenu}>Edit menu</button>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {selections.map(s=>(
              <div key={s.key} className="menu-pill">
                {s.label||(RECIPES[s.key]?.label)||s.key}
                <span className="menu-pill-count">×{s.qty}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ③ Generated prep list summary */}
        <div className="wiz-card">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:".16em",textTransform:"uppercase",color:"var(--carbon-50)"}}>
                Generated prep list · {calcItems?.length||0} ingredients
              </div>
              <div style={{fontSize:12,fontFamily:"var(--font-serif)",color:"var(--carbon-50)",marginTop:3}}>
                auto-merged from {selections.length} dish{selections.length!==1?"es":""}
              </div>
            </div>
          </div>
          <div className="review-prep-grid">
            {nonEmpty.map(g=>(
              <div key={g} className="review-cat-card">
                <div className="review-cat-hdr" style={{background:sc.bar}}>
                  {GROUPS[g].label} <span style={{opacity:.7,fontWeight:400,fontSize:9}}>({byGroup[g].length})</span>
                </div>
                {byGroup[g].slice(0,6).map(item=>(
                  <div key={item.name} className="review-cat-row">
                    <span style={{color:"var(--carbon-300)",fontSize:11}}>{item.name}</span>
                    <span style={{fontWeight:700,color:"var(--clay-600)",fontSize:12,marginLeft:8,whiteSpace:"nowrap"}}>{item.calculatedQty} {item.unit}</span>
                  </div>
                ))}
                {byGroup[g].length>6&&<div style={{padding:"6px 12px",fontSize:11,color:"var(--carbon-50)"}}>+{byGroup[g].length-6} more</div>}
              </div>
            ))}
          </div>
        </div>

        {/* ④ Notes & allergy ack */}
        {event.notes&&(
          <div className="allergy-ack">
            <div style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:12}}>
              <div className="allergy-icon">!</div>
              <div>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:".16em",textTransform:"uppercase",color:"var(--sol-700)",marginBottom:6}}>Notes & allergy alerts · carried to the prep sheet</div>
                <div style={{fontSize:15,fontFamily:"var(--font-serif)",color:"var(--carbon-300)",lineHeight:1.5,whiteSpace:"pre-wrap"}}>{event.notes}</div>
              </div>
            </div>
            <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:13,fontWeight:600,color:"var(--sol-700)"}}>
              <input type="checkbox" checked={ackAllergy} onChange={e=>setAckAllergy(e.target.checked)} style={{accentColor:"var(--sol-400)",width:16,height:16}}/>
              I've read the allergy alerts before generating.
            </label>
          </div>
        )}

        {/* Action bar */}
        <div className="wiz-action-bar">
          <div className="wiz-action-bar-left">
            <button className="btn btn-secondary" onClick={onEditMenu}>← Back to menu</button>
          </div>
          <button className="btn btn-secondary" onClick={onSaveDraft}>Save as draft</button>
          <button className="btn btn-primary" onClick={onGenerate} disabled={!canGenerate} style={{opacity:canGenerate?1:.5,cursor:canGenerate?"pointer":"not-allowed"}}>
            Generate prep sheet →
          </button>
        </div>
      </div>
    </div>
  );
}
