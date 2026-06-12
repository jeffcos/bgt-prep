import { useState, useEffect, useRef } from "react";
import { STICKER, getSticker, getStickerKey } from "../data/constants";
import { EmptyStateWrapper, EmptySearchIllustration } from "./EmptyStateVisuals";
import './Dashboard.css';

export function CardMenu({evId,archived,onOpen,onDuplicate,onArchive,onPrint,onDelete}){
  const [open,setOpen]=useState(false);
  const [pos,setPos]=useState({top:0,right:0});
  const btnRef=useRef();
  const ref=useRef();

  useEffect(()=>{
    if(!open)return;
    const handler=e=>{if(ref.current&&!ref.current.contains(e.target)&&!btnRef.current?.contains(e.target))setOpen(false);};
    document.addEventListener("mousedown",handler);
    return()=>document.removeEventListener("mousedown",handler);
  },[open]);

  const handleOpen=e=>{
    e.stopPropagation();
    if(!open&&btnRef.current){
      const r=btnRef.current.getBoundingClientRect();
      setPos({top:r.bottom+window.scrollY+4,right:window.innerWidth-r.right});
    }
    setOpen(p=>!p);
  };

  return(
    <div style={{position:"relative",display:"inline-flex"}} onClick={e=>e.stopPropagation()}>
      <button ref={btnRef} style={{background:"#fff",border:"1.5px solid #D4CCC2",borderRadius:6,width:30,height:30,cursor:"pointer",fontSize:18,color:"#3F3229",fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,flexShrink:0}} onClick={handleOpen}>⋮</button>
      {open&&(
        <div ref={ref} style={{position:"fixed",top:pos.top,right:pos.right,background:"#FFFFFF",border:"1px solid #D4CCC2",borderRadius:9,boxShadow:"0 4px 6px rgba(0,0,0,.08),0 12px 32px rgba(0,0,0,.18)",minWidth:160,overflow:"hidden",zIndex:99999}}>
          <button className="card-menu-item" onClick={()=>{setOpen(false);onPrint();}}>Print Sheet</button>
          <button className="card-menu-item" onClick={()=>{setOpen(false);onDuplicate();}}>Duplicate</button>
          <div className="card-menu-divider"/>
          <button className="card-menu-item" onClick={()=>{setOpen(false);onArchive();}}>{archived?"Restore Event":"Archive Event"}</button>
          <div className="card-menu-divider"/>
          <button className="card-menu-item danger" onClick={()=>{setOpen(false);if(confirm("Delete this event? This cannot be undone."))onDelete();}}>Delete Event</button>
        </div>
      )}
    </div>
  );
}


