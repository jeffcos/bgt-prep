import { useState, useEffect, useCallback, useMemo, useRef } from "react";

// ─── GROUPS ───
const GROUPS = {
  PROTEINS:   { label:"Proteins",           color:"#7F1D1D" },
  TORTILLAS:  { label:"Tortillas & Wraps",  color:"#78350F" },
  SALSAS:     { label:"Salsas & Sauces",    color:"#C9541E" },
  VEGETABLES: { label:"Slaws & Vegetables", color:"#14532D" },
  DAIRY:      { label:"Dairy & Cheese",     color:"#1E3A8A" },
  GRAINS:     { label:"Grains & Beans",     color:"#713F12" },
  SPECIALTY:  { label:"Specialty & Sweets", color:"#4C1D95" },
  LIQ:        { label:"Liquor & Cocktails", color:"#6D4FA3" },
  BEER:       { label:"Beer",               color:"#B38B18" },
  WINE:       { label:"Wine",               color:"#923650" },
  BEV:        { label:"Other Beverages",    color:"#1F7A6E" },
};
const GROUP_ORDER = ["PROTEINS","TORTILLAS","SALSAS","VEGETABLES","DAIRY","GRAINS","SPECIALTY","LIQ","BEER","WINE","BEV"];

// ─── BASE INGREDIENTS ───
const BASE_ING = {
  "Corn Tortillas":           {unit:"ea",     opU:1,  group:"TORTILLAS",  container:"produce bag",      notes:"30 per pkg"},
  "Large Flour Tortillas":    {unit:"ea",     opU:1,  group:"TORTILLAS",  container:"plastic w/ liner", notes:"12 per pkg"},
  "Brioche Bun":              {unit:"ea",     opU:1,  group:"TORTILLAS",  container:"produce bag",      notes:""},
  "Prime Rib":                {unit:"lbs",    opU:16, group:"PROTEINS",   container:"produce bag",      notes:"w/ chimi, bacon, poblano"},
  "Carnitas":                 {unit:"lbs",    opU:16, group:"PROTEINS",   container:"quart",      notes:""},
  "Citrus Chicken":           {unit:"lbs",    opU:16, group:"PROTEINS",   container:"produce bag",      notes:""},
  "Skirt Steak":              {unit:"lbs",    opU:16, group:"PROTEINS",   container:"produce bag",      notes:""},
  "Chicken Tinga":            {unit:"lbs",    opU:16, group:"PROTEINS",   container:"quart",      notes:""},
  "Yucatan Pork":             {unit:"lbs",    opU:16, group:"PROTEINS",   container:"quart",      notes:""},
  "Steak Picado":             {unit:"lbs",    opU:16, group:"PROTEINS",   container:"quart",      notes:""},
  "Beef Short Rib":           {unit:"lbs",    opU:16, group:"PROTEINS",   container:"quart",      notes:""},
  "Shrimp":                   {unit:"lbs",    opU:16, group:"PROTEINS",   container:"produce bag",      notes:""},
  "Fish (Salmon)":            {unit:"ea",     opU:1,  group:"PROTEINS",   container:"foil",             notes:"1.5 oz portions"},
  "Bacon":                    {unit:"lbs",    opU:16, group:"PROTEINS",   container:"foil",             notes:"Cooked halfway"},
  "Beer Batter":              {unit:"qt",     opU:32, group:"SALSAS",     container:"quart",      notes:""},
  "Serrano Salsa":            {unit:"qt",     opU:32, group:"SALSAS",     container:"quart",      notes:""},
  "Salsa Fresca":             {unit:"qt",     opU:32, group:"SALSAS",     container:"quart",      notes:""},
  "Tomatillo Salsa":          {unit:"qt",     opU:32, group:"SALSAS",     container:"quart",      notes:""},
  "Chipotle Salsa":           {unit:"qt",     opU:32, group:"SALSAS",     container:"quart",      notes:""},
  "Salsa Quemada":            {unit:"qt",     opU:32, group:"SALSAS",     container:"quart",      notes:""},
  "Salsa Verde":              {unit:"qt",     opU:32, group:"SALSAS",     container:"quart",      notes:""},
  "Arbol Salsa":              {unit:"qt",     opU:32, group:"SALSAS",     container:"quart",      notes:""},
  "Guacamole":                {unit:"qt",     opU:32, group:"SALSAS",     container:"quart",      notes:""},
  "Chipotle Ketchup":         {unit:"pt",     opU:16, group:"SALSAS",     container:"pint",       notes:""},
  "Aji Amarillo Aioli":       {unit:"pt",     opU:16, group:"SALSAS",     container:"pint",         notes:""},
  "Jalapeno Aioli":           {unit:"pt",     opU:16, group:"SALSAS",     container:"pint",         notes:""},
  "Chipotle Aioli":           {unit:"pt",     opU:16, group:"SALSAS",     container:"pint",       notes:""},
  "Avocado Crema":            {unit:"pt",     opU:16, group:"SALSAS",     container:"pint",       notes:""},
  "Chipotle Crema":           {unit:"pt",     opU:16, group:"SALSAS",     container:"pint",       notes:""},
  "Cubano Sauce":             {unit:"pt",     opU:16, group:"SALSAS",     container:"pint",       notes:""},
  "Red Wine Vinaigrette":     {unit:"pt",     opU:16, group:"SALSAS",     container:"pint",       notes:""},
  "Corn Relish":              {unit:"qt",     opU:32, group:"VEGETABLES", container:"quart",      notes:""},
  "Shaved Cabbage":           {unit:"qt",     opU:32, group:"VEGETABLES", container:"quart",      notes:""},
  "Mexican Slaw":             {unit:"qt",     opU:32, group:"VEGETABLES", container:"quart",      notes:"Cabb, Carrot, Cilantro"},
  "Cucumber Jicama Slaw":     {unit:"qt",     opU:32, group:"VEGETABLES", container:"quart",      notes:""},
  "Diced Poblano":            {unit:"pt",     opU:16, group:"VEGETABLES", container:"pint",       notes:""},
  "Pickled Onions":           {unit:"pt",     opU:16, group:"VEGETABLES", container:"pint",       notes:"Less liquid"},
  "Pickled Jalapeno":         {unit:"pt",     opU:16, group:"VEGETABLES", container:"pint",       notes:"Sliced"},
  "Roasted Garlic":           {unit:"pt",     opU:16, group:"VEGETABLES", container:"pint",       notes:""},
  "Limes":                    {unit:"ea",     opU:1,  group:"VEGETABLES", container:"produce bag",      notes:""},
  "Romaine Heads":            {unit:"ea",     opU:1,  group:"VEGETABLES", container:"produce bag",      notes:""},
  "Chopped Cilantro":         {unit:"ramekin",opU:1,  group:"VEGETABLES", container:"ramekin",          notes:""},
  "Potato Rajas":             {unit:"ea",     opU:1,  group:"VEGETABLES", container:"quart",         notes:""},
  "Crema":                    {unit:"pt",     opU:16, group:"DAIRY",      container:"quart",      notes:""},
  "Cheese Mix":               {unit:"lbs",    opU:16, group:"DAIRY",      container:"produce bag",      notes:""},
  "Cotija Cheese":            {unit:"lbs",    opU:16, group:"DAIRY",      container:"pint",       notes:""},
  "Oaxacan Cheese":           {unit:"qt",     opU:32, group:"DAIRY",      container:"quart",      notes:""},
  "Whipped Cream":            {unit:"pt",     opU:16, group:"DAIRY",      container:"pint",       notes:""},
  "Clarified Butter":         {unit:"pt",     opU:16, group:"DAIRY",      container:"pint",       notes:""},
  "Red Rice":                 {unit:"qt",     opU:32, group:"GRAINS",     container:"quart",      notes:""},
  "Pinto Beans":              {unit:"qt",     opU:32, group:"GRAINS",     container:"quart",      notes:""},
  "Black Beans":              {unit:"qt",     opU:32, group:"GRAINS",     container:"quart",      notes:""},
  "Whole Black Beans":        {unit:"qt",     opU:32, group:"GRAINS",     container:"quart",      notes:""},
  "Baja Ceviche":             {unit:"qt",     opU:32, group:"SPECIALTY",  container:"quart",      notes:""},
  "Green Corn Tamal Masa":    {unit:"qt",     opU:32, group:"SPECIALTY",  container:"quart",      notes:""},
  "Churro Batter":            {unit:"qt",     opU:32, group:"SPECIALTY",  container:"pastry bag",       notes:""},
  "Cinnamon Sugar":           {unit:"pt",     opU:16, group:"SPECIALTY",  container:"pint",       notes:""},
  "French Fries":             {unit:"lbs",    opU:16, group:"SPECIALTY",  container:"bag",              notes:""},
  "Fried Chips":              {unit:"lbs",    opU:16, group:"SPECIALTY",  container:"brown bag",        notes:""},
  "Guava Empanadas":          {unit:"ea",     opU:1,  group:"SPECIALTY",  container:"foil",             notes:"Large, baked off"},
  "Quinoa Fritters":          {unit:"ea",     opU:1,  group:"SPECIALTY",  container:"foil",             notes:""},
  "Tequila Blanco":           {unit:"bottle", opU:1,  group:"LIQ",        container:"",                 notes:""},
  "Tequila Reposado":         {unit:"bottle", opU:1,  group:"LIQ",        container:"",                 notes:""},
  "Mezcal":                   {unit:"bottle", opU:1,  group:"LIQ",        container:"",                 notes:""},
  "Margarita Mix":            {unit:"qt",     opU:32, group:"LIQ",        container:"quart",      notes:""},
  "Simple Syrup":             {unit:"pt",     opU:16, group:"LIQ",        container:"pint",       notes:""},
  "Lime Juice":               {unit:"pt",     opU:16, group:"LIQ",        container:"pint",       notes:""},
  "Modelo Especial":          {unit:"case",   opU:1,  group:"BEER",       container:"",                 notes:""},
  "Corona":                   {unit:"case",   opU:1,  group:"BEER",       container:"",                 notes:""},
  "Pacifico":                 {unit:"case",   opU:1,  group:"BEER",       container:"",                 notes:""},
  "White Wine":               {unit:"bottle", opU:1,  group:"WINE",       container:"",                 notes:""},
  "Red Wine":                 {unit:"bottle", opU:1,  group:"WINE",       container:"",                 notes:""},
  "Rosé":                     {unit:"bottle", opU:1,  group:"WINE",       container:"",                 notes:""},
  "Still Water":              {unit:"case",   opU:1,  group:"BEV",        container:"",                 notes:""},
  "Orange Juice":             {unit:"qt",     opU:32, group:"BEV",        container:"quart",      notes:""},
  "Horchata":                 {unit:"qt",     opU:32, group:"BEV",        container:"quart",      notes:""},
  "Jamaica Agua Fresca":      {unit:"qt",     opU:32, group:"BEV",        container:"quart",      notes:""},
};

