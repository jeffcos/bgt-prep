import { useState, useEffect, useRef } from "react";
import { GROUPS, GROUP_ORDER, RECIPE_CATS, RCAT_COLORS } from "../data/constants";
import Logo from "./Logo";
import UserManagement from "./UserManagement";
import AuditLog from "./AuditLog";

function getIngredientImpact(ingName, RECIPES){
  const affected = Object.entries(RECIPES)
    .filter(([,r]) => r.ingredients?.some(i => i.name === ingName))
    .map(([,r]) => r.label);
  return affected;
}

function getRecipeImpact(recipeKey, events){
  const affected = events
    ? events.filter(ev => ev.menuSelections?.some(s => s.key === recipeKey)).map(ev => ev.name)
    : [];
  return affected;
}

// ─── RECIPE LIST ───
function RecipeList({RECIPES,customKeys,onEdit,onNew,onDelete,isOwner,events}){
  const [filter,setFilter]=useState("ALL");
  const cats=["ALL",...RECIPE_CATS];
  const filtered=Object.entries(RECIPES).filter(([,r])=>filter==="ALL"||r.cat===filter);
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div><div className="mgr-page-title">Recipe Manager</div><div className="mgr-page-sub">{Object.keys(RECIPES).length} recipes</div></div>
        <button className="btn btn-primary" onClick={onNew}>+ Add New Recipe</button>
      </div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:16}}>
        {cats.map(c=><button key={c} onClick={()=>setFilter(c)} style={{padding:"4px 11px",borderRadius:20,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,background:filter===c?(RCAT_COLORS[c]||"#334155"):"#E2E8F0",color:filter===c?"#fff":"#475569",transition:"all .13s"}}>{c}</button>)}
      </div>
      <div className="recipe-grid">
        {filtered.map(([key,r])=>(
          <div key={key} className="rcard" onClick={()=>onEdit(key)}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:4,marginBottom:2}}>
              <div className="rcard-name">{r.label}</div>
              {isOwner&&(
                <button
                  style={{flexShrink:0,background:"none",border:"none",cursor:"pointer",color:"#CCC",fontSize:18,lineHeight:1,padding:"0 2px",borderRadius:3,transition:"color .12s"}}
                  onClick={e=>{e.stopPropagation();
                    const affected=getRecipeImpact(key,events);
                    const msg=affected.length>0
                      ? `"${r.label}" is currently on ${affected.length} active event${affected.length!==1?"s":""}:\n${affected.slice(0,5).join(", ")}${affected.length>5?` and ${affected.length-5} more`:""}\n\nDeleting this recipe will not affect existing prep sheets but removes it from the menu builder. Continue?`
                      : `Delete "${r.label}"? This cannot be undone.`;
                    if(confirm(msg))onDelete(key);
                  }}
                  title="Delete recipe"
                  onMouseEnter={e=>e.currentTarget.style.color="#DC2626"}
                  onMouseLeave={e=>e.currentTarget.style.color="#CCC"}
                >×</button>
              )}
            </div>
            <div className="rcard-cat" style={{color:RCAT_COLORS[r.cat]||"#64748B"}}>{r.cat} · per {r.servingWord}</div>
            <div className="rcard-ings">{r.ingredients.slice(0,3).map(i=>i.name).join(", ")}{r.ingredients.length>3?` +${r.ingredients.length-3} more`:""}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RECIPE EDITOR ───
function RecipeEditor({recipeKey,recipe,ING,onSave,onDelete,onCancel,isOwner,events}){
  const [label,setLabel]=useState(recipe?.label||"");
  const [cat,setCat]=useState(recipe?.cat||"TACOS");
  const [sw,setSw]=useState(recipe?.servingWord||"serving");
  const [ings,setIngs]=useState(recipe?.ingredients?.map(i=>({...i,type:"oz" in i?"oz":"ea"}))||[]);
  const addIng=()=>setIngs(p=>[...p,{name:"",oz:0,type:"oz"}]);
  const delIng=i=>setIngs(p=>p.filter((_,j)=>j!==i));
  const updIng=(i,k,v)=>setIngs(p=>p.map((ing,j)=>j!==i?ing:{...ing,[k]:v}));
  const setType=(i,t)=>setIngs(p=>p.map((ing,j)=>j!==i?ing:{name:ing.name,type:t,[t]:parseFloat(ing[ing.type]||0)||0}));
  const handleSave=()=>{
    if(!label)return;
    const key=recipeKey||label.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
    const cleanIngs=ings.filter(i=>i.name).map(i=>{const out={name:i.name};if(i.type==="oz")out.oz=parseFloat(i.oz)||0;else out.ea=parseFloat(i.ea)||0;return out;});
    onSave(key,{label,cat,servingWord:sw,ingredients:cleanIngs});
  };
  const ingNames=Object.keys(ING);
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <button className="btn btn-devghost btn-sm" onClick={onCancel}>← Back</button>
        <div><div className="mgr-page-title">{recipeKey&&recipeKey!=="new"?"Edit Recipe":"New Recipe"}</div></div>
      </div>
      <div className="recipe-editor">
        <div className="fgrid" style={{marginBottom:16}}>
          <div className="fg full"><label className="flabel">Recipe Name *</label><input className="finput" placeholder="e.g. Lobster Taco" value={label} onChange={e=>setLabel(e.target.value)}/></div>
          <div className="fg"><label className="flabel">Category</label><select className="finput" value={cat} onChange={e=>setCat(e.target.value)}>{RECIPE_CATS.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
          <div className="fg"><label className="flabel">Serving Word</label><input className="finput" placeholder="taco, bowl, piece…" value={sw} onChange={e=>setSw(e.target.value)}/></div>
        </div>
        <div style={{fontSize:13,fontWeight:700,marginBottom:10,color:"#334155"}}>Ingredients <span style={{fontSize:11,fontWeight:400,color:"#94A3B8"}}>— amounts per 1 serving</span></div>
        <div className="ing-row-hdr"><span>Ingredient</span><span>Amount</span><span>Unit Type</span><span/></div>
        {ings.map((ing,i)=>(
          <div key={i} className="ing-row">
            <input list={`il-${i}`} className="finput" placeholder="Ingredient name…" value={ing.name} onChange={e=>updIng(i,"name",e.target.value)} style={{padding:"5px 8px",fontSize:12}}/>
            <datalist id={`il-${i}`}>{ingNames.map(n=><option key={n} value={n}/>)}</datalist>
            <input className="finput" type="number" min="0" step="0.1" value={ing[ing.type]||""} onChange={e=>updIng(i,ing.type,e.target.value)} style={{padding:"5px 8px",fontSize:12,textAlign:"center"}}/>
            <div className="ing-type-toggle">
              <button className={`ing-type-btn ${ing.type==="oz"?"active":""}`} onClick={()=>setType(i,"oz")}>oz</button>
              <button className={`ing-type-btn ${ing.type==="ea"?"active":""}`} onClick={()=>setType(i,"ea")}>ea</button>
            </div>
            <button className="ing-del" onClick={()=>delIng(i)}>×</button>
          </div>
        ))}
        <button className="add-ing-btn" onClick={addIng}>+ Add Ingredient</button>
        <div className="faction">
          {onDelete&&<button className="btn btn-danger btn-sm" onClick={()=>{
            const affected=getRecipeImpact(recipeKey,events);
            const msg=affected.length>0
              ? `This recipe is on ${affected.length} active event${affected.length!==1?"s":""}:\n${affected.slice(0,5).join(", ")}\n\nDeleting removes it from the menu builder but won't affect existing prep sheets. Continue?`
              : "Delete this recipe? This cannot be undone.";
            if(confirm(msg))onDelete();
          }}>Delete</button>}
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!label}>Save Recipe</button>
        </div>
      </div>
    </div>
  );
}

