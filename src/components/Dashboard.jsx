import { useState, useEffect, useRef } from "react";
import { STICKER, getSticker, getStickerKey } from "../data/constants";
import { EmptyStateWrapper, EmptySearchIllustration } from "./EmptyStateVisuals";
import { CardMenu } from "../features/dashboard/CardMenu";

export default function Dashboard({ events, onSelect, onNew, onDuplicate, onArchive, onPrint, onDelete, userName, isOwner, compact = false }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [weather, setWeather] = useState(null);
  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => {
    const WMO = { 0: "Clear", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast", 45: "Foggy", 48: "Foggy", 51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain", 71: "Light snow", 73: "Snow", 75: "Heavy snow", 80: "Showers", 81: "Showers", 82: "Heavy showers", 95: "Thunderstorm", 96: "Thunderstorm", 99: "Thunderstorm" };
    const ICON = { 0: "☀️", 1: "🌤", 2: "⛅️", 3: "☁️", 45: "🌫", 48: "🌫", 51: "🌦", 53: "🌦", 55: "🌧", 61: "🌦", 63: "🌧", 65: "🌧", 71: "🌨", 73: "❄️", 75: "❄️", 80: "🌧", 81: "🌧", 82: "⛈", 95: "⛈", 96: "⛈", 99: "⛈" };
    const fetch_weather = (lat, lon) => {
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m&temperature_unit=fahrenheit&windspeed_unit=mph`)
        .then(r => r.json())
        .then(d => {
          const c = d.current;
          setWeather({ temp: Math.round(c.temperature_2m), icon: ICON[c.weathercode] || "🌡", desc: WMO[c.weathercode] || "", wind: Math.round(c.windspeed_10m) });
        }).catch(() => { });
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(p => fetch_weather(p.coords.latitude, p.coords.longitude), () => fetch_weather(34.0522, -118.2437));
    } else {
      fetch_weather(34.0522, -118.2437);
    }
  }, []);

  const fmt = d => d ? new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "";
  const fmtTime = t => { if (!t) return ""; const [h, m] = t.split(":"); const hr = parseInt(h, 10); return `${hr % 12 || 12}:${m}${hr >= 12 ? "p" : "a"}`; };

  const today = new Date();
  const dayLabel = today.toLocaleDateString("en-US", { weekday: "short" }) + " · " +
    today.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  const getStatus = ev => {
    if (!ev.items.length) return "pending";
    if (ev.items.some(i => parseFloat(i.returned) >= 0 && i.returned !== "")) return "returned";
    if (ev.items.some(i => parseFloat(i.loaded) > 0)) return "loaded";
    const preppedCount = ev.items.filter(i => i.prepped?.trim()).length;
    if (preppedCount === ev.items.length && preppedCount > 0) return "prepped";
    if (preppedCount > 0) return "prep";
    return "pending";
  };

  const activeEvents = events.filter(ev => !ev.archived);

  // KPI calculations
  const startOfWeek = () => { const d = new Date(); const day = d.getDay(); const diff = day === 0 ? -6 : 1 - day; d.setDate(d.getDate() + diff); d.setHours(0, 0, 0, 0); return d; };
  const endOfWeek = () => { const d = startOfWeek(); d.setDate(d.getDate() + 6); d.setHours(23, 59, 59, 999); return d; };
  const weekEvents = activeEvents.filter(ev => { if (!ev.date) return false; const d = new Date(ev.date + "T00:00:00"); return d >= startOfWeek() && d <= endOfWeek(); });
  const coversThisWeek = weekEvents.reduce((s, ev) => s + (parseInt(ev.guests) || 0), 0);
  const upcoming = activeEvents.filter(ev => ev.date && new Date(ev.date + "T00:00:00") >= new Date().setHours(0, 0, 0, 0)).sort((a, b) => new Date(a.date) - new Date(b.date));
  const nextEvent = upcoming[0];
  const nextPrepped = nextEvent ? nextEvent.items.filter(i => i.prepped?.trim()).length : 0;
  const nextTotal = nextEvent ? nextEvent.items.length : 0;
  // 30-day accuracy
  const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentDone = events.filter(ev => ev.archived && ev.date && new Date(ev.date + "T00:00:00") >= thirtyDaysAgo);
  const accPct = () => {
    const evs = recentDone.filter(ev => ev.items.some(i => parseFloat(i.loaded) > 0 || parseFloat(i.returned) >= 0));
    if (!evs.length) return null;
    let totL = 0, totR = 0;
    evs.forEach(ev => ev.items.forEach(i => { totL += parseFloat(i.loaded) || 0; totR += parseFloat(i.returned) || 0; }));
    return totL > 0 ? Math.round((totR / totL) * 100) : null;
  };
  const acc = accPct();

  const kpis = [
    { label: "EVENTS THIS WEEK", sub: `${weekEvents.length === 1 ? "1 event" : "" + weekEvents.length + " events"}`, value: weekEvents.length, bar: "var(--color-clay-500)" },
    { label: "COVERS BOOKED", sub: weekEvents.length ? `avg ${Math.round(coversThisWeek / (weekEvents.length || 1))} / event` : "this week", value: coversThisWeek.toLocaleString(), bar: "var(--sol-400)" },
    { label: "FULLY PREPPED", sub: nextEvent ? nextEvent.name.split(" ").slice(0, 2).join(" ") + " · " + Math.round(nextPrepped / Math.max(nextTotal, 1) * 100) + "%" : "no upcoming event", value: nextEvent ? `${nextPrepped}/${nextTotal}` : "—", bar: "var(--turquesa-500)" },
    { label: "PREP ACCURACY", sub: "30-day rolling", value: acc !== null ? `${acc}%` : "—", bar: "var(--cactus-500)" },
  ];

  // Filtered ledger
  const statusMap = { "In Prep": "prep", "Prepped": "prepped", "Loaded": "loaded", "Returned": "returned" };
  const filteredEvents = activeEvents.filter(ev => {
    const st = getStatus(ev);
    if (statusFilter !== "All" && st !== statusMap[statusFilter]) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!(ev.name || "").toLowerCase().includes(q) && !(ev.truck || "").toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => {
    if (!a.date) return 1; if (!b.date) return -1;
    return new Date(a.date) - new Date(b.date);
  });

  const StatusPillNew = ({ status }) => {
    const map = { prep: "bg-amber-bg text-amber border-amber", prepped: "bg-green-bg text-green border-green", loaded: "bg-blue-50 text-blue-600 border-blue-600", returned: "bg-purple-50 text-purple-600 border-purple-600", pending: "bg-carbon-08 text-carbon-200 border-bd" };
    const labels = { prep: "In Prep", prepped: "Prepped", loaded: "Loaded", returned: "Returned", pending: "Pending" };
    return <span className={`inline-flex items-center justify-center px-2 py-[2px] rounded-full text-[9px] font-bold uppercase tracking-wider border ${map[status] || map.pending}`}>{labels[status] || "Pending"}</span>;
  };

  const getLocalDateString = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startDay = firstOfMonth.getDay(); // 0 = Sunday, 1 = Monday...
    const startOfCalendar = new Date(year, month, 1 - startDay);

    const days = [];
    const temp = new Date(startOfCalendar);
    for (let i = 0; i < 42; i++) {
      days.push({
        day: temp.getDate(),
        otherMonth: temp.getMonth() !== month,
        dateStr: getLocalDateString(temp)
      });
      temp.setDate(temp.getDate() + 1);
    }
    return days;
  };

  const getWeekDays = () => {
    const start = startOfWeek();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const weekDayCounts = weekDays.map(d => {
    const dStr = getLocalDateString(d);
    return activeEvents.filter(ev => ev.date === dStr).length;
  });
  const maxWeeklyCount = Math.max(...weekDayCounts, 1);
  const calendarDays = getCalendarDays();
  const calMonthLabel = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const todayDateStr = getLocalDateString(today);

  return (
    <div className="max-w-[1200px] mx-auto pt-8 px-5">
      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 mb-8">
        <div>
          {(() => {
            const hr = new Date().getHours();
            const greeting = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : hr < 21 ? "Good evening" : "It's late";
            const name = (userName || "Chef").split(" ")[0];
            return (
              <div className="text-[32px] font-bold tracking-tight leading-tight">
                <span className="text-carbon-300">{greeting} </span>
                <span className="text-accent">{name}</span>
              </div>
            );
          })()}
        </div>
        <div className="flex flex-wrap items-center gap-3 md:gap-5 w-full md:w-auto">
          <div className="flex items-center gap-3 bg-white/75 backdrop-blur-md border border-bd px-4 py-1.5 rounded-full shadow-custom text-xs font-bold text-carbon-200">
            <span className="tracking-[.15em] uppercase text-muted">{dayLabel}</span>
            {weather && (
              <>
                <span className="text-bd-2 font-light">|</span>
                <div className="flex items-center gap-1.5" title={weather.desc}>
                  <span className="text-[15px]">{weather.icon}</span>
                  <span>{weather.temp}°</span>
                  <span className="text-[11px] font-medium text-muted ml-0.5 normal-case">{weather.desc}</span>
                </div>
              </>
            )}
          </div>
          <button className="bg-accent text-white border-none py-3 px-6 text-sm font-semibold rounded-xl cursor-pointer transition-colors hover:bg-accent-dk" onClick={onNew}>
            + New Event
          </button>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {(() => {
          const todayStr = today.toISOString().split("T")[0];
          const todayEvs = activeEvents.filter(ev => ev.date === todayStr);
          const todayGuests = todayEvs.reduce((s, ev) => s + (parseInt(ev.guests) || 0), 0);
          return (
            <div className="p-4 flex flex-col items-start justify-start bg-white rounded-2xl border border-bd shadow-sm min-w-0">
              <div className="text-[9px] font-bold tracking-wider uppercase text-muted mb-1 truncate w-full">TODAY</div>
              <div className="text-3xl font-extrabold text-carbon-300 leading-none">{todayEvs.length}</div>
              <div className="text-[11px] text-carbon-50 mt-1 truncate w-full">{todayGuests} guests</div>
            </div>
          );
        })()}
        {kpis.map((k, i) => (
          <div key={i} className="p-4 flex flex-col items-start justify-start bg-white rounded-2xl border border-bd shadow-sm min-w-0">
            <div className="text-[9px] font-bold tracking-wider uppercase text-muted mb-1 truncate w-full">{k.label}</div>
            <div className="text-3xl font-extrabold text-carbon-300 leading-none">{k.value}</div>
            <div className="text-[11px] text-carbon-50 mt-1 truncate w-full">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* MAIN PANELS */}
      {/* TOP ROW: Up Next, Weekly Graph, Mini Calendar */}
      <div className="w-full overflow-x-auto no-scrollbar mb-6">
        <div className={`grid gap-6 ${nextEvent && !compact ? "grid-cols-[1fr_280px] min-w-[720px]" : "grid-cols-1"}`}>

          {/* Up Next featured card (Horizontal) */}
          {nextEvent && (() => {
            const stk = getSticker(nextEvent);
            const pct = Math.round((nextPrepped / Math.max(nextTotal, 1)) * 100);
            const evDate = new Date(nextEvent.date + "T00:00:00");
            const diffTime = evDate - new Date().setHours(0, 0, 0, 0);
            const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const daysLabelText = daysUntil <= 0 ? "today" : daysUntil === 1 ? "tomorrow" : `in ${daysUntil} days`;
            return (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-5 rounded-2xl shadow-custom cursor-pointer border transition-shadow hover:shadow-md" style={{ background: 'var(--color-sol-50)', borderColor: 'var(--color-sol-400)' }} onClick={() => onSelect(nextEvent.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: stk.dot }} />
                    <span className="text-[10px] font-bold tracking-[.15em] uppercase" style={{ color: stk.ink }}>
                      Up next · {daysLabelText}
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold tracking-tight text-carbon-300 leading-[1.2] whitespace-nowrap overflow-hidden text-ellipsis">
                    {nextEvent.name}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-[13px] text-carbon-200 items-center">
                    <span className="flex items-center gap-1.5 shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" style={{ color: stk.ink }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      {evDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" style={{ color: stk.ink }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                      {nextEvent.guests || "—"} guests
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" style={{ color: stk.ink }}><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                      {nextEvent.truck || "Truck"}
                    </span>
                  </div>
                </div>
                <div className="w-full md:w-[240px] shrink-0 flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold tracking-[.1em] uppercase" style={{ color: stk.ink }}>Prep Progress</span>
                    <span className="text-sm font-extrabold text-carbon-300">{nextPrepped}/{nextTotal}</span>
                  </div>
                  <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                    <div className="h-full" style={{ width: `${pct}%`, background: stk.bar }} />
                  </div>
                  <button className="w-full text-white border-none py-2 px-3 rounded-lg text-xs font-bold cursor-pointer mt-1 flex items-center justify-center gap-1 hover:brightness-90 transition-all" style={{ background: stk.bar }} onClick={(e) => { e.stopPropagation(); onSelect(nextEvent.id); }}>
                    Open Prep Sheet →
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Mini Calendar Widget */}
          {!compact && <div className="bg-card rounded-2xl p-4 shadow-custom border border-bd flex flex-col justify-center">
            <div className="flex justify-between items-center mb-3">
              <button className="bg-transparent border-none cursor-pointer text-[11px] font-bold text-muted py-0.5 px-1.5 rounded hover:bg-black/5 transition-colors" onClick={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>◀</button>
              <span className="text-xs font-extrabold text-carbon-300 tracking-wide uppercase">{calMonthLabel}</span>
              <button className="bg-transparent border-none cursor-pointer text-[11px] font-bold text-muted py-0.5 px-1.5 rounded hover:bg-black/5 transition-colors" onClick={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>▶</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(dow => (
                <div key={dow} className="text-[9px] font-bold text-muted pb-1">{dow}</div>
              ))}
              {calendarDays.map((d, idx) => {
                const isToday = d.dateStr === todayDateStr;
                const hasEvent = activeEvents.some(ev => ev.date === d.dateStr);
                return (
                  <div key={idx} className={`text-xs py-1 rounded-md ${d.otherMonth ? "opacity-40" : ""} ${isToday ? "bg-carbon-300 text-white font-bold" : ""} ${hasEvent && !isToday ? "font-bold text-carbon-300 bg-carbon-08" : ""} ${!isToday && !hasEvent ? "hover:bg-black/5" : ""}`} title={hasEvent ? `${activeEvents.filter(ev => ev.date === d.dateStr).map(ev => ev.name).join(", ")}` : undefined}>
                    {d.day}
                  </div>
                );
              })}
            </div>
          </div>}
        </div>
      </div>

      {/* BOTTOM ROW: Active Events Ledger */}
      <div className="flex flex-col gap-6">
        {/* Alert banner for urgent events */}
        {(() => {
          const urgentEvents = activeEvents.filter(ev => {
            if (!ev.date || !ev.startTime) return false;
            const evStart = new Date(`${ev.date}T${ev.startTime}`);
            const hoursUntil = (evStart - new Date()) / (1000 * 60 * 60);
            return hoursUntil >= 0 && hoursUntil <= 24 && ev.items.some(i => !i.prepped?.trim());
          });
          if (!urgentEvents.length) return null;
          return (
            <div className="bg-[#FFFBEB] border-2 border-[#F59E0B] rounded-2xl p-5 flex flex-col gap-3 shadow-custom mb-6">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] flex items-center justify-center text-base font-extrabold text-[#92400E] shrink-0">!</div>
                <div className="text-xs font-extrabold uppercase tracking-[.1em] text-[#92400E]">Action Required</div>
              </div>
              <div className="text-[13px] text-[#92400E] leading-relaxed">You have events starting within 24 hours that still have unprepped items.</div>
              <div className="flex flex-col gap-2 mt-2">
                {urgentEvents.map(ev => (
                  <div key={ev.id} className="flex items-center justify-between bg-white py-2.5 px-3.5 rounded-xl border border-[#FDE68A]">
                    <div>
                      <div className="text-[13px] font-bold text-[#92400E]">{ev.name}</div>
                      <div className="text-[11px] text-[#B45309]">{ev.items.filter(i => !i.prepped?.trim()).length} items unprepped</div>
                    </div>
                    <button className="text-xs font-bold py-1.5 px-3 rounded-lg bg-[#FEF3C7] border-none text-[#92400E] cursor-pointer hover:bg-[#FDE68A] transition-colors" onClick={() => onSelect(ev.id)}>Open</button>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Active Events Ledger Card */}
        <div className="bg-card rounded-2xl p-4 md:p-6 shadow-custom border border-bd w-full min-w-0">
          <div className="text-xl font-extrabold mb-5 text-carbon-300">Active Events</div>

          <div className="flex gap-4 mb-5 flex-wrap">
            <div className="flex-1 relative min-w-[200px]">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-carbon-50">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
              <input className="w-full box-border pl-9 pr-3.5 py-2.5 rounded-xl border border-bd bg-white text-[13px] outline-none focus:border-[#E08A75] transition-colors" placeholder="Search events, clients, dishes…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["All", "In Prep", "Prepped", "Loaded", "Returned"].map(f => (
                <button key={f} className={`px-4 py-2 rounded-xl border text-[13px] font-bold cursor-pointer transition-colors ${statusFilter === f ? "bg-[#E08A75] text-white border-[#E08A75] shadow-sm" : "bg-transparent border-[#E5E0D8] text-carbon-300 hover:bg-black/5"}`} onClick={() => setStatusFilter(f)}>{f}</button>
              ))}
            </div>
          </div>

          <div className="border border-bd rounded-2xl overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <div className={`${compact ? 'min-w-[480px]' : 'min-w-[850px]'} flex flex-col`}>
                <div className={`grid ${compact ? 'grid-cols-[10px_60px_2fr_110px_70px_80px_24px]' : 'grid-cols-[10px_60px_2fr_1.5fr_60px_120px_100px_80px_24px]'} gap-4 items-center py-3 px-4 bg-[#F5F1E8] border-b border-bd text-[10px] font-bold text-carbon-300 uppercase tracking-wider`}>
                  <span /><span>Date</span><span>Event</span>
                  {!compact && <><span>Location</span><span className="text-right">Guests</span></>}
                  <span className="text-center">Prep</span>
                  <span className="text-right">Until Start</span>
                  <span className="text-center">Status</span>
                  <span className="text-right">·</span>
                </div>
                {filteredEvents.length === 0 && (
                  <EmptyStateWrapper
                    illustration={EmptySearchIllustration}
                    title={search || statusFilter !== "All" ? "No Events Found" : "No active events"}
                    description={search || statusFilter !== "All" ? "No events match your filter." : "No active events. Create one to get started."}
                    color="var(--accent)"
                  />
                )}
                {filteredEvents.map(ev => {
                  const stk = getSticker(ev);
                  const st = getStatus(ev);
                  const prepped = ev.items.filter(i => i.prepped?.trim()).length;
                  const total = ev.items.length;
                  const pct = total > 0 ? Math.round(prepped / total * 100) : 0;
                  const evDate = ev.date ? new Date(ev.date + "T00:00:00") : null;
                  const dateStr = evDate ? evDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase() : "—";
                  const msUntil = ev.date ? (new Date(ev.date + (ev.startTime ? "T" + ev.startTime : "T00:00:00")) - new Date()) : null;
                  const hoursUntil = msUntil !== null ? Math.floor(msUntil / (1000 * 60 * 60)) : null;
                  const untilLabel = hoursUntil === null ? "—" : hoursUntil <= 0 ? "Now" : hoursUntil < 24 ? `${hoursUntil}h` : `${Math.floor(hoursUntil / 24)}d ${hoursUntil % 24}h`;
                  const untilColor = hoursUntil === null ? "text-carbon-50" : hoursUntil <= 0 ? "text-red" : hoursUntil < 24 ? "text-amber" : "text-carbon-50";
                  return (
                    <div key={ev.id} className={`grid ${compact ? 'grid-cols-[10px_60px_2fr_110px_70px_80px_24px]' : 'grid-cols-[10px_60px_2fr_1.5fr_60px_120px_100px_80px_24px]'} gap-4 items-center py-3.5 px-4 border-b border-bd text-[13px] cursor-pointer hover:bg-bg transition-colors last:border-b-0`} onClick={() => onSelect(ev.id)}>
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: stk.dot }} />
                      <span className="text-[11px] font-semibold tracking-wider uppercase text-carbon-50">{dateStr}</span>
                      <span className="font-semibold text-carbon-300 overflow-hidden text-ellipsis whitespace-nowrap">{ev.name}</span>
                      {!compact && <><span className="text-carbon-50 overflow-hidden text-ellipsis whitespace-nowrap">{ev.truck || "—"}</span><span className="text-right text-[15px] font-bold text-carbon-300">{ev.guests || "—"}</span></>}
                      <span className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-carbon-08 rounded-full overflow-hidden">
                          <div className="h-full" style={{ width: `${pct}%`, background: stk.bar }} />
                        </div>
                        <span className="text-[11px] text-carbon-50 min-w-[28px] text-right font-semibold">{prepped}/{total}</span>
                      </span>
                      <span className={`text-right text-xs font-bold ${untilColor}`}>{untilLabel}</span>
                      <div className="text-center">{ev.draft ? <span className="inline-flex items-center justify-center px-2 py-[2px] rounded-full text-[9px] font-bold uppercase tracking-wider border bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]">DRAFT</span> : <StatusPillNew status={st} />}</div>
                      <div className="text-right relative" onClick={e => e.stopPropagation()}>
                        <CardMenu evId={ev.id} archived={ev.archived}
                          onOpen={() => onSelect(ev.id)}
                          onDuplicate={() => onDuplicate(ev.id)}
                          onArchive={() => onArchive(ev.id)}
                          onPrint={() => onPrint(ev.id)}
                          onDelete={() => { if (confirm("Delete this event? This cannot be undone.")) onDelete(ev.id); }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