// ─── BASE RECIPES ───
const BASE_RECIPES = {
  "Skirt Steak Taco":       {label:"Skirt Steak Taco",       servingWord:"taco",       cat:"TACOS",       ingredients:[{name:"Corn Tortillas",ea:1},{name:"Skirt Steak",oz:1.5},{name:"Guacamole",oz:1},{name:"Salsa Quemada",oz:1},{name:"Salsa Fresca",oz:1}]},
  "Citrus Chicken Taco":    {label:"Citrus Chicken Taco",    servingWord:"taco",       cat:"TACOS",       ingredients:[{name:"Corn Tortillas",ea:1},{name:"Citrus Chicken",oz:1.5},{name:"Tomatillo Salsa",oz:0.2},{name:"Salsa Fresca",oz:0.75},{name:"Crema",oz:0.5}]},
  "Carnitas Taco":          {label:"Carnitas Taco",          servingWord:"taco",       cat:"TACOS",       ingredients:[{name:"Corn Tortillas",ea:1},{name:"Carnitas",oz:2},{name:"Cotija Cheese",oz:0.1},{name:"Shaved Cabbage",oz:1.5},{name:"Serrano Salsa",oz:0.25},{name:"Pickled Onions",oz:0.1}]},
  "Fish Taco":              {label:"Fish Taco",              servingWord:"taco",       cat:"TACOS",       ingredients:[{name:"Corn Tortillas",ea:1},{name:"Fish (Salmon)",ea:1},{name:"Beer Batter",oz:1},{name:"Aji Amarillo Aioli",oz:0.2},{name:"Shaved Cabbage",oz:1.5},{name:"Salsa Fresca",oz:0.75}]},
  "Shrimp Taco":            {label:"Shrimp Taco",            servingWord:"taco",       cat:"TACOS",       ingredients:[{name:"Corn Tortillas",ea:1},{name:"Shrimp",oz:2},{name:"Mexican Slaw",oz:1.5},{name:"Aji Amarillo Aioli",oz:1}]},
  "Yucatan Pork Taco":      {label:"Yucatan Pork Taco",      servingWord:"taco",       cat:"TACOS",       ingredients:[{name:"Corn Tortillas",ea:1},{name:"Yucatan Pork",oz:1.5},{name:"Pickled Onions",oz:0.1},{name:"Cucumber Jicama Slaw",oz:1.5}]},
  "Beef Short Rib Taco":    {label:"Beef Short Rib Taco",    servingWord:"taco",       cat:"TACOS",       ingredients:[{name:"Corn Tortillas",ea:1},{name:"Beef Short Rib",oz:1.5},{name:"Tomatillo Salsa",oz:1.5}]},
  "Chicken Tinga Taco":     {label:"Chicken Tinga Taco",     servingWord:"taco",       cat:"TACOS",       ingredients:[{name:"Corn Tortillas",ea:1},{name:"Chicken Tinga",oz:1.5},{name:"Pickled Jalapeno",oz:0.5},{name:"Pickled Onions",oz:0.1}]},
  "Prime Rib Taco":         {label:"Prime Rib Taco",         servingWord:"taco",       cat:"TACOS",       ingredients:[{name:"Corn Tortillas",ea:1},{name:"Prime Rib",oz:2},{name:"Corn Relish",oz:0.5},{name:"Chipotle Salsa",oz:0.5}]},
  "Chicken Quesadilla":     {label:"Chicken Quesadilla",     servingWord:"quesadilla", cat:"QUESADILLAS", ingredients:[{name:"Large Flour Tortillas",ea:1},{name:"Citrus Chicken",oz:4},{name:"Cheese Mix",oz:3},{name:"Tomatillo Salsa",oz:0.3}]},
  "Carnitas Quesadilla":    {label:"Carnitas Quesadilla",    servingWord:"quesadilla", cat:"QUESADILLAS", ingredients:[{name:"Large Flour Tortillas",ea:1},{name:"Carnitas",oz:3},{name:"Cheese Mix",oz:3},{name:"Salsa Fresca",oz:1}]},
  "Skirt Steak Quesadilla": {label:"Skirt Steak Quesadilla", servingWord:"quesadilla", cat:"QUESADILLAS", ingredients:[{name:"Large Flour Tortillas",ea:1},{name:"Skirt Steak",oz:2.5},{name:"Cheese Mix",oz:3},{name:"Chipotle Salsa",oz:0.5}]},
  "Poblano Quesadilla":     {label:"Poblano Quesadilla",     servingWord:"quesadilla", cat:"QUESADILLAS", ingredients:[{name:"Large Flour Tortillas",ea:1},{name:"Diced Poblano",oz:2},{name:"Cheese Mix",oz:3},{name:"Chipotle Salsa",oz:0.5}]},
  "Skirt Steak Burrito":    {label:"Skirt Steak Burrito",    servingWord:"burrito",    cat:"BURRITOS",    ingredients:[{name:"Large Flour Tortillas",ea:1},{name:"Skirt Steak",oz:3},{name:"Red Rice",oz:2},{name:"Black Beans",oz:2},{name:"Salsa Fresca",oz:2},{name:"Corn Relish",oz:2},{name:"Cheese Mix",oz:0.25},{name:"Shaved Cabbage",oz:2}]},
  "Chicken Burrito":        {label:"Chicken Burrito",        servingWord:"burrito",    cat:"BURRITOS",    ingredients:[{name:"Large Flour Tortillas",ea:1},{name:"Citrus Chicken",oz:3},{name:"Red Rice",oz:2},{name:"Black Beans",oz:2},{name:"Salsa Fresca",oz:2},{name:"Corn Relish",oz:2},{name:"Cheese Mix",oz:0.25},{name:"Shaved Cabbage",oz:2}]},
  "Carnitas Burrito":       {label:"Carnitas Burrito",       servingWord:"burrito",    cat:"BURRITOS",    ingredients:[{name:"Large Flour Tortillas",ea:1},{name:"Carnitas",oz:3},{name:"Red Rice",oz:3},{name:"Black Beans",oz:2},{name:"Salsa Fresca",oz:2},{name:"Shaved Cabbage",oz:2}]},
  "Skirt Steak Bowl":       {label:"Skirt Steak Bowl",       servingWord:"bowl",       cat:"BOWLS",       ingredients:[{name:"Skirt Steak",oz:3},{name:"Red Rice",oz:4},{name:"Pinto Beans",oz:4},{name:"Guacamole",oz:1},{name:"Salsa Fresca",oz:1},{name:"Crema",oz:0.5}]},
  "Chicken Bowl":           {label:"Chicken Bowl",           servingWord:"bowl",       cat:"BOWLS",       ingredients:[{name:"Citrus Chicken",oz:3},{name:"Red Rice",oz:4},{name:"Pinto Beans",oz:4},{name:"Guacamole",oz:1},{name:"Salsa Fresca",oz:1},{name:"Crema",oz:0.5}]},
  "Carnitas Bowl":          {label:"Carnitas Bowl",          servingWord:"bowl",       cat:"BOWLS",       ingredients:[{name:"Carnitas",oz:3},{name:"Red Rice",oz:4},{name:"Pinto Beans",oz:4},{name:"Guacamole",oz:1},{name:"Salsa Fresca",oz:1},{name:"Crema",oz:0.5}]},
  "Seared Skirt Steak":     {label:"Seared Skirt Steak",     servingWord:"plate",      cat:"ENTREES",     ingredients:[{name:"Skirt Steak",oz:6},{name:"Red Rice",oz:4},{name:"Black Beans",oz:3},{name:"Chipotle Salsa",oz:1},{name:"Corn Relish",oz:1.5},{name:"Clarified Butter",oz:0.5}]},
  "Grilled Citrus Chicken": {label:"Grilled Citrus Chicken", servingWord:"plate",      cat:"ENTREES",     ingredients:[{name:"Citrus Chicken",oz:6},{name:"Red Rice",oz:4},{name:"Pinto Beans",oz:3},{name:"Tomatillo Salsa",oz:1},{name:"Corn Relish",oz:1.5}]},
  "Prime Rib Platter":      {label:"Prime Rib Platter",      servingWord:"plate",      cat:"ENTREES",     ingredients:[{name:"Prime Rib",oz:6},{name:"Red Rice",oz:4},{name:"Pinto Beans",oz:3},{name:"Chipotle Salsa",oz:1},{name:"Corn Relish",oz:1.5},{name:"Clarified Butter",oz:0.5}]},
  "Grilled Salmon":         {label:"Grilled Salmon",         servingWord:"plate",      cat:"ENTREES",     ingredients:[{name:"Fish (Salmon)",ea:2},{name:"Red Rice",oz:4},{name:"Cucumber Jicama Slaw",oz:2},{name:"Aji Amarillo Aioli",oz:1},{name:"Corn Relish",oz:1.5}]},
  "Grilled Shrimp Platter": {label:"Grilled Shrimp Platter", servingWord:"plate",      cat:"ENTREES",     ingredients:[{name:"Shrimp",oz:5},{name:"Red Rice",oz:4},{name:"Black Beans",oz:3},{name:"Chipotle Crema",oz:1},{name:"Corn Relish",oz:1.5},{name:"Clarified Butter",oz:0.5}]},
  "Beef Short Rib Platter":  {label:"Beef Short Rib Platter", servingWord:"plate",     cat:"ENTREES",     ingredients:[{name:"Beef Short Rib",oz:6},{name:"Red Rice",oz:4},{name:"Black Beans",oz:3},{name:"Tomatillo Salsa",oz:1.5},{name:"Corn Relish",oz:1.5}]},
  "Yucatan Pork Platter":   {label:"Yucatan Pork Platter",   servingWord:"plate",      cat:"ENTREES",     ingredients:[{name:"Yucatan Pork",oz:6},{name:"Red Rice",oz:4},{name:"Whole Black Beans",oz:3},{name:"Pickled Onions",oz:0.5},{name:"Cucumber Jicama Slaw",oz:2}]},
  "Carnitas Platter":       {label:"Carnitas Platter",       servingWord:"plate",      cat:"ENTREES",     ingredients:[{name:"Carnitas",oz:6},{name:"Red Rice",oz:4},{name:"Pinto Beans",oz:3},{name:"Salsa Fresca",oz:1},{name:"Pickled Onions",oz:0.5},{name:"Cotija Cheese",oz:0.25}]},
  "Red Rice":               {label:"Red Rice",               servingWord:"serving",    cat:"SIDES",       ingredients:[{name:"Red Rice",oz:4}]},
  "Pinto Beans":            {label:"Pinto Beans",            servingWord:"serving",    cat:"SIDES",       ingredients:[{name:"Pinto Beans",oz:4}]},
  "Black Beans":            {label:"Black Beans",            servingWord:"serving",    cat:"SIDES",       ingredients:[{name:"Black Beans",oz:4}]},
  "French Fries":           {label:"French Fries",           servingWord:"serving",    cat:"SIDES",       ingredients:[{name:"French Fries",oz:6},{name:"Chipotle Ketchup",oz:1},{name:"Chopped Cilantro",ea:1}]},
  "Chips & Guacamole":      {label:"Chips & Guacamole",      servingWord:"serving",    cat:"APPETIZERS",  ingredients:[{name:"Fried Chips",oz:6},{name:"Guacamole",oz:2}]},
  "Chips & Salsa":          {label:"Chips & Salsa",          servingWord:"serving",    cat:"APPETIZERS",  ingredients:[{name:"Fried Chips",oz:6},{name:"Chipotle Salsa",oz:2},{name:"Tomatillo Salsa",oz:2}]},
  "Baja Ceviche Cone":      {label:"Baja Ceviche Cone",      servingWord:"cone",       cat:"APPETIZERS",  ingredients:[{name:"Baja Ceviche",oz:4},{name:"Jalapeno Aioli",oz:0.1}]},
  "Quinoa Fritters":        {label:"Quinoa Fritters",        servingWord:"serving",    cat:"APPETIZERS",  ingredients:[{name:"Quinoa Fritters",ea:1.5},{name:"Aji Amarillo Aioli",oz:1}]},
  "Green Corn Tamal (2oz)": {label:"Green Corn Tamal (2oz)", servingWord:"piece",      cat:"APPETIZERS",  ingredients:[{name:"Green Corn Tamal Masa",oz:2}]},
  "Churro Bites":           {label:"Churro Bites",           servingWord:"serving",    cat:"SWEETS",      ingredients:[{name:"Churro Batter",oz:0.8},{name:"Whipped Cream",oz:1.5},{name:"Cinnamon Sugar",oz:0.5}]},
  "Guava Empanada":         {label:"Guava Empanada",         servingWord:"piece",      cat:"SWEETS",      ingredients:[{name:"Guava Empanadas",ea:1}]},
};

const RECIPE_CATS = ["TACOS","QUESADILLAS","BURRITOS","BOWLS","ENTREES","SIDES","APPETIZERS","SWEETS"];
const RCAT_COLORS = {TACOS:"#C9541E",QUESADILLAS:"#6D4FA3",BURRITOS:"#B38B18",BOWLS:"#1F7A6E",ENTREES:"#374151",SIDES:"#2563EB",APPETIZERS:"#0F766E",SWEETS:"#BE185D"};

