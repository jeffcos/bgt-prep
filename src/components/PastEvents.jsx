import React, { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, getDocs, startAfter } from "firebase/firestore";
import { db } from "../firebase";
import { EmptyStateWrapper, EmptyEventsIllustration, EmptySearchIllustration } from "./EmptyStateVisuals";
import { useAppContext } from "../context/AppContext";

export default function PastEvents({ onSelect, onDuplicate }) {
  const { ops } = useAppContext();
  const [archived, setArchived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");

  const PAGE_SIZE = 20;

  useEffect(() => {
    fetchEvents(true);
  }, []);

  const fetchEvents = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    let q = query(
      collection(db, "events"),
      where("archived", "==", true),
      orderBy("date", "desc"),
      limit(PAGE_SIZE)
    );

    if (!isInitial && lastDoc) {
      q = query(
        collection(db, "events"),
        where("archived", "==", true),
        orderBy("date", "desc"),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );
    }

    try {
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => d.data());
      setArchived(prev => isInitial ? docs : [...prev, ...docs]);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(docs.length === PAGE_SIZE);
    } catch (err) {
      console.error("Failed to fetch past events", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    await ops.updateEvent(id, { archived: false });
    setArchived(prev => prev.filter(e => e.id !== id));
  };

  const filtered = archived.filter(ev => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (ev.name || "").toLowerCase().includes(q) || 
           (ev.truck || "").toLowerCase().includes(q) || 
           (ev.notes || "").toLowerCase().includes(q) || 
           (ev.postNotes || "").toLowerCase().includes(q);
  });

  const fmt = d => d ? new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "No date";
  const fmtTime = t => { if (!t) return ""; const [h, m] = t.split(":"); const hr = parseInt(h, 10); return `${hr % 12 || 12}:${m}${hr >= 12 ? "pm" : "am"}` };

  const calcAcc = ev => {
    let tl = 0, tr = 0;
    (ev.items || []).forEach(i => {
      const l = parseFloat(i.loaded); const r = parseFloat(i.returned);
      if (!isNaN(l) && l > 0) { tl += l; if (!isNaN(r) && r >= 0) tr += r; }
    });
    if (tl === 0) return null; return Math.round(((tl - tr) / tl) * 100);
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="text-[28px] font-extrabold tracking-tight text-carbon-300 leading-tight">Past Events</div>
          <div className="text-sm text-carbon-50 mt-1 font-medium">Auto-archived 36 hours after event start</div>
        </div>
      </div>
      <div className="mb-4">
        <input
          className="w-full max-w-[400px] box-border px-3.5 py-2.5 rounded-xl border border-bd bg-white text-[13px] outline-none focus:border-accent transition-colors"
          placeholder="Search loaded past events by name, truck, or notes…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--carbon-50)" }}>Loading past events...</div>
      ) : !archived.length ? (
        <EmptyStateWrapper
          illustration={EmptyEventsIllustration}
          title="No past events yet"
          description="Events are automatically archived 36 hours after their start time."
          color="var(--carbon-50)"
        />
      ) : !filtered.length ? (
        <EmptyStateWrapper
          illustration={EmptySearchIllustration}
          title={`No results for "${search}"`}
          description="Try a different search term."
          color="var(--carbon-50)"
        />
      ) : (
        <>
          <div className="bg-white border border-bd rounded-2xl overflow-hidden shadow-custom">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-bg border-b border-bd text-left text-[10px] font-bold text-muted uppercase tracking-wider">
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Guests</th>
                  <th className="py-3 px-4 text-center">Items</th>
                  <th className="py-3 px-4 text-center">Prepped</th>
                  <th className="py-3 px-4 text-center">Accuracy</th>
                  <th className="py-3 px-4">Event Notes</th>
                  <th className="py-3 px-4">Post-Event Notes</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>{filtered.map(ev => {
                const prepped = (ev.items || []).filter(i => i.prepped?.trim()).length;
                const totalItems = (ev.items || []).length;
                const acc = calcAcc(ev);
                const accColor = acc === null ? "text-muted" : acc >= 85 ? "text-green" : acc >= 65 ? "text-amber" : "text-red";
                return (<tr key={ev.id} onClick={() => onSelect(ev.id)} className="border-b border-bd hover:bg-bg cursor-pointer transition-colors last:border-b-0">
                  <td className="py-3.5 px-4"><div className="font-bold text-carbon-300">{ev.name}</div><div className="text-[11px] text-muted uppercase tracking-wider font-semibold mt-0.5">{ev.truck}{ev.startTime ? ` · ${fmtTime(ev.startTime)}` : ""}</div></td>
                  <td className="py-3.5 px-4 text-xs text-muted">{fmt(ev.date)}</td>
                  <td className="py-3.5 px-4 text-[13px] font-semibold text-right text-carbon-300">{ev.guests || "—"}</td>
                  <td className="py-3.5 px-4 text-[13px] text-center text-carbon-200">{totalItems}</td>
                  <td className="py-3.5 px-4 text-[13px] text-center text-carbon-200">{prepped}/{totalItems}</td>
                  <td className={`py-3.5 px-4 text-[13px] font-bold text-center ${accColor}`}>{acc !== null ? `${acc}%` : "—"}</td>
                  <td className="py-3.5 px-4 text-xs text-muted max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap">{ev.notes || "—"}</td>
                  <td className="py-3.5 px-4 text-xs text-muted max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap">{ev.postNotes || <span className="italic text-bd-2">No notes yet</span>}</td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    <button className="bg-white border border-[#D4CCC2] text-carbon-300 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:bg-black/5 transition-colors" onClick={() => handleRestore(ev.id)}>Restore</button>
                    <button className="bg-white border border-[#D4CCC2] text-carbon-300 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:bg-black/5 transition-colors ml-1.5" onClick={() => onDuplicate(ev.id)}>Duplicate</button>
                  </td>
                </tr>);
              })}</tbody>
            </table>
          </div>
          {hasMore && !search && (
            <div className="text-center mt-6">
              <button className="bg-white border border-[#D4CCC2] text-carbon-300 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer shadow-sm hover:bg-black/5 transition-colors" onClick={() => fetchEvents(false)}>Load More</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