// ─── INGREDIENT MANAGER (with inline editing) ───
function IngredientManager({ING,customKeys,onSave,onUpdate,onDelete,isOwner,RECIPES}){
  const [filter,setFilter]=useState("ALL");
  const [adding,setAdding]=useState(false);
  const [editingName,setEditingName]=useState(null);
  const [form,setForm]=useState({name:"",unit:"qt",opU:32,group:"SALSAS",container:"",notes:""});
  const [editForm,setEditForm]=useState({});
  const sf=(k,v)=>setForm(p=>({...p,[k]:v}));

  const filtered=Object.entries(ING).filter(([,cfg])=>filter==="ALL"||cfg.group===filter);

  const handleSave=()=>{
    if(!form.name)return;
    onSave(form.name,{unit:form.unit,opU:parseFloat(form.opU)||1,group:form.group,container:form.container,notes:form.notes});
    setAdding(false);setForm({name:"",unit:"qt",opU:32,group:"SALSAS",container:"",notes:""});
  };

  const startEdit=(name,cfg)=>{
    setEditingName(name);
    setEditForm({name,unit:cfg.unit,opU:cfg.opU,group:cfg.group,container:cfg.container||"",notes:cfg.notes||""});
  };
  const saveEdit=()=>{
    if(!editForm.name)return;
    onUpdate(editingName,editForm.name,{unit:editForm.unit,opU:parseFloat(editForm.opU)||1,group:editForm.group,container:editForm.container,notes:editForm.notes});
    setEditingName(null);
  };

  const isEditable=name=>customKeys.includes(name);

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div><div className="mgr-page-title">Ingredient Library</div><div className="mgr-page-sub">{Object.keys(ING).length} ingredients</div></div>
        <button className="btn btn-primary" onClick={()=>setAdding(true)}>+ Add Ingredient</button>
      </div>

      {adding&&(
        <div className="recipe-editor" style={{marginBottom:16}}>
          <div style={{fontSize:16,fontWeight:700,marginBottom:14,color:"#1E293B"}}>New Ingredient</div>
          <div className="fgrid">
            <div className="fg full"><label className="flabel">Name *</label><input className="finput" placeholder="e.g. Habanero Salsa" value={form.name} onChange={e=>sf("name",e.target.value)}/></div>
            <div className="fg"><label className="flabel">Display Unit</label><input className="finput" placeholder="qt, pt, lbs, ea…" value={form.unit} onChange={e=>sf("unit",e.target.value)}/></div>
            <div className="fg"><label className="flabel">oz Per Unit <span style={{fontWeight:400,fontSize:10}}>(qt=32, pt=16, lb=16, ea=1)</span></label><input className="finput" type="number" value={form.opU} onChange={e=>sf("opU",e.target.value)}/></div>
            <div className="fg"><label className="flabel">Group</label><select className="finput" value={form.group} onChange={e=>sf("group",e.target.value)}>{GROUP_ORDER.map(g=><option key={g} value={g}>{GROUPS[g].label}</option>)}</select></div>
            <div className="fg"><label className="flabel">Container</label><input className="finput" placeholder="clear quart…" value={form.container} onChange={e=>sf("container",e.target.value)}/></div>
            <div className="fg"><label className="flabel">Notes</label><input className="finput" value={form.notes} onChange={e=>sf("notes",e.target.value)}/></div>
          </div>
          <div className="faction">
            <button className="btn btn-secondary btn-sm" onClick={()=>setAdding(false)}>Cancel</button>
            <button className="btn btn-dev btn-sm" onClick={handleSave} disabled={!form.name}>Save Ingredient</button>
          </div>
        </div>
      )}

      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:14}}>
        {["ALL",...GROUP_ORDER].map(g=><button key={g} onClick={()=>setFilter(g)} style={{padding:"3px 10px",borderRadius:20,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,background:filter===g?(GROUPS[g]?.color||"#334155"):"#E2E8F0",color:filter===g?"#fff":"#475569",transition:"all .13s"}}>{g==="ALL"?"All":GROUPS[g]?.label.split(" ")[0]}</button>)}
      </div>

      <div className="recipe-editor" style={{padding:0,overflow:"hidden"}}>
        <table className="ing-tbl">
          <thead><tr>
            <th>Name</th><th>Unit</th><th>oz/Unit</th><th>Group</th><th>Container</th><th>Notes</th><th style={{width:90}}></th>
          </tr></thead>
          <tbody>
            {filtered.map(([name,cfg])=>{
              const custom=customKeys.includes(name);
              const isEditing=editingName===name;
              return(
                <tr key={name}>
                  {isEditing?(
                    <>
                      <td><input className="ing-edit-inp" value={editForm.name} onChange={e=>setEditForm(p=>({...p,name:e.target.value}))}/></td>
                      <td><input className="ing-edit-inp" value={editForm.unit} onChange={e=>setEditForm(p=>({...p,unit:e.target.value}))}/></td>
                      <td><input className="ing-edit-inp" type="number" value={editForm.opU} onChange={e=>setEditForm(p=>({...p,opU:e.target.value}))}/></td>
                      <td><select className="ing-edit-inp" value={editForm.group} onChange={e=>setEditForm(p=>({...p,group:e.target.value}))}>{GROUP_ORDER.map(g=><option key={g} value={g}>{GROUPS[g].label}</option>)}</select></td>
                      <td><input className="ing-edit-inp" value={editForm.container} onChange={e=>setEditForm(p=>({...p,container:e.target.value}))}/></td>
                      <td><input className="ing-edit-inp" value={editForm.notes} onChange={e=>setEditForm(p=>({...p,notes:e.target.value}))}/></td>
                      <td><div style={{display:"flex",gap:4}}>
                        <button className="btn btn-dev btn-sm" style={{padding:"3px 8px",fontSize:11}} onClick={saveEdit}>Save</button>
                        <button className="btn btn-secondary btn-sm" style={{padding:"3px 8px",fontSize:11}} onClick={()=>setEditingName(null)}>Cancel</button>
                      </div></td>
                    </>
                  ):(
                    <>
                      <td style={{fontWeight:500}}>{name}</td>
                      <td style={{color:"#7A736C"}}>{cfg.unit}</td>
                      <td style={{color:"#7A736C"}}>{cfg.opU}</td>
                      <td><span style={{background:GROUPS[cfg.group]?.color+"22",color:GROUPS[cfg.group]?.color,fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:20}}>{GROUPS[cfg.group]?.label||cfg.group}</span></td>
                      <td style={{color:"#7A736C"}}>{cfg.container||"—"}</td>
                      <td style={{color:"#7A736C",fontSize:11}}>{cfg.notes||"—"}</td>
                      <td><div style={{display:"flex",gap:4}}>
                        {custom&&<button className="btn btn-secondary btn-sm" style={{padding:"3px 8px",fontSize:11}} onClick={()=>startEdit(name,cfg)}>Edit</button>}
                        {!custom&&<button className="btn btn-secondary btn-sm" style={{padding:"3px 8px",fontSize:11}} onClick={()=>startEdit(name,cfg)} title="Edit built-in ingredient">Edit</button>}
                        {isOwner&&<button className="btn btn-danger btn-sm" style={{padding:"3px 8px",fontSize:11}} onClick={()=>{
                const affected=getIngredientImpact(name,RECIPES);
                const msg=affected.length>0
                  ? `"${name}" is used in ${affected.length} recipe${affected.length!==1?"s":""}:\n${affected.slice(0,5).join(", ")}${affected.length>5?` and ${affected.length-5} more`:""}\n\nDeleting this ingredient will remove it from those recipes. Continue?`
                  : `Delete "${name}"? This cannot be undone.`;
                if(confirm(msg))onDelete(name);
              }}>Delete</button>}
                      </div></td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


export default function MgrApp({devData,mutDev,ING,RECIPES,onExit,isOwner,events,ops,onSignOut,userProfile,currentUserId}){
  const [tab,setTab]=useState("recipes");
  const [editingRecipe,setEditingRecipe]=useState(null);
  const [showUserMenu,setShowUserMenu]=useState(false);
  const userMenuRef=useRef(null);

  const userName=userProfile?.name||"";
  const userEmail=userProfile?.email||"";

  useEffect(()=>{
    if(!showUserMenu)return;
    const handler=(e)=>{if(userMenuRef.current&&!userMenuRef.current.contains(e.target))setShowUserMenu(false);};
    document.addEventListener("mousedown",handler);
    return()=>document.removeEventListener("mousedown",handler);
  },[showUserMenu]);

  const saveRecipe=(key,recipe)=>{mutDev(p=>({...p,customRecipes:{...p.customRecipes,[key]:recipe}}));setEditingRecipe(null);};
  const deleteRecipe=key=>{mutDev(p=>{const cr={...p.customRecipes};delete cr[key];return{...p,customRecipes:cr};}); };
  const saveIngredient=(name,cfg)=>mutDev(p=>({...p,customIngredients:{...p.customIngredients,[name]:cfg}}));
  const updateIngredient=(oldName,newName,cfg)=>{mutDev(p=>{const ci={...p.customIngredients};if(oldName!==newName)delete ci[oldName];ci[newName]=cfg;return{...p,customIngredients:ci};});};
  const deleteIngredient=name=>{mutDev(p=>{const ci={...p.customIngredients};delete ci[name];return{...p,customIngredients:ci};});};
  const savePin=newPin=>{if(newPin?.length>=3)mutDev(p=>({...p,pin:newPin}));};

  const navItems=[{tab:"recipes",label:"Recipes"},{tab:"ingredients",label:"Ingredients"},{tab:"guide",label:"Guide"},...(isOwner?[{tab:"team",label:"Team"},{tab:"audit",label:"Audit Log"},{tab:"recycle",label:"Recycle Bin"}]:[])];

  return(
    <>
      <nav className="nav-new">
        <Logo onClick={onExit}/>
        <div className="nav-items-new">
          {navItems.map(n=>(
            <button key={n.tab} className={`nav-item-new ${tab===n.tab?"on":""}`} onClick={()=>{setEditingRecipe(null);setTab(n.tab);}}>{n.label}</button>
          ))}
        </div>
        <div className="nav-right-new">
          <div className="sync-pill"><span className="sync-dot"/><span>{isOwner?"Owner mode":"Admin mode"}</span></div>
          <div className="avatar-menu-wrap" ref={userMenuRef}>
            <div className={`avatar-new${showUserMenu?" avatar-active":""}`} style={{cursor:"pointer"}} onClick={()=>setShowUserMenu(v=>!v)}>
              {userName?userName.trim().split(/\s+/).map(w=>w[0].toUpperCase()).slice(0,2).join(""):"?"}
            </div>
            {showUserMenu&&(
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <div className="user-dropdown-name">{userName||"User"}</div>
                </div>
                <div className="user-dropdown-divider"/>
                <button className="user-dropdown-item" onClick={()=>{setShowUserMenu(false);onExit();}}>← Operations</button>
                <div className="user-dropdown-divider"/>
                <button className="user-dropdown-item user-dropdown-signout" onClick={()=>{setShowUserMenu(false);onSignOut&&onSignOut();}}>↪ Sign out</button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <div className="mgr-layout">
        <div className="mgr-content" style={{maxWidth:"none",width:"100%"}}>
          {tab==="recipes"&&(editingRecipe?
            <RecipeEditor recipeKey={editingRecipe==="new"?null:editingRecipe} recipe={editingRecipe==="new"?null:RECIPES[editingRecipe]} ING={ING} onSave={saveRecipe} onDelete={isOwner&&editingRecipe!=="new"?()=>{deleteRecipe(editingRecipe);setEditingRecipe(null);}:null} onCancel={()=>setEditingRecipe(null)} isOwner={isOwner} events={events}/>:
            <RecipeList RECIPES={RECIPES} customKeys={Object.keys(devData.customRecipes)} onEdit={setEditingRecipe} onNew={()=>setEditingRecipe("new")} onDelete={key=>{deleteRecipe(key);setEditingRecipe(null);}} isOwner={isOwner} events={events}/>
          )}
          {tab==="ingredients"&&<IngredientManager ING={ING} customKeys={Object.keys(devData.customIngredients||{})} onSave={saveIngredient} onUpdate={updateIngredient} onDelete={deleteIngredient} isOwner={isOwner} RECIPES={RECIPES}/>}
          {tab==="team"&&isOwner&&<UserManagement currentUserId={currentUserId}/>}
        {tab==="guide"&&(
          <div style={{maxWidth:800}}>
            <div className="mgr-page-title">Recipe & Ingredient Guide</div>
            <div className="mgr-page-sub">Reference guide for adding and editing recipes and ingredients in the system</div>

            {/* NAMING CONVENTIONS */}
            <div className="guide-section">
              <div className="guide-section-title">Naming Conventions</div>
              <div className="guide-intro">All recipe and ingredient names should match your Tripleseat menu item names as closely as possible. This will allow for automatic matching when we integrate Tripleseat in a future update.</div>
              <div className="guide-card">
                <div className="guide-card-title">General Rules</div>
                <div className="guide-steps">
                  <div className="guide-step"><div className="guide-step-num">1</div><div className="guide-step-text">Use <strong>Title Case</strong> for all names — e.g. "Skirt Steak Taco" not "skirt steak taco"</div></div>
                  <div className="guide-step"><div className="guide-step-num">2</div><div className="guide-step-text">Be <strong>specific</strong> — "Citrus Chicken" not just "Chicken"</div></div>
                  <div className="guide-step"><div className="guide-step-num">3</div><div className="guide-step-text">Match <strong>Tripleseat names exactly</strong> where possible — this enables future auto-import</div></div>
                  <div className="guide-step"><div className="guide-step-num">4</div><div className="guide-step-text">Avoid abbreviations — write "Jalapeño Aioli" not "Jal. Aioli"</div></div>
                </div>
              </div>
            </div>

            {/* ADDING A RECIPE */}
            <div className="guide-section">
              <div className="guide-section-title">Adding a New Recipe</div>
              <div className="guide-intro">Recipes are the dishes your team selects when building an event menu. Each recipe contains a list of ingredients with quantities per serving. The system uses these to auto-calculate total prep quantities.</div>
              <div className="guide-card">
                <div className="guide-card-title">Step by Step <span className="guide-card-title-badge">Recipes Tab</span></div>
                <div className="guide-steps">
                  <div className="guide-step"><div className="guide-step-num">1</div><div className="guide-step-text">Go to <strong>Recipes</strong> and click <strong>+ Add New Recipe</strong></div></div>
                  <div className="guide-step"><div className="guide-step-num">2</div><div className="guide-step-text">Enter the <strong>Recipe Name</strong> — match Tripleseat naming where possible</div></div>
                  <div className="guide-step"><div className="guide-step-num">3</div><div className="guide-step-text">Select the <strong>Category</strong> — this groups the recipe in the menu builder</div></div>
                  <div className="guide-step"><div className="guide-step-num">4</div><div className="guide-step-text">Set the <strong>Serving Word</strong> — what one unit is called (taco, plate, serving, cone, etc.)</div></div>
                  <div className="guide-step"><div className="guide-step-num">5</div><div className="guide-step-text">Add each <strong>ingredient</strong> from the library and enter the <strong>quantity per serving</strong></div></div>
                  <div className="guide-step"><div className="guide-step-num">6</div><div className="guide-step-text">Click <strong>Save Recipe</strong></div></div>
                </div>
                <div className="guide-note">The quantity you enter is per single serving. If a taco uses 0.1 lbs of steak, enter 0.1 — the system multiplies by the order quantity automatically.</div>
              </div>
              <div className="guide-card">
                <div className="guide-card-title">Recipe Categories</div>
                <table className="guide-table">
                  <thead><tr><th>Category</th><th>Use for</th><th>Serving Word</th></tr></thead>
                  <tbody>
                    {[
                      ["Tacos","Individual tacos","taco"],
                      ["Quesadillas","Individual quesadillas","quesadilla"],
                      ["Burritos","Individual burritos","burrito"],
                      ["Bowls","Individual bowls","bowl"],
                      ["Entrees","Plated entrees, platters","plate"],
                      ["Sides","Side dishes, beans, rice","serving"],
                      ["Appetizers","Starters, bites, cones","serving"],
                      ["Sweets","Desserts, churros","serving"],
                    ].map(([cat,use,sw])=>(
                      <tr key={cat}><td>{cat}</td><td style={{color:"var(--muted)"}}>{use}</td><td style={{color:"var(--accent)",fontWeight:600}}>{sw}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ADDING AN INGREDIENT */}
            <div className="guide-section">
              <div className="guide-section-title">Adding a New Ingredient</div>
              <div className="guide-intro">Ingredients are the building blocks of recipes. Each ingredient needs a unit, an oz/unit conversion, a prep group, and a container type. Getting these right ensures accurate quantity calculations on the prep sheet.</div>
              <div className="guide-card">
                <div className="guide-card-title">Step by Step <span className="guide-card-title-badge">Ingredients Tab</span></div>
                <div className="guide-steps">
                  <div className="guide-step"><div className="guide-step-num">1</div><div className="guide-step-text">Go to <strong>Ingredients</strong> and click <strong>+ Add Ingredient</strong></div></div>
                  <div className="guide-step"><div className="guide-step-num">2</div><div className="guide-step-text">Enter the <strong>Ingredient Name</strong></div></div>
                  <div className="guide-step"><div className="guide-step-num">3</div><div className="guide-step-text">Select the <strong>Unit</strong> — how it's measured (lbs, oz, ea, qt, pt, ramekin)</div></div>
                  <div className="guide-step"><div className="guide-step-num">4</div><div className="guide-step-text">Enter <strong>Oz/Unit</strong> — how many ounces per unit. Use 16 for lbs, 32 for qt, 16 for pt, 1 for ea/ramekin</div></div>
                  <div className="guide-step"><div className="guide-step-num">5</div><div className="guide-step-text">Select the <strong>Group</strong> — which section of the prep sheet it appears in</div></div>
                  <div className="guide-step"><div className="guide-step-num">6</div><div className="guide-step-text">Set the <strong>Container</strong> — how it's stored for transport (quart, pint, produce bag, foil, etc.)</div></div>
                  <div className="guide-step"><div className="guide-step-num">7</div><div className="guide-step-text">Add any <strong>Notes</strong> — packaging instructions, portion info, special handling</div></div>
                  <div className="guide-step"><div className="guide-step-num">8</div><div className="guide-step-text">Click <strong>Add Ingredient</strong></div></div>
                </div>
                <div className="guide-tip">Tip: Always check if the ingredient already exists before adding a new one. Use the search bar at the top of the Ingredients tab.</div>
              </div>
              <div className="guide-card">
                <div className="guide-card-title">Oz/Unit Reference</div>
                <table className="guide-table">
                  <thead><tr><th>Unit</th><th>Oz/Unit Value</th><th>Notes</th></tr></thead>
                  <tbody>
                    {[
                      ["lbs","16","Standard weight for proteins, cheese, etc."],
                      ["oz","1","Use for small quantities"],
                      ["qt","32","Quart containers — salsas, sauces"],
                      ["pt","16","Pint containers — aiolis, cremas"],
                      ["ea","1","Individual items — tortillas, fish portions"],
                      ["ramekin","1","Small portion cups — cilantro, garnishes"],
                    ].map(([u,oz,note])=>(
                      <tr key={u}><td>{u}</td><td style={{color:"var(--accent)",fontWeight:700}}>{oz}</td><td style={{color:"var(--muted)"}}>{note}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="guide-card">
                <div className="guide-card-title">Prep Sheet Groups</div>
                <table className="guide-table">
                  <thead><tr><th>Group</th><th>Ingredients that belong here</th></tr></thead>
                  <tbody>
                    {[
                      ["Proteins","All meats and proteins — steak, chicken, fish, carnitas, shrimp"],
                      ["Tortillas","Corn tortillas, flour tortillas, wraps, brioche buns"],
                      ["Salsas & Sauces","All salsas, aiolis, batters, sauces, guacamole"],
                      ["Slaws & Vegetables","Cabbage, relishes, pickled items, slaws, fresh veg"],
                      ["Dairy & Cheese","Cheese mix, crema, cotija, whipped cream, butter"],
                      ["Grains & Beans","Rice, black beans, pinto beans, whole beans"],
                      ["Specialty & Sweets","Ceviche, churro batter, dessert items, specialty prep"],
                      ["Liquor / Beer / Wine / Bev","All beverage items for bar events"],
                    ].map(([g,desc])=>(
                      <tr key={g}><td>{g}</td><td style={{color:"var(--muted)"}}>{desc}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* EDITING EXISTING */}
            <div className="guide-section">
              <div className="guide-section-title">Editing Existing Recipes & Ingredients</div>
              <div className="guide-card">
                <div className="guide-steps">
                  <div className="guide-step"><div className="guide-step-num">1</div><div className="guide-step-text"><strong>Built-in recipes and ingredients</strong> can be edited — your changes save as an override without removing the original</div></div>
                  <div className="guide-step"><div className="guide-step-num">2</div><div className="guide-step-text"><strong>Deleting</strong> any recipe or ingredient requires Owner access — contact Jeffrey</div></div>
                  <div className="guide-step"><div className="guide-step-num">3</div><div className="guide-step-text">Changes take effect on all <strong>future events</strong> — existing prep sheets are not retroactively updated</div></div>
                </div>
                <div className="guide-note">If you are unsure whether to edit a built-in recipe or add a new one, add a new one. Built-in recipes are shared across all events and changes affect everyone.</div>
              </div>
            </div>
          </div>
        )}
        {tab==="recycle"&&isOwner&&(
          <div>
            <div className="mgr-page-title">Recycle Bin</div>
            <div className="mgr-page-sub">{events.filter(e=>e.deleted).length} deleted event{events.filter(e=>e.deleted).length!==1?"s":""} · Owner access only</div>
            {events.filter(e=>e.deleted).length===0&&(
              <div className="empty-state"><h3>No deleted events</h3><p>Deleted events will appear here and can be restored.</p></div>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {events.filter(e=>e.deleted).sort((a,b)=>new Date(b.deletedAt||0)-new Date(a.deletedAt||0)).map(ev=>(
                <div key={ev.id} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,padding:"14px 18px",display:"flex",alignItems:"center",gap:16}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:14,color:"var(--text)"}}>{ev.name}</div>
                    <div style={{fontSize:12,color:"var(--muted)",marginTop:2}}>{ev.truck} · {ev.date} · {ev.guests} guests</div>
                    <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>Deleted {ev.deletedAt?new Date(ev.deletedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"}):""}</div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={()=>ops.updateEvent(ev.id,{deleted:false,deletedAt:null},ev.name)}>Restore</button>
                  <button className="btn btn-danger btn-sm" onClick={async()=>{if(confirm(`Permanently delete "${ev.name}"? This cannot be undone.`))await ops.purgeEvent(ev.id);}}>Purge</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab==="audit"&&isOwner&&<AuditLog/>}
        </div>
      </div>
    </>
  );
}