function calcPrepList(selections, ING, ALLRECIPES) {
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

const EVENT_COLORS=[
  {name:"Orange",hex:"#E8621A"},{name:"Red",hex:"#E02020"},{name:"Blue",hex:"#2E7BD6"},
  {name:"Green",hex:"#1E9B4B"},{name:"Pink",hex:"#E8189A"},{name:"Yellow",hex:"#E8C110"},
  {name:"Purple",hex:"#7B30C8"},{name:"Navy",hex:"#1E3A8A"},
];
function uid() { return Math.random().toString(36).slice(2,10); }

// ─── STYLES ───
const CSS = `

*{box-sizing:border-box;margin:0;padding:0;}
:root{--bg:#F2F0EB;--card:#FFF;--nav:#151210;--accent:#C9541E;--accent-lt:#FAEAE2;--text:#1A1714;--muted:#7A736C;--border:#E4DED8;--green:#15803D;--red:#DC2626;--mgr:#1E293B;--mgr-accent:#38BDF8;}
body{font-family:'Aptos Display','Aptos','Segoe UI',system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;}
h1,h2,h3,h4{font-family:'Aptos Display','Aptos','Segoe UI',system-ui,-apple-system,sans-serif;font-weight:800;}
input,select,button,textarea{font-family:inherit;}

/* LOGO */
.bg-logo{display:flex;flex-direction:column;align-items:flex-start;line-height:1;cursor:pointer;}
.bg-logo-text{font-family:'Aptos Display','Aptos','Segoe UI',system-ui,sans-serif;font-weight:800;font-size:16px;color:#fff;letter-spacing:.18em;text-transform:uppercase;}
.bg-logo-text::after{display:none;}
.bg-logo-sub{font-size:8px;color:rgba(255,255,255,.35);letter-spacing:.12em;text-transform:uppercase;margin-top:2px;}
.bg-logo-dev .bg-logo-text{color:var(--mgr-accent);}
.bg-logo-dev .bg-logo-text::after{background:rgba(56,189,248,.2);}
.bg-logo-dev .bg-logo-sub{color:rgba(56,189,248,.4);}

/* NAV */
.nav{height:54px;padding:0 20px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:90;}
.nav-staff{background:var(--nav);}
.nav-mgr{background:#F8F7F5;border-bottom:2px solid var(--accent);}
.nav-mgr .nbtn-ghost{background:rgba(0,0,0,.05);color:var(--text2);border:1px solid var(--border);}
.nav-mgr .nbtn-ghost:hover{background:rgba(0,0,0,.09);color:var(--text);}
.nav-mgr .nbtn-accent{background:var(--accent);color:#fff;}
.nav-mgr .gear-btn{background:rgba(0,0,0,.05);border:1px solid var(--border);color:var(--muted);}
.nav-mgr .gear-btn:hover{background:rgba(0,0,0,.09);color:var(--text);}
.nav-mgr .bg-name{color:var(--text) !important;}
.nav-mgr .bg-sub{color:var(--muted) !important;}
.nav-right{display:flex;gap:8px;align-items:center;}
.nbtn{font-size:12px;font-weight:600;padding:6px 13px;border-radius:7px;border:none;cursor:pointer;transition:all .15s;}
.nbtn-ghost{background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.15);}
.nbtn-ghost:hover{background:rgba(255,255,255,.18);}
.nbtn-accent{background:var(--accent);color:#fff;}
.nbtn-accent:hover{background:#b34817;}
.nbtn-mgr{background:var(--accent);color:#fff;font-weight:700;}
.nbtn-dev:hover{background:#7DD3FC;}
.nbtn-mgrgh{background:rgba(196,80,42,.1);color:var(--accent);border:1px solid rgba(196,80,42,.25);}
.nbtn-devghost:hover{background:rgba(56,189,248,.22);}
.mgr-badge{background:var(--accent);color:#fff;font-size:9px;font-weight:800;padding:2px 7px;border-radius:20px;letter-spacing:.08em;text-transform:uppercase;}
.gear-btn{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.5);width:30px;height:30px;border-radius:7px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all .15s;}
.gear-btn:hover{background:rgba(255,255,255,.15);color:#fff;}

.wrap{max-width:1200px;margin:0 auto;padding:24px 20px;}

/* MODAL */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:300;display:flex;align-items:center;justify-content:center;}
.modal{background:var(--card);border-radius:14px;padding:28px;width:340px;box-shadow:0 20px 60px rgba(0,0,0,.25);}
.modal-title{font-size:18px;font-weight:700;margin-bottom:6px;}
.modal-sub{font-size:12px;color:var(--muted);margin-bottom:20px;}
.modal-actions{display:flex;gap:8px;margin-top:16px;justify-content:flex-end;}
.pin-input{width:100%;border:2px solid var(--border);border-radius:8px;padding:10px 14px;font-size:18px;text-align:center;letter-spacing:.3em;outline:none;font-family:'Aptos Display','Aptos','Segoe UI',system-ui,sans-serif;transition:border-color .15s;}
.pin-input:focus{border-color:var(--accent);}
.pin-error{font-size:12px;color:var(--red);margin-top:6px;text-align:center;}

/* BUTTONS */
.btn{font-size:13px;font-weight:600;padding:8px 16px;border-radius:8px;border:none;cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;gap:6px;}
.btn-primary{background:var(--accent);color:#fff;}
.btn-primary:hover{background:#b34817;}
.btn-primary:disabled{opacity:.4;cursor:default;}
.btn-secondary{background:var(--bg);color:var(--text);border:1px solid var(--border);}
.btn-secondary:hover{background:var(--border);}
.btn-danger{background:#FEE2E2;color:var(--red);border:1px solid #FECACA;}
.btn-danger:hover{background:#FECACA;}
.btn-mgr{background:var(--accent);color:#fff;font-weight:700;}
.btn-dev:hover{background:#7DD3FC;}
.btn-mgrgh{background:transparent;color:var(--accent);border:1px solid rgba(196,80,42,.3);}
.btn-devghost:hover{background:rgba(56,189,248,.1);}
.btn-sm{padding:5px 11px;font-size:12px;}

/* FORM */
.fcard{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:22px;}
.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.fg{display:flex;flex-direction:column;gap:4px;}
.fg.full{grid-column:1/-1;}
.flabel{font-size:10px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.09em;}
.finput{border:1px solid var(--border);border-radius:8px;padding:8px 11px;font-size:13px;color:var(--text);background:#fff;outline:none;width:100%;transition:border-color .15s;}
.finput[type=time]::-webkit-calendar-picker-indicator{opacity:.4;cursor:pointer;}
.meta-inp[type=time]::-webkit-calendar-picker-indicator{opacity:.35;cursor:pointer;width:12px;}
.finput:focus{border-color:var(--accent);}
.faction{display:flex;gap:8px;margin-top:18px;justify-content:flex-end;}

/* DASHBOARD */
.page-title{font-size:24px;font-weight:800;letter-spacing:-.02em;margin-bottom:3px;}
.page-sub{font-size:13px;color:var(--muted);margin-bottom:20px;}
.events-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:12px;}
.ecard{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px;cursor:pointer;position:relative;transition:box-shadow .15s,transform .15s;}
.ecard-color-indicator{position:absolute;top:0;left:0;right:0;height:4px;border-radius:12px 12px 0 0;}
.ecard:hover{box-shadow:0 6px 20px rgba(0,0,0,.09);transform:translateY(-2px);}
.ecard-name{font-family:'Aptos Display','Aptos','Segoe UI',system-ui,sans-serif;font-weight:700;font-size:14px;margin-bottom:4px;}
.ecard-meta{font-size:12px;color:var(--muted);margin-bottom:12px;}
.ecard-stats{display:flex;gap:8px;flex-wrap:wrap;}
.estat{background:var(--bg);border-radius:6px;padding:4px 9px;font-size:11px;color:var(--muted);}
.estat span{font-family:'Aptos Display','Aptos','Segoe UI',system-ui,sans-serif;font-weight:700;font-size:13px;color:var(--text);display:block;line-height:1.2;}
.prog-ring{display:flex;align-items:center;gap:6px;margin-top:10px;}
.prog-track{flex:1;height:4px;background:#E4DED8;border-radius:99px;overflow:hidden;}
.prog-fill{height:100%;background:var(--green);border-radius:99px;transition:width .4s;}
.prog-pct{font-size:11px;color:var(--muted);min-width:28px;text-align:right;}
.new-ecard{background:transparent;border:2px dashed var(--border);border-radius:12px;padding:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;color:var(--muted);font-size:13px;font-weight:500;min-height:120px;transition:border-color .15s,color .15s;}
.new-ecard:hover{border-color:var(--accent);color:var(--accent);}

/* MENU BUILDER */
.mb-layout{display:grid;grid-template-columns:1fr 310px;gap:16px;align-items:start;}
.rcat-section{margin-bottom:10px;}
.rcat-hdr{display:flex;align-items:center;padding:8px 14px;cursor:pointer;user-select:none;border-radius:8px 8px 0 0;gap:8px;}
.rcat-name{font-family:'Aptos Display','Aptos','Segoe UI',system-ui,sans-serif;font-weight:700;font-size:11px;letter-spacing:.1em;color:#fff;text-transform:uppercase;}
.rcat-count{font-size:11px;color:rgba(255,255,255,.55);margin-left:auto;}
.rcat-arr{font-size:9px;color:rgba(255,255,255,.5);margin-left:4px;transition:transform .2s;}
.rcat-arr.open{transform:rotate(180deg);}
.rcat-items{background:var(--card);border:1px solid var(--border);border-top:none;border-radius:0 0 8px 8px;}
.rdish{display:flex;align-items:center;justify-content:space-between;padding:9px 14px;border-bottom:1px solid #EDE9E4;gap:12px;}
.rdish:last-child{border-bottom:none;}
.rdish-name{font-size:13px;font-weight:500;flex:1;}
.rdish-ctrl{display:flex;align-items:center;gap:5px;}
.qty-btn{width:24px;height:24px;border-radius:5px;border:1px solid var(--border);background:#fff;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--muted);font-weight:700;transition:all .12s;line-height:1;}
.qty-btn:hover{border-color:var(--accent);color:var(--accent);}
.qty-inp{width:50px;text-align:center;border:1px solid var(--border);border-radius:5px;padding:3px 4px;font-size:13px;font-weight:600;color:var(--text);outline:none;}
.qty-inp:focus{border-color:var(--accent);}
.qty-inp.has-val{background:var(--accent-lt);border-color:var(--accent);color:var(--accent);}
.qty-lbl{font-size:10px;color:var(--muted);min-width:38px;}

/* SUMMARY SIDEBAR */
.sum-panel{background:var(--card);border:1px solid var(--border);border-radius:12px;overflow:hidden;position:sticky;top:70px;}
.sum-hdr{background:var(--nav);padding:11px 14px;display:flex;align-items:center;justify-content:space-between;}
.sum-title{font-family:'Aptos Display','Aptos','Segoe UI',system-ui,sans-serif;font-weight:700;font-size:12px;color:#fff;}
.sum-count{font-size:10px;color:rgba(255,255,255,.5);}
.sum-list{max-height:250px;overflow-y:auto;}
.sum-empty{padding:18px 14px;text-align:center;color:var(--muted);font-size:12px;}
.sum-item{display:flex;justify-content:space-between;padding:6px 14px;border-bottom:1px solid #EDE9E4;font-size:12px;}
.sum-item:last-child{border-bottom:none;}
.sum-preview{padding:10px 14px;background:#F9F9F7;border-top:1px solid var(--border);}
.sum-prev-lbl{font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;}
.sum-prev-row{display:flex;justify-content:space-between;font-size:11px;padding:2px 0;border-bottom:1px solid #EDE9E4;}
.sum-prev-more{font-size:11px;color:var(--muted);margin-top:5px;text-align:center;}
.sum-foot{padding:11px 14px;border-top:1px solid var(--border);}

/* PREP SHEET */
.sheet-hdr{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px 22px;margin-bottom:13px;}
.sheet-hdr-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:13px;}
.sheet-name{font-size:20px;font-weight:800;letter-spacing:-.02em;}
.sheet-desc{font-size:12px;color:var(--muted);margin-top:2px;}
.meta-row{display:grid;grid-template-columns:repeat(6,1fr);gap:9px;padding-top:11px;border-top:1px solid var(--border);}
.meta-lbl{font-size:9px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.09em;margin-bottom:2px;}
.meta-inp{border:none;border-bottom:1px solid var(--border);background:transparent;font-size:12px;font-weight:500;color:var(--text);width:100%;outline:none;padding:2px 0;}
.meta-inp:focus{border-color:var(--accent);}
.sbar{background:var(--nav);border-radius:10px;padding:10px 16px;display:flex;gap:16px;align-items:center;margin-bottom:13px;flex-wrap:wrap;}
.sbar-lbl{font-size:9px;color:rgba(255,255,255,.42);text-transform:uppercase;letter-spacing:.08em;}
.sbar-val{font-family:'Aptos Display','Aptos','Segoe UI',system-ui,sans-serif;font-size:17px;font-weight:800;color:#fff;}
.sbar-div{width:1px;background:rgba(255,255,255,.1);align-self:stretch;}
.sbar-spacer{flex:1;}
.menu-bar{background:#F0FDF4;border:1px solid #BBF7D0;border-radius:9px;padding:10px 15px;margin-bottom:13px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;}
.mdish-tag{background:#fff;border:1px solid #BBF7D0;border-radius:20px;padding:2px 9px;font-size:11px;font-weight:600;color:var(--green);}
.sheet-actions{display:flex;gap:9px;margin-bottom:13px;align-items:center;}
.auto-badge{background:var(--accent-lt);color:var(--accent);font-size:11px;font-weight:600;padding:3px 9px;border-radius:20px;border:1px solid #F5C8B0;}
.cat-section{margin-bottom:11px;}
.cat-hdr{display:flex;align-items:center;gap:8px;padding:8px 14px;cursor:pointer;user-select:none;border-radius:8px 8px 0 0;}
.cat-hdr-name{font-family:'Aptos Display','Aptos','Segoe UI',system-ui,sans-serif;font-weight:800;font-size:12px;letter-spacing:.1em;color:#fff !important;text-transform:uppercase;}
.cat-hdr-count{font-size:11px;color:rgba(255,255,255,.55);margin-left:auto;}
.cat-hdr-arrow{font-size:9px;color:rgba(255,255,255,.55);margin-left:5px;transition:transform .2s;}
.cat-hdr-arrow.open{transform:rotate(180deg);}
.items-wrap{background:var(--card);border:1px solid var(--border);border-top:none;border-radius:0 0 8px 8px;overflow:hidden;}
.items-tbl{width:100%;border-collapse:collapse;}
.items-tbl th{background:#F7F5F2;padding:5px 9px;text-align:left;font-size:9px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid var(--border);white-space:nowrap;}
.items-tbl td{padding:7px 9px;border-bottom:1px solid #EDE9E4;font-size:12px;vertical-align:middle;}
.items-tbl tr:last-child td{border-bottom:none;}
.items-tbl tr:hover td{background:#FAFAF8;}
.iname{font-weight:500;}
.icalc{font-size:10px;color:#9CA3AF;font-style:italic;margin-top:1px;}
.ivar{font-size:10px;color:var(--accent);background:var(--accent-lt);display:inline-block;padding:1px 6px;border-radius:4px;margin-top:2px;}
.ci{border:1px solid transparent;border-radius:5px;padding:3px 6px;font-size:12px;background:transparent;outline:none;color:var(--text);transition:border-color .15s,background .15s;width:100%;}
.ci:focus{border-color:var(--accent);background:#fff;}
.ci-qty{width:68px;text-align:center;font-weight:600;}
.ci-qty.auto{background:#F0FDF4;border-color:#86EFAC;color:#166534;}
.ci-qty.auto:focus{background:#fff;border-color:var(--accent);color:var(--text);}
.ci-sm{width:62px;}
.ci-init{width:62px;text-align:center;}
.ci-prepped{background:#DCFCE7 !important;border-color:#16A34A !important;color:#166534 !important;font-weight:600;}
.rmv{background:none;border:none;color:#D1CBC4;cursor:pointer;font-size:14px;padding:2px 5px;border-radius:4px;transition:all .12s;line-height:1;}
.rmv:hover{color:var(--red);background:#FEE2E2;}
.empty-cat{padding:12px 14px;color:var(--muted);font-size:12px;}
.empty-state{text-align:center;padding:28px;color:var(--muted);}
.empty-state h3{font-size:14px;color:var(--text);margin-bottom:4px;}

/* EVENT COLOR PICKER */
.color-picker-wrap{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
.color-dot-btn{width:30px;height:30px;border-radius:50%;border:3px solid transparent;cursor:pointer;transition:all .15s;position:relative;flex-shrink:0;}
.color-dot-btn:hover{transform:scale(1.15);}
.color-dot-btn.selected{border-color:var(--text);transform:scale(1.15);}
.color-dot-btn.selected::after{content:"✔";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:800;}
.event-color-dot{width:12px;height:12px;border-radius:50%;display:inline-block;flex-shrink:0;border:2px solid rgba(255,255,255,.3);}
.ecard-color-bar{position:absolute;top:0;left:0;right:0;height:3px;border-radius:12px 12px 0 0;}

/* ALERT BANNER */
.alert-banner{background:#FFFBEB;border:2px solid #F59E0B;border-radius:10px;padding:12px 18px;margin-bottom:16px;display:flex;align-items:flex-start;gap:12px;}
.alert-banner-icon{font-size:18px;flex-shrink:0;margin-top:1px;}
.alert-banner-content{flex:1;}
.alert-banner-title{font-size:12px;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;}
.alert-banner-events{display:flex;flex-direction:column;gap:4px;}
.alert-banner-ev{display:flex;align-items:center;justify-content:space-between;gap:12px;}
.alert-banner-ev-name{font-size:13px;font-weight:600;color:#1C1208;}
.alert-banner-ev-meta{font-size:11px;color:#92400E;}
.alert-banner-btn{font-size:11px;font-weight:600;padding:3px 10px;border-radius:5px;border:1px solid #F59E0B;background:transparent;color:#92400E;cursor:pointer;white-space:nowrap;}
.alert-banner-btn:hover{background:#F59E0B;color:#fff;}

/* POST EVENT NOTES */
.post-notes-section{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:16px 18px;margin-top:16px;}
.post-notes-title{font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.09em;margin-bottom:8px;}
.post-notes-ta{width:100%;border:1px solid var(--border);border-radius:7px;padding:9px 12px;font-size:13px;color:var(--text);background:var(--card);outline:none;resize:vertical;line-height:1.5;transition:border-color .15s;}
.post-notes-ta:focus{border-color:var(--accent);}
.post-notes-ta::placeholder{color:var(--muted);}

/* TEMPLATE BADGE */
.template-section{margin-top:20px;}
.template-section-title{font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px;}
.template-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;}
.template-card{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:14px;cursor:pointer;transition:box-shadow .13s,border-color .13s;display:flex;align-items:center;gap:12px;}
.template-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.08);border-color:var(--accent);}
.template-icon{width:36px;height:36px;border-radius:8px;background:var(--accent-lt);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
.template-name{font-size:13px;font-weight:600;color:var(--text);margin-bottom:2px;}
.template-meta{font-size:11px;color:var(--muted);}

/* MOBILE */
@media (max-width:768px){
  .wrap{padding:14px;}
  .week-stats{grid-template-columns:1fr 1fr;}
  .events-grid{grid-template-columns:1fr;}
  .mb-layout{grid-template-columns:1fr;}
  .sum-panel{position:static;}
  .fgrid{grid-template-columns:1fr;}
  .meta-row{grid-template-columns:1fr 1fr 1fr;}
  .items-tbl th:nth-child(5),.items-tbl td:nth-child(5){display:none;}
  .items-tbl th:nth-child(7),.items-tbl td:nth-child(7){display:none;}
  .items-tbl th:nth-child(8),.items-tbl td:nth-child(8){display:none;}
  .nav{padding:0 12px;}
  .nbtn{padding:5px 10px;font-size:10px;}
}
@media (max-width:480px){
  .week-stats{grid-template-columns:1fr;}
  .meta-row{grid-template-columns:1fr 1fr;}
  .page-title{font-size:20px;}
}

/* THREE-DOT MENU */
.card-menu-wrap{position:absolute;top:10px;right:10px;z-index:10;}
.card-menu-btn{background:transparent;border:none;cursor:pointer;width:26px;height:26px;border-radius:5px;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:16px;transition:all .12s;line-height:1;}
.card-menu-btn:hover{background:var(--bg);color:var(--text);}
.card-menu-dropdown{position:absolute;right:0;top:30px;background:var(--card);border:1px solid var(--border);border-radius:9px;box-shadow:0 8px 24px rgba(0,0,0,.12);min-width:160px;overflow:hidden;z-index:20;}
.card-menu-item{display:flex;align-items:center;gap:8px;padding:9px 14px;font-size:13px;font-weight:500;cursor:pointer;transition:background .12s;color:var(--text);border:none;background:none;width:100%;text-align:left;}
.card-menu-item:hover{background:var(--bg);}
.card-menu-item.danger{color:var(--red,#DC2626);}
.card-menu-item.danger:hover{background:var(--red-bg,#FEECEC);}
.card-menu-divider{height:1px;background:var(--border);margin:3px 0;}

/* PAST EVENTS PAGE */
.past-events-tbl{width:100%;border-collapse:collapse;background:var(--card);border-radius:12px;overflow:hidden;border:1px solid var(--border);}
.past-events-tbl th{background:var(--bg);padding:8px 14px;text-align:left;font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid var(--border);}
.past-events-tbl td{padding:11px 14px;border-bottom:1px solid var(--border);font-size:13px;vertical-align:middle;}
.past-events-tbl tr:last-child td{border-bottom:none;}
.past-events-tbl tr:hover td{background:var(--bg);cursor:pointer;}
.past-ev-name{font-weight:600;margin-bottom:2px;}
.past-ev-meta{font-size:11px;color:var(--muted);}

/* SEARCH + FILTER BAR */
.dash-toolbar{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap;}
.dash-search{flex:1;min-width:200px;border:1px solid var(--border);border-radius:8px;padding:8px 12px;font-size:13px;background:var(--card);outline:none;color:var(--text);}
.dash-search:focus{border-color:var(--accent);}
.filter-tabs{display:flex;gap:4px;flex-wrap:wrap;}
.ftab{padding:5px 12px;border-radius:20px;border:none;cursor:pointer;font-size:11px;font-weight:600;transition:all .15s;background:var(--bg);color:var(--muted);border:1px solid var(--border);}
.ftab:hover{border-color:var(--accent);color:var(--accent);}
.ftab.active{background:var(--accent);color:#fff;border-color:var(--accent);}
.ftab-archived{background:transparent;color:var(--muted);}

/* ARCHIVE BADGE */
.archived-badge{background:#F3F4F6;color:#9CA3AF;font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px;border:1px solid #E5E7EB;}

/* ECARD ACTIONS */
.ecard-actions{display:flex;gap:5px;margin-top:10px;padding-top:10px;border-top:1px solid var(--border);}
.ecard-action-btn{flex:1;padding:5px 8px;border-radius:6px;border:1px solid var(--border);background:transparent;font-size:11px;font-weight:600;cursor:pointer;color:var(--muted);transition:all .13s;text-align:center;}
.ecard-action-btn:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-lt);}
.ecard-action-btn.danger:hover{border-color:var(--red,#DC2626);color:var(--red,#DC2626);background:#FEE2E2;}
.ecard-archived{opacity:.6;}
.ecard-archived::before{background:#9CA3AF !important;}

/* MULTIPLIER */
.mult-bar{display:flex;align-items:center;gap:10px;background:var(--accent-lt);border:1px solid #F5C8B0;border-radius:9px;padding:10px 14px;margin-bottom:14px;}
.mult-label{font-size:12px;font-weight:600;color:var(--accent);white-space:nowrap;}
.mult-btns{display:flex;gap:4px;}
.mult-btn{padding:4px 11px;border-radius:6px;border:1px solid rgba(201,84,30,.3);background:#fff;font-size:12px;font-weight:600;cursor:pointer;color:var(--muted);transition:all .13s;}
.mult-btn:hover{border-color:var(--accent);color:var(--accent);}
.mult-btn.active{background:var(--accent);border-color:var(--accent);color:#fff;}
.mult-custom{width:64px;border:1px solid rgba(201,84,30,.3);border-radius:6px;padding:4px 7px;font-size:12px;font-weight:600;text-align:center;outline:none;}
.mult-custom:focus{border-color:var(--accent);}

/* EDIT EVENT MODAL */
.edit-modal{background:var(--card);border-radius:14px;padding:28px;width:520px;box-shadow:0 20px 60px rgba(0,0,0,.25);border:1px solid var(--border);}

/* WEEKLY STATS BAR */
.week-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;}
.wstat{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:14px 16px;position:relative;overflow:hidden;}
.wstat::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;}
.wstat-events::before{background:var(--accent);}
.wstat-covers::before{background:#1F7A6E;}
.wstat-prepped::before{background:#15803D;}
.wstat-accuracy::before{background:#6D4FA3;}
.wstat-label{font-size:10px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.09em;margin-bottom:6px;}
.wstat-value{font-family:'Aptos Display','Aptos',system-ui,sans-serif;font-size:28px;font-weight:800;color:var(--text);line-height:1;margin-bottom:3px;}
.wstat-sub{font-size:11px;color:var(--muted);}
.wstat-bar{height:3px;background:var(--border);border-radius:99px;margin-top:10px;overflow:hidden;}
.wstat-bar-fill{height:100%;border-radius:99px;transition:width .4s;}

/* ACCURACY RING on event cards */
.ecard-accuracy{display:flex;align-items:center;gap:6px;margin-top:8px;padding-top:8px;border-top:1px solid var(--border);}
.accuracy-label{font-size:10px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.07em;}
.accuracy-value{font-size:12px;font-weight:700;margin-left:auto;}
.accuracy-bar{flex:1;height:4px;background:var(--border);border-radius:99px;overflow:hidden;max-width:80px;}
.accuracy-bar-fill{height:100%;border-radius:99px;}
.acc-green{color:#15803D;}
.acc-amber{color:#B45309;}
.acc-red{color:var(--red,#DC2626);}

/* EVENT NOTES */
.event-notes{background:#FFFBEB;border:2px solid #F59E0B;border-radius:10px;padding:14px 18px;margin-bottom:14px;}
.event-notes-label{font-size:10px;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:.1em;margin-bottom:7px;display:flex;align-items:center;gap:6px;}
.event-notes-ta{width:100%;border:none;background:transparent;font-size:13px;color:#1A1714;outline:none;resize:none;font-family:inherit;line-height:1.5;}
.event-notes-ta::placeholder{color:#D97706;opacity:.6;}
.event-notes-empty{font-size:12px;color:#D97706;font-style:italic;}

/* PRINT MODAL */
.print-modal-opt{display:flex;flex-direction:column;gap:10px;margin:4px 0 8px;}
.print-opt-btn{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border:2px solid var(--border);border-radius:10px;background:#fff;cursor:pointer;text-align:left;transition:all .15s;}
.print-opt-btn:hover{border-color:var(--accent);background:var(--accent-lt);}
.print-opt-title{font-size:13px;font-weight:700;color:var(--text);margin-bottom:2px;}
.print-opt-desc{font-size:11px;color:var(--muted);}

/* DRAWER */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.38);z-index:200;display:flex;justify-content:flex-end;}
.drawer{background:#fff;width:420px;height:100%;display:flex;flex-direction:column;box-shadow:-6px 0 24px rgba(0,0,0,.14);}
.drawer-hdr{padding:15px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.drawer-title{font-size:15px;font-weight:700;}
.drawer-x{background:var(--bg);border:none;width:27px;height:27px;border-radius:6px;cursor:pointer;font-size:14px;color:var(--muted);}
.drawer-body{flex:1;overflow-y:auto;padding:12px 18px;}
.drawer-foot{padding:11px 18px;border-top:1px solid var(--border);}
.dsearch{width:100%;border:1px solid var(--border);border-radius:8px;padding:8px 11px;font-size:13px;outline:none;margin-bottom:10px;}
.dsearch:focus{border-color:var(--accent);}
.cat-tabs{display:flex;gap:3px;flex-wrap:wrap;margin-bottom:9px;}
.ctab{padding:3px 9px;border-radius:20px;border:none;cursor:pointer;font-size:11px;font-weight:600;transition:all .15s;}
.ctab-active{color:#fff;}
.ctab-idle{background:#F0EDE8;color:var(--muted);}
.dlabel{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);padding:6px 0 3px;border-bottom:1px solid var(--border);margin-bottom:4px;margin-top:7px;}
.ditem{display:flex;align-items:center;gap:7px;padding:6px 0;cursor:pointer;border-bottom:1px solid #F5F3EF;}
.ditem-name{font-size:13px;font-weight:500;flex:1;}
.ditem-meta{font-size:11px;color:var(--muted);}
.ditem input[type=checkbox]{accent-color:var(--accent);width:13px;height:13px;cursor:pointer;}
.custom-box{background:var(--bg);border:1px solid var(--border);border-radius:9px;padding:12px;margin-bottom:10px;}
.cbx-title{font-size:13px;font-weight:600;margin-bottom:9px;}
.cgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.sel-info{font-size:12px;color:var(--muted);margin-bottom:7px;}
.dflex{display:flex;gap:7px;}

/* MGR LAYOUT */
.mgr-layout{display:grid;grid-template-columns:200px 1fr;gap:0;min-height:calc(100vh - 54px);}
.mgr-sidebar{background:#F8F7F5;padding:24px 0;border-right:1px solid #E0D8CE;}
.mgr-nav-item{display:flex;align-items:center;padding:11px 20px 11px 17px;cursor:pointer;font-size:14px;font-weight:500;color:#4B5563;transition:all .13s;border-left:3px solid transparent;letter-spacing:.01em;}
.mgr-nav-item:hover{background:#F0EDE8;color:#1C1208;}
.mgr-nav-item.active{background:#FBF0EC;color:var(--accent);border-left-color:var(--accent);font-weight:700;}
.mgr-nav-section{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:#9CA3AF;padding:16px 20px 8px 20px;}
.mgr-content{background:var(--bg);padding:28px;}
.mgr-page-title{font-size:24px;font-weight:800;color:var(--text);margin-bottom:3px;}
.mgr-page-sub{font-size:13px;color:var(--muted);margin-bottom:20px;opacity:1;}

/* RECIPE CARDS */
.recipe-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin-bottom:20px;}
.rcard{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:14px;cursor:pointer;transition:box-shadow .13s,transform .13s;position:relative;overflow:visible;}
.rcard:hover{box-shadow:0 4px 16px rgba(0,0,0,.08);transform:translateY(-1px);}
.rcard.custom{border-color:#93C5FD;background:#F0F9FF;}
.rcard-name{font-weight:700;font-size:13px;margin-bottom:3px;}
.rcard-cat{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;}
.rcard-ings{font-size:11px;color:var(--muted);line-height:1.5;}
.rcard-badge{position:absolute;top:10px;right:10px;background:#DBEAFE;color:#1D4ED8;font-size:9px;font-weight:700;padding:2px 7px;border-radius:20px;text-transform:uppercase;}

/* RECIPE EDITOR */
.recipe-editor{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:22px;}
.ing-row{display:grid;grid-template-columns:1fr 70px 90px 24px;gap:8px;align-items:center;margin-bottom:7px;}
.ing-row-hdr{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);display:grid;grid-template-columns:1fr 70px 90px 24px;gap:8px;margin-bottom:5px;}
.ing-del{background:none;border:none;cursor:pointer;color:#D1CBC4;font-size:14px;transition:color .12s;padding:0;line-height:1;}
.ing-del:hover{color:var(--red);}
.add-ing-btn{background:var(--bg);border:1px dashed var(--border);border-radius:7px;padding:6px;width:100%;cursor:pointer;font-size:12px;color:var(--muted);transition:all .13s;margin-top:5px;}
.add-ing-btn:hover{border-color:var(--accent);color:var(--accent);}
.ing-type-toggle{display:flex;gap:3px;}
.ing-type-btn{padding:3px 7px;border-radius:5px;border:1px solid var(--border);font-size:11px;font-weight:600;cursor:pointer;background:#fff;color:var(--muted);transition:all .12s;}
.ing-type-btn.active{background:var(--accent);border-color:var(--accent);color:#fff;}

/* INGREDIENT TABLE */
.ing-tbl{width:100%;border-collapse:collapse;}
.ing-tbl th{background:#F7F5F2;padding:6px 10px;text-align:left;font-size:9px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid var(--border);}
.ing-tbl td{padding:6px 10px;border-bottom:1px solid #EDE9E4;font-size:12px;vertical-align:middle;}
.ing-tbl tr:last-child td{border-bottom:none;}
.ing-tbl tr:hover td{background:#FAFAF8;}
.ing-edit-inp{border:1px solid transparent;background:transparent;font-size:12px;color:var(--text);outline:none;width:100%;padding:2px 5px;border-radius:4px;transition:all .12s;}
.ing-edit-inp:hover{background:#F5F3EF;}
.ing-edit-inp:focus{border-color:var(--accent);background:#fff;}
select.ing-edit-inp{cursor:pointer;}

/* SETTINGS */
.settings-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:22px;max-width:440px;}

/* ── PRINT STYLES ── */
@media print {
  @page{size:letter portrait;margin:0.4in 0.45in;}
  *{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;}

  /* ── HIDE UI ── */
  .nav,.sheet-actions,.sbar,.btn,.rmv,.menu-bar,.nbtn,.gear-btn,
  .sheet-hdr-top,.icalc,.auto-badge{display:none !important;}
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}
  .wrap{padding:0;max-width:100%;}
  body{background:#fff;}
  *{font-variant-ligatures:none !important;font-feature-settings:"liga" 0,"kern" 0 !important;}
  input[type=time]::-webkit-calendar-picker-indicator{display:none !important;}
  input[type=time]::-webkit-inner-spin-button{display:none !important;}

  /* ── PRINT HEADER ── */
  .print-header{display:flex !important;align-items:flex-start;justify-content:space-between;
    padding-bottom:6px;border-bottom:2px solid #1A1714;margin-bottom:7px;}
  .print-logo-text{font-family:'Aptos Display','Aptos','Segoe UI',system-ui,sans-serif;
    font-weight:800;font-size:20px;letter-spacing:.16em;color:#1A1714;text-transform:uppercase;}
  .print-logo-text::after{display:none;}
  .print-logo-sub{font-size:8px;letter-spacing:.1em;color:#7A736C;text-transform:uppercase;margin-top:2px;}
  .print-event-title{font-size:12px;font-weight:700;text-align:right;}
  .print-event-meta{font-size:9px;color:#7A736C;text-align:right;margin-top:2px;}

  /* ── SHEET HEADER (meta row only, name/desc hidden via sheet-hdr-top) ── */
  .sheet-hdr{padding:5px 12px;margin-bottom:6px;border:1px solid #E4DED8;border-radius:6px;}
  .meta-row{display:grid !important;grid-template-columns:repeat(6,1fr);gap:6px;padding:0;}
  .meta-lbl{font-size:8px;font-weight:600;color:#7A736C;text-transform:uppercase;letter-spacing:.07em;margin-bottom:1px;}
  .meta-inp{font-size:10px;border:none;border-bottom:1px solid #D1D5DB;background:transparent;padding:1px 0;width:100%;}

  /* ── NOTES BOX ── */
  .event-notes{background:#FFFBEB !important;border:2px solid #F59E0B !important;
    border-radius:5px;padding:5px 10px;margin-bottom:6px;}
  .event-notes-label{font-size:9px !important;font-weight:700;}
  .event-notes-ta{font-size:10px;min-height:auto !important;border:none !important;background:transparent !important;}

  /* ── PREP LIST TABLE ── */
  .cat-hdr{border-radius:3px 3px 0 0 !important;padding:3px 8px !important;
    -webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .cat-hdr-name{font-size:11px !important;font-weight:800 !important;color:#fff !important;letter-spacing:.1em;}
  .cat-hdr-count{font-size:10px !important;color:rgba(255,255,255,.7) !important;}
  .cat-hdr-arrow{display:none;}
  .cat-section{margin-bottom:5px;}
  .items-wrap{border-radius:0 0 3px 3px;overflow:hidden;}
  .items-tbl{table-layout:fixed !important;width:100% !important;border-collapse:collapse;}
  .items-tbl th{background:#F3F4F6 !important;font-size:9px;padding:2px 4px;white-space:nowrap;
    overflow:hidden;text-overflow:ellipsis;border-bottom:1px solid #D1D5DB;}
  .items-tbl td{font-size:10px;padding:2px 4px;line-height:1.3;overflow:hidden;
    text-overflow:ellipsis;white-space:nowrap;border-bottom:1px solid #EDE9E4;}
  /* Column widths — 8 visible cols (QTY USED removed) */
  .items-tbl th:nth-child(1),.items-tbl td:nth-child(1){width:22%;}
  .items-tbl th:nth-child(2),.items-tbl td:nth-child(2){width:6%;}
  .items-tbl th:nth-child(3),.items-tbl td:nth-child(3){width:5%;}
  .items-tbl th:nth-child(4),.items-tbl td:nth-child(4){width:8%;}
  .items-tbl th:nth-child(5),.items-tbl td:nth-child(5){width:27%;}
  .items-tbl th:nth-child(6),.items-tbl td:nth-child(6){width:11%;}
  .items-tbl th:nth-child(7),.items-tbl td:nth-child(7){width:9%;}
  .items-tbl th:nth-child(8),.items-tbl td:nth-child(8){width:9%;}
  .items-tbl th:nth-child(9),.items-tbl td:nth-child(9){display:none !important;}
  .ci{border:none !important;background:transparent !important;padding:0 !important;
    font-size:10px !important;width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .ci-prepped{color:#065F46 !important;font-weight:700 !important;}
  .iname{font-size:10px !important;font-weight:500;}

  /* ── TIMESTAMP ── */
  .print-timestamp{display:block !important;font-size:8px;color:#9CA3AF;text-align:right;margin-bottom:4px;}

  /* ── SIGNATURES ── */
  .print-sigs{display:flex !important;gap:20px;margin-top:12px;padding-top:8px;border-top:1px solid #D1D5DB;}
  .print-sig{flex:1;}
  .print-sig-line{border-bottom:1px solid #374151;margin-top:14px;}
  .print-sig-lbl{font-size:8px;color:#7A736C;text-transform:uppercase;letter-spacing:.07em;margin-top:3px;}

  /* ══ PRINT MODE: PREP ONLY ══ */
  [data-pmode="prep"] .perdish-print{display:none !important;}

  /* ══ PRINT MODE: PERDISH ONLY ══ */
  [data-pmode="perdish"] .sheet-hdr{display:none !important;}
  [data-pmode="perdish"] .cat-section{display:none !important;}
  [data-pmode="perdish"] .event-notes{display:none !important;}
  [data-pmode="perdish"] .print-sigs{display:none !important;}
  [data-pmode="perdish"] .perdish-print{display:block !important;}
  /* Hide the prep sheet main header in perdish-only — perdish has its own */
  [data-pmode="perdish"] .print-timestamp:not(.perdish-own-timestamp){display:none !important;}

  /* ══ PRINT MODE: BOTH ══ */
  [data-pmode="both"] .perdish-print{display:block !important;}
  [data-pmode="both"] .cat-section{display:block !important;}
  /* In "both" mode perdish already has context from prep header, hide its duplicate */
  [data-pmode="both"] .perdish-own-header{display:none !important;}
  [data-pmode="both"] .perdish-own-timestamp{display:none !important;}

  /* ── PER DISH SECTION ── */
  /* page break only when printing both */
  [data-pmode="both"] .perdish-print{page-break-before:always !important;}
  [data-pmode="perdish"] .perdish-print{page-break-before:auto !important;}
  .perdish-print .print-header{display:flex !important;}
  .perdish-print .perdish-own-header{display:flex !important;}
  .perdish-print .perdish-own-timestamp{display:block !important;}
  .perdish-section-title{font-size:11px;font-weight:800;margin-bottom:6px;
    padding-bottom:4px;border-bottom:2px solid #1A1714;text-transform:uppercase;letter-spacing:.06em;}

  /* Two-column layout using CSS columns (more reliable than grid in print) */
  .perdish-grid{-webkit-columns:2;columns:2;-webkit-column-gap:10px;column-gap:10px;}
  .perdish-dish{break-inside:avoid;page-break-inside:avoid;display:inline-block;
    width:100%;margin-bottom:8px;vertical-align:top;}

  /* Dish header */
  .perdish-dish-header{display:table !important;width:100%;
    -webkit-print-color-adjust:exact;print-color-adjust:exact;
    padding:4px 8px;border-radius:3px 3px 0 0;}
  .perdish-dish-name{display:table-cell;font-weight:800;font-size:10px;
    color:#fff;letter-spacing:.04em;vertical-align:middle;}
  .perdish-dish-qty{display:table-cell;text-align:right;font-size:9px;
    color:rgba(255,255,255,.75);vertical-align:middle;white-space:nowrap;padding-left:8px;}

  /* Dish table */
  .perdish-tbl{width:100%;border-collapse:collapse;border:1px solid #D1D5DB;border-top:none;}
  .perdish-tbl thead tr{background:#F3F4F6 !important;-webkit-print-color-adjust:exact;}
  .perdish-tbl th{padding:2px 5px;font-size:8px;font-weight:700;text-transform:uppercase;
    letter-spacing:.05em;color:#6B7280;border-bottom:1px solid #D1D5DB;text-align:left;}
  .perdish-tbl td{padding:2px 5px;border-bottom:1px solid #E5E7EB;font-size:10px;line-height:1.3;}
  .perdish-tbl tr:last-child td{border-bottom:none;}
  .pd-name{font-weight:500;width:44%;}
  .pd-qty{font-weight:700;color:#166534;width:14%;text-align:right;}
  .pd-unit{color:#6B7280;width:12%;padding-left:3px;}
  .pd-cont{color:#6B7280;width:30%;font-size:8.5px;}
}

@media screen {
  .print-header{display:none;}
  .perdish-own-header{display:none;}
  .print-sigs{display:none;}
  .perdish-print{display:none;}
  .print-timestamp{display:none;}
  .perdish-own-timestamp{display:none;}
}
`;

// ─── APP ROOT ───
export default function App() {
  const [mode,setMode]   = useState("staff");
  const [isOwner,setIsOwner] = useState(false);
  const [showPin,setShowPin] = useState(false);
  const [devData,setDevData] = useState({pin:"1234",ownerPin:"0000",customRecipes:{},customIngredients:{}});
  const [events,setEvents]   = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    try{const ev=localStorage.getItem("bgt_ev5");if(ev)setEvents(JSON.parse(ev));}catch{}
    try{const dd=localStorage.getItem("bgt_dev3");if(dd)setDevData(JSON.parse(dd));}catch{}
    setLoading(false);
  },[]);

  const saveEv  = useCallback(evts=>{try{localStorage.setItem("bgt_ev5",JSON.stringify(evts));}catch{}}, []);
  const saveDev = useCallback(dd=>{try{localStorage.setItem("bgt_dev3",JSON.stringify(dd));}catch{}}, []);
  const mutEv   = useCallback(fn=>{setEvents(p=>{const n=fn(p);saveEv(n);return n;});},[saveEv]);
  const mutDev  = useCallback(fn=>{setDevData(p=>{const n=fn(p);saveDev(n);return n;});},[saveDev]);

  const ING     = useMemo(()=>({...BASE_ING,...(devData.customIngredients||{})}),[devData]);
  const RECIPES = useMemo(()=>({...BASE_RECIPES,...(devData.customRecipes||{})}),[devData]);

  if(loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",color:"#888"}}>Loading…</div>;

  return(
    <>
      <style>{CSS}</style>
      {mode==="staff"?(
        <StaffApp events={events} mutEv={mutEv} ING={ING} RECIPES={RECIPES} onGear={()=>setShowPin(true)}/>
      ):(
        <MgrApp devData={devData} mutDev={mutDev} ING={ING} RECIPES={RECIPES} onExit={()=>{setMode("staff");setIsOwner(false);}} isOwner={isOwner}/>
      )}
      {showPin&&<PinModal correctPin={devData.pin} ownerPin={devData.ownerPin||"0000"} onSuccess={()=>{setShowPin(false);setIsOwner(false);setMode("mgr");}} onSuccessOwner={()=>{setShowPin(false);setIsOwner(true);setMode("mgr");}} onCancel={()=>setShowPin(false)}/>}
    </>
  );
}

