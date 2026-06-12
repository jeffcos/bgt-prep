import { useState, useMemo } from "react";
import { STICKER } from "../data/constants";

const fmtTime=t=>{if(!t)return"";const[h,m]=t.split(":");const hr=parseInt(h,10);return`${hr%12||12}:${m===undefined?"00":m}${hr>=12?"P":"A"}`;};

function Chip({ev,onSelect}){
  const evColor=ev.color&&STICKER[ev.color]?ev.color:"orange";
  const stk=STICKER[evColor];
  return(
    <div className="sch-chip" style={{background:stk.soft,borderLeftColor:stk.bar}} onClick={()=>onSelect(ev.id)}>
      {ev.startTime&&<div className="sch-chip-time" style={{color:stk.ink}}>{fmtTime(ev.startTime)}</div>}
      <div className="sch-chip-name">{ev.name}</div>
      {ev.guests&&<div className="sch-chip-guests">{ev.guests} guests</div>}
    </div>
  );
}

export default function CalendarView({events,onSelect}){
  const [calView,setCalView]=useState("month");
  const [anchor,setAnchor]=useState(()=>{const d=new Date();d.setHours(0,0,0,0);return d;});
  const [statusFilter,setStatusFilter]=useState([]);
  const [search,setSearch]=useState("");

  const isSameDay=(a,b)=>a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
  const evDate=ev=>ev.date?new Date(ev.date+"T00:00:00"):null;

  const today=useMemo(()=>{const d=new Date();d.setHours(0,0,0,0);return d;},[]);

  const activeEvents=events.filter(ev=>!ev.archived&&!ev.deleted);

  const getStatus=ev=>{
    if(!ev.items.length)return"pending";
    if(ev.items.some(i=>parseFloat(i.returned)>=0&&i.returned!==""))return"returned";
    if(ev.items.some(i=>parseFloat(i.loaded)>0))return"loaded";
    const preppedCount=ev.items.filter(i=>i.prepped?.trim()).length;
    if(preppedCount===ev.items.length&&preppedCount>0)return"prepped";
    if(preppedCount>0)return"prep";
    return"pending";
  };

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
    if(statusFilter.length&&!statusFilter.includes(getStatus(ev)))return false;
    return true;
  });

  const monthEvs=activeEvents.filter(ev=>{const d=evDate(ev);return d&&d.getMonth()===anchor.getMonth()&&d.getFullYear()===anchor.getFullYear();});
  const upcoming=monthEvs.filter(ev=>{const d=evDate(ev);return d&&d>=today;}).length;
  const wrapped=monthEvs.filter(ev=>{const d=evDate(ev);return d&&d<today;}).length;

  const toggleStatus=s=>setStatusFilter(prev=>prev.includes(s)?prev.filter(x=>x!==s):[...prev,s]);

  return(
    <div className="sch-layout">
      {/* SIDEBAR */}
      <aside className="sch-sidebar">
        <div className="sch-eyebrow">Schedule</div>
        <div className="sch-heading">
          <div className="sch-month-name">{monthLabel()}</div>
          <div className="sch-year-name">{yearLabel()}.</div>
        </div>

        <div className="sch-nav">
          <button className="sch-nav-btn" onClick={calView==="week"?prevWeek:prevMonth}>‹ {adjMonthLabel(-1)}</button>
          <button className="sch-nav-btn sch-nav-today" onClick={goToday}>{new Date().toLocaleDateString("en-US",{month:"short"})}</button>
          <button className="sch-nav-btn" onClick={calView==="week"?nextWeek:nextMonth}>{adjMonthLabel(1)} ›</button>
        </div>

        <div>
          <div className="sch-section-label">View</div>
          <div className="sch-view-btns">
            {["month","week","list"].map(v=>(
              <button key={v} className={`sch-view-btn ${calView===v?"active":""}`} onClick={()=>setCalView(v)}>
                {v.charAt(0).toUpperCase()+v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="sch-section-label">Status</div>
          <div className="sch-status-pills">
            {[{key:"prep",label:"In Prep"},{key:"prepped",label:"Prepped"},{key:"loaded",label:"Loaded"},{key:"returned",label:"Returned"}].map(s=>(
              <button key={s.key} className={`sch-status-pill ${statusFilter.includes(s.key)?"active":""}`} onClick={()=>toggleStatus(s.key)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="sch-main">
        <div className="sch-main-hdr">
          <div>
            <div className="sch-main-title">{monthLabel()} {yearLabel()}</div>
            <div className="sch-main-sub">{upcoming} upcoming · {wrapped} wrapped this month</div>
          </div>
          <div className="sch-search-wrap">
            <span className="sch-search-icon">⌕</span>
            <input className="sch-search" placeholder="Search events…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
        </div>

        {/* MONTH VIEW */}
        {calView==="month"&&(
          <div className="sch-month-grid">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(
              <div key={d} className="sch-dow">{d}</div>
            ))}
            {monthDays().map(({date,cur},i)=>{
              const isToday=isSameDay(date,today);
              const dayEvs=filteredEvents.filter(ev=>{const d=evDate(ev);return d&&isSameDay(d,date);}).sort((a,b)=>(a.startTime||"").localeCompare(b.startTime||""));
              return(
                <div key={i} className={`sch-cell ${!cur?"sch-cell-other":""} ${isToday?"sch-cell-today":""}`}>
                  <div className="sch-cell-num">
                    {date.getDate()}
                    {isToday&&<span className="sch-today-badge">Today</span>}
                  </div>
                  {dayEvs.slice(0,3).map(ev=><Chip key={ev.id} ev={ev} onSelect={onSelect}/>)}
                  {dayEvs.length>3&&<div className="sch-chip-more">+{dayEvs.length-3} more</div>}
                </div>
              );
            })}
          </div>
        )}

        {/* WEEK VIEW */}
        {calView==="week"&&(
          <div className="sch-week-grid">
            {weekDays().map((day,i)=>{
              const isToday=isSameDay(day,today);
              const dayEvs=filteredEvents.filter(ev=>{const d=evDate(ev);return d&&isSameDay(d,day);}).sort((a,b)=>(a.startTime||"").localeCompare(b.startTime||""));
              const DOW=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
              return(
                <div key={i} className={`sch-week-col ${isToday?"sch-week-col-today":""}`}>
                  <div className="sch-week-dow">{DOW[i]}</div>
                  <div className={`sch-week-num ${isToday?"sch-week-num-today":""}`}>{day.getDate()}</div>
                  {isToday&&<div className="sch-week-today-lbl">Today</div>}
                  <div className="sch-week-events">
                    {dayEvs.map(ev=><Chip key={ev.id} ev={ev} onSelect={onSelect}/>)}
                    {!dayEvs.length&&<div className="sch-week-empty">—</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* LIST VIEW */}
        {calView==="list"&&(
          <div className="sch-list">
            {filteredEvents.filter(ev=>evDate(ev)).length===0&&<div className="sch-list-empty">No events</div>}
            {filteredEvents
              .filter(ev=>evDate(ev))
              .sort((a,b)=>new Date(a.date)-new Date(b.date))
              .map(ev=>{
                const stk=STICKER[ev.color]||STICKER.orange;
                const d=evDate(ev);
                return(
                  <div key={ev.id} className="sch-list-row" style={{borderLeftColor:stk.bar}} onClick={()=>onSelect(ev.id)}>
                    <div className="sch-list-date">{d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</div>
                    <div className="sch-list-name">{ev.name}</div>
                    <div className="sch-list-meta">{ev.startTime?fmtTime(ev.startTime):""}{"  "}{ev.guests?ev.guests+" guests":""}</div>
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
