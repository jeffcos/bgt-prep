import { useState } from "react";

export default function PastEvents({events,onRestore,onSelect,onDuplicate}){
  const [search,setSearch]=useState("");
  const archived=events.filter(e=>e.archived).sort((a,b)=>{
    if(!a.date&&!b.date)return 0;if(!a.date)return 1;if(!b.date)return -1;
    return new Date(b.date)-new Date(a.date);
  });
  const filtered=archived.filter(ev=>{
    if(!search)return true;
    const q=search.toLowerCase();
    return ev.name.toLowerCase().includes(q)||ev.truck?.toLowerCase().includes(q)||ev.notes?.toLowerCase().includes(q)||ev.postNotes?.toLowerCase().includes(q);
  });
  const fmt=d=>d?new Date(d+"T00:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"}):"No date";
  const fmtTime=t=>{if(!t)return"";const[h,m]=t.split(":");const hr=parseInt(h,10);return`${hr%12||12}:${m}${hr>=12?"pm":"am"}`};

  const calcAcc=ev=>{let tl=0,tr=0;ev.items.forEach(i=>{const l=parseFloat(i.loaded);const r=parseFloat(i.returned);if(!isNaN(l)&&l>0){tl+=l;if(!isNaN(r)&&r>=0)tr+=r;}});if(tl===0)return null;return Math.round(((tl-tr)/tl)*100);};
  return(
    <div>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:16}}>
        <div>
          <div className="page-title">Past Events</div>
          <div className="page-sub">{archived.length} archived event{archived.length!==1?"s":""} · Auto-archived 36 hours after event start</div>
        </div>
      </div>
      <div style={{marginBottom:14}}>
        <input
          className="dash-search"
          style={{maxWidth:400}}
          placeholder="Search past events by name, truck, or notes…"
          value={search}
          onChange={e=>setSearch(e.target.value)}
        />
      </div>
      {!archived.length?(
        <div className="empty-state"><h3>No past events yet</h3><p>Events are automatically archived 36 hours after their start time.</p></div>
      ):!filtered.length?(
        <div className="empty-state"><h3>No results for "{search}"</h3><p>Try a different search term.</p></div>
      ):(
        <table className="past-events-tbl">
          <thead><tr><th>Event</th><th>Date</th><th>Guests</th><th>Items</th><th>Prepped</th><th>Accuracy</th><th>Event Notes</th><th>Post-Event Notes</th><th></th></tr></thead>
          <tbody>{filtered.map(ev=>{
            const prepped=ev.items.filter(i=>i.prepped?.trim()).length;
            const acc=calcAcc(ev);
            const accColor=acc===null?"var(--muted)":acc>=85?"var(--green)":acc>=65?"var(--amber)":"#DC2626";
            return(<tr key={ev.id} onClick={()=>onSelect(ev.id)}>
              <td><div className="past-ev-name">{ev.name}</div><div className="past-ev-meta">{ev.truck}{ev.startTime?` · ${fmtTime(ev.startTime)}`:""}</div></td>
              <td style={{fontSize:12,color:"var(--muted)"}}>{fmt(ev.date)}</td>
              <td style={{fontSize:13,fontWeight:600}}>{ev.guests||"—"}</td>
              <td style={{fontSize:13}}>{ev.items.length}</td>
              <td style={{fontSize:13}}>{prepped}/{ev.items.length}</td>
              <td style={{fontSize:13,fontWeight:700,color:accColor}}>{acc!==null?`${acc}%`:"—"}</td>
              <td style={{fontSize:12,color:"var(--muted)",maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.notes||"—"}</td>
              <td style={{fontSize:12,color:"var(--muted)",maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.postNotes||<span style={{fontStyle:"italic",color:"var(--border2)"}}>No notes yet</span>}</td>
              <td onClick={e=>e.stopPropagation()} style={{whiteSpace:"nowrap"}}>
                <button className="btn btn-secondary btn-sm" onClick={()=>onRestore(ev.id)}>Restore</button>
                <button className="btn btn-secondary btn-sm" style={{marginLeft:6}} onClick={()=>onDuplicate(ev.id)}>Duplicate</button>
              </td>
            </tr>);
          })}</tbody>
        </table>
      )}
    </div>
  );
}