// ─── LOGO COMPONENT ───
function Logo({isDev,onClick}){
  return(
    <div className={`bg-logo ${isDev?"bg-logo-dev":""}`} onClick={onClick}>
      <div className="bg-logo-text">BORDER GRILL</div>
      <div className="bg-logo-sub">Truck + Catering · Prep System</div>
    </div>
  );
}

// ─── PIN MODAL ───
function PinModal({correctPin,ownerPin,onSuccess,onSuccessOwner,onCancel}){
  const [val,setVal]=useState(""); const [err,setErr]=useState(false);
  const tryPin=()=>{
    if(val===ownerPin&&onSuccessOwner){onSuccessOwner();return;}
    if(val===correctPin){onSuccess();return;}
    setErr(true);setVal("");
  };
  return(
    <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)onCancel();}}>
      <div className="modal">
        <div className="modal-title">Manager Access</div>
        <div className="modal-sub">Enter your PIN to access the manager interface</div>
        <input className="pin-input" type="password" maxLength={8} placeholder="••••" value={val} onChange={e=>{setVal(e.target.value);setErr(false);}} onKeyDown={e=>e.key==="Enter"&&tryPin()} autoFocus/>
        {err&&<div className="pin-error">Incorrect PIN. Try again.</div>}
        <div className="modal-actions">
          <button className="btn btn-secondary btn-sm" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={tryPin}>Enter</button>
        </div>
      </div>
    </div>
  );
}