export default function Dashboard({events,onSelect,onNew,onDuplicate,onArchive,onPrint,onDelete,userName,isOwner}){
  const [search,setSearch]=useState("");
  const [statusFilter,setStatusFilter]=useState("All");
  const [weather,setWeather]=useState(null);

  useEffect(()=>{
    const WMO={0:"Clear",1:"Mostly clear",2:"Partly cloudy",3:"Overcast",45:"Foggy",48:"Foggy",51:"Light drizzle",53:"Drizzle",55:"Heavy drizzle",61:"Light rain",63:"Rain",65:"Heavy rain",71:"Light snow",73:"Snow",75:"Heavy snow",80:"Showers",81:"Showers",82:"Heavy showers",95:"Thunderstorm",96:"Thunderstorm",99:"Thunderstorm"};
    const ICON={0:"☀️",1:"🌤",2:"⛅️",3:"☁️",45:"🌫",48:"🌫",51:"🌦",53:"🌦",55:"🌧",61:"🌦",63:"🌧",65:"🌧",71:"🌨",73:"❄️",75:"❄️",80:"🌧",81:"🌧",82:"⛈",95:"⛈",96:"⛈",99:"⛈"};
    const fetch_weather=(lat,lon)=>{
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m&temperature_unit=fahrenheit&windspeed_unit=mph`)
        .then(r=>r.json())
        .then(d=>{
          const c=d.current;
          setWeather({temp:Math.round(c.temperature_2m),icon:ICON[c.weathercode]||"🌡",desc:WMO[c.weathercode]||"",wind:Math.round(c.windspeed_10m)});
        }).catch(()=>{});
    };
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(p=>fetch_weather(p.coords.latitude,p.coords.longitude),()=>fetch_weather(34.0522,-118.2437));
    } else {
      fetch_weather(34.0522,-118.2437);
    }
  },[]);

  const fmt=d=>d?new Date(d+"T00:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}):"";
  const fmtTime=t=>{if(!t)return"";const[h,m]=t.split(":");const hr=parseInt(h,10);return`${hr%12||12}:${m}${hr>=12?"p":"a"}`;};

  const today=new Date();
  const dayLabel=today.toLocaleDateString("en-US",{weekday:"short"})+" · "+
    today.toLocaleDateString("en-US",{month:"long",day:"numeric"});

  const getStatus=ev=>{
    if(!ev.items.length)return"pending";
    if(ev.items.some(i=>parseFloat(i.returned)>=0&&i.returned!==""))return"returned";
    if(ev.items.some(i=>parseFloat(i.loaded)>0))return"loaded";
    const preppedCount=ev.items.filter(i=>i.prepped?.trim()).length;
    if(preppedCount===ev.items.length&&preppedCount>0)return"prepped";
    if(preppedCount>0)return"prep";
    return"pending";
  };

  const activeEvents=events.filter(ev=>!ev.archived);

  // KPI calculations
  const startOfWeek=()=>{const d=new Date();const day=d.getDay();const diff=day===0?-6:1-day;d.setDate(d.getDate()+diff);d.setHours(0,0,0,0);return d;};
  const endOfWeek=()=>{const d=startOfWeek();d.setDate(d.getDate()+6);d.setHours(23,59,59,999);return d;};
  const weekEvents=activeEvents.filter(ev=>{if(!ev.date)return false;const d=new Date(ev.date+"T00:00:00");return d>=startOfWeek()&&d<=endOfWeek();});
  const coversThisWeek=weekEvents.reduce((s,ev)=>s+(parseInt(ev.guests)||0),0);
  const upcoming=activeEvents.filter(ev=>ev.date&&new Date(ev.date+"T00:00:00")>=new Date()).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const nextEvent=upcoming[0];
  const nextPrepped=nextEvent?nextEvent.items.filter(i=>i.prepped?.trim()).length:0;
  const nextTotal=nextEvent?nextEvent.items.length:0;
  // 30-day accuracy
  const thirtyDaysAgo=new Date();thirtyDaysAgo.setDate(thirtyDaysAgo.getDate()-30);
  const recentDone=events.filter(ev=>ev.archived&&ev.date&&new Date(ev.date+"T00:00:00")>=thirtyDaysAgo);
  const accPct=()=>{
    const evs=recentDone.filter(ev=>ev.items.some(i=>parseFloat(i.loaded)>0||parseFloat(i.returned)>=0));
    if(!evs.length)return null;
    let totL=0,totR=0;
    evs.forEach(ev=>ev.items.forEach(i=>{totL+=parseFloat(i.loaded)||0;totR+=parseFloat(i.returned)||0;}));
    return totL>0?Math.round((totR/totL)*100):null;
  };
  const acc=accPct();

  const kpis=[
    {label:"EVENTS THIS WEEK",sub:`${weekEvents.length===1?"1 event":""+weekEvents.length+" events"}`,value:weekEvents.length,bar:"var(--clay-500)"},
    {label:"COVERS BOOKED",sub:weekEvents.length?`avg ${Math.round(coversThisWeek/(weekEvents.length||1))} / event`:"this week",value:coversThisWeek.toLocaleString(),bar:"var(--sol-400)"},
    {label:"FULLY PREPPED",sub:nextEvent?nextEvent.name.split(" ").slice(0,2).join(" ")+" · "+Math.round(nextPrepped/Math.max(nextTotal,1)*100)+"%":"no upcoming event",value:nextEvent?`${nextPrepped}/${nextTotal}`:"—",bar:"var(--turquesa-500)"},
    {label:"PREP ACCURACY",sub:"30-day rolling",value:acc!==null?`${acc}%`:"—",bar:"var(--cactus-500)"},
  ];

  // Filtered ledger
  const statusMap={"In Prep":"prep","Prepped":"prepped","Loaded":"loaded","Returned":"returned"};
  const filteredEvents=activeEvents.filter(ev=>{
    const st=getStatus(ev);
    if(statusFilter!=="All"&&st!==statusMap[statusFilter])return false;
    if(search){
      const q=search.toLowerCase();
      if(!(ev.name||"").toLowerCase().includes(q)&&!(ev.truck||"").toLowerCase().includes(q))return false;
    }
    return true;
  }).sort((a,b)=>{
    if(!a.date)return 1;if(!b.date)return -1;
    return new Date(a.date)-new Date(b.date);
  });

  const StatusPillNew=({status})=>{
    const map={prep:"s-prep",prepped:"s-prepped",loaded:"s-load",returned:"s-ret",pending:"s-pend"};
    const labels={prep:"In Prep",prepped:"Prepped",loaded:"Loaded",returned:"Returned",pending:"Pending"};
    return <span className={`s-pill ${map[status]||"s-pend"}`}>{labels[status]||"Pending"}</span>;
  };

  return(
    <div className="cockpit">
      {/* SIDEBAR */}
      <aside className="cockpit-sidebar">
        {/* Greeting */}
        {(()=>{
          const hr=new Date().getHours();
          const greeting=hr<12?"Good morning":hr<17?"Good afternoon":hr<21?"Good evening":"It's late";
          const name=(userName||"Chef").split(" ")[0];
          return(
            <div>
              <div style={{fontSize:26,fontWeight:700,color:"var(--carbon-300)",letterSpacing:"-.02em",lineHeight:1.15}}>{greeting},</div>
              <div style={{fontSize:26,fontWeight:700,color:"var(--clay-500)",letterSpacing:"-.02em",lineHeight:1.15}}>{name}.</div>
            </div>
          );
        })()}
        {/* Date */}
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:"var(--clay-500)"}}>{dayLabel}</div>

        {/* + New Event */}
        <button className="btn btn-primary" style={{width:"100%",padding:"10px 18px",fontSize:12,letterSpacing:".02em",borderRadius:8}} onClick={onNew}>
          + New Event
        </button>

        {/* Today summary */}
        {(()=>{
          const todayStr=today.toISOString().split("T")[0];
          const todayEvs=activeEvents.filter(ev=>ev.date===todayStr);
          const todayGuests=todayEvs.reduce((s,ev)=>s+(parseInt(ev.guests)||0),0);
          return(
            <div className="kpi-tile">
                <div className="kpi-tile-bar" style={{background:"var(--purple)"}}/>
                <div style={{paddingLeft:10}}>
                  <div className="kpi-label" style={{marginBottom:8}}>Today</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                    <div>
                      <div className="kpi-value">{todayEvs.length}</div>
                      <div className="kpi-sub">{todayEvs.length===1?"event":"events"}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div className="kpi-value">{todayGuests||"—"}</div>
                      <div className="kpi-sub">guests</div>
                    </div>
                  </div>
                </div>
              </div>
          );
        })()}

        {/* KPI tiles */}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {kpis.map((k,i)=>(
            <div key={i} className="kpi-tile">
              <div className="kpi-tile-bar" style={{background:k.bar}}/>
              <div className="kpi-tile-inner">
                <div style={{flex:1,minWidth:0}}>
                  <div className="kpi-label">{k.label}</div>
                  <div className="kpi-sub">{k.sub}</div>
                </div>
                <div className="kpi-value">{k.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Weather */}
        {weather&&(
          <div className="kpi-tile">
            <div className="kpi-tile-bar" style={{background:"var(--turquesa-500)"}}/>
            <div className="kpi-tile-inner">
              <div style={{flex:1,minWidth:0}}>
                <div className="kpi-label">Outside</div>
                <div className="kpi-sub">{weather.desc}{weather.wind?` · ${weather.wind} mph`:""}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:20}}>{weather.icon}</span>
                <span className="kpi-value">{weather.temp}°</span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* MAIN FEED */}
      <div className="cockpit-feed">
        {/* Filter bar */}
        <div className="feed-filter-bar">
          <div className="feed-search-wrap">
            <span className="feed-search-icon">⌕</span>
            <input className="feed-search" placeholder="Search events, clients, dishes…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          {["All","In Prep","Prepped","Loaded","Returned"].map(f=>(
            <button key={f} className={`filter-pill ${statusFilter===f?"on":""}`} onClick={()=>setStatusFilter(f)}>{f}</button>
          ))}
        </div>

        {/* Up Next featured card */}
        {nextEvent&&(()=>{
          const stk=getSticker(nextEvent);
          const pct=Math.round((nextPrepped/Math.max(nextTotal,1))*100);
          const daysUntil=Math.round((new Date(nextEvent.date+"T00:00:00")-new Date())/(1000*60*60*24));
          const evDate=new Date(nextEvent.date+"T00:00:00");
          return(
            <div className="upnext-card" style={{background:stk.soft,border:`1.5px solid ${stk.bar}`,marginBottom:14}}>
              <div className="upnext-grid">
                {/* Date col */}
                <div className="upnext-date-col" style={{borderRight:`1px dashed ${stk.bar}66`}}>
                  <div style={{fontSize:11,fontWeight:700,letterSpacing:".15em",color:stk.ink,textTransform:"uppercase"}}>
                    {evDate.toLocaleDateString("en-US",{weekday:"short"})}
                  </div>
                  <div style={{fontSize:48,fontWeight:700,letterSpacing:"-.02em",lineHeight:1,color:stk.ink,marginTop:2}}>
                    {evDate.getDate()}
                  </div>
                  {nextEvent.startTime&&<div style={{fontSize:11,fontWeight:600,color:stk.ink,marginTop:2}}>{fmtTime(nextEvent.startTime)}</div>}
                </div>
                {/* Title col */}
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{width:9,height:9,borderRadius:99,background:stk.dot,flexShrink:0}}/>
                    <span style={{fontSize:11,fontWeight:600,letterSpacing:".2em",textTransform:"uppercase",color:stk.ink}}>
                      Up next · {daysUntil<=0?"today":daysUntil===1?"tomorrow":`in ${daysUntil} days`}
                    </span>
                  </div>
                  <div style={{fontSize:34,fontWeight:700,letterSpacing:"-.02em",color:"var(--carbon-300)",marginTop:4,lineHeight:1.1}}>
                    {nextEvent.name}
                  </div>
                  <div style={{fontFamily:"var(--font-serif)",fontSize:14,color:"var(--carbon-50)",marginTop:3}}>
                    {nextEvent.truck}
                  </div>
                </div>
                {/* Guests col */}
                <div>
                  <div style={{fontSize:10,fontWeight:600,letterSpacing:".15em",textTransform:"uppercase",color:stk.ink}}>Guests</div>
                  <div style={{fontSize:34,fontWeight:700,letterSpacing:"-.02em",color:"var(--carbon-300)",marginTop:2}}>{nextEvent.guests||"—"}</div>
                </div>
                {/* Prepped col */}
                <div>
                  <div style={{fontSize:10,fontWeight:600,letterSpacing:".15em",textTransform:"uppercase",color:stk.ink}}>Prepped</div>
                  <div style={{fontSize:34,fontWeight:700,letterSpacing:"-.02em",color:"var(--carbon-300)",marginTop:2}}>
                    {nextPrepped}<span style={{color:"var(--carbon-50)",fontSize:20}}>/{nextTotal}</span>
                  </div>
                  <div style={{height:3,background:"rgba(0,0,0,.08)",borderRadius:99,marginTop:6,overflow:"hidden"}}>
                    <div style={{width:`${pct}%`,height:"100%",background:stk.bar}}/>
                  </div>
                </div>
                {/* CTA */}
                <button style={{background:stk.bar,color:"#fff",border:"none",padding:"12px 16px",borderRadius:6,fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}} onClick={()=>onSelect(nextEvent.id)}>
                  Open sheet →
                </button>
              </div>
            </div>
          );
        })()}

        {/* Alert banner for urgent events */}
        {(()=>{
          const urgentEvents=activeEvents.filter(ev=>{
            if(!ev.date||!ev.startTime)return false;
            const evStart=new Date(`${ev.date}T${ev.startTime}`);
            const hoursUntil=(evStart-new Date())/(1000*60*60);
            return hoursUntil>=0&&hoursUntil<=24&&ev.items.some(i=>!i.prepped?.trim());
          });
          if(!urgentEvents.length)return null;
          return(
            <div style={{background:"#FFFBEB",border:"1.5px solid #F59E0B",borderRadius:10,padding:"10px 16px",marginBottom:14,display:"flex",alignItems:"flex-start",gap:12}}>
              <div style={{width:28,height:28,borderRadius:6,background:"#FEF3C7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#92400E",flexShrink:0}}>!</div>
              <div style={{flex:1}}>
                <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",color:"#92400E",marginBottom:5}}>Events starting within 24 hours with unprepped items</div>
                {urgentEvents.map(ev=>(
                  <div key={ev.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:13,fontWeight:600,color:"var(--carbon-300)"}}>{ev.name}</span>
                    <span style={{fontSize:11,color:"#92400E"}}>{ev.items.filter(i=>!i.prepped?.trim()).length} items unprepped</span>
                    <button style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:5,border:"1px solid #F59E0B",background:"transparent",color:"#92400E",cursor:"pointer"}} onClick={()=>onSelect(ev.id)}>Open →</button>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Ledger */}
        <div className="ledger">
          <div className="ledger-head">
            <span/><span>Date</span><span>Event</span><span>Location</span>
            <span style={{textAlign:"right"}}>Guests</span>
            <span className="ledger-col-prep">Prep</span>
            <span className="ledger-col-until" style={{textAlign:"right"}}>Until Start</span>
            <span className="ledger-col-status" style={{textAlign:"center"}}>Status</span>
            <span style={{textAlign:"right"}}>·</span>
          </div>
          {filteredEvents.length===0&&(
            <EmptyStateWrapper
              illustration={EmptySearchIllustration}
              title={search||statusFilter!=="All"?"No Events Found":"No active events"}
              description={search||statusFilter!=="All"?"No events match your filter.":"No active events. Create one to get started."}
              color="var(--accent)"
            />
          )}
          {filteredEvents.map(ev=>{
            const stk=getSticker(ev);
            const st=getStatus(ev);
            const prepped=ev.items.filter(i=>i.prepped?.trim()).length;
            const total=ev.items.length;
            const pct=total>0?Math.round(prepped/total*100):0;
            const evDate=ev.date?new Date(ev.date+"T00:00:00"):null;
            const dateStr=evDate?evDate.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}).toUpperCase():"—";
            const msUntil=ev.date?(new Date(ev.date+(ev.startTime?"T"+ev.startTime:"T00:00:00"))-new Date()):null;
            const hoursUntil=msUntil!==null?Math.floor(msUntil/(1000*60*60)):null;
            const untilLabel=hoursUntil===null?"—":hoursUntil<=0?"Now":hoursUntil<24?`${hoursUntil}h`:`${Math.floor(hoursUntil/24)}d ${hoursUntil%24}h`;
            const untilColor=hoursUntil===null?"var(--carbon-50)":hoursUntil<=0?"var(--red)":hoursUntil<24?"var(--amber)":"var(--carbon-50)";
            return(
              <div key={ev.id} className="ledger-row" onClick={()=>onSelect(ev.id)}>
                <span style={{width:10,height:10,borderRadius:99,background:stk.dot,flexShrink:0}}/>
                <span style={{fontSize:11,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",color:"var(--carbon-50)"}}>{dateStr}</span>
                <span style={{fontWeight:600,color:"var(--carbon-300)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.name}</span>
                <span style={{color:"var(--carbon-50)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.truck||"—"}</span>
                <span style={{textAlign:"right",fontSize:15,fontWeight:700,color:"var(--carbon-300)"}}>{ev.guests||"—"}</span>
                <span className="ledger-col-prep" style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{flex:1,height:4,background:"var(--carbon-08)",borderRadius:99,overflow:"hidden"}}>
                    <div style={{width:`${pct}%`,height:"100%",background:stk.bar}}/>
                  </div>
                  <span style={{fontSize:11,color:"var(--carbon-50)",minWidth:38,textAlign:"right",fontWeight:600}}>{prepped}/{total}</span>
                </span>
                <span className="ledger-col-until" style={{textAlign:"right",fontSize:12,fontWeight:700,color:untilColor}}>{untilLabel}</span>
                <div className="ledger-col-status" style={{textAlign:"center"}}>{ev.draft?<span className="s-pill" style={{background:"#FEF3C7",color:"#92400E",border:"1px solid #F59E0B"}}>DRAFT</span>:<StatusPillNew status={st}/>}</div>
                <div style={{textAlign:"right"}} onClick={e=>e.stopPropagation()}>
                  <CardMenu evId={ev.id} archived={ev.archived}
                    onOpen={()=>onSelect(ev.id)}
                    onDuplicate={()=>onDuplicate(ev.id)}
                    onArchive={()=>onArchive(ev.id)}
                    onPrint={()=>onPrint(ev.id)}
                    onDelete={()=>{if(confirm("Delete this event? This cannot be undone."))onDelete(ev.id);}}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
