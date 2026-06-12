import { useState, useRef, useMemo } from "react";
import { GROUPS, GROUP_ORDER, STICKER, getSticker, RECIPE_CATS, RCAT_COLORS } from "../data/constants";
import { TimeSmart } from "./EventForm";
import { uid } from "../utils/calc";

export function DItem({item,gkey,checked,already,onToggle}){
  return(
    <div className="ditem" onClick={already?undefined:onToggle} style={{opacity:already?.45:1,cursor:already?"default":"pointer"}}>
      <input type="checkbox" checked={checked} onChange={onToggle} disabled={already} onClick={e=>e.stopPropagation()}/>
      <div style={{flex:1}}>
        <div className="ditem-name">{item.name}{already&&<span style={{fontSize:10,color:"#9CA3AF"}}> (on sheet)</span>}</div>
        <div className="ditem-meta">{item.unit}{item.container?` · ${item.container}`:""}</div>
      </div>
    </div>
  );
}

export function ItemRow({item,onUpdate,onRemove}){
  const [editing,setEditing]=useState(false);
  const isAuto=item.fromMenu&&!editing;
  return(
    <tr>
      <td><div className="iname">{item.name}</div>{item.fromMenu&&!editing&&<div className="icalc"> from menu</div>}{item.variation&&<div className="ivar">{item.variation}</div>}</td>
      <td><input className={`ci ci-qty${isAuto?" auto":""}`} type="number" placeholder="—" value={item.quantity||""} onFocus={()=>setEditing(true)} onBlur={()=>setEditing(false)} onChange={e=>onUpdate({quantity:e.target.value})}/></td>
      <td><input className="ci ci-sm" value={item.unit||""} onChange={e=>onUpdate({unit:e.target.value})}/></td>
      <td><input className="ci" value={item.container||""} onChange={e=>onUpdate({container:e.target.value})}/></td>
      <td><input className="ci" placeholder="notes or variation…" value={item.notes||""} style={{fontStyle:item.notes?"italic":"normal"}} onChange={e=>onUpdate({notes:e.target.value})}/></td>
      <td><input className={`ci ci-init${item.prepped?.trim()?" ci-prepped":""}`} placeholder="initials" value={item.prepped||""} onChange={e=>onUpdate({prepped:e.target.value})}/></td>
      <td><input className="ci ci-init" placeholder="qty" value={item.loaded||""} onChange={e=>onUpdate({loaded:e.target.value})}/></td>
      <td><input className="ci ci-init" placeholder="qty" value={item.returned||""} onChange={e=>onUpdate({returned:e.target.value})}/></td>
      <td><button className="rmv" onClick={onRemove}>×</button></td>
    </tr>
  );
}

