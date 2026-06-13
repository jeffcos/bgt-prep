import { useState, useEffect, useMemo } from "react";
import { GROUPS, GROUP_ORDER, RECIPE_CATS, RCAT_COLORS } from "../data/constants";
import { calcPrepList } from "../utils/calc";
import StepRail from "./StepRail";

export default function MenuBuilder({event,RECIPES,ING,onApply,onSkip,onBack}){
  const [qtys,setQtys]=useState(()=>{
    const init={};
    (event.menuSelections||[]).forEach(s=>{init[s.key]=s.qty;});
    return init;
  });
  const [dishNotes,setDishNotes]=useState(()=>{
    const init={};
    (event.menuSelections||[]).forEach(s=>{if(s.notes)init[s.key]=s.notes;});
    return init;
  });
  const [ingNotes,setIngNotes]=useState(()=>{
    const init={};
    (event.menuSelections||[]).forEach(s=>{if(s.ingNotes)init[s.key]=s.ingNotes;});
    return init;
  });
  const [expanded,setExpanded]=useState({});
  const [search,setSearch]=useState("");

  // Sync local state if event.menuSelections changes while mounted
  useEffect(()=>{
    if(!event.menuSelections)return;
    const newQtys={},newDishNotes={},newIngNotes={};
    event.menuSelections.forEach(s=>{
      newQtys[s.key]=s.qty;
      if(s.notes)newDishNotes[s.key]=s.notes;
      if(s.ingNotes)newIngNotes[s.key]=s.ingNotes;
    });
    setQtys(newQtys);
    setDishNotes(newDishNotes);
    setIngNotes(newIngNotes);
  },[event.menuSelections]);

  const adj=(key,d)=>setQtys(p=>{
    const c=parseInt(p[key]||0,10);
    const n=Math.max(0,c+d);
    return{...p,[key]:n||""};
  });
  const setQty=(key,val)=>{
    const n=parseInt(val,10);
    setQtys(p=>({...p,[key]:isNaN(n)||n<0?"":n}));
  };
  const setIngNote=(dishKey,ingName,val)=>setIngNotes(p=>({...p,[dishKey]:{...(p[dishKey]||{}),[ingName]:val}}));

  const selections=useMemo(()=>
    Object.entries(qtys).filter(([,q])=>q>0).map(([key,qty])=>({
      key,qty,label:RECIPES[key]?.label||key,
      notes:dishNotes[key]||"",
      ingNotes:ingNotes[key]||{}
    })),[qtys,dishNotes,ingNotes,RECIPES]);

  const calcResults=useMemo(()=>calcPrepList(selections,ING,RECIPES),[selections,ING,RECIPES]);

  // Group calc results by GROUP_ORDER
  const calcByGroup=useMemo(()=>{
    const out={};
    GROUP_ORDER.forEach(g=>{out[g]=calcResults.filter(i=>(i.group||"SPECIALTY")===g);});
    return out;
  },[calcResults]);

  const bycat=useMemo(()=>{
    const out={};
    RECIPE_CATS.forEach(c=>{
      out[c]=Object.entries(RECIPES)
        .filter(([,r])=>r.cat===c)
        .map(([key,r])=>({key,r}));
    });
    return out;
  },[RECIPES]);

  const filteredBycat=useMemo(()=>{
    if(!search)return bycat;
    const q=search.toLowerCase();
    const out={};
    RECIPE_CATS.forEach(c=>{
      const matches=(bycat[c]||[]).filter(({r})=>r.label.toLowerCase().includes(q));
      if(matches.length)out[c]=matches;
    });
    return out;
  },[search,bycat]);

  const totalCovers=selections.reduce((s,x)=>s+(parseInt(x.qty)||0),0);

  const handleApply=()=>{
    onApply(selections,calcResults);
  };

  return(
    <div className="wiz-layout-single" style={{maxWidth:1100}}>
      <StepRail current={1}/>

      <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:24,width:"100%",alignItems:"start"}}>
        {/* LEFT COLUMN: Categories & Dishes */}
        <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,boxShadow:"var(--shadow)",overflow:"hidden"}}>
          {/* Header */}
          <div style={{padding:"24px 24px 16px",borderBottom:"1px solid var(--carbon-08)",background:"rgba(255,255,255,0.5)",backdropFilter:"blur(8px)"}}>
            {/* Title row */}
            <div className="wiz-hdr" style={{marginBottom:14,alignItems:"flex-end"}}>
              <div>
                <div className="wiz-step-eyebrow">Step 2 of 3 · For {event.name||"new event"}</div>
                <div className="wiz-title" style={{fontSize:28}}>Pick dishes &amp; set covers</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button className="btn btn-secondary" onClick={onBack}>← Back</button>
                <button className="btn btn-primary" onClick={handleApply}>Review →</button>
              </div>
            </div>
            {/* Search + Skip */}
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <div style={{position:"relative",flex:1}}>
                <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"var(--carbon-50)",fontSize:16}}>⌕</span>
                <input style={{width:"100%",padding:"11px 14px 11px 38px",border:"1px solid var(--carbon-20)",borderRadius:8,background:"#fff",fontSize:13,fontFamily:"inherit",outline:"none"}} placeholder="Search dishes…" value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>
              <button className="btn btn-secondary" style={{whiteSpace:"nowrap",flexShrink:0}} onClick={onSkip}>Skip — Build Manually</button>
            </div>
          </div>

          {/* Dish list area */}
          <div style={{padding:"20px 24px",maxHeight:"calc(100vh - 280px)",overflowY:"auto"}}>
            {RECIPE_CATS.filter(cat=>(filteredBycat[cat]||[]).length>0).map(cat=>{
              const dishes=filteredBycat[cat]||[];
              const selCount=dishes.filter(({key})=>qtys[key]>0).length;
              const covers=dishes.reduce((s,{key})=>s+(parseInt(qtys[key]||0)),0);
              const r0=dishes[0]?.r;
              return(
                <div key={cat} style={{background:"#fff",border:"1px solid var(--carbon-08)",borderRadius:10,overflow:"hidden",marginBottom:12}}>
                  {/* Category header */}
                  <div style={{padding:"10px 18px",borderBottom:"1px solid var(--carbon-08)",background:RCAT_COLORS[cat]||"#374151",display:"flex",alignItems:"baseline",gap:14}}>
                    <div style={{fontSize:12,fontWeight:800,letterSpacing:".12em",textTransform:"uppercase",color:"#fff"}}>{cat}</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.65)",letterSpacing:".03em"}}>
                      {selCount}/{dishes.length} chosen · {covers} covers{r0?.servingWord?` · per ${r0.servingWord}`:""}
                    </div>
                  </div>
                  {/* Dish rows */}
                  {dishes.map(({key,r},i)=>{
                    const q=qtys[key]||"";
                    const isSelected=q>0;
                    const isExpanded=!!(expanded[key]);
                    return(
                      <div key={key}>
                        {/* Main row */}
                        <div style={{display:"grid",gridTemplateColumns:"22px 1fr 1fr 150px 28px",padding:"12px 18px",borderTop:i>0?"1px solid var(--carbon-08)":"none",alignItems:"center",gap:14,background:isSelected?"rgba(224,138,117,.03)":"transparent",transition:"background .12s"}}>
                          <span style={{width:18,height:18,borderRadius:5,border:`1.5px solid ${isSelected?"var(--clay-500)":"var(--carbon-20)"}`,background:isSelected?"var(--clay-500)":"transparent",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0,cursor:"pointer"}} onClick={()=>{if(isSelected)adj(key,-999);else adj(key,1);}}>
                            {isSelected?"✓":""}
                          </span>
                          <span style={{fontSize:13,fontWeight:600,color:"var(--carbon-300)"}}>{r.label}</span>
                          {isSelected?(
                            <input value={dishNotes[key]||""} onChange={e=>setDishNotes(p=>({...p,[key]:e.target.value}))} placeholder="Dish note…" style={{width:"100%",border:"1px solid var(--carbon-12)",borderRadius:5,padding:"5px 8px",fontSize:11,color:"var(--carbon-300)",background:"#fff",outline:"none",fontFamily:"inherit"}} onClick={e=>e.stopPropagation()}/>
                          ):<span/>}
                          <div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"flex-end"}}>
                            <button style={{width:28,height:28,border:"1px solid var(--carbon-20)",borderRadius:6,background:"#fff",cursor:"pointer",fontSize:14,color:"var(--carbon-50)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,flexShrink:0}} onClick={()=>adj(key,-1)}>−</button>
                            <input value={q} placeholder="0" onChange={e=>setQty(key,e.target.value)} style={{width:56,padding:"5px 8px",border:`1px solid ${isSelected?"var(--clay-500)":"var(--carbon-20)"}`,borderRadius:6,background:isSelected?"var(--clay-50)":"#fff",fontSize:14,fontWeight:700,textAlign:"center",color:isSelected?"var(--clay-700)":"var(--carbon-300)",fontFamily:"inherit",outline:"none"}}/>
                            <button style={{width:28,height:28,border:"1px solid var(--carbon-20)",borderRadius:6,background:"#fff",cursor:"pointer",fontSize:14,color:"var(--carbon-50)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,flexShrink:0}} onClick={()=>adj(key,1)}>+</button>
                          </div>
                          {isSelected?(
                            <button onClick={()=>setExpanded(p=>({...p,[key]:!p[key]}))} style={{width:24,height:24,border:"1px solid var(--carbon-12)",borderRadius:5,background:"transparent",cursor:"pointer",fontSize:10,color:"var(--carbon-50)",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .12s",transform:isExpanded?"rotate(180deg)":"none"}}>▾</button>
                          ):<span/>}
                        </div>
                        {isSelected&&isExpanded&&(
                          <div style={{background:"#F7F5F2",borderTop:"1px dashed var(--carbon-08)",padding:"10px 18px 14px 54px"}}>
                            <div style={{fontSize:9,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"var(--carbon-50)",marginBottom:8}}>Ingredient Notes</div>
                            {r.ingredients.filter(ing=>ING[ing.name]).map(ing=>(
                              <div key={ing.name} style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                                <span style={{fontSize:12,color:"var(--carbon-300)",minWidth:150,flexShrink:0}}>
                                  {ing.name}
                                  <span style={{fontSize:10,color:"var(--carbon-50)",marginLeft:5}}>{"oz" in ing?ing.oz+"oz":ing.ea+" ea"}</span>
                                </span>
                                <input
                                  value={(ingNotes[key]||{})[ing.name]||""}
                                  onChange={e=>setIngNote(key,ing.name,e.target.value)}
                                  placeholder="Note…"
                                  style={{flex:1,border:"1px solid var(--carbon-12)",borderRadius:5,padding:"4px 8px",fontSize:11,color:"var(--carbon-300)",background:"#fff",outline:"none",fontFamily:"inherit"}}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Live Prep Calc & Actions */}
        <div style={{display:"flex",flexDirection:"column",gap:16,position:"sticky",top:32}}>
          <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,boxShadow:"var(--shadow)",overflow:"hidden",display:"flex",flexDirection:"column",height:"calc(100vh - 240px)"}}>
            <div style={{padding:"16px 20px",borderBottom:"1px solid var(--carbon-08)",background:"var(--masa-100)",flexShrink:0}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:".15em",textTransform:"uppercase",color:"var(--carbon-50)"}}>Live prep calc</div>
              <div style={{display:"flex",alignItems:"baseline",gap:6,marginTop:4}}>
                <span style={{fontSize:24,fontWeight:700,letterSpacing:"-.02em",color:"var(--carbon-300)"}}>{calcResults.length}</span>
                <span style={{fontSize:11,color:"var(--carbon-50)"}}>ingredients · {totalCovers} covers</span>
              </div>
            </div>
            <div style={{overflowY:"auto",flex:1,minHeight:0,overscrollBehavior:"contain"}}>
              {GROUP_ORDER.map(g=>{
                const items=calcByGroup[g];
                if(!items||!items.length)return null;
                return(
                  <div key={g}>
                    <div style={{padding:"7px 16px",fontSize:9,fontWeight:700,letterSpacing:".15em",textTransform:"uppercase",color:"var(--clay-500)",background:"var(--clay-50)"}}>{GROUPS[g].label}</div>
                    {items.map((item,j)=>(
                      <div key={item.name} style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"7px 16px",borderTop:j>0?"1px dashed var(--carbon-08)":"none",fontSize:12}}>
                        <span style={{color:"var(--carbon-300)"}}>{item.name}</span>
                        <span style={{fontWeight:700,color:"var(--clay-600)",letterSpacing:"-.01em",marginLeft:8,whiteSpace:"nowrap"}}>{item.calculatedQty} {item.unit}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
              {calcResults.length===0&&(
                <div style={{padding:"32px 20px",textAlign:"center",fontSize:12,color:"var(--carbon-50)",fontFamily:"var(--font-serif)"}}>Add dishes to see ingredient totals</div>
              )}
            </div>
          </div>

          <button className="btn btn-primary" style={{width:"100%",padding:"14px 16px",fontSize:14,borderRadius:12,fontWeight:700,boxShadow:"var(--shadow-md)"}} onClick={handleApply}>
            Next: Review &amp; Generate →
          </button>
        </div>
      </div>
    </div>
  );
}
