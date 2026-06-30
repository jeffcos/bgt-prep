import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useAppContext } from "../../context/AppContext";
import { EmptyStateWrapper, EmptyDeletedIllustration } from "../../components/EmptyStateVisuals";

export function RecycleBinView() {
  const { ops } = useAppContext();
  const [deletedEvents, setDeletedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeleted();
  }, []);

  const fetchDeleted = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "events"), where("deleted", "==", true));
      const snap = await getDocs(q);
      setDeletedEvents(snap.docs.map(d => d.data()));
    } catch (err) {
      console.error("Failed to fetch deleted events", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (ev) => {
    await ops.updateEvent(ev.id, { deleted: false, deletedAt: null }, ev.name);
    setDeletedEvents(prev => prev.filter(e => e.id !== ev.id));
  };

  const handlePurge = async (ev) => {
    if (confirm(`Permanently delete "${ev.name}"? This cannot be undone.`)) {
      await ops.purgeEvent(ev.id);
      setDeletedEvents(prev => prev.filter(e => e.id !== ev.id));
    }
  };

  return (
    <div>
      <div className="text-3xl font-extrabold text-carbon-300 leading-tight mb-2">Recycle Bin</div>
      <div className="text-sm font-semibold text-carbon-50 mb-10">{deletedEvents.length} deleted event{deletedEvents.length !== 1 ? "s" : ""} · Admin access only</div>
      
      {loading ? (
        <div className="p-10 text-center text-carbon-50">Loading recycle bin...</div>
      ) : deletedEvents.length === 0 ? (
        <EmptyStateWrapper
          illustration={EmptyDeletedIllustration}
          title="No deleted events"
          description="Deleted events will appear here and can be restored."
          color="var(--carbon-50)"
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {deletedEvents.sort((a, b) => new Date(b.deletedAt || 0) - new Date(a.deletedAt || 0)).map(ev => (
            <div key={ev.id} className="bg-white border border-bd rounded-xl px-4.5 py-3.5 flex items-center gap-4">
              <div className="flex-1">
                <div className="font-bold text-sm text-carbon-300">{ev.name}</div>
                <div className="text-xs text-muted mt-0.5">{ev.truck} · {ev.date} · {ev.guests} guests</div>
                <div className="text-[11px] text-muted mt-0.5">Deleted {ev.deletedAt ? new Date(ev.deletedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : ""}</div>
              </div>
              <button className="bg-white border border-[#D4CCC2] text-carbon-300 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-black/5 transition-colors" onClick={() => handleRestore(ev)}>Restore</button>
              <button className="bg-red-bg border border-red text-red px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-red hover:text-white transition-colors" onClick={() => handlePurge(ev)}>Purge</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
