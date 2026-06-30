import React from "react";

export function GuideView() {
  return (
    <div className="max-w-[800px]">
      <div className="text-3xl font-extrabold text-carbon-300 leading-tight mb-2">Recipe & Ingredient Guide</div>
      <div className="text-sm font-semibold text-carbon-50 mb-10">Reference guide for adding and editing recipes and ingredients in the system</div>

      {/* NAMING CONVENTIONS */}
      <div className="mb-12">
        <div className="text-xl font-extrabold text-carbon-300 mb-4 pb-2 border-b-2 border-bd">Naming Conventions</div>
        <div className="text-[13px] text-carbon-100 font-semibold mb-6 leading-relaxed">All recipe and ingredient names should match your Tripleseat menu item names as closely as possible. This will allow for automatic matching when we integrate Tripleseat in a future update.</div>
        <div className="bg-white border border-bd rounded-xl p-6 mb-6 shadow-sm">
          <div className="text-base font-extrabold text-carbon-300 mb-4 flex items-center justify-between">General Rules</div>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3"><div className="bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div><div className="text-[13px] text-carbon-200 leading-relaxed font-medium">Use <strong>Title Case</strong> for all names — e.g. "Skirt Steak Taco" not "skirt steak taco"</div></div>
            <div className="flex items-start gap-3"><div className="bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div><div className="text-[13px] text-carbon-200 leading-relaxed font-medium">Be <strong>specific</strong> — "Citrus Chicken" not just "Chicken"</div></div>
            <div className="flex items-start gap-3"><div className="bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div><div className="text-[13px] text-carbon-200 leading-relaxed font-medium">Match <strong>Tripleseat names exactly</strong> where possible — this enables future auto-import</div></div>
            <div className="flex items-start gap-3"><div className="bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">4</div><div className="text-[13px] text-carbon-200 leading-relaxed font-medium">Avoid abbreviations — write "Jalapeño Aioli" not "Jal. Aioli"</div></div>
          </div>
        </div>
      </div>

      {/* ADDING A RECIPE */}
      <div className="mb-12">
        <div className="text-xl font-extrabold text-carbon-300 mb-4 pb-2 border-b-2 border-bd">Adding a New Recipe</div>
        <div className="text-[13px] text-carbon-100 font-semibold mb-6 leading-relaxed">Recipes are the dishes your team selects when building an event menu. Each recipe contains a list of ingredients with quantities per serving. The system uses these to auto-calculate total prep quantities.</div>
        <div className="bg-white border border-bd rounded-xl p-6 mb-6 shadow-sm">
          <div className="text-base font-extrabold text-carbon-300 mb-4 flex items-center justify-between">Step by Step <span className="text-[10px] bg-bg px-2 py-1 rounded-md text-muted uppercase tracking-widest">Recipes Tab</span></div>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3"><div className="bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div><div className="text-[13px] text-carbon-200 leading-relaxed font-medium">Go to <strong>Recipes</strong> and click <strong>+ Add New Recipe</strong></div></div>
            <div className="flex items-start gap-3"><div className="bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div><div className="text-[13px] text-carbon-200 leading-relaxed font-medium">Enter the <strong>Recipe Name</strong> — match Tripleseat naming where possible</div></div>
            <div className="flex items-start gap-3"><div className="bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div><div className="text-[13px] text-carbon-200 leading-relaxed font-medium">Select the <strong>Category</strong> — this groups the recipe in the menu builder</div></div>
            <div className="flex items-start gap-3"><div className="bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">4</div><div className="text-[13px] text-carbon-200 leading-relaxed font-medium">Set the <strong>Serving Word</strong> — what one unit is called (taco, plate, serving, cone, etc.)</div></div>
            <div className="flex items-start gap-3"><div className="bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">5</div><div className="text-[13px] text-carbon-200 leading-relaxed font-medium">Add each <strong>ingredient</strong> from the library and enter the <strong>quantity per serving</strong></div></div>
            <div className="flex items-start gap-3"><div className="bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">6</div><div className="text-[13px] text-carbon-200 leading-relaxed font-medium">Click <strong>Save Recipe</strong></div></div>
          </div>
          <div className="mt-5 p-3 bg-bg rounded-lg text-xs text-muted italic font-medium">The quantity you enter is per single serving. If a taco uses 0.1 lbs of steak, enter 0.1 — the system multiplies by the order quantity automatically.</div>
        </div>
        <div className="bg-white border border-bd rounded-xl p-6 mb-6 shadow-sm">
          <div className="text-base font-extrabold text-carbon-300 mb-4 flex items-center justify-between">Recipe Categories</div>
          <table className="w-full border-collapse text-left text-[13px]">
            <thead><tr><th className="font-extrabold uppercase tracking-widest text-[10px] text-muted border-b border-bd pb-2">Category</th><th className="font-extrabold uppercase tracking-widest text-[10px] text-muted border-b border-bd pb-2">Use for</th><th className="font-extrabold uppercase tracking-widest text-[10px] text-muted border-b border-bd pb-2">Serving Word</th></tr></thead>
            <tbody>
              {[
                ["Tacos", "Individual tacos", "taco"],
                ["Quesadillas", "Individual quesadillas", "quesadilla"],
                ["Burritos", "Individual burritos", "burrito"],
                ["Bowls", "Individual bowls", "bowl"],
                ["Entrees", "Plated entrees, platters", "plate"],
                ["Sides", "Side dishes, beans, rice", "serving"],
                ["Appetizers", "Starters, bites, cones", "serving"],
                ["Sweets", "Desserts, churros", "serving"],
              ].map(([cat, use, sw]) => (
                <tr key={cat}><td className="py-2.5 font-medium border-b border-carbon-08 last:border-0">{cat}</td><td className="py-2.5 font-medium border-b border-carbon-08 last:border-0 text-muted">{use}</td><td className="py-2.5 font-medium border-b border-carbon-08 last:border-0 text-accent font-semibold">{sw}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADDING AN INGREDIENT */}
      <div className="mb-12">
        <div className="text-xl font-extrabold text-carbon-300 mb-4 pb-2 border-b-2 border-bd">Adding a New Ingredient</div>
        <div className="text-[13px] text-carbon-100 font-semibold mb-6 leading-relaxed">Ingredients are the building blocks of recipes. Each ingredient needs a unit, an oz/unit conversion, a prep group, and a container type. Getting these right ensures accurate quantity calculations on the prep sheet.</div>
        <div className="bg-white border border-bd rounded-xl p-6 mb-6 shadow-sm">
          <div className="text-base font-extrabold text-carbon-300 mb-4 flex items-center justify-between">Step by Step <span className="text-[10px] bg-bg px-2 py-1 rounded-md text-muted uppercase tracking-widest">Ingredients Tab</span></div>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3"><div className="bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div><div className="text-[13px] text-carbon-200 leading-relaxed font-medium">Go to <strong>Ingredients</strong> and click <strong>+ Add Ingredient</strong></div></div>
            <div className="flex items-start gap-3"><div className="bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div><div className="text-[13px] text-carbon-200 leading-relaxed font-medium">Enter the <strong>Ingredient Name</strong></div></div>
            <div className="flex items-start gap-3"><div className="bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div><div className="text-[13px] text-carbon-200 leading-relaxed font-medium">Select the <strong>Unit</strong> — how it's measured (lbs, oz, ea, qt, pt, ramekin)</div></div>
            <div className="flex items-start gap-3"><div className="bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">4</div><div className="text-[13px] text-carbon-200 leading-relaxed font-medium">Enter <strong>Oz/Unit</strong> — how many ounces per unit. Use 16 for lbs, 32 for qt, 16 for pt, 1 for ea/ramekin</div></div>
            <div className="flex items-start gap-3"><div className="bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">5</div><div className="text-[13px] text-carbon-200 leading-relaxed font-medium">Select the <strong>Group</strong> — which section of the prep sheet it appears in</div></div>
            <div className="flex items-start gap-3"><div className="bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">6</div><div className="text-[13px] text-carbon-200 leading-relaxed font-medium">Set the <strong>Container</strong> — how it's stored for transport (quart, pint, produce bag, foil, etc.)</div></div>
            <div className="flex items-start gap-3"><div className="bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">7</div><div className="text-[13px] text-carbon-200 leading-relaxed font-medium">Add any <strong>Notes</strong> — packaging instructions, portion info, special handling</div></div>
            <div className="flex items-start gap-3"><div className="bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">8</div><div className="text-[13px] text-carbon-200 leading-relaxed font-medium">Click <strong>Add Ingredient</strong></div></div>
          </div>
          <div className="mt-5 p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg text-xs text-[#065F46] font-semibold">Tip: Always check if the ingredient already exists before adding a new one. Use the search bar at the top of the Ingredients tab.</div>
        </div>
        <div className="bg-white border border-bd rounded-xl p-6 mb-6 shadow-sm">
          <div className="text-base font-extrabold text-carbon-300 mb-4 flex items-center justify-between">Oz/Unit Reference</div>
          <table className="w-full border-collapse text-left text-[13px]">
            <thead><tr><th className="font-extrabold uppercase tracking-widest text-[10px] text-muted border-b border-bd pb-2">Unit</th><th className="font-extrabold uppercase tracking-widest text-[10px] text-muted border-b border-bd pb-2">Oz/Unit Value</th><th className="font-extrabold uppercase tracking-widest text-[10px] text-muted border-b border-bd pb-2">Notes</th></tr></thead>
            <tbody>
              {[
                ["lbs", "16", "Standard weight for proteins, cheese, etc."],
                ["oz", "1", "Use for small quantities"],
                ["qt", "32", "Quart containers — salsas, sauces"],
                ["pt", "16", "Pint containers — aiolis, cremas"],
                ["ea", "1", "Individual items — tortillas, fish portions"],
                ["ramekin", "1", "Small portion cups — cilantro, garnishes"],
              ].map(([u, oz, note]) => (
                <tr key={u}><td className="py-2.5 font-medium border-b border-carbon-08 last:border-0">{u}</td><td className="py-2.5 font-medium border-b border-carbon-08 last:border-0 text-accent font-bold">{oz}</td><td className="py-2.5 font-medium border-b border-carbon-08 last:border-0 text-muted">{note}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white border border-bd rounded-xl p-6 mb-6 shadow-sm">
          <div className="text-base font-extrabold text-carbon-300 mb-4 flex items-center justify-between">Prep Sheet Groups</div>
          <table className="w-full border-collapse text-left text-[13px]">
            <thead><tr><th className="font-extrabold uppercase tracking-widest text-[10px] text-muted border-b border-bd pb-2">Group</th><th className="font-extrabold uppercase tracking-widest text-[10px] text-muted border-b border-bd pb-2">Ingredients that belong here</th></tr></thead>
            <tbody>
              {[
                ["Proteins", "All meats and proteins — steak, chicken, fish, carnitas, shrimp"],
                ["Tortillas", "Corn tortillas, flour tortillas, wraps, brioche buns"],
                ["Salsas & Sauces", "All salsas, aiolis, batters, sauces, guacamole"],
                ["Slaws & Vegetables", "Cabbage, relishes, pickled items, slaws, fresh veg"],
                ["Dairy & Cheese", "Cheese mix, crema, cotija, whipped cream, butter"],
                ["Grains & Beans", "Rice, black beans, pinto beans, whole beans"],
                ["Specialty & Sweets", "Ceviche, churro batter, dessert items, specialty prep"],
                ["Liquor / Beer / Wine / Bev", "All beverage items for bar events"],
              ].map(([g, desc]) => (
                <tr key={g}><td className="py-2.5 font-medium border-b border-carbon-08 last:border-0">{g}</td><td className="py-2.5 font-medium border-b border-carbon-08 last:border-0 text-muted">{desc}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDITING EXISTING */}
      <div className="mb-12">
        <div className="text-xl font-extrabold text-carbon-300 mb-4 pb-2 border-b-2 border-bd">Editing Existing Recipes & Ingredients</div>
        <div className="bg-white border border-bd rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3"><div className="bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div><div className="text-[13px] text-carbon-200 leading-relaxed font-medium"><strong>Built-in recipes and ingredients</strong> can be edited — your changes save as an override without removing the original</div></div>
            <div className="flex items-start gap-3"><div className="bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div><div className="text-[13px] text-carbon-200 leading-relaxed font-medium"><strong>Deleting</strong> any recipe or ingredient requires Admin access — contact Jeffrey</div></div>
            <div className="flex items-start gap-3"><div className="bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div><div className="text-[13px] text-carbon-200 leading-relaxed font-medium">Changes take effect on all <strong>future events</strong> — existing prep sheets are not retroactively updated</div></div>
          </div>
          <div className="mt-5 p-3 bg-bg rounded-lg text-xs text-muted italic font-medium">If you are unsure whether to edit a built-in recipe or add a new one, add a new one. Built-in recipes are shared across all events and changes affect everyone.</div>
        </div>
      </div>
    </div>
  );
}
