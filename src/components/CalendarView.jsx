import { useState, useMemo } from "react";
import { STICKER } from "../data/constants";

const fmtTime=t=>{if(!t)return"";const[h,m]=t.split(":");const hr=parseInt(h,10);return`${hr%12||12}:${m===undefined?"00":m}${hr>=12?"P":"A"}`;};

function Chip({ev,onSelect}){
  const evColor=ev.color&&STICKER[ev.color]?ev.color:"orange";
  const stk=STICKER[evColor];
  return(
    <div className="rounded-md border-l-4 px-2 py-1.5 mb-1 cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-sm" style={{background:stk.soft,borderLeftColor:stk.bar}} onClick={()=>onSelect(ev.id)}>
      {ev.startTime&&<div className="text-[9px] font-bold tracking-wider mb-0.5" style={{color:stk.ink}}>{fmtTime(ev.startTime)}</div>}
      <div className="text-[11px] font-bold text-carbon-300 leading-tight truncate">{ev.name}</div>
      {ev.guests&&<div className="text-[9px] font-semibold text-carbon-50 truncate mt-0.5">{ev.guests} guests</div>}
    </div>
  );
}

export default function CalendarView({events,onSelect}){
  const [calView,setCalView]=useState("month");
  const [anchor,setAnchor]=useState(()=>{const d=new Date();d.setHours(0,0,0,0);return d;});
  const [search,setSearch]=useState("");

  const isSameDay=(a,b)=>a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
  const evDate=ev=>ev.date?new Date(ev.date+"T00:00:00"):null;

  const today=useMemo(()=>{const d=new Date();d.setHours(0,0,0,0);return d;},[]);

  const activeEvents=events.filter(ev=>!ev.archived&&!ev.deleted);

  const prevMonth=()=>{const d=new Date(anchor);d.setDate(1);d.setMonth(d.getMonth()-1);setAnchor(d);};
  const nextMonth=()=>{const d=new Date(anchor);d.setDate(1);d.setMonth(d.getMonth()+1);setAnchor(d);};
  const prevWeek=()=>{const d=new Date(anchor);d.setDate(d.getDate()-7);setAnchor(d);};
  const nextWeek=()=>{const d=new Date(anchor);d.setDate(d.getDate()+7);setAnchor(d);};
  const goToday=()=>{const d=new Date();d.setHours(0,0,0,0);setAnchor(d);};

  const monthLabel=()=>anchor.toLocaleDateString("en-US",{month:"long"});
  const yearLabel=()=>anchor.getFullYear();
  const adjMonthLabel=delta=>{const d=new Date(anchor);d.setDate(1);d.setMonth(d.getMonth()+delta);return d.toLocaleDateString("en-US",{month:"short"});};

  const monthDays=()=>{
    const year=anchor.getFullYear();const month=anchor.getMonth();
    const first=new Date(year,month,1);const last=new Date(year,month+1,0);
    const startDow=first.getDay();
    const days=[];
    for(let i=startDow;i>0;i--){const d=new Date(first);d.setDate(d.getDate()-i);days.push({date:d,cur:false});}
    for(let i=1;i<=last.getDate();i++)days.push({date:new Date(year,month,i),cur:true});
    const rem=42-days.length;
    for(let i=1;i<=rem;i++){const d=new Date(last);d.setDate(d.getDate()+i);days.push({date:d,cur:false});}
    return days;
  };

  const weekStart=()=>{const d=new Date(anchor);d.setDate(d.getDate()-d.getDay());return d;};
  const weekDays=()=>Array.from({length:7},(_,i)=>{const d=new Date(weekStart());d.setDate(d.getDate()+i);return d;});

  const filteredEvents=activeEvents.filter(ev=>{
    if(search&&!ev.name?.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  });

  const monthEvs=activeEvents.filter(ev=>{const d=evDate(ev);return d&&d.getMonth()===anchor.getMonth()&&d.getFullYear()===anchor.getFullYear();});
  const upcoming=monthEvs.filter(ev=>{const d=evDate(ev);return d&&d>=today;}).length;
  const wrapped=monthEvs.filter(ev=>{const d=evDate(ev);return d&&d<today;}).length;


  return(
    <div className="w-full">
      <div className="py-10 px-15 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-3xl font-extrabold text-carbon-300 leading-tight">{monthLabel()} {yearLabel()}</div>
            <div className="text-sm font-semibold text-carbon-50 mt-1">{upcoming} upcoming · {wrapped} wrapped this month</div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <div className="relative w-[300px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-base">⌕</span>
              <input className="w-full box-border py-2 pr-3.5 pl-8 border border-bd rounded-full bg-white text-[13px] text-carbon-300 outline-none focus:border-[#D4CCC2] transition-colors shadow-sm" placeholder="Search events…" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                <button className="bg-transparent border-none py-1.5 px-2.5 rounded-lg text-xs font-bold text-carbon-200 cursor-pointer hover:bg-black/5 transition-colors" onClick={calView==="week"?prevWeek:prevMonth}>‹ {adjMonthLabel(-1)}</button>
                <button className="bg-white border border-bd py-1.5 px-3 rounded-lg text-xs font-extrabold text-carbon-300 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,.04)] hover:bg-black/5 hover:border-[#D4CCC2] transition-colors" onClick={goToday}>{new Date().toLocaleDateString("en-US",{month:"short"})}</button>
                <button className="bg-transparent border-none py-1.5 px-2.5 rounded-lg text-xs font-bold text-carbon-200 cursor-pointer hover:bg-black/5 transition-colors" onClick={calView==="week"?nextWeek:nextMonth}>{adjMonthLabel(1)} ›</button>
              </div>
              
              <div className="flex gap-1 bg-white p-1 rounded-xl border border-bd shadow-sm">
                {["month","week","list"].map(v=>(
                  <button key={v} className={`py-1.5 px-3 border-none rounded-lg font-semibold text-xs cursor-pointer transition-all ${calView===v ? "bg-bg text-carbon-300 shadow-[0_1px_3px_rgba(0,0,0,.08)]" : "bg-transparent text-muted hover:text-carbon-200"}`} onClick={()=>setCalView(v)}>
                    {v.charAt(0).toUpperCase()+v.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {calView==="month"&&(
          <div className="grid grid-cols-7 border-l border-t border-bd bg-white rounded-xl overflow-hidden shadow-sm">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(
              <div key={d} className="py-2.5 text-center text-[10px] font-bold tracking-[.15em] uppercase text-muted bg-bg border-r border-b border-bd">{d}</div>
            ))}
            {monthDays().map(({date,cur},i)=>{
              const isToday=isSameDay(date,today);
              const dayEvs=filteredEvents.filter(ev=>{const d=evDate(ev);return d&&isSameDay(d,date);}).sort((a,b)=>(a.startTime||"").localeCompare(b.startTime||""));
              return(
                <div key={i} className={`min-h-[120px] p-2 border-r border-b border-bd ${!cur?"bg-bg/50":"bg-white"} ${isToday?"bg-[rgba(224,138,117,0.04)]":""}`}>
                  <div className="text-xs font-bold text-carbon-200 mb-1.5 flex justify-between items-center px-1">
                    {date.getDate()}
                    {isToday&&<span className="bg-[#E08A75] text-white px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-wider uppercase">Today</span>}
                  </div>
                  {dayEvs.slice(0,3).map(ev=><Chip key={ev.id} ev={ev} onSelect={onSelect}/>)}
                  {dayEvs.length>3&&<div className="text-[10px] font-bold text-muted text-center mt-1 cursor-pointer hover:text-carbon-300">+{dayEvs.length-3} more</div>}
                </div>
              );
            })}
          </div>
        )}

        {calView==="week"&&(
          <div className="grid grid-cols-7 border-l border-t border-bd bg-white rounded-xl overflow-hidden shadow-sm min-h-[500px]">
            {weekDays().map((day,i)=>{
              const isToday=isSameDay(day,today);
              const dayEvs=filteredEvents.filter(ev=>{const d=evDate(ev);return d&&isSameDay(d,day);}).sort((a,b)=>(a.startTime||"").localeCompare(b.startTime||""));
              const DOW=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
              return(
                <div key={i} className={`flex flex-col border-r border-b border-bd relative ${isToday?"bg-[rgba(224,138,117,0.04)]":"bg-white"}`}>
                  <div className="text-center pt-3 pb-1 text-[11px] font-bold tracking-widest uppercase text-muted">{DOW[i]}</div>
                  <div className={`text-center pb-3 text-2xl font-extrabold ${isToday?"text-[#E08A75]":"text-carbon-300"}`}>{day.getDate()}</div>
                  {isToday&&<div className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] font-extrabold uppercase tracking-widest text-[#E08A75]">Today</div>}
                  <div className="flex-1 p-2 bg-black/5 border-t border-bd">
                    {dayEvs.map(ev=><Chip key={ev.id} ev={ev} onSelect={onSelect}/>)}
                    {!dayEvs.length&&<div className="text-center text-xs font-semibold text-carbon-50 mt-4">—</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {calView==="list"&&(
          <div className="bg-white border border-bd rounded-xl overflow-hidden shadow-sm">
            {filteredEvents.filter(ev=>evDate(ev)).length===0&&<div className="p-10 text-center text-sm font-semibold text-carbon-50">No events</div>}
            {filteredEvents
              .filter(ev=>evDate(ev))
              .sort((a,b)=>new Date(a.date)-new Date(b.date))
              .map(ev=>{
                const stk=STICKER[ev.color]||STICKER.orange;
                const d=evDate(ev);
                return(
                  <div key={ev.id} className="flex items-center gap-4 py-3 px-5 border-b border-bd border-l-4 cursor-pointer hover:bg-bg transition-colors last:border-b-0" style={{borderLeftColor:stk.bar}} onClick={()=>onSelect(ev.id)}>
                    <div className="w-[100px] text-xs font-bold text-muted shrink-0">{d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</div>
                    <div className="flex-1 text-sm font-extrabold text-carbon-300">{ev.name}</div>
                    <div className="text-xs font-semibold text-carbon-50 shrink-0 text-right whitespace-pre">{ev.startTime?fmtTime(ev.startTime):""}{"  "}{ev.guests?ev.guests+" guests":""}</div>
                  </div>
                );
              })
            }
          </div>
        )}
      </div>
    </div>
  );
}
