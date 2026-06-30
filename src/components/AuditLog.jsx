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
  menu_applied:"var(--color-clay-500)",
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
      <div className="text-3xl font-extrabold text-carbon-300 leading-tight tracking-[-.02em]">Audit Log</div>
      <div className="text-sm font-semibold text-carbon-50 mt-1 mb-6">{logs.length} total entries · Admin access only</div>

      <div className="flex gap-2.5 mb-4 flex-wrap">
        <input
          className="w-full max-w-[320px] box-border py-2 px-3.5 border border-carbon-12 rounded-lg bg-white text-[13px] outline-none focus:border-[#E08A75] transition-colors"
          placeholder="Search event, detail, or user…"
          value={search}
          onChange={e=>setSearch(e.target.value)}
        />
        <select
          className="h-9 px-2.5 rounded-lg border border-carbon-12 text-[13px] text-carbon-200 bg-white cursor-pointer outline-none focus:border-[#E08A75]"
          value={filterAction}
          onChange={e=>setFilterAction(e.target.value)}
        >
          <option value="all">All actions</option>
          {Object.entries(ACTION_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
        </select>
        <select
          className="h-9 px-2.5 rounded-lg border border-carbon-12 text-[13px] text-carbon-200 bg-white cursor-pointer outline-none focus:border-[#E08A75]"
          value={filterUser}
          onChange={e=>setFilterUser(e.target.value)}
        >
          <option value="all">All users</option>
          {users.map(u=><option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      {loading?(
        <div className="p-10 text-center font-medium text-carbon-50">Loading…</div>
      ):!filtered.length?(
        <EmptyStateWrapper
          illustration={EmptyAuditIllustration}
          title="No entries found"
          description="Try adjusting your filters."
          color="var(--carbon-50)"
        />
      ):(
        <div className="bg-white border border-bd rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-bg border-b border-bd text-left text-[10px] font-bold text-muted uppercase tracking-wider">
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Detail</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l=>(
                <tr key={l.id} className="border-b border-bd last:border-b-0 hover:bg-black/5 transition-colors">
                  <td className="py-3 px-4 text-[11px] text-carbon-50 whitespace-nowrap">{fmtTs(l.timestamp)}</td>
                  <td className="py-3 px-4 text-[13px] font-semibold text-carbon-300 whitespace-nowrap">{l.userName||"—"}</td>
                  <td className="py-3 px-4 text-[13px] text-carbon-200 max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap">{l.eventName||"—"}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-[11px] font-bold tracking-[.04em] uppercase" style={{color:ACTION_COLORS[l.action]||"var(--carbon-50)"}}>
                      {ACTION_LABELS[l.action]||l.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-carbon-50 max-w-[280px] overflow-hidden text-ellipsis whitespace-nowrap">{l.detail||"—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