export function ManualDrawer({event,ING,onClose,onAdd}){
  const [search,setSearch]=useState(""); const [sel,setSel]=useState({}); const [activeCat,setActiveCat]=useState("PROTEINS");
  const [custom,setCustom]=useState({show:false,name:"",group:"PROTEINS",unit:"",container:"",notes:"",variation:""});
  const existing=new Set(event.items.map(i=>i.name.toLowerCase()));
  const toggle=(g,name)=>{const k=`${g}::${name}`;setSel(p=>({...p,[k]:!p[k]}));};
  const isChecked=(g,name)=>!!sel[`${g}::${name}`];
  const bygroup=useMemo(()=>{const out={};GROUP_ORDER.forEach(g=>{out[g]=Object.entries(ING).filter(([,cfg])=>cfg.group===g).map(([name,cfg])=>({name,...cfg}));});return out;},[ING]);
  const filtered=useMemo(()=>{if(!search)return null;const q=search.toLowerCase();const out={};Object.entries(ING).forEach(([name,cfg])=>{if(name.toLowerCase().includes(q)){if(!out[cfg.group])out[cfg.group]=[];out[cfg.group].push({name,...cfg});}});return out;},[search,ING]);
  const selCount=Object.values(sel).filter(Boolean).length;
  const sc=(k,v)=>setCustom(p=>({...p,[k]:v}));
  const handleAdd=()=>{
    const toAdd=Object.entries(sel).filter(([,v])=>v).map(([k])=>{const[g,name]=k.split("::");const cfg=ING[name]||{};return{id:uid(),group:g,category:g,name,quantity:"",unit:cfg.unit||"",container:cfg.container||"",notes:cfg.notes||"",variation:"",prepped:"",loaded:"",returned:"",qtyUsed:""};});
    onAdd(toAdd);
  };
  const handleCustom=()=>{if(!custom.name)return;onAdd([{id:uid(),group:custom.group,category:custom.group,name:custom.name,quantity:"",unit:custom.unit,container:custom.container,notes:custom.notes,variation:custom.variation,prepped:"",loaded:"",returned:"",qtyUsed:""}]);setCustom({show:false,name:"",group:"PROTEINS",unit:"",container:"",notes:"",variation:""});};
  return(
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="drawer">
        <div className="drawer-hdr"><div className="drawer-title">Add Items Manually</div><button className="drawer-x" onClick={onClose}>×</button></div>
        <div className="drawer-body">
          <input className="dsearch" placeholder="Search ingredients…" value={search} onChange={e=>setSearch(e.target.value)}/>
          {custom.show?(
            <div className="custom-box">
              <div className="cbx-title">Custom or Variation Item</div>
              <div className="cgrid">
                <div className="fg full"><label className="flabel">Item Name *</label><input className="finput" placeholder="e.g. Mango Habanero Salsa" value={custom.name} onChange={e=>sc("name",e.target.value)}/></div>
                <div className="fg"><label className="flabel">Group</label><select className="finput" value={custom.group} onChange={e=>sc("group",e.target.value)}>{GROUP_ORDER.map(g=><option key={g} value={g}>{GROUPS[g].label}</option>)}</select></div>
                <div className="fg"><label className="flabel">Unit</label><input className="finput" placeholder="qt, lb, ea…" value={custom.unit} onChange={e=>sc("unit",e.target.value)}/></div>
                <div className="fg"><label className="flabel">Container</label><input className="finput" placeholder="clear quart…" value={custom.container} onChange={e=>sc("container",e.target.value)}/></div>
                <div className="fg"><label className="flabel">Notes</label><input className="finput" value={custom.notes} onChange={e=>sc("notes",e.target.value)}/></div>
                <div className="fg full"><label className="flabel">Variation / Special Instruction</label><input className="finput" placeholder="dairy-free, extra spicy…" value={custom.variation} onChange={e=>sc("variation",e.target.value)}/></div>
              </div>
              <div style={{display:"flex",gap:7,marginTop:9}}>
                <button className="btn btn-secondary btn-sm" onClick={()=>sc("show",false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={handleCustom} disabled={!custom.name}>Add to Sheet</button>
              </div>
            </div>
          ):<button className="btn btn-secondary btn-sm" style={{width:"100%",marginBottom:9}} onClick={()=>sc("show",true)}>+ Add Custom or Variation Item</button>}
          {!search&&<div className="cat-tabs">{GROUP_ORDER.map(g=><button key={g} className={`ctab ${activeCat===g?"ctab-active":"ctab-idle"}`} style={activeCat===g?{background:GROUPS[g].color}:{}} onClick={()=>setActiveCat(g)}>{GROUPS[g].label.split(" ")[0]}</button>)}</div>}
          {search?(
            filtered&&Object.keys(filtered).length>0?Object.entries(filtered).map(([g,items])=>(
              <div key={g}><div className="dlabel" style={{color:GROUPS[g]?.color}}>{GROUPS[g]?.label||g}</div>
              {items.map(item=><DItem key={item.name} item={item} gkey={g} checked={isChecked(g,item.name)} already={existing.has(item.name.toLowerCase())} onToggle={()=>toggle(g,item.name)}/>)}</div>
            )):<div style={{color:"var(--muted)",fontSize:13,padding:"10px 0"}}>No items found. Add a custom item above.</div>
          ):(bygroup[activeCat]||[]).map(item=><DItem key={item.name} item={item} gkey={activeCat} checked={isChecked(activeCat,item.name)} already={existing.has(item.name.toLowerCase())} onToggle={()=>toggle(activeCat,item.name)}/>)}
        </div>
        <div className="drawer-foot">
          <div className="sel-info">{selCount>0?`${selCount} item${selCount!==1?"s":""} selected`:"Select items or add a custom item above"}</div>
          <div className="dflex">
            <button className="btn btn-secondary" style={{flex:1}} onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" style={{flex:2}} onClick={handleAdd} disabled={!selCount}>Add {selCount||""} Item{selCount!==1?"s":""} →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PrepSheet({event,ING,RECIPES,onUpdate,onUpdateItem,onRemoveItem,onAddItems,onDelete,onEditMenu,onEdit,onPrint,printMode}){
  const [collapsed,setCollapsed]=useState({});
  const [showDrawer,setShowDrawer]=useState(false);
  const [activeGroup,setActiveGroup]=useState(null);
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
    <div className="ps-grid">
      {/* ── CONTEXT RAIL ── */}
      <aside className="ctx-rail">
        <div>
          <div className="rail-event-name">{event.name}</div>
          <div className="rail-client">{event.truck}{event.guests?` · ${event.guests} guests`:""}</div>
        </div>
        <div className="rail-progress-card">
          <div className="rail-progress-label">Prep progress</div>
          <div><span className="rail-progress-nums">{prepped}</span><span className="rail-progress-denom"> / {total} items</span></div>
          <div className="rail-progress-bar"><div className="rail-progress-fill" style={{width:`${pct}%`,background:sc.bar}}/></div>
          <div className="rail-stat-row">
            <span className="rail-stat"><strong>{loaded}</strong> loaded</span>
            <span className="rail-stat"><strong>{returned}</strong> returned</span>
            {acc!==null&&<span className="rail-stat"><strong>{acc}%</strong> accuracy</span>}
          </div>
        </div>
        <div>
          <div className="rail-jump-title">Jump to category</div>
          {nonEmptyGroups.map(g=>{
            const items=bygroup[g];
            const grpPrepped=items.filter(x=>x.prepped?.trim()).length;
            const grpPct=items.length>0?Math.round(grpPrepped/items.length*100):0;
            return(
              <div key={g} className={`rail-jump-item ${activeGroup===g?"active":""}`} onClick={()=>{setActiveGroup(g);scrollToGroup(g);}}>
                <span className="rail-jump-name">{GROUPS[g].label}</span>
                <span className="rail-jump-count">{grpPrepped}/{items.length}</span>
                <div className="rail-jump-bar"><div className="rail-jump-bar-fill" style={{width:`${grpPct}%`,background:sc.bar}}/></div>
              </div>
            );
          })}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <button className="rail-btn rail-btn-ghost" onClick={()=>setShowDrawer(true)}>Add Item</button>
          <button className="rail-btn rail-btn-ghost" onClick={onEditMenu}>Edit Menu</button>
          <button className="rail-btn rail-btn-ghost" onClick={onEdit}>Edit Event</button>
          <button className="rail-btn rail-btn-ghost" onClick={onPrint}>Print</button>
          <button style={{width:"100%",padding:"9px 14px",borderRadius:8,border:"1.5px solid var(--red)",background:"var(--red-bg)",color:"var(--red)",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onDelete}>Delete Event</button>
        </div>
      </aside>

      {/* ── WORK AREA ── */}
      <main className="ps-work">

        {/* ── PRINT-ONLY HEADER (hidden on screen, shown when printing) ── */}
        <div className="prep-print-only">
          <div className="print-header">
            <div className="print-logo-wrap">
              <div className="print-logo-mark" style={{width:30,height:30,borderRadius:"50%",background:"#1A1714",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,fontWeight:800,letterSpacing:".02em",flexShrink:0}}>BG</div>
              <div>
                <div className="print-logo-text">BORDER GRILL</div>
                <div className="print-logo-sub">TRUCK + CATERING · PREP SHEET</div>
              </div>
            </div>
            <div className="print-event-right">
              <div className="print-event-title">{event.name}</div>
              <div className="print-event-meta">{event.truck}{event.date?` · ${fmt(event.date)}`:""}{event.startTime?` · ${fmtTime(event.startTime)}`:""}{event.guests?` · ${event.guests} guests`:""}</div>
              <div className="print-timestamp">Printed: {new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"})} at {new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}</div>
            </div>
          </div>
          <div className="print-meta-row">
            {[
              ["ORDER READY BY", event.orderReadyBy?fmtTime(event.orderReadyBy):""],
              ["LOAD BY",        event.loadBy?fmtTime(event.loadBy):""],
              ["REVISED ON",     event.updatedAt?new Date(event.updatedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):""],
              ["LOAD DRIVER",    event.loadDriver||""],
              ["RETURNS DRIVER", event.returnsDriver||""],
            ].map(([lbl,val])=>(
              <div key={lbl} className="print-meta-cell">
                <div className="print-meta-lbl">{lbl}</div>
                <div className="print-meta-val">{val}</div>
              </div>
            ))}
          </div>
          {event.notes?.trim()&&(
            <div className="print-notes-box">
              <div className="print-notes-lbl">EVENT NOTES &amp; ALERTS — VISIBLE TO ALL STAFF</div>
              <div className="print-notes-txt">{event.notes}</div>
            </div>
          )}
        </div>

        {/* Header card */}
        <div className="ps-hdr-card">
          <div className="ps-hdr-stripe" style={{background:sc.bar}}/>
          <div className="ps-hdr-body">
            <div style={{display:"flex",gap:24,alignItems:"flex-start"}}>
              <div style={{flex:1,minWidth:0}}>
                <div className="ps-event-eyebrow" style={{color:sc.bar}}>{event.date?fmtShort(event.date):""}{daysUntil!==null?` · ${daysLabel}`:""}</div>
                <div className="ps-event-name">{event.name}</div>
                <div className="ps-event-meta">{event.truck}{event.guests?` · ${event.guests} guests`:""}{event.startTime?` · service at ${fmtTime(event.startTime)}`:""}</div>
              </div>
              <div style={{flexShrink:0,display:"flex",flexDirection:"column",gap:12,minWidth:340}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
                  {[["Order Ready","orderReadyBy"],["Load Time","loadBy"],["Start Time","startTime"]].map(([lbl,key])=>(
                    <div key={key}>
                      <div className="ps-meta-lbl">{lbl}</div>
                      <TimeSmart value={event[key]||""} onChange={v=>onUpdate({[key]:v})}/>
                    </div>
                  ))}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
                  {[["Loaded By","loadDriver","text"],["Return By","returnsDriver","text"]].map(([lbl,key])=>(
                    <div key={key}>
                      <div className="ps-meta-lbl">{lbl}</div>
                      <input className="ps-meta-inp" type="text" value={event[key]||""} onChange={e=>onUpdate({[key]:e.target.value})} placeholder="—"/>
                    </div>
                  ))}
                  <div>
                    <div className="ps-meta-lbl">Created</div>
                    <div style={{fontSize:12,fontWeight:600,color:"var(--carbon-300)",borderBottom:"1px solid var(--carbon-08)",paddingBottom:2,marginTop:2}}>
                      {event.createdAt?new Date(event.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"—"}
                    </div>
                  </div>
                  <div>
                    <div className="ps-meta-lbl">Created By</div>
                    <div style={{fontSize:12,fontWeight:600,color:"var(--carbon-300)",borderBottom:"1px solid var(--carbon-08)",paddingBottom:2,marginTop:2}}>
                      {event.createdBy?.name||"—"}
                    </div>
                  </div>
                </div>
                {event.updatedAt&&<div style={{fontSize:10,color:"var(--carbon-50)",letterSpacing:".06em"}}>Last revised: {new Date(event.updatedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})} at {new Date(event.updatedAt).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}</div>}
              </div>
            </div>
            <div className="ps-stat-ribbon">
              {(()=>{
                const untilLabel=hoursUntil===null?"—":hoursUntil<=0?"Now":hoursUntil<24?`${hoursUntil}h`:`${Math.floor(hoursUntil/24)}d ${hoursUntil%24}h`;
                return[["Items",total],["Prepped",prepped],["Loaded",loaded],["Categories",nonEmptyGroups.length],["Until Service",untilLabel]].map(([l,v])=>(
                  <div key={l} className="ps-stat"><div className="ps-stat-val">{v}</div><div className="ps-stat-lbl">{l}</div></div>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* Notes banner */}
        <div className="ps-notes-banner">
          <div className="ps-notes-eyebrow">Event notes &amp; alerts · all staff read</div>
          <textarea className="ps-notes-ta" rows={3} value={event.notes||""} onChange={e=>onUpdate({notes:e.target.value})} placeholder="Add important notes here — allergies, special requests, client instructions…"/>
        </div>

        {/* Menu chips */}
        {event.menuSelections?.length>0&&(
          <div className="ps-menu-bar">
            <div className="ps-menu-eyebrow">Auto-calculated from menu</div>
            <div className="ps-menu-chips">
              {event.menuSelections.map(s=><span key={s.key} className="ps-menu-chip">{s.label||(RECIPES[s.key]?.label)||s.key}: {s.qty}</span>)}
              <button style={{fontSize:11,fontWeight:600,color:sc.bar,background:"transparent",border:`1px solid ${sc.bar}`,borderRadius:20,padding:"3px 10px",cursor:"pointer",marginLeft:4}} onClick={onEditMenu}>Edit menu →</button>
            </div>
          </div>
        )}

        {/* Category sections */}
        {GROUP_ORDER.map((g,gIdx)=>{
          const items=bygroup[g];if(!items.length)return null;
          const open=!collapsed[g];
          const grpPrepped=items.filter(x=>x.prepped?.trim()).length;
          return(
            <div key={g} className="ps-cat-section" ref={el=>catRefs.current[g]=el}>
              <div className="ps-cat-hdr" style={{background:sc.bar}} onClick={()=>setCollapsed(p=>({...p,[g]:!p[g]}))}>
                <span className="ps-cat-num">{String(gIdx+1).padStart(2,"0")}</span>
                <span className="ps-cat-name">{GROUPS[g].label}</span>
                <span className="ps-cat-count">{grpPrepped} of {items.length} prepped</span>
                <span className={`ps-cat-arr ${open?"open":""}`}>▾</span>
              </div>
              {open&&(
                <div className="items-wrap">
                  <table className="items-tbl">
                    <thead><tr>
                      <th>Ingredient</th><th>QTY</th><th>Unit</th>
                      <th style={{width:"7%"}}>Container</th>
                      <th style={{width:"32%"}}>Notes / Variation</th>
                      <th>Prepped</th><th>Loaded</th><th>Returned</th><th/>
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
          <div className="post-notes-section">
            <div className="post-notes-title">Post-Event Notes</div>
            <textarea className="post-notes-ta" rows={4} value={event.postNotes||""} onChange={e=>onUpdate({postNotes:e.target.value})} placeholder="How did it go? Notes for next time…"/>
          </div>
        )}

        {/* ── PREP SHEET SIGNATURES (print only) ── */}
        <div className="print-sigs">
          {[["Kitchen Manager","kitchenManager"],["Load Driver","loadDriver"],["Returns Driver","returnsDriver"]].map(([lbl,key])=>(
            <div key={key} className="print-sig">
              <div className="print-sig-line"/>
              <div className="print-sig-name">{lbl}</div>
            </div>
          ))}
        </div>

        {/* ── PER DISH BREAKDOWN (print only, shown when pmode=perdish or both) ── */}
        <div className="perdish-print">
          <div className="perdish-own-header print-header">
            <div className="print-logo-wrap">
              <div style={{width:30,height:30,borderRadius:"50%",background:"#1A1714",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,fontWeight:800,flexShrink:0}}>BG</div>
              <div>
                <div className="print-logo-text">BORDER GRILL</div>
                <div className="print-logo-sub">TRUCK + CATERING · PER DISH BREAKDOWN</div>
              </div>
            </div>
            <div className="print-event-right">
              <div className="print-event-title">{event.name}</div>
              <div className="print-event-meta">{event.truck}{event.date?` · ${fmt(event.date)}`:""}{event.startTime?` · ${fmtTime(event.startTime)}`:""}{event.guests?` · ${event.guests} guests`:""}</div>
              <div className="perdish-own-timestamp print-timestamp">Printed: {new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"})} at {new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}</div>
            </div>
          </div>
          {event.notes?.trim()&&(
            <div className="print-notes-box">
              <div className="print-notes-lbl">EVENT NOTES &amp; ALERTS — VISIBLE TO ALL STAFF</div>
              <div className="print-notes-txt">{event.notes}</div>
            </div>
          )}
          <div className="perdish-section-title">Ingredient Quantities Per Dish</div>
          <div className="perdish-grid">
            {(event.menuSelections||[]).map(({key,qty,notes,ingNotes})=>{
              const recipe=RECIPES[key]; if(!recipe)return null;
              const ings=recipe.ingredients.filter(i=>ING[i.name]).map(i=>{
                const cfg=ING[i.name];
                const amount="ea" in i?Math.ceil(i.ea*qty):Math.ceil((i.oz||0)*qty/cfg.opU);
                return{name:i.name,qty:amount,unit:cfg.unit,container:cfg.container||"",note:(ingNotes||{})[i.name]||""};
              });
              return(
                <div key={key} className="perdish-dish">
                  <div className="perdish-dish-hdr" style={{background:RCAT_COLORS[recipe.cat]||"#374151"}}>
                    <span className="perdish-dish-name">{recipe.label}</span>
                    <span className="perdish-dish-qty">{qty} {recipe.servingWord}{qty!==1?"s":""}</span>
                  </div>
                  {notes?.trim()&&(
                    <div style={{fontSize:9,padding:"3px 9px",background:"#FFFBEB",borderBottom:"1px solid #F0B429",fontStyle:"italic",color:"#92400E"}}>
                      {notes}
                    </div>
                  )}
                  <table className="perdish-tbl">
                    <thead><tr>
                      <th className="pd-name">Ingredient</th>
                      <th className="pd-qty">Qty</th>
                      <th className="pd-unit">Unit</th>
                      <th className="pd-cont">Container</th>
                      <th className="pd-note">Notes</th>
                    </tr></thead>
                    <tbody>
                      {ings.map(i=>(
                        <tr key={i.name}>
                          <td className="pd-name">{i.name}</td>
                          <td className="pd-qty">{i.qty}</td>
                          <td className="pd-unit">{i.unit}</td>
                          <td className="pd-cont">{i.container||"—"}</td>
                          <td className="pd-note">{i.note||""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {showDrawer&&<ManualDrawer event={event} ING={ING} onClose={()=>setShowDrawer(false)} onAdd={items=>{onAddItems(items);setShowDrawer(false);}}/>}
    </div>
  );
}
