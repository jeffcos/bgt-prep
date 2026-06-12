export function calcPrepList(selections, ING, ALLRECIPES) {
  const totals={}, eaTotals={};
  const allRecipes = ALLRECIPES;
  selections.forEach(({key,qty}) => {
    if (!qty||qty<=0) return;
    const recipe = allRecipes[key]; if (!recipe) return;
    recipe.ingredients.forEach(ing => {
      const cfg = ING[ing.name]; if (!cfg) return;
      if ("ea" in ing) eaTotals[ing.name] = (eaTotals[ing.name]||0) + ing.ea*qty;
      else totals[ing.name] = (totals[ing.name]||0) + (ing.oz||0)*qty;
    });
  });
  const result={};
  Object.entries(totals).forEach(([name,totalOz]) => {
    const cfg=ING[name]; if (!cfg) return;
    result[name]={name, calculatedQty:Math.ceil(totalOz/cfg.opU), unit:cfg.unit, container:cfg.container, notes:cfg.notes, group:cfg.group};
  });
  Object.entries(eaTotals).forEach(([name,count]) => {
    const cfg=ING[name]; if (!cfg) return;
    result[name]={name, calculatedQty:Math.ceil(count), unit:cfg.unit, container:cfg.container, notes:cfg.notes, group:cfg.group};
  });
  return Object.values(result);
}

export function uid() { return Math.random().toString(36).slice(2,10); }
