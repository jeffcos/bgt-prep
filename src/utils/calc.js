export function calcPrepList(selections, ING, ALLRECIPES) {
  const totals={}, eaTotals={};
  const allRecipes = ALLRECIPES;
  selections.forEach(({key,qty,notes,ingNotes}) => {
    if (!qty||qty<=0) return;
    const recipe = allRecipes[key]; if (!recipe) return;
    recipe.ingredients.forEach(ing => {
      const cfg = ING[ing.name]; if (!cfg) return;
      const ingNote = (ingNotes && ingNotes[ing.name]) || "";
      const variation = [notes, ingNote].filter(Boolean).join(" - ");
      const hash = variation ? `${ing.name}___MOD___${variation}` : ing.name;

      if ("ea" in ing) {
        if (!eaTotals[hash]) eaTotals[hash] = { name: ing.name, variation, count: 0 };
        eaTotals[hash].count += ing.ea*qty;
      } else {
        if (!totals[hash]) totals[hash] = { name: ing.name, variation, oz: 0 };
        totals[hash].oz += (ing.oz||0)*qty;
      }
    });
  });
  const result={};
  Object.entries(totals).forEach(([hash, data]) => {
    const cfg=ING[data.name]; if (!cfg) return;
    result[hash]={id: uid(), name: data.name, calculatedQty:Math.ceil(data.oz/cfg.opU), unit:cfg.unit, container:cfg.container, notes:cfg.notes, variation: data.variation || null, group:cfg.group};
  });
  Object.entries(eaTotals).forEach(([hash, data]) => {
    const cfg=ING[data.name]; if (!cfg) return;
    result[hash]={id: uid(), name: data.name, calculatedQty:Math.ceil(data.count), unit:cfg.unit, container:cfg.container, notes:cfg.notes, variation: data.variation || null, group:cfg.group};
  });
  return Object.values(result);
}

export function uid() { return Math.random().toString(36).slice(2,10); }