// ─── PRINT MODAL ───
function PrintModal({onClose,onPrint}){
  const doPrint=(mode)=>{ onClose(); onPrint(mode); };
  return(
    <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal" style={{width:400}}>
        <div className="modal-title">Print Options</div>
        <div className="modal-sub">Choose what to print for this event</div>
        <div className="print-modal-opt">
          <button className="print-opt-btn" onClick={()=>doPrint("prep")}>
            <div>
              <div className="print-opt-title">Prep Team Sheet</div>
              <div className="print-opt-desc">All ingredients grouped by category with quantities, containers, tracking columns, and signature lines</div>
            </div>
          </button>
          <button className="print-opt-btn" onClick={()=>doPrint("perdish")}>
            <div>
              <div className="print-opt-title">Per Dish Breakdown</div>
              <div className="print-opt-desc">Each dish with its own ingredient quantities — cooks know exactly what belongs to which dish</div>
            </div>
          </button>
          <button className="print-opt-btn" onClick={()=>doPrint("both")}>
            <div>
              <div className="print-opt-title">Print Both</div>
              <div className="print-opt-desc">Full prep list first, then per dish breakdown starting on a new page</div>
            </div>
          </button>
          <button className="print-opt-btn" onClick={()=>{onClose();setTimeout(()=>window.print(),120);}}>
            <div>
              <div className="print-opt-title">Save as PDF</div>
              <div className="print-opt-desc">Opens your browser's save-to-PDF dialog — choose a location to save the file</div>
            </div>
          </button>
        </div>
        <div style={{textAlign:"right"}}><button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button></div>
      </div>
    </div>
  );
}

// ─── EDIT EVENT MODAL ───
function EditEventModal({event,onSave,onClose}){
  const [f,setF]=useState({
    name:event.name||"",
    truck:event.truck||"Border Grill Truck",
    date:event.date||"",
    guests:event.guests||"",
    startTime:event.startTime||"",
    orderReadyBy:event.orderReadyBy||"",
    loadBy:event.loadBy||"",
    color:event.color||"",
  });
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const handleSave=()=>{ if(!f.name)return; onSave(f); };

  return(
    <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="edit-modal">
        <div className="modal-title">Edit Event Details</div>
        <div className="modal-sub">Changes apply immediately to the prep sheet</div>
        <div className="fgrid">
          <div className="fg full">
            <label className="flabel">Event Name *</label>
            <input className="finput" value={f.name} onChange={e=>s("name",e.target.value)} placeholder="Event name"/>
          </div>
          <div className="fg">
            <label className="flabel">Truck / Unit</label>
            <input className="finput" value={f.truck} onChange={e=>s("truck",e.target.value)}/>
          </div>
          <div className="fg">
            <label className="flabel">Date</label>
            <input className="finput" type="date" value={f.date} onChange={e=>s("date",e.target.value)}/>
          </div>
          <div className="fg">
            <label className="flabel">No. of Guests</label>
            <input className="finput" type="number" placeholder="200" value={f.guests} onChange={e=>s("guests",e.target.value)}/>
          </div>
          <div className="fg">
            <label className="flabel">Event Start Time</label>
            <input className="finput" type="time" value={f.startTime} onChange={e=>s("startTime",e.target.value)}/>
          </div>
          <div className="fg">
            <label className="flabel">Order Ready By</label>
            <input className="finput" type="time" value={f.orderReadyBy} onChange={e=>s("orderReadyBy",e.target.value)}/>
          </div>
          <div className="fg">
            <label className="flabel">Load By</label>
            <input className="finput" type="time" value={f.loadBy} onChange={e=>s("loadBy",e.target.value)}/>
          </div>
          <div className="fg full">
            <label className="flabel">Event Color — matches your sticker roll</label>
            <div className="color-picker-wrap">
              {EVENT_COLORS.map(c=>(
                <button key={c.hex} className={`color-dot-btn ${f.color===c.hex?"selected":""}`} style={{background:c.hex}} title={c.name} onClick={e=>{e.preventDefault();s("color",f.color===c.hex?"":c.hex);}}/>
              ))}
              {f.color&&<span style={{fontSize:12,color:"var(--muted)",marginLeft:4}}>{EVENT_COLORS.find(c=>c.hex===f.color)?.name}</span>}
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!f.name}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// ─── STAFF APP ───
function StaffApp({events,mutEv,ING,RECIPES,onGear}){
  const [view,setView]=useState("dashboard");
  const [activeId,setActiveId]=useState(null);
  const [showPrintModal,setShowPrintModal]=useState(false);
  const [showEditModal,setShowEditModal]=useState(false);
  const [templates,setTemplates]=useState(()=>{try{const t=localStorage.getItem("bgt_templates");return t?JSON.parse(t):[]}catch{return[]}});
  const saveTemplate=(ev)=>{
    const t={id:uid(),name:ev.name,truck:ev.truck,guests:ev.guests,menuSelections:ev.menuSelections,items:ev.items.map(i=>({...i,id:uid(),prepped:"",loaded:"",returned:""})),createdAt:new Date().toISOString()};
    setTemplates(prev=>{const next=[t,...prev];try{localStorage.setItem("bgt_templates",JSON.stringify(next))}catch{};return next;});
  };
  const deleteTemplate=(id)=>setTemplates(prev=>{const next=prev.filter(t=>t.id!==id);try{localStorage.setItem("bgt_templates",JSON.stringify(next))}catch{};return next;});
  const useTemplate=(t)=>{const ev={id:uid(),name:`${t.name} (From Template)`,truck:t.truck,guests:t.guests,date:"",menuSelections:t.menuSelections,items:t.items.map(i=>({...i,id:uid()})),createdAt:new Date().toISOString()};mutEv(p=>[ev,...p]);setActiveId(ev.id);setView("sheet");};
  const [printMode,setPrintMode]=useState(null);
  useEffect(()=>{
    if(!printMode)return;
    const t=setTimeout(()=>{window.print();setPrintMode(null);},150);
    return()=>clearTimeout(t);
  },[printMode]);

  // Auto-archive events 36h after start time
  useEffect(()=>{
    const autoArchive=()=>{
      const now=new Date();
      mutEv(prev=>{
        let changed=false;
        const next=prev.map(ev=>{
          if(ev.archived) return ev;
          if(!ev.date) return ev;
          const timeStr=ev.startTime||"23:59";
          const evDate=new Date(`${ev.date}T${timeStr}`);
          const hoursElapsed=(now-evDate)/(1000*60*60);
          if(hoursElapsed>=36){changed=true;return{...ev,archived:true};}
          return ev;
        });
        return changed?next:prev;
      });
    };
    autoArchive();
    const interval=setInterval(autoArchive,5*60*1000); // check every 5 min
    return()=>clearInterval(interval);
  },[]);
  const active=events.find(e=>e.id===activeId)||null;

  const createEvent=data=>{const ev={id:uid(),...data,items:[],menuSelections:[],createdAt:new Date().toISOString()};mutEv(p=>[ev,...p]);setActiveId(ev.id);setView("menu");};
  const duplicateEvent=id=>{
    const src=events.find(e=>e.id===id); if(!src) return;
    const ev={...src,id:uid(),name:`${src.name} (Copy)`,createdAt:new Date().toISOString(),archived:false,
      items:src.items.map(i=>({...i,id:uid(),prepped:"",loaded:"",returned:""}))};
    mutEv(p=>[ev,...p]); setActiveId(ev.id); setView("sheet");
  };
  const archiveEvent=id=>mutEv(p=>p.map(e=>e.id===id?{...e,archived:!e.archived}:e));
  const deleteEvent=id=>{mutEv(p=>p.filter(e=>e.id!==id));setView("dashboard");};
  const updateEvent=(id,patch)=>mutEv(p=>p.map(e=>e.id===id?{...e,...patch}:e));
  const updateItem=(evId,iid,patch)=>mutEv(p=>p.map(e=>e.id!==evId?e:{...e,items:e.items.map(i=>i.id===iid?{...i,...patch}:i)}));
  const removeItem=(evId,iid)=>mutEv(p=>p.map(e=>e.id!==evId?e:{...e,items:e.items.filter(i=>i.id!==iid)}));
  const addItems=(evId,newItems)=>mutEv(p=>p.map(e=>{if(e.id!==evId)return e;const ex=new Set(e.items.map(i=>i.name.toLowerCase()));return{...e,items:[...e.items,...newItems.filter(i=>!ex.has(i.name.toLowerCase()))]};}));
  const applyMenu=(evId,sel,calcItems)=>mutEv(p=>p.map(e=>{if(e.id!==evId)return e;const existing=e.items.filter(i=>!i.fromMenu);const calc=calcItems.map(ci=>({id:uid(),...ci,quantity:String(ci.calculatedQty),fromMenu:true,calcQty:ci.calculatedQty,prepped:"",loaded:"",returned:"",qtyUsed:"",notes:ci.notes||"",variation:""}));return{...e,menuSelections:sel,items:[...existing,...calc]};}));

  return(
    <>
      <nav className="nav nav-staff">
        <Logo onClick={()=>setView("dashboard")}/>
        <div className="nav-right">
          <button className={`nbtn ${view==="dashboard"?"nbtn-accent":"nbtn-ghost"}`} onClick={()=>setView("dashboard")}>Dashboard</button>
          {(view==="dashboard"||view==="past")&&<button className={`nbtn nbtn-ghost ${view==="past"?"nbtn-accent":""}`} onClick={()=>setView("past")}>Past Events</button>}
          {view==="sheet"&&active&&<button className="nbtn nbtn-ghost" onClick={()=>setShowPrintModal(true)}>Print Sheet</button>}
          {view==="sheet"&&active&&<button className="nbtn nbtn-ghost" onClick={()=>{saveTemplate(active);alert(`"${active.name}" saved as template!`);}}>Save as Template</button>}
          {view==="sheet"&&active&&<button className="nbtn nbtn-ghost" onClick={()=>setShowEditModal(true)}>Edit Event</button>}
          {(view==="sheet"||view==="menu")&&active&&<button className="nbtn nbtn-ghost" onClick={()=>setView("menu")}>Edit Menu</button>}
          {(view==="dashboard"||view==="past")&&<button className="nbtn nbtn-accent" onClick={()=>setView("create")}>+ New Event</button>}
          <button className="gear-btn" onClick={onGear} title="Manager Access">⚙</button>
        </div>
      </nav>
      <div className="wrap">
        {view==="dashboard"&&<Dashboard events={events} onSelect={id=>{setActiveId(id);setView("sheet");}} onNew={()=>setView("create")} onDuplicate={duplicateEvent} onArchive={archiveEvent} onPrint={id=>{setActiveId(id);setView("sheet");setTimeout(()=>setShowPrintModal(true),100);}} templates={templates} onUseTemplate={useTemplate} onDeleteTemplate={deleteTemplate}/>}
        {view==="create"&&<EventForm onSubmit={createEvent} onCancel={()=>setView("dashboard")}/>}
        {view==="menu"&&active&&<MenuBuilder event={active} RECIPES={RECIPES} ING={ING} onApply={(sel,items)=>{applyMenu(active.id,sel,items);setView("sheet");}} onSkip={()=>setView("sheet")}/>}
        {view==="sheet"&&active&&<PrepSheet event={active} ING={ING} RECIPES={RECIPES} onUpdate={p=>updateEvent(active.id,p)} onUpdateItem={(iid,p)=>updateItem(active.id,iid,p)} onRemoveItem={iid=>removeItem(active.id,iid)} onAddItems={items=>addItems(active.id,items)} onDelete={()=>{if(confirm("Delete this event?"))deleteEvent(active.id);}} onEditMenu={()=>setView("menu")} printMode={printMode} onSaveTemplate={()=>{saveTemplate(active);alert(`Template "${active.name}" saved!`);}}/>}
        {view==="past"&&<PastEvents events={events} onRestore={id=>archiveEvent(id)} onSelect={id=>{setActiveId(id);setView("sheet");}}/>}
      </div>
      {showPrintModal&&<PrintModal onClose={()=>setShowPrintModal(false)} onPrint={setPrintMode}/>}
      {showEditModal&&active&&<EditEventModal event={active} onSave={p=>{updateEvent(active.id,p);setShowEditModal(false);}} onClose={()=>setShowEditModal(false)}/>}
    </>
  );
}

// ─── DASHBOARD ───
function CardMenu({evId,archived,onOpen,onDuplicate,onArchive,onPrint}){
  const [open,setOpen]=useState(false);
  const ref=useRef();
  useEffect(()=>{
    if(!open)return;
    const handler=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};
    document.addEventListener("mousedown",handler);
    return()=>document.removeEventListener("mousedown",handler);
  },[open]);
  return(
    <div className="card-menu-wrap" ref={ref} onClick={e=>e.stopPropagation()}>
      <button className="card-menu-btn" onClick={e=>{e.stopPropagation();setOpen(p=>!p);}}>⋮</button>
      {open&&(
        <div className="card-menu-dropdown">
          <button className="card-menu-item" onClick={()=>{setOpen(false);onOpen();}}>Open Sheet</button>
          <button className="card-menu-item" onClick={()=>{setOpen(false);onPrint();}}>Print Sheet</button>
          <button className="card-menu-item" onClick={()=>{setOpen(false);onDuplicate();}}>Duplicate</button>
          <div className="card-menu-divider"/>
          <button className="card-menu-item" onClick={()=>{setOpen(false);onArchive();}}>{archived?"Restore Event":"Archive Event"}</button>
        </div>
      )}
    </div>
  );
}

