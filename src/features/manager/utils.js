export function getIngredientImpact(ingName, RECIPES) {
  const affected = Object.entries(RECIPES)
    .filter(([, r]) => r.ingredients?.some(i => i.name === ingName))
    .map(([, r]) => r.label);
  return affected;
}

export function getRecipeImpact(recipeKey, events) {
  const affected = events
    ? events.filter(ev => ev.menuSelections?.some(s => s.key === recipeKey)).map(ev => ev.name)
    : [];
  return affected;
}
