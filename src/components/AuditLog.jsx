import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { EmptyStateWrapper, EmptyAuditIllustration } from "./EmptyStateVisuals";

const ACTION_LABELS={
  event_created:"Created",
  event_updated:"Updated",
  event_deleted:"Deleted",
  event_archived:"Archived",
  event_duplicated:"Duplicated",
  item_added:"Item Added",
  item_removed:"Item Removed",
  item_updated:"Item Updated",
  menu_applied:"Menu Applied",
};

const ACTION_COLORS={
  event_created:"var(--cactus-400)",
  event_updated:"var(--clay-400)",
  event_deleted:"#DC2626",
  event_archived:"var(--carbon-50)",
  event_duplicated:"var(--clay-300)",
  item_added:"var(--cactus-400)",
  item_removed:"#DC2626",
  item_updated:"var(--clay-400)",
  menu_applied:"var(--clay-500)",
};

function fmtTs(ts){
  if(!ts)return"—";
  const d=new Date(ts);
  return d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})+" at "+d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});
}

export default function AuditLog(){
  const [logs,setLogs]=useState([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState("");
  const [filterAction,setFilterAction]=useState("all");
  const [filterUser,setFilterUser]=useState("all");

  useEffect(()=>{
    const q=query(collection(db,"auditLogs"),orderBy("timestamp","desc"),limit(1000));
    const unsub=onSnapshot(q,snap=>{
      setLogs(snap.docs.map(d=>({id:d.id,...d.data()})));
      setLoading(false);
    },()=>setLoading(false));
    return unsub;
  },[]);

  const users=[...new Set(logs.map(l=>l.userName).filter(Boolean))].sort();

  const filtered=logs.filter(l=>{
    if(filterAction!=="all"&&l.action!==filterAction)return false;
    if(filterUser!=="all"&&l.userName!==filterUser)return false;
    if(search){
      const q=search.toLowerCase();
      return(l.eventName||"").toLowerCase().includes(q)||(l.detail||"").toLowerCase().includes(q)||(l.userName||"").toLowerCase().includes(q);
    }
    return true;
  });

  return(
    <div>
      <div className="mgr-page-title">Audit Log</div>
      <div className="mgr-page-sub">{logs.length} total entries · Owner access only</div>

      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <input
          className="dash-search"
          style={{flex:"1 1 220px",maxWidth:320}}
          placeholder="Search event, detail, or user…"
          value={search}
          onChange={e=>setSearch(e.target.value)}
        />
        <select
          style={{height:36,padding:"0 10px",borderRadius:8,border:"1px solid var(--carbon-12)",fontSize:13,color:"var(--carbon-200)",background:"#fff",cursor:"pointer"}}
          value={filterAction}
          onChange={e=>setFilterAction(e.target.value)}
        >
          <option value="all">All actions</option>
          {Object.entries(ACTION_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
        </select>
        <select
          style={{height:36,padding:"0 10px",borderRadius:8,border:"1px solid var(--carbon-12)",fontSize:13,color:"var(--carbon-200)",background:"#fff",cursor:"pointer"}}
          value={filterUser}
          onChange={e=>setFilterUser(e.target.value)}
        >
          <option value="all">All users</option>
          {users.map(u=><option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      {loading?(
        <div style={{padding:40,textAlign:"center",color:"var(--carbon-50)"}}>Loading…</div>
      ):!filtered.length?(
        <EmptyStateWrapper
          illustration={EmptyAuditIllustration}
          title="No entries found"
          description="Try adjusting your filters."
          color="var(--carbon-50)"
        />
      ):(
        <table className="past-events-tbl">
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Event</th>
              <th>Action</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(l=>(
              <tr key={l.id}>
                <td style={{fontSize:11,color:"var(--carbon-50)",whiteSpace:"nowrap"}}>{fmtTs(l.timestamp)}</td>
                <td style={{fontSize:13,fontWeight:600,color:"var(--carbon-300)",whiteSpace:"nowrap"}}>{l.userName||"—"}</td>
                <td style={{fontSize:13,color:"var(--carbon-200)",maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.eventName||"—"}</td>
                <td style={{whiteSpace:"nowrap"}}>
                  <span style={{fontSize:11,fontWeight:700,color:ACTION_COLORS[l.action]||"var(--carbon-50)",letterSpacing:".04em",textTransform:"uppercase"}}>
                    {ACTION_LABELS[l.action]||l.action}
                  </span>
                </td>
                <td style={{fontSize:12,color:"var(--carbon-50)",maxWidth:280,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.detail||"—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