function Dashboard({events,onSelect,onNew,onDuplicate,onArchive,onPrint,templates,onUseTemplate,onDeleteTemplate}){
  const fmt=d=>d?new Date(d+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"";
  const fmtTime=t=>{if(!t)return"";const[h,m]=t.split(":");const hr=parseInt(h,10);return`${hr%12||12}:${m}${hr>=12?"pm":"am"}`};
  const pct=ev=>!ev.items.length?0:Math.round(ev.items.filter(i=>i.prepped?.trim()).length/ev.items.length*100);
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("active");
  const [showArchived,setShowArchived]=useState(false);

  const calcAccuracy=ev=>{
    let tl=0,tr=0;
    ev.items.forEach(i=>{const l=parseFloat(i.loaded);const r=parseFloat(i.returned);if(!isNaN(l)&&l>0){tl+=l;if(!isNaN(r)&&r>=0)tr+=r;}});
    if(tl===0)return null;
    return Math.round(((tl-tr)/tl)*100);
  };

  const accColor=a=>a===null?"":a>=85?"#15803D":a>=65?"#B45309":"#DC2626";
  const accBarColor=a=>a===null?"var(--border)":a>=85?"#15803D":a>=65?"#B45309":"#DC2626";

  // Week bounds (Mon–Sun)
  const now=new Date();
  const dow=now.getDay();
  const startOfWeek=new Date(now);
  startOfWeek.setDate(now.getDate()-(dow===0?6:dow-1));
  startOfWeek.setHours(0,0,0,0);
  const endOfWeek=new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate()+6);
  endOfWeek.setHours(23,59,59,999);
  const isThisWeek=ev=>{ if(!ev.date)return false; const d=new Date(ev.date+"T00:00:00"); return d>=startOfWeek&&d<=endOfWeek; };

  const activeEvents=events.filter(ev=>!ev.archived);
  const weekEvents=activeEvents.filter(isThisWeek);
  const weekCovers=weekEvents.reduce((s,ev)=>s+(parseInt(ev.guests)||0),0);
  const weekFullyPrepped=weekEvents.filter(ev=>ev.items.length>0&&ev.items.every(i=>i.prepped?.trim())).length;
  const accuracies=activeEvents.map(calcAccuracy).filter(a=>a!==null);
  const avgAcc=accuracies.length?Math.round(accuracies.reduce((s,a)=>s+a,0)/accuracies.length):null;
  // Upcoming alert: events within 24hrs with unprepped items
  const urgentEvents=activeEvents.filter(ev=>{
    if(!ev.date)return false;
    const timeStr=ev.startTime||"23:59";
    const evStart=new Date(`${ev.date}T${timeStr}`);
    const hoursUntil=(evStart-now)/(1000*60*60);
    return hoursUntil>=0&&hoursUntil<=24&&ev.items.some(i=>!i.prepped?.trim());
  });

  const weekLabel=`${startOfWeek.toLocaleDateString("en-US",{month:"short",day:"numeric"})} – ${endOfWeek.toLocaleDateString("en-US",{month:"short",day:"numeric"})}`;

  const STATUS_FILTERS = ["active","pending","prep","loaded","returned"];
  const getStatus=ev=>{
    if(ev.archived) return "archived";
    if(!ev.items.length) return "pending";
    const p=ev.items.filter(i=>i.prepped?.trim()).length;
    if(ev.items.some(i=>parseFloat(i.returned)>=0&&i.returned!=="")) return "returned";
    if(ev.items.some(i=>parseFloat(i.loaded)>0)) return "loaded";
    if(p>0) return "prep";
    return "pending";
  };
  const filteredEvents=events.filter(ev=>{
    if(ev.archived) return false;
    if(filter!=="active"&&getStatus(ev)!==filter) return false;
    if(search&&!ev.name.toLowerCase().includes(search.toLowerCase())&&
       !ev.truck?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const archivedCount=events.filter(e=>e.archived).length;

  return(
    <div>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:16}}>
        <div>
          <div className="page-title">Event Prep Sheets</div>
          <div className="page-sub">{activeEvents.length} event{activeEvents.length!==1?"s":""} on record · Week of {weekLabel}</div>
        </div>
      </div>

      {/* Upcoming Alert Banner */}
      {urgentEvents.length>0&&(
        <div className="alert-banner">
          <div className="alert-banner-icon" style={{fontWeight:800,fontSize:16,color:"#92400E"}}>!</div>
          <div className="alert-banner-content">
            <div className="alert-banner-title">Prep Alert — Event{urgentEvents.length>1?"s":""} Starting Within 24 Hours</div>
            <div className="alert-banner-events">
              {urgentEvents.map(ev=>{
                const unprepped=ev.items.filter(i=>!i.prepped?.trim()).length;
                const timeStr=ev.startTime||"23:59";
                const evStart=new Date(`${ev.date}T${timeStr}`);
                const hoursUntil=Math.round((evStart-now)/(1000*60*60));
                return(
                  <div key={ev.id} className="alert-banner-ev">
                    <div>
                      <span className="alert-banner-ev-name">{ev.name}</span>
                      <span className="alert-banner-ev-meta"> · {unprepped} item{unprepped!==1?"s":""} unprepped · starts in {hoursUntil}h</span>
                    </div>
                    <button className="alert-banner-btn" onClick={()=>onSelect(ev.id)}>Open Sheet</button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Templates */}
      {templates?.length>0&&(
        <div className="template-section">
          <div className="template-section-title">Event Templates</div>
          <div className="template-grid">
            {templates.map(t=>(
              <div key={t.id} className="template-card" onClick={()=>onUseTemplate(t)}>
                <div className="template-icon" style={{fontWeight:800,fontSize:13,color:"var(--accent)"}}>TPL</div>
                <div>
                  <div className="template-name">{t.name}</div>
                  <div className="template-meta">{t.items.length} items · {t.menuSelections?.length||0} dishes</div>
                </div>
                <button style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontSize:16,padding:"2px 6px"}} onClick={e=>{e.stopPropagation();if(confirm("Delete this template?"))onDeleteTemplate(t.id);}}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Stats */}
      <div className="week-stats">
        <div className="wstat wstat-events">
          <div className="wstat-label">Events This Week</div>
          <div className="wstat-value">{weekEvents.length}</div>
          <div className="wstat-sub">{weekEvents.length>0?weekEvents.map(ev=>ev.name).slice(0,2).join(", ")+(weekEvents.length>2?` +${weekEvents.length-2} more`:""):"None scheduled this week"}</div>
        </div>
        <div className="wstat wstat-covers">
          <div className="wstat-label">Covers This Week</div>
          <div className="wstat-value">{weekCovers.toLocaleString()}</div>
          <div className="wstat-sub">{weekEvents.length>0?`avg ${Math.round(weekCovers/(weekEvents.length||1))} per event`:"No events this week"}</div>
        </div>
        <div className="wstat wstat-prepped">
          <div className="wstat-label">Fully Prepped</div>
          <div className="wstat-value">{weekFullyPrepped}<span style={{fontSize:15,fontWeight:500,color:"var(--muted)"}}> / {weekEvents.length}</span></div>
          <div className="wstat-sub">{weekEvents.length>0?`${weekEvents.length-weekFullyPrepped} event${weekEvents.length-weekFullyPrepped!==1?"s":""} in progress`:"No events this week"}</div>
          {weekEvents.length>0&&<div className="wstat-bar"><div className="wstat-bar-fill" style={{width:`${Math.round((weekFullyPrepped/(weekEvents.length||1))*100)}%`,background:"#15803D"}}/></div>}
        </div>
        <div className="wstat wstat-accuracy">
          <div className="wstat-label">Prep Accuracy</div>
          <div className="wstat-value" style={{color:accColor(avgAcc)}}>{avgAcc!==null?`${avgAcc}%`:"—"}</div>
          <div className="wstat-sub">{avgAcc!==null?`loaded vs returned · ${accuracies.length} event${accuracies.length!==1?"s":""}`:"Fill loaded & returned cols to track"}</div>
          {avgAcc!==null&&<div className="wstat-bar"><div className="wstat-bar-fill" style={{width:`${avgAcc}%`,background:accBarColor(avgAcc)}}/></div>}
        </div>
      </div>

      {/* Event Cards */}
      <div className="events-grid">
        {filteredEvents.map(ev=>{
          const p=pct(ev); const acc=calcAccuracy(ev);
          return(
            <div key={ev.id} className="ecard" onClick={()=>onSelect(ev.id)}>
              <div className="ecard-color-indicator" style={{background:ev.color||"var(--accent)"}}/>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  {ev.color&&<span className="event-color-dot" style={{background:ev.color}}/>}
                  <div className="ecard-name">{ev.name}</div>
                </div>
              </div>
              <div className="ecard-meta">{fmt(ev.date)}{ev.startTime?` · ${fmtTime(ev.startTime)}`:""}{ev.guests?` · ${ev.guests} guests`:""}{ev.truck?` · ${ev.truck}`:""}</div>
              <div className="ecard-stats">
                <div className="estat"><span>{ev.items.length}</span>Items</div>
                <div className="estat"><span>{ev.items.filter(i=>i.prepped?.trim()).length}</span>Prepped</div>
                {ev.menuSelections?.length>0&&<div className="estat"><span>{ev.menuSelections.length}</span>Dishes</div>}
                {ev.guests&&<div className="estat"><span>{ev.guests}</span>Covers</div>}
              </div>
              <div className="prog-ring"><div className="prog-track"><div className="prog-fill" style={{width:`${p}%`}}/></div><div className="prog-pct">{p}%</div></div>
              {acc!==null&&(
                <div className="ecard-accuracy">
                  <span className="accuracy-label">Accuracy</span>
                  <div className="accuracy-bar"><div className="accuracy-bar-fill" style={{width:`${acc}%`,background:accBarColor(acc)}}/></div>
                  <span className="accuracy-value" style={{color:accColor(acc)}}>{acc}%</span>
                </div>
              )}
              <CardMenu evId={ev.id} archived={ev.archived}
                onOpen={()=>onSelect(ev.id)}
                onDuplicate={()=>onDuplicate(ev.id)}
                onArchive={()=>onArchive(ev.id)}
                onPrint={()=>onPrint(ev.id)}
              />
            </div>
          );
        })}
        {!filteredEvents.length&&search&&<div className="empty-state" style={{gridColumn:"1/-1",padding:20}}><h3>No events match "{search}"</h3><p>Try a different search or clear the filter.</p></div>}
        <div className="new-ecard" onClick={onNew}><span style={{fontSize:20}}>+</span><span>Create New Event</span></div>
      </div>
      {!events.length&&<div className="empty-state" style={{marginTop:20}}><h3>No events yet</h3><p>Create your first prep sheet to get started.</p></div>}
    </div>
  );
}


// ─── EVENT FORM ───
function EventForm({onSubmit,onCancel}){
  const [f,setF]=useState({name:"",truck:"Border Grill Truck",date:"",guests:"",startTime:"",orderReadyBy:"",loadBy:"",color:""});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  return(
    <div style={{maxWidth:580}}>
      <div className="page-title" style={{marginBottom:3}}>New Event</div>
      <div className="page-sub">Step 1 of 2 — Enter event details</div>
      <div className="fcard">
        <div className="fgrid">
          <div className="fg full"><label className="flabel">Event Name *</label><input className="finput" placeholder="e.g. Smith Wedding · Google HQ Catering" value={f.name} onChange={e=>s("name",e.target.value)}/></div>
          <div className="fg"><label className="flabel">Truck / Unit</label><input className="finput" value={f.truck} onChange={e=>s("truck",e.target.value)}/></div>
          <div className="fg"><label className="flabel">Date</label><input className="finput" type="date" value={f.date} onChange={e=>s("date",e.target.value)}/></div>
          <div className="fg"><label className="flabel">No. of Guests</label><input className="finput" type="number" placeholder="200" value={f.guests} onChange={e=>s("guests",e.target.value)}/></div>
          <div className="fg"><label className="flabel">Event Start Time</label><input className="finput" type="time" value={f.startTime||""} onChange={e=>s("startTime",e.target.value)}/></div>
          <div className="fg"><label className="flabel">Order Ready By</label><input className="finput" type="time" value={f.orderReadyBy||""} onChange={e=>s("orderReadyBy",e.target.value)}/></div>
          <div className="fg"><label className="flabel">Load By</label><input className="finput" type="time" value={f.loadBy||""} onChange={e=>s("loadBy",e.target.value)}/></div>
          <div className="fg full">
            <label className="flabel">Event Color <span style={{fontWeight:400,color:"var(--muted)"}}>— matches your sticker roll</span></label>
            <div className="color-picker-wrap">
              {EVENT_COLORS.map(c=>(
                <button key={c.hex} className={`color-dot-btn ${f.color===c.hex?"selected":""}`} style={{background:c.hex}} title={c.name} onClick={e=>{e.preventDefault();s("color",f.color===c.hex?"":c.hex);}}/>
              ))}
              {f.color&&<span style={{fontSize:12,color:"var(--muted)",marginLeft:4}}>Selected: {EVENT_COLORS.find(c=>c.hex===f.color)?.name}</span>}
            </div>
          </div>
        </div>
        <div className="faction">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>{if(f.name)onSubmit(f);}} disabled={!f.name}>Next: Build Menu →</button>
        </div>
      </div>
    </div>
  );
}

// ─── MENU BUILDER ───
function MenuBuilder({event,RECIPES,ING,onApply,onSkip}){
  const [qtys,setQtys]=useState(()=>{const init={};(event.menuSelections||[]).forEach(s=>{init[s.key]=s.qty;});return init;});
  const [collapsed,setCollapsed]=useState({});
  const [search,setSearch]=useState("");
  const setQty=(key,val)=>{const n=parseInt(val,10);setQtys(p=>({...p,[key]:isNaN(n)||n<=0?"":n}));};
  const adj=(key,d)=>setQtys(p=>{const c=parseInt(p[key]||0,10);const n=Math.max(0,c+d);return{...p,[key]:n||""};});
  const selections=useMemo(()=>Object.entries(qtys).filter(([,q])=>q>0).map(([key,qty])=>({key,qty})),[qtys]);
  const calcResults=useMemo(()=>calcPrepList(selections,ING,RECIPES),[selections,ING,RECIPES]);
  const filtered=useMemo(()=>{if(!search)return null;const q=search.toLowerCase();const out={};Object.entries(RECIPES).forEach(([key,r])=>{if(r.label.toLowerCase().includes(q)){if(!out[r.cat])out[r.cat]=[];out[r.cat].push({key,r});}});return out;},[search,RECIPES]);
  const bycat=useMemo(()=>{const out={};RECIPE_CATS.forEach(c=>{out[c]=Object.entries(RECIPES).filter(([,r])=>r.cat===c).map(([key,r])=>({key,r}));});return out;},[RECIPES]);

  const renderDish=({key,r})=>{const q=qtys[key]||"";return(
    <div key={key} className="rdish">
      <div className="rdish-name">{r.label}</div>
      <div className="rdish-ctrl">
        <button className="qty-btn" onClick={()=>adj(key,-1)}>−</button>
        <input className={`qty-inp${q>0?" has-val":""}`} type="number" min="0" placeholder="0" value={q} onChange={e=>setQty(key,e.target.value)}/>
        <button className="qty-btn" onClick={()=>adj(key,1)}>+</button>
        <span className="qty-lbl">{r.servingWord}{q>1?"s":""}</span>
      </div>
    </div>
  );};

  return(
    <div>
      <div className="page-title" style={{marginBottom:2}}>Build Your Menu</div>
      <div className="page-sub" style={{marginBottom:14}}>{event.name} — Enter quantities per dish. Ingredients auto-calculate &amp; merge.</div>
      <div className="mb-layout">
        <div>
          <input style={{width:"100%",border:"1px solid var(--border)",borderRadius:8,padding:"8px 12px",fontSize:13,outline:"none",marginBottom:12}} placeholder="Search dishes…" value={search} onChange={e=>setSearch(e.target.value)}/>
          {search?(
            filtered&&Object.keys(filtered).length>0?Object.entries(filtered).map(([cat,dishes])=>(
              <div key={cat} className="rcat-section"><div className="rcat-hdr" style={{background:RCAT_COLORS[cat]}}><span className="rcat-name">{cat}</span></div><div className="rcat-items">{dishes.map(renderDish)}</div></div>
            )):<div className="empty-state"><p>No dishes found</p></div>
          ):RECIPE_CATS.map(cat=>{
            const dishes=bycat[cat]||[];const open=!collapsed[cat];
            const sel=dishes.filter(({key})=>qtys[key]>0).length;
            return(<div key={cat} className="rcat-section">
              <div className="rcat-hdr" style={{background:RCAT_COLORS[cat]}} onClick={()=>setCollapsed(p=>({...p,[cat]:!p[cat]}))}>
                <span className="rcat-name">{cat}</span>{sel>0&&<span className="rcat-count">{sel} selected</span>}<span className={`rcat-arr ${open?"open":""}`}>▼</span>
              </div>
              {open&&<div className="rcat-items">{dishes.map(renderDish)}</div>}
            </div>);
          })}
        </div>
        <div className="sum-panel">
          <div className="sum-hdr"><span className="sum-title">Menu Summary</span><span className="sum-count">{selections.length} dish{selections.length!==1?"es":""} · {calcResults.length} ingredients</span></div>
          <div className="sum-list">
            {!selections.length?<div className="sum-empty">Add dishes to see your calculated prep list.</div>:selections.map(({key,qty})=>(
              <div key={key} className="sum-item"><span style={{fontWeight:500}}>{RECIPES[key]?.label}</span><span style={{color:"var(--muted)"}}>{qty} {RECIPES[key]?.servingWord}{qty!==1?"s":""}</span></div>
            ))}
          </div>
          {calcResults.length>0&&(
            <div className="sum-preview">
              <div className="sum-prev-lbl">Calculated Ingredients</div>
              {calcResults.slice(0,6).map(ci=>(
                <div key={ci.name} className="sum-prev-row"><span style={{fontWeight:500}}>{ci.name}</span><span style={{color:"var(--green)",fontWeight:700}}>{ci.calculatedQty} {ci.unit}</span></div>
              ))}
              {calcResults.length>6&&<div className="sum-prev-more">+{calcResults.length-6} more…</div>}
            </div>
          )}
          <div className="sum-foot">
            <button className="btn btn-primary" style={{width:"100%"}} onClick={()=>{if(selections.length)onApply(selections,calcResults);}} disabled={!selections.length}>Generate Prep List →</button>
            <button className="btn btn-secondary" style={{width:"100%",marginTop:7}} onClick={onSkip}>Skip — Build Manually</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PREP SHEET ───
function PrepSheet({event,ING,RECIPES,onUpdate,onUpdateItem,onRemoveItem,onAddItems,onDelete,onEditMenu,printMode,onSaveTemplate}){
  const [collapsed,setCollapsed]=useState({});
  const [showDrawer,setShowDrawer]=useState(false);
  const bygroup=GROUP_ORDER.reduce((a,g)=>{a[g]=event.items.filter(i=>(i.group||"SPECIALTY")===g);return a;},{});
  const total=event.items.length,prepped=event.items.filter(i=>i.prepped?.trim()).length,loaded=event.items.filter(i=>i.loaded?.trim()).length;
  const fmt=d=>d?new Date(d+"T00:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}):"";
  const fmtTime=t=>{if(!t)return"";const[h,m]=t.split(":");const hr=parseInt(h,10);return`${hr%12||12}:${m}${hr>=12?"pm":"am"}`};

  return(
    <div data-pmode={printMode||"prep"}>
      {/* PRINT HEADER — only visible when printing */}
      <div className="print-timestamp">Printed: {new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"})} at {new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}</div>
      <div className="print-header">
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {event.color&&<div style={{width:24,height:24,borderRadius:"50%",background:event.color,flexShrink:0,border:"2px solid rgba(0,0,0,.1)"}}/>}
          <div>
            <div className="print-logo-text">BORDER GRILL</div>
            <div className="print-logo-sub">Truck + Catering · Prep Sheet</div>
          </div>
        </div>
        <div>
          <div className="print-event-title">{event.name}</div>
          <div className="print-event-meta">{event.truck}{event.date?` · ${fmt(event.date)}`:""}{event.startTime?` · ${fmtTime(event.startTime)}`:""}{event.guests?` · ${event.guests} guests`:""}</div>
        </div>
      </div>

      <div className="sheet-hdr">
        <div className="sheet-hdr-top">
          <div><div className="sheet-name">{event.name}</div><div className="sheet-desc">{event.truck}{event.date?` · ${fmt(event.date)}`:""}{event.startTime?` · ${fmtTime(event.startTime)}`:""}{event.guests?` · ${event.guests} guests`:""}</div></div>
          <button className="btn btn-danger btn-sm" onClick={onDelete}>Delete</button>
        </div>
        <div className="meta-row">
          {[["Order Ready By","orderReadyBy","time"],["Load By","loadBy","time"],["Revised On","revisedOn","text"],["Kitchen Mgr","kitchenManager","text"],["Load Driver","loadDriver","text"],["Returns Driver","returnsDriver","text"]].map(([lbl,key,type])=>(
            <div key={key}><div className="meta-lbl">{lbl}</div><input className="meta-inp" type={type} value={event[key]||""} onChange={e=>onUpdate({[key]:e.target.value})}/></div>
          ))}
        </div>
      </div>

      {/* EVENT NOTES */}
      <div className="event-notes">
        <div className="event-notes-label">Event Notes &amp; Alerts — visible to all staff</div>
        <textarea
          className="event-notes-ta"
          rows={event.notes?.trim() ? Math.max(2, (event.notes.match(/\n/g)||[]).length+2) : 2}
          placeholder="Add important notes here — allergies, special requests, client instructions… This prints prominently on both sheet versions."
          value={event.notes||""}
          onChange={e=>onUpdate({notes:e.target.value})}
        />
      </div>

      {event.menuSelections?.length>0&&(
        <div className="menu-bar">
          <div><div style={{fontSize:10,fontWeight:700,color:"var(--green)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:5}}>Auto-Calculated from Menu</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{event.menuSelections.map(s=><span key={s.key} className="mdish-tag">{RECIPES[s.key]?.label}: {s.qty}</span>)}</div></div>
          <button className="btn btn-secondary btn-sm" onClick={onEditMenu}>Edit Menu</button>
        </div>
      )}

      <div className="sbar" style={event.color?{background:event.color}:{}}>
        <div><div className="sbar-lbl">Total Items</div><div className="sbar-val">{total}</div></div>
        <div className="sbar-div"/>
        <div><div className="sbar-lbl">Prepped</div><div className="sbar-val" style={{color:prepped===total&&total>0?"#4ADE80":"#fff"}}>{prepped}/{total}</div></div>
        <div className="sbar-div"/>
        <div><div className="sbar-lbl">Loaded</div><div className="sbar-val">{loaded}/{total}</div></div>
        <div className="sbar-div"/>
        {(()=>{
          let tl=0,tr=0;
          event.items.forEach(i=>{const l=parseFloat(i.loaded);const r=parseFloat(i.returned);if(!isNaN(l)&&l>0){tl+=l;if(!isNaN(r)&&r>=0)tr+=r;}});
          const acc=tl>0?Math.round(((tl-tr)/tl)*100):null;
          const col=acc===null?"#fff":acc>=85?"#4ADE80":acc>=65?"#FBB040":"#F87171";
          return(<div><div className="sbar-lbl">Prep Accuracy</div><div className="sbar-val" style={{color:col}}>{acc!==null?`${acc}%`:"—"}</div></div>);
        })()}
        <div className="sbar-spacer"/>
        {GROUP_ORDER.map(g=>bygroup[g].length>0&&<span key={g} style={{background:"rgba(255,255,255,.1)",borderRadius:20,padding:"2px 9px",fontSize:10,color:"#fff",display:"inline-flex",alignItems:"center",gap:4}}><span style={{width:5,height:5,borderRadius:"50%",background:GROUPS[g].color,display:"inline-block"}}/>{GROUPS[g].label.split(" ")[0]}: {bygroup[g].length}</span>)}
      </div>

      <div className="sheet-actions">
        <button className="btn btn-primary" onClick={()=>setShowDrawer(true)}>+ Add Items</button>
        {event.items.filter(i=>i.fromMenu).length>0&&<span className="auto-badge">{event.items.filter(i=>i.fromMenu).length} auto-calculated</span>}
      </div>

      {GROUP_ORDER.map(g=>{
        const items=bygroup[g];if(!items.length)return null;
        const cfg=GROUPS[g];const open=!collapsed[g];
        return(<div key={g} className="cat-section">
          <div className="cat-hdr" style={{background:event.color||cfg.color}} onClick={()=>setCollapsed(p=>({...p,[g]:!p[g]}))}>
            <span className="cat-hdr-name">{cfg.label}</span>
            <span className="cat-hdr-count">{items.length} item{items.length!==1?"s":""}</span>
            <span className={`cat-hdr-arrow ${open?"open":""}`}>▼</span>
          </div>
          {open&&<div className="items-wrap">
            <table className="items-tbl">
              <thead><tr><th style={{minWidth:160}}>Item</th><th style={{width:60}}>Qty</th><th style={{width:48}}>Unit</th><th style={{width:88}}>Container</th><th>Notes / Variation</th><th style={{width:68}}>Prepped</th><th style={{width:64}}>Loaded</th><th style={{width:64}}>Returned</th><th style={{width:28}}/></tr></thead>
              <tbody>{items.map(item=><ItemRow key={item.id} item={item} onUpdate={p=>onUpdateItem(item.id,p)} onRemove={()=>onRemoveItem(item.id)}/>)}</tbody>
            </table>
          </div>}
        </div>);
      })}

      {!total&&<div className="empty-state" style={{marginTop:20}}><h3>Prep sheet is empty</h3><p>Build a menu to auto-calculate, or click "+ Add Items".</p></div>}

      {/* POST-EVENT NOTES — visible when archived */}
      {event.archived&&(
        <div className="post-notes-section">
          <div className="post-notes-title">Post-Event Notes</div>
          <textarea
            className="post-notes-ta"
            rows={4}
            placeholder="How did prep go? What ran short? What was over-prepped? These notes will appear in the past events report."
            value={event.postNotes||""}
            onChange={e=>onUpdate({postNotes:e.target.value})}
          />
        </div>
      )}

      {/* PER DISH BREAKDOWN — only shows when printing in perdish/both mode */}
      <div className="perdish-print">
        {/* Per dish own header — hidden in "both" mode via CSS */}
        <div className="perdish-own-timestamp print-timestamp">Printed: {new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"})} at {new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}</div>
        <div className="perdish-own-header print-header">
          <div>
            <div className="print-logo-text">BORDER GRILL</div>
            <div className="print-logo-sub">Truck + Catering · Per Dish Breakdown</div>
          </div>
          <div>
            <div className="print-event-title">{event.name}</div>
            <div className="print-event-meta">{event.truck}{event.date?` · ${new Date(event.date+"T00:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}`:""}{event.startTime?` · ${fmtTime(event.startTime)}`:""}{event.guests?` · ${event.guests} guests`:""}</div>
          </div>
        </div>
        {event.notes?.trim()&&(
          <div className="event-notes" style={{marginBottom:8}}>
            <div className="event-notes-label">Event Notes &amp; Alerts</div>
            <div style={{fontSize:10,color:"#1A1714",fontWeight:500,lineHeight:1.4}}>{event.notes}</div>
          </div>
        )}
        <div className="perdish-section-title">Ingredient Quantities Per Dish</div>
        <div className="perdish-grid">
          {(event.menuSelections||[]).map(({key,qty})=>{
            const recipe=RECIPES[key]; if(!recipe)return null;
            const ings=recipe.ingredients.filter(i=>ING[i.name]).map(i=>{
              const cfg=ING[i.name];
              const amount="ea" in i?Math.ceil(i.ea*qty):Math.ceil((i.oz*qty)/cfg.opU);
              return{name:i.name,qty:amount,unit:cfg.unit,container:cfg.container||""};
            });
            return(
              <div key={key} className="perdish-dish">
                <div className="perdish-dish-header" style={{background:RCAT_COLORS[recipe.cat]||"#374151",display:"table",width:"100%",padding:"4px 8px",borderRadius:"3px 3px 0 0"}}>
                  <span className="perdish-dish-name" style={{display:"table-cell",verticalAlign:"middle",color:"#fff",fontWeight:800,fontSize:10,letterSpacing:".04em"}}>{recipe.label}</span>
                  <span className="perdish-dish-qty" style={{display:"table-cell",verticalAlign:"middle",textAlign:"right",color:"rgba(255,255,255,.75)",fontSize:9,whiteSpace:"nowrap",paddingLeft:8}}>{qty} {recipe.servingWord}{qty!==1?"s":""}</span>
                </div>
                <table className="perdish-tbl">
                  <thead>
                    <tr><th className="pd-name">Ingredient</th><th className="pd-qty" style={{textAlign:"right"}}>Qty</th><th className="pd-unit">Unit</th><th className="pd-cont">Container</th></tr>
                  </thead>
                  <tbody>
                    {ings.map(i=>(
                      <tr key={i.name}>
                        <td className="pd-name">{i.name}</td>
                        <td className="pd-qty">{i.qty}</td>
                        <td className="pd-unit">{i.unit}</td>
                        <td className="pd-cont">{i.container||"—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>

      {/* PRINT SIGNATURES */}
      <div className="print-sigs">
        {[["Kitchen Manager","kitchenManager"],["Load Driver","loadDriver"],["Returns Driver","returnsDriver"]].map(([lbl,key])=>(
          <div key={key} className="print-sig">
            <div style={{fontSize:11,fontWeight:600,color:"#374151"}}>{lbl}</div>
            <div className="print-sig-line"/>
            <div className="print-sig-lbl">{event[key]||"_________________________"}</div>
          </div>
        ))}
      </div>

      {showDrawer&&<ManualDrawer event={event} ING={ING} onClose={()=>setShowDrawer(false)} onAdd={items=>{onAddItems(items);setShowDrawer(false);}}/>}
    </div>
  );
}

function ItemRow({item,onUpdate,onRemove}){
  const [editing,setEditing]=useState(false);
  const isAuto=item.fromMenu&&!editing;
  return(
    <tr>
      <td><div className="iname">{item.name}</div>{item.fromMenu&&!editing&&<div className="icalc"> from menu</div>}{item.variation&&<div className="ivar">{item.variation}</div>}</td>
      <td><input className={`ci ci-qty${isAuto?" auto":""}`} type="number" placeholder="—" value={item.quantity||""} onFocus={()=>setEditing(true)} onBlur={()=>setEditing(false)} onChange={e=>onUpdate({quantity:e.target.value})}/></td>
      <td><input className="ci ci-sm" value={item.unit||""} onChange={e=>onUpdate({unit:e.target.value})}/></td>
      <td><input className="ci" value={item.container||""} onChange={e=>onUpdate({container:e.target.value})}/></td>
      <td><input className="ci" placeholder="notes or variation…" value={item.notes||""} style={{fontStyle:item.notes?"italic":"normal"}} onChange={e=>onUpdate({notes:e.target.value})}/></td>
      <td><input className={`ci ci-init${item.prepped?.trim()?" ci-prepped":""}`} placeholder="initials" value={item.prepped||""} onChange={e=>onUpdate({prepped:e.target.value})}/></td>
      <td><input className="ci ci-init" placeholder="qty" value={item.loaded||""} onChange={e=>onUpdate({loaded:e.target.value})}/></td>
      <td><input className="ci ci-init" placeholder="qty" value={item.returned||""} onChange={e=>onUpdate({returned:e.target.value})}/></td>
      <td><button className="rmv" onClick={onRemove}>×</button></td>
    </tr>
  );
}

// ─── MANUAL DRAWER ───
function ManualDrawer({event,ING,onClose,onAdd}){
  const [search,setSearch]=useState(""); const [sel,setSel]=useState({}); const [activeCat,setActiveCat]=useState("PROTEINS");
  const [custom,setCustom]=useState({show:false,name:"",group:"PROTEINS",unit:"",container:"",notes:"",variation:""});
  const existing=new Set(event.items.map(i=>i.name.toLowerCase()));
  const toggle=(g,name)=>{const k=`${g}::${name}`;setSel(p=>({...p,[k]:!p[k]}));};
  const isChecked=(g,name)=>!!sel[`${g}::${name}`];
  const bygroup=useMemo(()=>{const out={};GROUP_ORDER.forEach(g=>{out[g]=Object.entries(ING).filter(([,cfg])=>cfg.group===g).map(([name,cfg])=>({name,...cfg}));});return out;},[ING]);
  const filtered=useMemo(()=>{if(!search)return null;const q=search.toLowerCase();const out={};Object.entries(ING).forEach(([name,cfg])=>{if(name.toLowerCase().includes(q)){if(!out[cfg.group])out[cfg.group]=[];out[cfg.group].push({name,...cfg});}});return out;},[search,ING]);
  const selCount=Object.values(sel).filter(Boolean).length;
  const sc=(k,v)=>setCustom(p=>({...p,[k]:v}));
  const handleAdd=()=>{
    const toAdd=Object.entries(sel).filter(([,v])=>v).map(([k])=>{const[g,name]=k.split("::");const cfg=ING[name]||{};return{id:uid(),group:g,category:g,name,quantity:"",unit:cfg.unit||"",container:cfg.container||"",notes:cfg.notes||"",variation:"",prepped:"",loaded:"",returned:"",qtyUsed:""};});
    onAdd(toAdd);
  };
  const handleCustom=()=>{if(!custom.name)return;onAdd([{id:uid(),group:custom.group,category:custom.group,name:custom.name,quantity:"",unit:custom.unit,container:custom.container,notes:custom.notes,variation:custom.variation,prepped:"",loaded:"",returned:"",qtyUsed:""}]);setCustom({show:false,name:"",group:"PROTEINS",unit:"",container:"",notes:"",variation:""});};
  return(
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="drawer">
        <div className="drawer-hdr"><div className="drawer-title">Add Items Manually</div><button className="drawer-x" onClick={onClose}>×</button></div>
        <div className="drawer-body">
          <input className="dsearch" placeholder="Search ingredients…" value={search} onChange={e=>setSearch(e.target.value)}/>
          {custom.show?(
            <div className="custom-box">
              <div className="cbx-title">Custom or Variation Item</div>
              <div className="cgrid">
                <div className="fg full"><label className="flabel">Item Name *</label><input className="finput" placeholder="e.g. Mango Habanero Salsa" value={custom.name} onChange={e=>sc("name",e.target.value)}/></div>
                <div className="fg"><label className="flabel">Group</label><select className="finput" value={custom.group} onChange={e=>sc("group",e.target.value)}>{GROUP_ORDER.map(g=><option key={g} value={g}>{GROUPS[g].label}</option>)}</select></div>
                <div className="fg"><label className="flabel">Unit</label><input className="finput" placeholder="qt, lb, ea…" value={custom.unit} onChange={e=>sc("unit",e.target.value)}/></div>
                <div className="fg"><label className="flabel">Container</label><input className="finput" placeholder="clear quart…" value={custom.container} onChange={e=>sc("container",e.target.value)}/></div>
                <div className="fg"><label className="flabel">Notes</label><input className="finput" value={custom.notes} onChange={e=>sc("notes",e.target.value)}/></div>
                <div className="fg full"><label className="flabel">Variation / Special Instruction</label><input className="finput" placeholder="dairy-free, extra spicy…" value={custom.variation} onChange={e=>sc("variation",e.target.value)}/></div>
              </div>
              <div style={{display:"flex",gap:7,marginTop:9}}>
                <button className="btn btn-secondary btn-sm" onClick={()=>sc("show",false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={handleCustom} disabled={!custom.name}>Add to Sheet</button>
              </div>
            </div>
          ):<button className="btn btn-secondary btn-sm" style={{width:"100%",marginBottom:9}} onClick={()=>sc("show",true)}>+ Add Custom or Variation Item</button>}
          {!search&&<div className="cat-tabs">{GROUP_ORDER.map(g=><button key={g} className={`ctab ${activeCat===g?"ctab-active":"ctab-idle"}`} style={activeCat===g?{background:GROUPS[g].color}:{}} onClick={()=>setActiveCat(g)}>{GROUPS[g].label.split(" ")[0]}</button>)}</div>}
          {search?(
            filtered&&Object.keys(filtered).length>0?Object.entries(filtered).map(([g,items])=>(
              <div key={g}><div className="dlabel" style={{color:GROUPS[g]?.color}}>{GROUPS[g]?.label||g}</div>
              {items.map(item=><DItem key={item.name} item={item} gkey={g} checked={isChecked(g,item.name)} already={existing.has(item.name.toLowerCase())} onToggle={()=>toggle(g,item.name)}/>)}</div>
            )):<div style={{color:"var(--muted)",fontSize:13,padding:"10px 0"}}>No items found. Add a custom item above.</div>
          ):(bygroup[activeCat]||[]).map(item=><DItem key={item.name} item={item} gkey={activeCat} checked={isChecked(activeCat,item.name)} already={existing.has(item.name.toLowerCase())} onToggle={()=>toggle(activeCat,item.name)}/>)}
        </div>
        <div className="drawer-foot">
          <div className="sel-info">{selCount>0?`${selCount} item${selCount!==1?"s":""} selected`:"Select items or add a custom item above"}</div>
          <div className="dflex">
            <button className="btn btn-secondary" style={{flex:1}} onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" style={{flex:2}} onClick={handleAdd} disabled={!selCount}>Add {selCount||""} Item{selCount!==1?"s":""} →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
function DItem({item,gkey,checked,already,onToggle}){
  return(
    <div className="ditem" onClick={already?undefined:onToggle} style={{opacity:already?.45:1,cursor:already?"default":"pointer"}}>
      <input type="checkbox" checked={checked} onChange={onToggle} disabled={already} onClick={e=>e.stopPropagation()}/>
      <div style={{flex:1}}>
        <div className="ditem-name">{item.name}{already&&<span style={{fontSize:10,color:"#9CA3AF"}}> (on sheet)</span>}</div>
        <div className="ditem-meta">{item.unit}{item.container?` · ${item.container}`:""}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MGR APP
// ─────────────────────────────────────────────
// ─── PAST EVENTS PAGE ───
function PastEvents({events,onRestore,onSelect}){
  const [search,setSearch]=useState("");
  const archived=events.filter(e=>e.archived).sort((a,b)=>{
    if(!a.date&&!b.date)return 0;if(!a.date)return 1;if(!b.date)return -1;
    return new Date(b.date)-new Date(a.date);
  });
  const filtered=archived.filter(ev=>{
    if(!search)return true;
    const q=search.toLowerCase();
    return ev.name.toLowerCase().includes(q)||ev.truck?.toLowerCase().includes(q)||ev.notes?.toLowerCase().includes(q)||ev.postNotes?.toLowerCase().includes(q);
  });
  const fmt=d=>d?new Date(d+"T00:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"}):"No date";
  const fmtTime=t=>{if(!t)return"";const[h,m]=t.split(":");const hr=parseInt(h,10);return`${hr%12||12}:${m}${hr>=12?"pm":"am"}`};
  const calcAcc=ev=>{let tl=0,tr=0;ev.items.forEach(i=>{const l=parseFloat(i.loaded);const r=parseFloat(i.returned);if(!isNaN(l)&&l>0){tl+=l;if(!isNaN(r)&&r>=0)tr+=r;}});if(tl===0)return null;return Math.round(((tl-tr)/tl)*100);};
  return(
    <div>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:16}}>
        <div>
          <div className="page-title">Past Events</div>
          <div className="page-sub">{archived.length} archived event{archived.length!==1?"s":""} · Auto-archived 36 hours after event start</div>
        </div>
      </div>
      <div style={{marginBottom:14}}>
        <input
          className="dash-search"
          style={{maxWidth:400}}
          placeholder="Search past events by name, truck, or notes…"
          value={search}
          onChange={e=>setSearch(e.target.value)}
        />
      </div>
      {!archived.length?(
        <div className="empty-state"><h3>No past events yet</h3><p>Events are automatically archived 36 hours after their start time.</p></div>
      ):!filtered.length?(
        <div className="empty-state"><h3>No results for "{search}"</h3><p>Try a different search term.</p></div>
      ):(
        <table className="past-events-tbl">
          <thead><tr><th>Event</th><th>Date</th><th>Guests</th><th>Items</th><th>Prepped</th><th>Accuracy</th><th>Event Notes</th><th>Post-Event Notes</th><th></th></tr></thead>
          <tbody>{filtered.map(ev=>{
            const prepped=ev.items.filter(i=>i.prepped?.trim()).length;
            const acc=calcAcc(ev);
            const accColor=acc===null?"var(--muted)":acc>=85?"var(--green)":acc>=65?"var(--amber)":"#DC2626";
            return(<tr key={ev.id} onClick={()=>onSelect(ev.id)}>
              <td><div className="past-ev-name">{ev.name}</div><div className="past-ev-meta">{ev.truck}{ev.startTime?` · ${fmtTime(ev.startTime)}`:""}</div></td>
              <td style={{fontSize:12,color:"var(--muted)"}}>{fmt(ev.date)}</td>
              <td style={{fontSize:13,fontWeight:600}}>{ev.guests||"—"}</td>
              <td style={{fontSize:13}}>{ev.items.length}</td>
              <td style={{fontSize:13}}>{prepped}/{ev.items.length}</td>
              <td style={{fontSize:13,fontWeight:700,color:accColor}}>{acc!==null?`${acc}%`:"—"}</td>
              <td style={{fontSize:12,color:"var(--muted)",maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.notes||"—"}</td>
              <td style={{fontSize:12,color:"var(--muted)",maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.postNotes||<span style={{fontStyle:"italic",color:"var(--border2)"}}>No notes yet</span>}</td>
              <td onClick={e=>e.stopPropagation()}><button className="btn btn-secondary btn-sm" onClick={()=>onRestore(ev.id)}>Restore</button></td>
            </tr>);
          })}</tbody>
        </table>
      )}
    </div>
  );
}

function MgrApp({devData,mutDev,ING,RECIPES,onExit,isOwner}){
  const [tab,setTab]=useState("recipes");
  const [editingRecipe,setEditingRecipe]=useState(null);

  const saveRecipe=(key,recipe)=>{mutDev(p=>({...p,customRecipes:{...p.customRecipes,[key]:recipe}}));setEditingRecipe(null);};
  const deleteRecipe=key=>{mutDev(p=>{const cr={...p.customRecipes};delete cr[key];return{...p,customRecipes:cr};}); };
  const saveIngredient=(name,cfg)=>mutDev(p=>({...p,customIngredients:{...p.customIngredients,[name]:cfg}}));
  const updateIngredient=(oldName,newName,cfg)=>{mutDev(p=>{const ci={...p.customIngredients};if(oldName!==newName)delete ci[oldName];ci[newName]=cfg;return{...p,customIngredients:ci};});};
  const deleteIngredient=name=>{mutDev(p=>{const ci={...p.customIngredients};delete ci[name];return{...p,customIngredients:ci};});};
  const savePin=newPin=>{if(newPin?.length>=3)mutDev(p=>({...p,pin:newPin}));};

  const navItems=[{tab:"recipes",label:"Recipes"},{tab:"ingredients",label:"Ingredients"},{tab:"settings",label:"Settings"}];

  return(
    <>
      <nav className="nav nav-mgr">
        <Logo isDev onClick={onExit}/>
        <div className="nav-right">
          <span className="mgr-badge">{isOwner?"OWNER":"MGR"}</span>
          <button className="nbtn nbtn-mgrgh" onClick={onExit}>← Staff View</button>
        </div>
      </nav>
      <div className="mgr-layout">
        <div className="mgr-sidebar">
          <div className="mgr-nav-section">Management</div>
          {navItems.map(n=>(
            <div key={n.tab} className={`dev-nav-item ${tab===n.tab?"active":""}`} onClick={()=>{setEditingRecipe(null);setTab(n.tab);}}>
              <span>{n.label}</span>
            </div>
          ))}
        </div>
        <div className="mgr-content">
          {tab==="recipes"&&(editingRecipe?
            <RecipeEditor recipeKey={editingRecipe==="new"?null:editingRecipe} recipe={editingRecipe==="new"?null:RECIPES[editingRecipe]} isCustom={editingRecipe==="new"||!!devData.customRecipes[editingRecipe]} ING={ING} onSave={saveRecipe} onDelete={isOwner&&editingRecipe!=="new"?()=>{deleteRecipe(editingRecipe);setEditingRecipe(null);}:null} onCancel={()=>setEditingRecipe(null)} isOwner={isOwner}/>:
            <RecipeList RECIPES={RECIPES} customKeys={Object.keys(devData.customRecipes)} onEdit={setEditingRecipe} onNew={()=>setEditingRecipe("new")} onDelete={key=>{deleteRecipe(key);setEditingRecipe(null);}} isOwner={isOwner}/>
          )}
          {tab==="ingredients"&&<IngredientManager ING={ING} customKeys={Object.keys(devData.customIngredients||{})} onSave={saveIngredient} onUpdate={updateIngredient} onDelete={deleteIngredient} isOwner={isOwner}/>}
          {tab==="settings"&&<DevSettings currentPin={devData.pin} currentOwnerPin={devData.ownerPin} onSave={savePin} onSaveOwner={pin=>mutDev(p=>({...p,ownerPin:pin}))} isOwner={isOwner}/>}
        </div>
      </div>
    </>
  );
}

// ─── RECIPE LIST ───
function RecipeList({RECIPES,customKeys,onEdit,onNew,onDelete,isOwner}){
  const [filter,setFilter]=useState("ALL");
  const cats=["ALL",...RECIPE_CATS];
  const filtered=Object.entries(RECIPES).filter(([,r])=>filter==="ALL"||r.cat===filter);
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div><div className="mgr-page-title">Recipe Manager</div><div className="mgr-page-sub">{Object.keys(RECIPES).length} recipes · {customKeys.length} custom</div></div>
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
                  onClick={e=>{e.stopPropagation();if(confirm(`Delete "${r.label}"?`))onDelete(key);}}
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
function RecipeEditor({recipeKey,recipe,isCustom,ING,onSave,onDelete,onCancel}){
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
        <div><div className="mgr-page-title">{recipeKey&&recipeKey!=="new"?"Edit Recipe":"New Recipe"}</div>{!isCustom&&recipeKey&&<div style={{fontSize:12,color:"#94A3B8"}}>Built-in — changes save as an override</div>}</div>
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
          {onDelete&&<button className="btn btn-danger btn-sm" onClick={()=>{if(confirm("Delete this recipe?"))onDelete();}}>Delete</button>}
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!label}>Save Recipe</button>
        </div>
      </div>
    </div>
  );
}

// ─── INGREDIENT MANAGER (with inline editing) ───
function IngredientManager({ING,customKeys,onSave,onUpdate,onDelete,isOwner}){
  const [filter,setFilter]=useState("ALL");
  const [adding,setAdding]=useState(false);
  const [editingName,setEditingName]=useState(null); // name of ingredient being edited
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
        <div><div className="mgr-page-title">Ingredient Library</div><div className="mgr-page-sub">{Object.keys(ING).length} ingredients · {customKeys.length} custom (editable)</div></div>
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
                        {isOwner&&<button className="btn btn-danger btn-sm" style={{padding:"3px 8px",fontSize:11}} onClick={()=>{if(confirm(`Delete "${name}"?`))onDelete(name);}}>Delete</button>}
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

// ─── MGR SETTINGS ───
function DevSettings({currentPin,currentOwnerPin,onSave,onSaveOwner,isOwner}){
  const [pin,setPin]=useState(""); const [confirm2,setConfirm2]=useState(""); const [msg,setMsg]=useState("");
  const [opin,setOpin]=useState(""); const [oconfirm,setOconfirm]=useState(""); const [omsg,setOmsg]=useState("");
  const handle=()=>{if(pin.length<3){setMsg("PIN must be at least 3 characters");return;}if(pin!==confirm2){setMsg("PINs don't match");return;}onSave(pin);setMsg("PIN updated!");setPin("");setConfirm2("");setTimeout(()=>setMsg(""),2500);};
  const handleOwner=()=>{if(opin.length<3){setOmsg("PIN must be at least 3 characters");return;}if(opin!==oconfirm){setOmsg("PINs don't match");return;}onSaveOwner(opin);setOmsg("Owner PIN updated!");setOpin("");setOconfirm("");setTimeout(()=>setOmsg(""),2500);};
  return(
    <div>
      <div className="mgr-page-title" style={{marginBottom:3}}>Settings</div>
      <div className="mgr-page-sub" style={{marginBottom:18}}>Manage manager access and configuration</div>
      <div className="settings-card">
        <div style={{fontSize:15,fontWeight:700,marginBottom:5}}>Change Manager PIN</div>
        <div style={{fontSize:12,color:"var(--muted)",marginBottom:16}}>Current PIN is hidden. Enter a new PIN to replace it.</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div className="fg"><label className="flabel">New PIN</label><input className="finput" type="password" placeholder="Min 3 characters" value={pin} onChange={e=>setPin(e.target.value)}/></div>
          <div className="fg"><label className="flabel">Confirm PIN</label><input className="finput" type="password" placeholder="Repeat PIN" value={confirm2} onChange={e=>setConfirm2(e.target.value)}/></div>
        </div>
        {msg&&<div style={{fontSize:12,marginTop:8,color:msg.includes("PIN updated")?"var(--green)":"var(--red)"}}>{msg}</div>}
        <div style={{marginTop:14}}><button className="btn btn-primary" onClick={handle} disabled={!pin||!confirm2}>Update PIN</button></div>
      </div>
      {isOwner&&(
        <div className="settings-card" style={{marginTop:14}}>
          <div style={{fontSize:15,fontWeight:700,marginBottom:5}}>Owner PIN <span style={{fontSize:11,fontWeight:400,color:"var(--muted)"}}>— full access including delete</span></div>
          <div style={{fontSize:12,color:"var(--muted)",marginBottom:16}}>Only the Owner PIN can delete built-in recipes and ingredients. Keep this separate from the Manager PIN.</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div className="fg"><label className="flabel">New Owner PIN</label><input className="finput" type="password" placeholder="Min 3 characters" value={opin} onChange={e=>setOpin(e.target.value)}/></div>
            <div className="fg"><label className="flabel">Confirm Owner PIN</label><input className="finput" type="password" placeholder="Repeat PIN" value={oconfirm} onChange={e=>setOconfirm(e.target.value)}/></div>
          </div>
          {omsg&&<div style={{fontSize:12,marginTop:8,color:omsg.includes("updated")?"var(--green)":"var(--red)"}}>{omsg}</div>}
          <div style={{marginTop:14}}><button className="btn btn-primary" onClick={handleOwner} disabled={!opin||!oconfirm}>Update Owner PIN</button></div>
        </div>
      )}
      <div className="settings-card" style={{marginTop:14}}>
        <div style={{fontSize:15,fontWeight:700,marginBottom:8}}>About</div>
        <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.6}}>
          Border Grill Truck + Catering — Prep Management System<br/>
          Default PIN: <strong>1234</strong> (change above)<br/>
          Built-in ingredients can be edited but not deleted.<br/>
          New ingredients and recipes you add are stored permanently.<br/>
          All auto-calculated quantities round up to the nearest whole number.
        </div>
      </div>
    </div>
  );
}
