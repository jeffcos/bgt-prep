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
    <div className="max-w-[1100px] w-full mx-auto pb-12">
      <StepRail current={1}/>

      <div className="grid grid-cols-[1fr_340px] gap-6 w-full items-start">
        {/* LEFT COLUMN: Categories & Dishes */}
        <div className="bg-white border border-bd rounded-2xl shadow-custom overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-carbon-08 bg-white/50 backdrop-blur-md">
            {/* Title row */}
            <div className="flex items-end justify-between mb-3.5">
              <div>
                <div className="text-[10px] font-extrabold text-[#E08A75] uppercase tracking-[.15em] mb-1.5">Step 2 of 3 · For {event.name||"new event"}</div>
                <div className="text-[28px] font-extrabold text-carbon-300 leading-tight tracking-[-.02em]">Pick dishes &amp; set covers</div>
              </div>
              <div className="flex gap-2">
                <button className="bg-white border border-[#D4CCC2] text-carbon-300 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-black/5 shadow-sm transition-colors" onClick={onBack}>← Back</button>
                <button className="bg-[#E08A75] text-white border-none px-4 py-2 rounded-xl text-xs font-bold cursor-pointer hover:opacity-90 shadow-sm transition-colors" onClick={handleApply}>Review →</button>
              </div>
            </div>
            {/* Search + Skip */}
            <div className="flex gap-2.5 items-center">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-carbon-50 text-base">⌕</span>
                <input className="w-full py-2.5 pr-3.5 pl-9 border border-carbon-20 rounded-lg bg-white text-[13px] outline-none focus:border-[#E08A75] transition-colors" placeholder="Search dishes…" value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>
              <button className="whitespace-nowrap shrink-0 bg-white border border-[#D4CCC2] text-carbon-300 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-black/5 shadow-sm transition-colors" onClick={onSkip}>Skip — Build Manually</button>
            </div>
          </div>

          {/* Dish list area */}
          <div className="p-6 max-h-[calc(100vh-280px)] overflow-y-auto bg-bg">
            {RECIPE_CATS.filter(cat=>(filteredBycat[cat]||[]).length>0).map(cat=>{
              const dishes=filteredBycat[cat]||[];
              const selCount=dishes.filter(({key})=>qtys[key]>0).length;
              const covers=dishes.reduce((s,{key})=>s+(parseInt(qtys[key]||0)),0);
              const r0=dishes[0]?.r;
              return(
                <div key={cat} className="bg-white border border-carbon-08 rounded-xl overflow-hidden mb-3 shadow-[0_2px_4px_rgba(0,0,0,.02)]">
                  {/* Category header */}
                  <div className="px-4 py-2.5 flex items-baseline gap-3" style={{background:RCAT_COLORS[cat]||"#374151"}}>
                    <div className="text-xs font-extrabold tracking-[.12em] uppercase text-white">{cat}</div>
                    <div className="text-[11px] text-white/70 tracking-[.03em] font-medium">
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
                        <div className={`grid grid-cols-[22px_1fr_1fr_150px_28px] px-4 py-3 items-center gap-3.5 transition-colors ${i>0?"border-t border-carbon-08":""} ${isSelected?"bg-[rgba(224,138,117,.03)]":"bg-transparent"}`}>
                          <span className={`w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex items-center justify-center text-[11px] font-bold shrink-0 cursor-pointer ${isSelected?"border-[#E08A75] bg-[#E08A75] text-white":"border-carbon-20 bg-transparent text-transparent"}`} onClick={()=>{if(isSelected)adj(key,-999);else adj(key,1);}}>
                            {isSelected?"✓":""}
                          </span>
                          <span className="text-[13px] font-semibold text-carbon-300 leading-tight">{r.label}</span>
                          {isSelected?(
                            <input value={dishNotes[key]||""} onChange={e=>setDishNotes(p=>({...p,[key]:e.target.value}))} placeholder="Dish note…" className="w-full border border-carbon-12 rounded-[5px] px-2 py-1 text-[11px] text-carbon-300 bg-white outline-none focus:border-[#E08A75]" onClick={e=>e.stopPropagation()}/>
                          ):<span/>}
                          <div className="flex items-center gap-1.5 justify-end">
                            <button className="w-7 h-7 border border-carbon-20 rounded-md bg-white cursor-pointer text-sm text-carbon-50 flex items-center justify-center font-bold shrink-0 hover:border-carbon-50 transition-colors" onClick={()=>adj(key,-1)}>−</button>
                            <input value={q} placeholder="0" onChange={e=>setQty(key,e.target.value)} className={`w-14 px-2 py-1 rounded-md text-sm font-bold text-center outline-none ${isSelected?"border border-[#E08A75] bg-white text-[#A3503B] shadow-[0_0_0_1px_#E08A75_inset]":"border border-carbon-20 bg-white text-carbon-300"}`}/>
                            <button className="w-7 h-7 border border-carbon-20 rounded-md bg-white cursor-pointer text-sm text-carbon-50 flex items-center justify-center font-bold shrink-0 hover:border-carbon-50 transition-colors" onClick={()=>adj(key,1)}>+</button>
                          </div>
                          {isSelected?(
                            <button onClick={()=>setExpanded(p=>({...p,[key]:!p[key]}))} className={`w-6 h-6 border border-carbon-12 rounded-[5px] bg-white cursor-pointer text-[10px] text-carbon-50 flex items-center justify-center transition-transform hover:bg-black/5 ${isExpanded?"rotate-180":""}`}>▾</button>
                          ):<span/>}
                        </div>
                        {isSelected&&isExpanded&&(
                          <div className="bg-[#F7F5F2] border-t border-dashed border-carbon-08 pt-2.5 pb-3.5 pr-4 pl-[54px]">
                            <div className="text-[9px] font-bold tracking-[.12em] uppercase text-carbon-50 mb-2">Ingredient Notes</div>
                            {r.ingredients.filter(ing=>ING[ing.name]).map(ing=>(
                              <div key={ing.name} className="flex items-center gap-2.5 mb-1.5">
                                <span className="text-xs font-semibold text-carbon-300 min-w-[150px] shrink-0">
                                  {ing.name}
                                  <span className="text-[10px] font-normal text-carbon-50 ml-1.5">{"oz" in ing?ing.oz+"oz":ing.ea+" ea"}</span>
                                </span>
                                <input
                                  value={(ingNotes[key]||{})[ing.name]||""}
                                  onChange={e=>setIngNote(key,ing.name,e.target.value)}
                                  placeholder="Note…"
                                  className="flex-1 border border-carbon-12 rounded-[5px] px-2 py-1 text-[11px] text-carbon-300 bg-white outline-none focus:border-[#E08A75]"
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
        <div className="flex flex-col gap-4 sticky top-8">
          <div className="bg-white border border-bd rounded-2xl shadow-custom overflow-hidden flex flex-col h-[calc(100vh-240px)]">
            <div className="px-5 py-4 border-b border-carbon-08 bg-masa-100 shrink-0">
              <div className="text-[10px] font-bold tracking-[.15em] uppercase text-carbon-50">Live prep calc</div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold tracking-[-.02em] text-carbon-300">{calcResults.length}</span>
                <span className="text-[11px] font-medium text-carbon-50">ingredients · {totalCovers} covers</span>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 min-h-0 bg-white">
              {GROUP_ORDER.map(g=>{
                const items=calcByGroup[g];
                if(!items||!items.length)return null;
                return(
                  <div key={g}>
                    <div className="px-4 py-1.5 text-[9px] font-bold tracking-[.15em] uppercase text-clay-700 bg-clay-50">{GROUPS[g].label}</div>
                    {items.map((item,j)=>(
                      <div key={item.id} className={`flex justify-between items-center px-4 py-1.5 text-xs ${j>0?"border-t border-dashed border-carbon-08":""}`}>
                        <div className="flex flex-col">
                          <span className="font-semibold text-carbon-300">{item.name}</span>
                          {item.variation && <span className="text-[10px] italic font-medium text-carbon-50 bg-black/5 px-1 py-0.5 rounded-sm self-start mt-0.5">{item.variation}</span>}
                        </div>
                        <span className="font-bold text-clay-700 tracking-[-.01em] ml-2 whitespace-nowrap shrink-0">{item.calculatedQty} {item.unit}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
              {calcResults.length===0&&(
                <div className="p-8 text-center text-xs font-medium text-carbon-50">Add dishes to see ingredient totals</div>
              )}
            </div>
          </div>

          <button className="bg-[#E08A75] text-white border-none w-full py-3.5 px-4 text-sm rounded-xl font-bold shadow-custom-md cursor-pointer hover:opacity-90 transition-colors" onClick={handleApply}>
            Next: Review &amp; Generate →
          </button>
        </div>
      </div>
    </div>
  );
}
