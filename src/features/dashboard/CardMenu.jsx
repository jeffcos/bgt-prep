import React, { useState, useEffect, useRef } from "react";

export function CardMenu({ evId, archived, onOpen, onDuplicate, onArchive, onPrint, onDelete }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef();
  const ref = useRef();

  useEffect(() => {
    if (!open) return;
    const handler = e => { if (ref.current && !ref.current.contains(e.target) && !btnRef.current?.contains(e.target)) setOpen(false); };
    const scrollHandler = () => setOpen(false);
    document.addEventListener("mousedown", handler);
    window.addEventListener("scroll", scrollHandler, true);
    window.addEventListener("resize", scrollHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("scroll", scrollHandler, true);
      window.removeEventListener("resize", scrollHandler);
    };
  }, [open]);

  const handleOpen = e => {
    e.stopPropagation();
    e.preventDefault();
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      let topPos = r.bottom + 4;
      const menuHeight = 160;
      if (topPos + menuHeight > window.innerHeight) {
        topPos = r.top - menuHeight - 4;
      }
      setPos({ top: topPos, right: window.innerWidth - r.right });
    }
    setOpen(p => !p);
  };

  return (
    <div className="relative inline-flex" onClick={e => e.stopPropagation()}>
      <button ref={btnRef} className="bg-white border-[1.5px] border-[#D4CCC2] rounded-md w-[30px] h-[30px] cursor-pointer text-lg text-[#3F3229] font-black flex items-center justify-center leading-none shrink-0" onClick={handleOpen}>⋮</button>
      {open && (
        <div ref={ref} style={{ position: "fixed", top: pos.top, right: pos.right }} className="bg-white border border-[#D4CCC2] rounded-lg shadow-[0_4px_6px_rgba(0,0,0,.08),0_12px_32px_rgba(0,0,0,.18)] min-w-[160px] overflow-hidden z-[99999]">
          <button className="block w-full text-left px-3 py-2 text-[13px] font-semibold text-carbon-300 bg-transparent border-none cursor-pointer hover:bg-black/5 transition-colors" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setOpen(false); onPrint(); }}>Print Sheet</button>
          <button className="block w-full text-left px-3 py-2 text-[13px] font-semibold text-carbon-300 bg-transparent border-none cursor-pointer hover:bg-black/5 transition-colors" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setOpen(false); onDuplicate(); }}>Duplicate</button>
          <div className="h-px bg-[#D4CCC2] my-1" />
          <button className="block w-full text-left px-3 py-2 text-[13px] font-semibold text-carbon-300 bg-transparent border-none cursor-pointer hover:bg-black/5 transition-colors" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setOpen(false); onArchive(); }}>{archived ? "Restore Event" : "Archive Event"}</button>
          <div className="h-px bg-[#D4CCC2] my-1" />
          <button className="block w-full text-left px-3 py-2 text-[13px] font-semibold text-red bg-transparent border-none cursor-pointer hover:bg-[#FEECEC] transition-colors" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setOpen(false); if (confirm("Delete this event? This cannot be undone.")) onDelete(); }}>Delete Event</button>
        </div>
      )}
    </div>
  );
}
