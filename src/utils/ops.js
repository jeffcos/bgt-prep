import { collection, doc, setDoc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";
import { uid } from "./calc";

const AUDIT_FIELD_LABELS = { name: "Event name", date: "Date", guests: "Guests", truck: "Truck", startTime: "Start time", orderReadyBy: "Order ready by", loadBy: "Load by", loadDriver: "Load driver", returnsDriver: "Returns driver", notes: "Notes", postNotes: "Post-event notes" };
const AUDIT_ITEM_LABELS = { quantity: "Qty", unit: "Unit", container: "Container", notes: "Notes", prepped: "Prepped", loaded: "Loaded", returned: "Returned", variation: "Variation" };

export function makeOps(db, getUser) {
  const log = async (eventId, eventName, action, detail) => {
    try {
      const u = getUser() || {};
      await addDoc(collection(db, "auditLogs"), { eventId, eventName, action, detail, userId: u.uid || "", userName: u.name || "Unknown", timestamp: new Date().toISOString() });
    } catch (e) {
      console.error("Audit log failed:", e);
    }
  };

  const createEvent = async (data) => {
    const id = uid();
    const u = getUser() || {};
    const ev = { id, ...data, items: [], menuSelections: [], createdAt: new Date().toISOString(), createdBy: { uid: u.uid || "", name: u.name || "Unknown" }, archived: false };
    await setDoc(doc(db, "events", id), ev);
    log(id, data.name || "", "event_created", "Created event");
    return ev;
  };

  const updateEvent = async (id, patch, eventName) => {
    await updateDoc(doc(db, "events", id), patch);
    const loggable = Object.entries(patch).filter(([k]) => AUDIT_FIELD_LABELS[k]);
    if (loggable.length) {
      const detail = loggable.map(([k, v]) => `${AUDIT_FIELD_LABELS[k]}: ${v}`).join("; ");
      log(id, eventName || "", "event_updated", detail);
    } else if (patch.draft === false) {
      log(id, eventName || "", "event_updated", "Finalized prep sheet");
    }
  };

  const deleteEvent = async (id, eventName) => {
    await updateDoc(doc(db, "events", id), { deleted: true, deletedAt: new Date().toISOString() });
    log(id, eventName || "", "event_deleted", "Deleted event");
  };

  const archiveEvent = async (id, events) => {
    const ev = events.find(e => e.id === id);
    if (!ev) return;
    await updateDoc(doc(db, "events", id), { archived: !ev.archived });
    log(id, ev.name, "event_archived", ev.archived ? "Restored event" : "Archived event");
  };

  const duplicateEvent = async (id, events) => {
    const src = events.find(e => e.id === id);
    if (!src) return null;
    const newId = uid();
    const u = getUser() || {};
    const ev = {
      ...src, id: newId, name: `${src.name} (Copy)`, createdAt: new Date().toISOString(), createdBy: { uid: u.uid || "", name: u.name || "Unknown" }, archived: false,
      items: src.items.map(i => ({ ...i, id: uid(), prepped: "", loaded: "", returned: "" }))
    };
    await setDoc(doc(db, "events", newId), ev);
    log(newId, ev.name, "event_duplicated", `Duplicated from "${src.name}"`);
    return ev;
  };

  const updateItem = async (evId, iid, patch, events) => {
    const ev = events.find(e => e.id === evId);
    if (!ev) return;
    const item = ev.items.find(i => i.id === iid);
    const items = ev.items.map(i => i.id === iid ? { ...i, ...patch } : i);
    await updateDoc(doc(db, "events", evId), { items, updatedAt: new Date().toISOString() });
    if (item) {
      const changed = Object.entries(patch).filter(([k, v]) => AUDIT_ITEM_LABELS[k] && String(v || "") !== String(item[k] || ""));
      if (changed.length) {
        const detail = `${item.name}: ` + changed.map(([k, v]) => `${AUDIT_ITEM_LABELS[k]} → ${v || "(cleared)"}`).join(", ");
        log(evId, ev.name, "item_updated", detail);
      }
    }
  };

  const removeItem = async (evId, iid, events) => {
    const ev = events.find(e => e.id === evId);
    if (!ev) return;
    const item = ev.items.find(i => i.id === iid);
    const items = ev.items.filter(i => i.id !== iid);
    await updateDoc(doc(db, "events", evId), { items });
    if (item) log(evId, ev.name, "item_removed", `Removed item: ${item.name}`);
  };

  const addItems = async (evId, newItems, events) => {
    const ev = events.find(e => e.id === evId);
    if (!ev) return;
    const existing = new Set(ev.items.map(i => i.name.toLowerCase()));
    const toAdd = newItems.filter(i => !existing.has(i.name.toLowerCase()));
    const items = [...ev.items, ...toAdd];
    await updateDoc(doc(db, "events", evId), { items });
    if (toAdd.length) log(evId, ev.name, "item_added", `Added ${toAdd.length} item${toAdd.length !== 1 ? "s" : ""}: ${toAdd.map(i => i.name).join(", ")}`);
  };

  const applyMenu = async (evId, sel, calcItems, events) => {
    const ev = events.find(e => e.id === evId);
    if (!ev) return;
    const existing = ev.items.filter(i => !i.fromMenu);
    
    const calc = calcItems.map(ci => ({
      id: uid(), ...ci,
      quantity: String(ci.calculatedQty), fromMenu: true, calcQty: ci.calculatedQty,
      prepped: "", loaded: "", returned: "", qtyUsed: "",
      notes: ci.notes || "",
      variation: ci.variation || ""
    }));
    await updateDoc(doc(db, "events", evId), { menuSelections: sel, items: [...existing, ...calc] });
    log(evId, ev.name, "menu_applied", `Applied menu (${calc.length} items)`);
  };

  const purgeEvent = async (id) => {
    await deleteDoc(doc(db, "events", id));
  };

  return { createEvent, updateEvent, deleteEvent, archiveEvent, duplicateEvent, updateItem, removeItem, addItems, applyMenu, purgeEvent };
}
