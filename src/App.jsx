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

const STICKER={
  orange:{bar:"#E09A78",dot:"#C47652",soft:"#FBF0EA",ink:"#7A4530"},
  red:   {bar:"#D98080",dot:"#BF5C5C",soft:"#FBEDEC",ink:"#7A3030"},
  blue:  {bar:"#7AAFD4",dot:"#5590BB",soft:"#EAF3FA",ink:"#2D5A7A"},
  green: {bar:"#7AB87A",dot:"#5A9A5A",soft:"#EAF4EA",ink:"#2D5A2D"},
  pink:  {bar:"#E0A0BC",dot:"#C47898",soft:"#FBEFF4",ink:"#7A3A54"},
  yellow:{bar:"#E0C070",dot:"#C4A040",soft:"#FBF6E4",ink:"#7A5C10"},
  purple:{bar:"#A888CC",dot:"#8A64B0",soft:"#F3EDF9",ink:"#4A3066"},
  navy:  {bar:"#7090B8",dot:"#4E6E9A",soft:"#EAF0F8",ink:"#2A3E5A"},
};
const STICKER_KEYS=["orange","red","blue","green","pink","yellow","purple","navy"];
const getStickerKey=ev=>ev.color&&STICKER[ev.color]?ev.color:"orange";
const getSticker=ev=>STICKER[getStickerKey(ev)];


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
  "Pickled Onions":           {unit:"pt",     opU:16, group:"VEGETABLES", container:"pint",       notes:""},
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
  {name:"Orange",hex:"orange"},{name:"Red",hex:"red"},{name:"Blue",hex:"blue"},
  {name:"Green",hex:"green"},{name:"Pink",hex:"pink"},{name:"Yellow",hex:"yellow"},
  {name:"Purple",hex:"purple"},{name:"Navy",hex:"navy"},
];
function uid() { return Math.random().toString(36).slice(2,10); }

// ─── STYLES ───
const CSS = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=Fraunces:ital,opsz,wght@1,9..144,400&display=swap');


*{box-sizing:border-box;margin:0;padding:0;}
:root{
  --clay-50:#FBEFE8;--clay-100:#F5D6C5;--clay-200:#ECB69B;--clay-400:#D26A3D;--clay-500:#C0532A;--clay-600:#A14323;--clay-700:#80341C;--clay-800:#5C2514;
  --sol-50:#FEF6DC;--sol-100:#FCE8A4;--sol-300:#F2C53A;--sol-400:#E5B021;--sol-600:#9C7212;--sol-700:#6E500B;
  --turquesa-300:#3FC2B7;--turquesa-500:#0E8A80;--turquesa-700:#074C46;
  --cactus-50:#E5F2DA;--cactus-100:#C5E1AC;--cactus-400:#519328;--cactus-500:#3F7820;--cactus-700:#213F12;
  --masa-50:#FBF7EF;--masa-100:#F5EEDF;--masa-200:#ECE2CC;--masa-300:#DDD0B3;
  --carbon-50:#6B5A4E;--carbon-200:#3F3229;--carbon-300:#2B1810;
  --carbon-08:rgba(43,24,16,.08);--carbon-12:rgba(43,24,16,.12);--carbon-20:rgba(43,24,16,.20);
  --surface-nav:#EDE5D2;--surface-sidebar:#F6F1E8;--surface-feed:#FFFFFF;--dev-sidebar:#F2F0EA;
  --font-body:'DM Sans','Helvetica Neue',system-ui,sans-serif;
  --font-serif:'Fraunces','Georgia',serif;
  /* Legacy aliases */
  --bg:#F5F2EC;--card:#FFFFFF;--nav:var(--surface-nav);
  --accent:var(--clay-500);--accent-dk:var(--clay-600);--accent-lt:var(--clay-50);
  --text:var(--carbon-300);--text2:var(--carbon-200);--muted:var(--carbon-50);
  --border:var(--carbon-08);--border2:var(--carbon-12);
  --green:var(--cactus-500);--green-bg:var(--cactus-50);
  --amber:var(--sol-600);--amber-bg:var(--sol-50);
  --red:#C42B2B;--red-bg:#FEECEC;
  --shadow:0 1px 3px rgba(43,24,16,.06),0 4px 12px rgba(43,24,16,.04);
  --shadow-md:0 2px 8px rgba(43,24,16,.08),0 8px 24px rgba(43,24,16,.06);
  --mgr:var(--surface-nav);--mgr-accent:var(--clay-500);
  --teal:var(--turquesa-500);--purple:#5B3FA6;
}
html{overflow-x:auto;}
body{font-family:'DM Sans','Helvetica Neue',system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;min-width:1000px;overflow-x:auto;}
h1,h2,h3,h4{font-family:'Aptos Display','Aptos','Segoe UI',system-ui,-apple-system,sans-serif;font-weight:800;}
input,select,button,textarea{font-family:inherit;}

/* LOGO */
.bg-logo{display:flex;flex-direction:column;align-items:flex-start;line-height:1;cursor:pointer;}
.bg-logo-text{font-family:'Aptos Display','Aptos','Segoe UI',system-ui,sans-serif;font-weight:800;font-size:16px;color:var(--text);letter-spacing:.18em;text-transform:uppercase;}
.bg-logo-text::after{display:none;}
.bg-logo-sub{font-size:8px;color:var(--muted);letter-spacing:.12em;text-transform:uppercase;margin-top:2px;}
.bg-logo-dev .bg-logo-text{color:var(--text);}
.bg-logo-dev .bg-logo-text::after{background:rgba(196,80,42,.15);}
.bg-logo-dev .bg-logo-sub{color:var(--muted);}

/* NAV */
.nav{height:54px;padding:0 20px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:90;}
.nav-staff{background:#FFFFFF;border-bottom:1px solid #EDE9E2;}
.nav-mgr{background:#F8F7F5;border-bottom:2px solid var(--accent);}
.nav-mgr .nbtn-ghost{background:rgba(0,0,0,.05);color:var(--text2);border:1px solid var(--border);}
.nav-mgr .nbtn-ghost:hover{background:rgba(0,0,0,.09);color:var(--text);}
.nav-mgr .nbtn-accent{background:var(--accent);color:#fff;}
.nav-mgr .gear-btn{background:rgba(0,0,0,.05);border:1px solid var(--border);color:var(--text2);width:32px;height:32px;border-radius:7px;cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;transition:all .15s;font-weight:600;}
.nav-mgr .gear-btn:hover{background:var(--bg);color:var(--accent);border-color:var(--accent);}
.nav-mgr .bg-name{color:var(--text) !important;}
.nav-mgr .bg-sub{color:var(--muted) !important;}
.nav-right{display:flex;gap:8px;align-items:center;}
.nav-page-btn{font-size:12px;font-weight:600;padding:6px 13px;border-radius:7px;border:1px solid var(--border);background:transparent;color:var(--text2);cursor:pointer;transition:all .15s;}
.nav-page-btn:hover{background:var(--bg);color:var(--text);border-color:var(--border2);}
.nav-page-btn.active{background:var(--accent-lt);color:var(--accent);border-color:rgba(196,80,42,.3);font-weight:700;}
.nbtn{font-size:12px;font-weight:600;padding:6px 13px;border-radius:7px;border:none;cursor:pointer;transition:all .15s;}
.nbtn-ghost{background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.15);}
.nbtn-ghost:hover{background:rgba(255,255,255,.18);}
.nbtn-accent{background:var(--accent);color:#fff;}
.nbtn-accent:hover{background:#b34817;}
.nbtn-mgr{background:var(--accent);color:#fff;font-weight:700;}
.nbtn-dev:hover{background:#E8813A;}
.nbtn-mgrgh{background:rgba(196,80,42,.1);color:var(--accent);border:1px solid rgba(196,80,42,.25);}
.nbtn-devghost:hover{background:rgba(196,80,42,.22);}
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
.btn-dev:hover{background:#E8813A;}
.btn-mgrgh{background:transparent;color:var(--accent);border:1px solid rgba(196,80,42,.3);}
.btn-devghost:hover{background:rgba(196,80,42,.1);}
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
.card-menu-wrap{position:relative;z-index:100;display:inline-flex;}
.card-menu-btn{background:transparent;border:none;cursor:pointer;width:26px;height:26px;border-radius:5px;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:16px;transition:all .12s;line-height:1;}
.card-menu-btn:hover{background:var(--carbon-08);color:var(--carbon-300);}
.card-menu-dropdown{position:absolute;right:0;top:100%;background:#FFFFFF;border:1px solid #D4CCC2;border-radius:9px;z-index:9999;box-shadow:0 4px 6px rgba(0,0,0,.08),0 12px 32px rgba(0,0,0,.16);min-width:160px;overflow:hidden;}
.card-menu-item{display:flex;align-items:center;gap:8px;padding:9px 14px;font-size:13px;font-weight:500;cursor:pointer;transition:background .12s;color:var(--text);border:none;background:none;width:100%;text-align:left;}
.card-menu-item:hover{background:var(--bg);}
.card-menu-item.danger{color:var(--red,#DC2626);}
.card-menu-item.danger:hover{background:var(--red-bg,#FEECEC);}
.card-menu-divider{height:1px;background:var(--border);margin:3px 0;}

/* PAST EVENTS PAGE */
/* ── CALENDAR ── */
.cal-wrap{padding:0;}
.cal-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px;}
.cal-title-week{font-size:11px;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px;}
.cal-title{font-size:32px;font-weight:800;letter-spacing:-.02em;color:var(--text);line-height:1;}
.cal-nav{display:flex;align-items:center;gap:8px;}
.cal-nav-btn{width:34px;height:34px;border-radius:7px;border:1px solid var(--border);background:var(--card);color:var(--text2);cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all .15s;}
.cal-nav-btn:hover{border-color:var(--accent);color:var(--accent);}
.cal-today-btn{padding:7px 16px;border-radius:7px;border:1px solid var(--border);background:var(--card);color:var(--text2);cursor:pointer;font-size:12px;font-weight:600;transition:all .15s;}
.cal-today-btn:hover{border-color:var(--accent);color:var(--accent);}
.cal-view-toggle{display:flex;gap:3px;background:var(--card2);border:1px solid var(--border);border-radius:8px;padding:3px;}
.cal-view-btn{padding:5px 12px;border-radius:6px;border:none;background:transparent;color:var(--muted);font-size:11px;font-weight:600;cursor:pointer;transition:all .15s;}
.cal-view-btn.active{background:var(--card);color:var(--text);box-shadow:0 1px 3px rgba(0,0,0,.08);}

/* WEEK VIEW */
.cal-week-grid{display:grid;grid-template-columns:repeat(7,1fr);border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--card);}
.cal-day-header{padding:10px 12px;border-bottom:1px solid var(--border);border-right:1px solid var(--border);background:var(--card2);}
.cal-day-header:last-child{border-right:none;}
.cal-day-dow{font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:3px;}
.cal-day-num{font-size:24px;font-weight:800;color:var(--text);line-height:1;}
.cal-day-today .cal-day-num{color:var(--accent);}
.cal-day-today{background:var(--accent-lt);}
.cal-day-cell{padding:8px;border-right:1px solid var(--border);min-height:140px;vertical-align:top;}
.cal-day-cell:last-child{border-right:none;}
.cal-ev-chip{border-radius:6px;padding:6px 8px;margin-bottom:5px;cursor:pointer;transition:all .15s;border:1px solid rgba(0,0,0,.06);}
.cal-ev-chip:hover{transform:translateY(-1px);box-shadow:0 2px 8px rgba(0,0,0,.12);}
.cal-ev-time{font-size:9px;font-weight:700;letter-spacing:.04em;margin-bottom:2px;opacity:.85;}
.cal-ev-name{font-size:11px;font-weight:700;line-height:1.2;margin-bottom:3px;}
.cal-ev-guests{font-size:10px;opacity:.75;margin-bottom:4px;}
.cal-ev-status{font-size:9px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;display:inline-block;padding:2px 8px;border-radius:20px;}

/* MONTH VIEW */
.cal-month-grid{display:grid;grid-template-columns:repeat(7,1fr);border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--card);}
.cal-month-dow{padding:8px 10px;background:var(--card2);font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid var(--border);border-right:1px solid var(--border);text-align:center;}
.cal-month-dow:last-child{border-right:none;}
.cal-month-cell{padding:6px;min-height:90px;border-right:1px solid var(--border);border-bottom:1px solid var(--border);vertical-align:top;}
.cal-month-cell:nth-child(7n){border-right:none;}
.cal-month-cell.other-month{background:var(--card2);opacity:.5;}
.cal-month-cell.today{background:var(--accent-lt);}
.cal-month-date{font-size:12px;font-weight:700;color:var(--text);margin-bottom:4px;}
.cal-month-cell.today .cal-month-date{color:var(--accent);}
.cal-month-chip{border-radius:4px;padding:2px 6px;margin-bottom:2px;cursor:pointer;font-size:10px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:all .12s;}
.cal-month-chip:hover{opacity:.85;}

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
.mgr-layout{display:grid;grid-template-columns:280px 1fr;gap:0;min-height:calc(100vh - 54px);min-width:1000px;}
.mgr-sidebar{background:#F8F7F5;padding:24px 0;border-right:1px solid #E0D8CE;}
.mgr-nav-item{display:flex;align-items:center;padding:11px 20px;cursor:pointer;font-size:13px;font-weight:500;color:#4B5563;transition:all .13s;border-bottom:2px solid transparent;letter-spacing:.01em;}
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
.guide-section{margin-bottom:28px;}
.guide-section-title{font-family:'Aptos Display','Aptos','Aptos Display',system-ui,sans-serif;font-size:16px;font-weight:800;color:var(--text);margin-bottom:4px;padding-bottom:8px;border-bottom:2px solid var(--accent);}
.guide-intro{font-size:13px;color:var(--muted);margin-bottom:16px;line-height:1.6;}
.guide-card{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:18px 20px;margin-bottom:12px;}
.guide-card-title{font-size:13px;font-weight:700;color:var(--text);margin-bottom:8px;display:flex;align-items:center;gap:7px;}
.guide-card-title-badge{font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;background:var(--accent-lt);color:var(--accent);text-transform:uppercase;letter-spacing:.06em;}
.guide-steps{display:flex;flex-direction:column;gap:8px;}
.guide-step{display:flex;gap:12px;align-items:flex-start;}
.guide-step-num{width:22px;height:22px;border-radius:50%;background:var(--accent);color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;}
.guide-step-text{font-size:13px;color:var(--text2);line-height:1.5;}
.guide-step-text strong{color:var(--text);font-weight:700;}
.guide-table{width:100%;border-collapse:collapse;margin-top:10px;}
.guide-table th{background:var(--card2);padding:7px 12px;text-align:left;font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid var(--border);}
.guide-table td{padding:8px 12px;border-bottom:1px solid var(--border);font-size:12px;vertical-align:top;}
.guide-table tr:last-child td{border-bottom:none;}
.guide-table td:first-child{font-weight:600;color:var(--text);white-space:nowrap;}
.guide-note{background:var(--amber-bg);border:1px solid #F0B429;border-radius:8px;padding:10px 14px;font-size:12px;color:var(--amber);margin-top:12px;line-height:1.5;}
.guide-tip{background:var(--green-bg);border:1px solid #9FDFBC;border-radius:8px;padding:10px 14px;font-size:12px;color:var(--green);margin-top:12px;line-height:1.5;}

/* ── PRINT STYLES ── */
@media print {
  @page{size:letter portrait;margin:0.4in 0.45in;}
  *{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;}

  /* ── HIDE UI ── */
  .nav-new,.ctx-rail,.ps-notes-banner,.ps-menu-bar,.wiz-layout,.cockpit,
  .cockpit-sidebar,.modal-overlay,.print-modal-overlay,.btn,.rmv,
  .ps-hdr-card,.ps-stat-ribbon{
    display:none !important;
  }
  /* Show print-specific content */
  .prep-print-only{display:block !important;}
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}
  .wrap{padding:0;max-width:100%;}
  body{background:#fff;}
  *{font-variant-ligatures:none !important;font-feature-settings:"liga" 0,"kern" 0 !important;}
  input[type=time]::-webkit-calendar-picker-indicator{display:none !important;}
  input[type=time]::-webkit-inner-spin-button{display:none !important;}

  /* ── PRINT TIMESTAMP ── */
  .print-timestamp{display:block !important;font-size:8px;color:#9CA3AF;text-align:right;margin-top:4px;}

  /* ── PRINT HEADER ── */
  .print-header{display:flex !important;align-items:flex-start;justify-content:space-between;
    padding-bottom:8px;border-bottom:2px solid #1A1714;margin-bottom:8px;}
  .print-logo-wrap{display:flex;align-items:center;gap:9px;}
  .print-logo-mark{width:30px;height:30px;border-radius:50%;background:#1A1714;
    display:flex;align-items:center;justify-content:center;color:#fff;
    font-size:11px;font-weight:800;letter-spacing:.02em;flex-shrink:0;}
  .print-logo-text{font-family:'Aptos Display','Aptos','Segoe UI',system-ui,sans-serif;
    font-weight:800;font-size:18px;letter-spacing:.18em;color:#1A1714;text-transform:uppercase;line-height:1.1;}
  .print-logo-sub{font-size:7.5px;letter-spacing:.12em;color:#7A736C;text-transform:uppercase;margin-top:1px;}
  .print-event-right{text-align:right;}
  .print-event-title{font-size:18px;font-weight:800;color:#1A1714;}
  .print-event-meta{font-size:11px;color:#7A736C;margin-top:3px;}

  /* ── META ROW ── */
  .print-meta-row{display:flex;border:1px solid #D1CBC4;border-radius:4px;margin-bottom:9px;overflow:hidden;}
  .print-meta-cell{flex:1;padding:5px 10px;border-right:1px solid #D1CBC4;}
  .print-meta-cell:last-child{border-right:none;}
  .print-meta-lbl{font-size:7.5px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#9CA3AF;margin-bottom:2px;}
  .print-meta-val{font-size:10px;font-weight:700;color:#1A1714;border-bottom:1px solid #D1CBC4;padding-bottom:2px;min-height:14px;}

  /* ── NOTES BOX ── */
  .print-notes-box{background:#FFFBEB !important;border:2px solid #F59E0B;
    border-radius:4px;padding:7px 12px;margin-bottom:9px;}
  .print-notes-lbl{font-size:8px;font-weight:700;text-transform:uppercase;
    letter-spacing:.08em;color:#92400E;margin-bottom:4px;}
  .print-notes-txt{font-size:10px;color:#1A1208;line-height:1.5;}

  /* ── PREP LIST (ps-cat / items-tbl) ── */
  .ps-cat-section{box-shadow:none !important;border:1px solid #E5E7EB;margin-bottom:6px;}
  .ps-cat-hdr{padding:5px 12px !important;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .ps-cat-arr{display:none !important;}
  .items-wrap{display:block !important;}
  .items-tbl{table-layout:fixed !important;width:100% !important;border-collapse:collapse;}
  .items-tbl th{background:#F3F4F6 !important;font-size:9px;padding:2px 4px;white-space:nowrap;
    overflow:hidden;text-overflow:ellipsis;border-bottom:1px solid #D1D5DB;}
  .items-tbl td{font-size:10px;padding:2px 4px;line-height:1.3;overflow:hidden;
    text-overflow:ellipsis;white-space:nowrap;border-bottom:1px solid #EDE9E4;}
  .items-tbl th:nth-child(1),.items-tbl td:nth-child(1){width:22%;}
  .items-tbl th:nth-child(2),.items-tbl td:nth-child(2){width:6%;}
  .items-tbl th:nth-child(3),.items-tbl td:nth-child(3){width:5%;}
  .items-tbl th:nth-child(4),.items-tbl td:nth-child(4){width:4%;}
  .items-tbl th:nth-child(5),.items-tbl td:nth-child(5){width:31%;}
  .items-tbl th:nth-child(6),.items-tbl td:nth-child(6){width:11%;}
  .items-tbl th:nth-child(7),.items-tbl td:nth-child(7){width:9%;}
  .items-tbl th:nth-child(8),.items-tbl td:nth-child(8){width:9%;}
  .items-tbl th:nth-child(9),.items-tbl td:nth-child(9){display:none !important;}
  .ci{border:none !important;background:transparent !important;padding:0 !important;
    font-size:10px !important;width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .ci-prepped{color:#065F46 !important;font-weight:700 !important;}
  .iname{font-size:10px !important;font-weight:500;}

  /* ── SIGNATURES ── */
  .print-sigs{display:flex !important;gap:20px;margin-top:8px;padding-top:8px;border-top:1px solid #D1D5DB;}
  .print-sig{flex:1;}
  .print-sig-name{font-size:10px;font-weight:600;color:#374151;margin-top:5px;}
  .print-sig-line{border-bottom:1px solid #374151;margin-top:36px;}
  .print-sig-lbl{font-size:8px;color:#7A736C;text-transform:uppercase;letter-spacing:.07em;margin-top:3px;}

  /* ══ PRINT MODE: PREP ONLY ══ */
  [data-pmode="prep"] .perdish-print{display:none !important;}

  /* ══ PRINT MODE: PERDISH ONLY ══ */
  [data-pmode="perdish"] .ps-cat-section{display:none !important;}
  [data-pmode="perdish"] .print-sigs{display:none !important;}
  [data-pmode="perdish"] .perdish-print{display:block !important;}
  [data-pmode="perdish"] .print-timestamp:not(.perdish-own-timestamp){display:none !important;}
  [data-pmode="perdish"] .prep-print-only{display:none !important;}

  /* ══ PRINT MODE: BOTH ══ */
  [data-pmode="both"] .perdish-print{display:block !important;}

  /* ── PER DISH SECTION ── */
  [data-pmode="both"] .perdish-print{page-break-before:always !important;break-before:page !important;}
  [data-pmode="perdish"] .perdish-print{page-break-before:auto !important;break-before:auto !important;}
  .perdish-print{margin-top:0;}
  .perdish-own-header{display:none;}
  .perdish-own-timestamp{display:none;}
  .perdish-print .perdish-own-header{display:flex !important;}
  .perdish-print .perdish-own-timestamp{display:block !important;}
  .perdish-section-title{font-size:11px;font-weight:800;margin-bottom:8px;
    padding-bottom:5px;border-bottom:2px solid #1A1714;text-transform:uppercase;letter-spacing:.08em;}

  /* Two-column layout */
  .perdish-grid{-webkit-columns:2;columns:2;-webkit-column-gap:12px;column-gap:12px;}
  .perdish-dish{break-inside:avoid;page-break-inside:avoid;display:inline-block;
    width:100%;margin-bottom:10px;vertical-align:top;}

  /* Dish header */
  .perdish-dish-hdr{display:table !important;width:100%;
    -webkit-print-color-adjust:exact;print-color-adjust:exact;
    padding:5px 9px;border-radius:3px 3px 0 0;}
  .perdish-dish-name{display:table-cell;font-weight:800;font-size:10px;
    color:#fff;letter-spacing:.04em;vertical-align:middle;}
  .perdish-dish-qty{display:table-cell;text-align:right;font-size:9px;
    color:rgba(255,255,255,.8);vertical-align:middle;white-space:nowrap;padding-left:8px;}

  /* Dish table */
  .perdish-tbl{width:100%;border-collapse:collapse;border:1px solid #D1D5DB;border-top:none;border-radius:0 0 3px 3px;}
  .perdish-tbl thead tr{background:#F3F4F6 !important;-webkit-print-color-adjust:exact;}
  .perdish-tbl th{padding:3px 6px;font-size:9px;font-weight:700;text-transform:uppercase;
    letter-spacing:.05em;color:#6B7280;border-bottom:1px solid #D1D5DB;text-align:left;}
  .perdish-tbl td{padding:3px 6px;border-bottom:1px solid #E5E7EB;font-size:12px;line-height:1.5;}
  .perdish-tbl tr:last-child td{border-bottom:none;}
  .pd-name{font-weight:500;width:32%;}
  .pd-qty{font-weight:800;color:#1A1714;width:10%;text-align:right;}
  .perdish-tbl th.pd-qty{text-align:right;}
  .pd-unit{color:#6B7280;width:8%;padding-left:4px;}
  .pd-cont{color:#6B7280;width:20%;font-size:9px;}
  .pd-note{color:#6B7280;width:30%;font-size:9px;font-style:italic;}
}

@media screen {
  .print-header{display:none;}
  .perdish-own-header{display:none;}
  .print-sigs{display:none;}
  .perdish-print{display:none;}
  .print-timestamp{display:none;}
  .perdish-own-timestamp{display:none;}
  .prep-print-only{display:none;}
}

/* ── NEW NAV ── */
.nav-new{height:52px;padding:0 28px;display:flex;align-items:center;justify-content:space-between;background:var(--surface-nav);border-bottom:1px solid var(--carbon-08);position:sticky;top:0;z-index:90;flex:none;min-width:1000px;white-space:nowrap;}
.logo-new{display:inline-flex;align-items:center;gap:12px;cursor:pointer;flex-shrink:0;white-space:nowrap;}
.logo-mark-new{width:32px;height:32px;border-radius:50%;background:var(--clay-500);display:flex;align-items:center;justify-content:center;flex:none;color:#FBF7EF;font-size:13px;font-weight:800;letter-spacing:.02em;}
.logo-text-new{font-size:16px;font-weight:800;letter-spacing:.06em;color:var(--clay-500);line-height:1;}
.logo-sub-new{font-size:9px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--carbon-50);margin-top:3px;}
.nav-items-new{display:flex;gap:2px;align-items:center;flex-shrink:0;white-space:nowrap;}
.nav-item-new{font-size:13px;font-weight:500;color:var(--carbon-50);padding:6px 14px;border-radius:6px;cursor:pointer;border:none;background:none;transition:all .15s;letter-spacing:.01em;display:flex;flex-direction:column;align-items:center;}
.nav-item-new:hover{color:var(--carbon-300);background:rgba(43,24,16,.05);}
.nav-item-new.on{color:var(--carbon-300);font-weight:700;}
.nav-item-new.on::after{content:'';display:block;height:2px;width:100%;background:var(--clay-500);border-radius:99px;margin-top:3px;}
.nav-right-new{display:flex;gap:10px;align-items:center;flex-shrink:0;white-space:nowrap;}
.sync-pill{padding:5px 12px;border:1px solid var(--carbon-08);border-radius:99px;font-size:11px;color:var(--carbon-50);display:flex;align-items:center;gap:7px;white-space:nowrap;}
.sync-dot{width:6px;height:6px;border-radius:99px;background:var(--cactus-400);flex-shrink:0;}
.gear-new{width:32px;height:32px;border-radius:8px;border:1px solid var(--carbon-12);background:transparent;color:var(--carbon-50);font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;}
.gear-new:hover{background:rgba(43,24,16,.06);color:var(--carbon-300);}
.avatar-new{width:32px;height:32px;border-radius:99px;background:var(--clay-500);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;}
.dev-tag{padding:3px 8px;border-radius:4px;background:var(--carbon-300);color:var(--sol-300);font-size:9px;font-weight:800;letter-spacing:.15em;}

/* ── DASHBOARD COCKPIT ── */
.cockpit{display:flex;flex-direction:row;min-height:calc(100vh - 52px);width:100%;min-width:1000px;}
.cockpit-sidebar{background:var(--surface-sidebar);padding:20px 12px;border-right:1px solid var(--carbon-08);display:flex;flex-direction:column;gap:12px;width:280px;min-width:280px;max-width:280px;flex-shrink:0;align-items:stretch;justify-content:flex-start;position:sticky;top:52px;height:calc(100vh - 52px);overflow-y:auto;overscroll-behavior:contain;}
.cockpit-feed{background:var(--surface-feed);padding:24px 30px;display:flex;flex-direction:column;flex:1;min-width:0;overflow:visible;}
.greeting-eyebrow{font-size:11px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--clay-500);}
.greeting-head{font-size:38px;font-weight:700;letter-spacing:-.02em;line-height:.95;color:var(--carbon-300);margin-top:6px;}
.greeting-accent{font-family:var(--font-serif);font-style:italic;font-weight:400;color:var(--clay-500);}
.kpi-tile{background:#fff;border:1px solid var(--carbon-08);border-radius:8px;padding:10px 12px;position:relative;overflow:hidden;flex-shrink:0;}
.kpi-tile-bar{position:absolute;left:0;top:0;bottom:0;width:4px;}
.kpi-tile-inner{padding-left:10px;display:flex;justify-content:space-between;align-items:center;gap:10px;}
.kpi-label{font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--carbon-50);white-space:nowrap;}
.kpi-sub{font-size:10px;color:var(--carbon-50);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.kpi-value{font-size:22px;font-weight:700;letter-spacing:-.02em;line-height:1;color:var(--carbon-300);}
.sidebar-quote{margin-top:auto;font-size:11px;color:var(--carbon-50);font-family:var(--font-serif);font-style:italic;line-height:1.5;}
.feed-filter-bar{display:flex;align-items:center;gap:10px;margin-bottom:18px;flex-wrap:wrap;}
.feed-search-wrap{position:relative;flex:1;min-width:180px;}
.feed-search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:14px;color:var(--carbon-50);}
.feed-search{width:100%;padding:10px 14px 10px 34px;border:1px solid var(--carbon-20);border-radius:8px;background:#fff;font-size:13px;font-family:var(--font-body);color:var(--carbon-300);outline:none;}
.feed-search:focus{border-color:var(--clay-500);}
.filter-pill{padding:7px 14px;font-size:11px;font-weight:600;border-radius:8px;border:1px solid var(--carbon-20);background:transparent;color:var(--carbon-300);cursor:pointer;transition:all .15s;}
.filter-pill:hover{border-color:var(--clay-500);color:var(--clay-500);}
.filter-pill.on{background:var(--clay-500);color:#fff;border-color:var(--clay-500);}
.upnext-card{border-radius:12px;padding:18px 22px;margin-bottom:14px;}
.upnext-grid{display:grid;grid-template-columns:120px 2fr 1fr 1fr 130px;gap:24px;align-items:center;}
.upnext-date-col{text-align:center;padding-right:14px;}
.ledger{background:#fff;border:1px solid var(--carbon-08);border-radius:10px;overflow:visible;flex:1;}
.ledger-head{display:grid;grid-template-columns:14px 90px minmax(140px,2fr) minmax(80px,1.3fr) 70px 140px 90px 100px 50px;column-gap:18px;padding:10px 22px;background:var(--masa-100);font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--carbon-50);}
.ledger-row{display:grid;grid-template-columns:14px 90px minmax(140px,2fr) minmax(80px,1.3fr) 70px 140px 90px 100px 50px;column-gap:18px;padding:13px 22px;border-top:1px solid var(--carbon-08);align-items:center;font-size:13px;cursor:pointer;transition:background .12s;}
@media(max-width:1150px){
  .ledger-head,.ledger-row{grid-template-columns:14px 90px minmax(140px,2fr) minmax(80px,1fr) 70px 50px !important;}
  .ledger-col-prep,.ledger-col-until,.ledger-col-status{display:none !important;}
}
.ledger-row:hover{background:var(--masa-50);}
.s-pill{padding:3px 9px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;display:inline-block;}
.s-prep{background:var(--clay-50);color:var(--clay-700);}
.s-prepped{background:var(--cactus-50);color:var(--cactus-700);}
.s-load{background:var(--sol-100);color:var(--sol-700);}
.s-ret{background:var(--masa-100);color:var(--carbon-50);}
.s-pend{background:var(--masa-100);color:var(--carbon-50);}
@media print{.nav-new,.cockpit-sidebar{display:none;}}

.wiz-layout{display:flex;flex-direction:row;width:100%;min-width:1000px;height:calc(100vh - 52px);overflow:hidden;}
.wiz-rail{width:280px;min-width:280px;max-width:280px;background:var(--surface-sidebar);border-right:1px solid var(--carbon-08);padding:24px 22px;display:flex;flex-direction:column;gap:18px;flex-shrink:0;overflow-y:hidden;height:100%;}
.wiz-main{flex:1;min-width:0;padding:32px 40px;overflow-y:auto;}
.wiz-eyebrow{font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--clay-500);}
.wiz-heading{font-size:30px;font-weight:700;letter-spacing:-.02em;line-height:1;color:var(--carbon-300);margin-top:6px;}
.wiz-heading em{font-family:var(--font-serif);font-style:italic;font-weight:400;color:var(--clay-500);}
.step-rail{display:flex;flex-direction:column;gap:8px;}
.step-row{display:flex;align-items:flex-start;gap:12px;padding:10px 12px;border-radius:8px;}
.step-row.current{background:#fff;border:1px solid var(--carbon-08);}
.step-badge{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;margin-top:1px;}
.step-badge.done{background:var(--clay-500);color:#fff;}
.step-badge.active{background:var(--clay-500);color:#fff;}
.step-badge.upcoming{background:var(--masa-200);color:var(--carbon-50);}
.step-label{font-size:13px;font-weight:600;color:var(--carbon-300);line-height:1.2;}
.step-label.upcoming{color:var(--carbon-50);}
.step-sub{font-size:11px;color:var(--carbon-50);margin-top:2px;}
.wiz-footer{margin-top:auto;font-size:11px;font-family:var(--font-serif);font-style:italic;color:var(--carbon-50);line-height:1.5;}
.wiz-hdr{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:28px;}
.wiz-hdr-left{}
.wiz-step-eyebrow{font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--clay-500);margin-bottom:6px;}
.wiz-title{font-size:38px;font-weight:700;letter-spacing:-.02em;line-height:1;color:var(--carbon-300);}
.wiz-card{background:#fff;border:1px solid var(--carbon-08);border-radius:12px;padding:26px 28px;margin-bottom:16px;}
.field-label{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--carbon-50);margin-bottom:5px;}
.field{border:1px solid var(--carbon-12);border-radius:8px;padding:10px 12px;font-size:14px;font-family:var(--font-body);color:var(--carbon-300);background:#fff;outline:none;width:100%;transition:border-color .15s;}
.field:focus{border-color:var(--clay-500);}
.wiz-divider{height:1px;background:var(--carbon-08);border:none;margin:20px 0;}
.sticker-picker{display:flex;flex-wrap:wrap;gap:8px;}
.sticker-btn{padding:6px 12px;border-radius:20px;border:1.5px solid var(--carbon-08);background:transparent;cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;gap:7px;transition:all .15s;color:var(--carbon-300);}
.sticker-btn.selected{border-width:1.5px;}
.sticker-dot{width:16px;height:16px;border-radius:50%;flex-shrink:0;}
.wiz-action-bar{display:flex;align-items:center;justify-content:flex-end;gap:10px;padding-top:20px;border-top:1px solid var(--carbon-08);margin-top:4px;}
.wiz-action-bar-left{margin-right:auto;}
/* Review screen */
.review-meta-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;padding-top:14px;border-top:1px solid var(--carbon-08);margin-top:14px;}
.review-meta-label{font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--carbon-50);margin-bottom:4px;}
.review-meta-val{font-size:13px;font-weight:600;color:var(--carbon-300);}
.review-prep-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;}
.review-cat-card{border:1px solid var(--carbon-08);border-radius:8px;overflow:hidden;}
.review-cat-hdr{padding:8px 12px;font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#fff;}
.review-cat-row{padding:7px 12px;border-top:1px dashed var(--carbon-08);display:flex;justify-content:space-between;align-items:center;font-size:12px;}
.review-cat-row:first-of-type{border-top:none;}
.menu-pill{background:var(--masa-100);border-radius:20px;padding:5px 12px;font-size:12px;font-weight:600;color:var(--carbon-300);display:inline-flex;align-items:center;gap:6px;}
.menu-pill-count{background:#fff;border-radius:10px;padding:1px 8px;font-size:11px;font-weight:700;color:var(--carbon-200);}
.allergy-ack{background:var(--sol-50);border:1.5px solid var(--sol-400);border-radius:10px;padding:18px 20px;}
.allergy-icon{width:32px;height:32px;border-radius:50%;background:var(--sol-400);color:#fff;font-size:16px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;}


.ps-grid{display:flex;flex-direction:row;height:calc(100vh - 52px);min-width:1000px;overflow:hidden;}
.ctx-rail{width:280px;min-width:280px;max-width:280px;background:var(--surface-sidebar);border-right:1px solid var(--carbon-08);padding:24px 18px;display:flex;flex-direction:column;gap:16px;height:100%;overflow-y:auto;flex-shrink:0;overscroll-behavior:contain;}
.ps-work{flex:1;min-width:0;padding:24px 28px;overflow-y:auto;overscroll-behavior:contain;}
.ps-work>*{margin-bottom:14px;}.ps-work>*:last-child{margin-bottom:0;}
.rail-eyebrow{font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;margin-bottom:4px;}
.rail-event-name{font-size:20px;font-weight:700;letter-spacing:-.01em;line-height:1.1;color:var(--carbon-300);}
.rail-client{font-size:12px;font-family:var(--font-serif);font-style:italic;color:var(--carbon-50);margin-top:3px;}
.rail-progress-card{background:#fff;border:1px solid var(--carbon-08);border-radius:10px;padding:14px;}
.rail-progress-nums{font-size:28px;font-weight:700;letter-spacing:-.02em;color:var(--carbon-300);line-height:1;}
.rail-progress-denom{font-size:16px;font-weight:400;color:var(--carbon-50);}
.rail-progress-label{font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--carbon-50);margin-bottom:6px;}
.rail-progress-bar{height:5px;background:var(--carbon-08);border-radius:99px;overflow:hidden;margin:8px 0;}
.rail-progress-fill{height:100%;border-radius:99px;transition:width .3s;}
.rail-stat-row{display:flex;gap:12px;margin-top:6px;}
.rail-stat{font-size:11px;color:var(--carbon-50);}
.rail-stat strong{color:var(--carbon-300);font-weight:700;}
.rail-jump-title{font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--carbon-50);margin-bottom:8px;}
.rail-jump-item{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:7px;cursor:pointer;transition:background .12s;border:1px solid transparent;}
.rail-jump-item:hover{background:rgba(43,24,16,.05);}
.rail-jump-item.active{background:#fff;border-color:var(--carbon-08);box-shadow:0 1px 3px rgba(43,24,16,.06);}
.rail-jump-name{font-size:12px;font-weight:500;color:var(--carbon-300);flex:1;}
.rail-jump-count{font-size:10px;color:var(--carbon-50);white-space:nowrap;}
.rail-jump-bar{width:28px;height:3px;background:var(--carbon-08);border-radius:99px;overflow:hidden;}
.rail-jump-bar-fill{height:100%;border-radius:99px;}
.rail-btn{width:100%;padding:9px 14px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .15s;}
.rail-btn-ghost{background:transparent;border:1px solid var(--carbon-12);color:var(--carbon-200);}
.rail-btn-ghost:hover{background:rgba(43,24,16,.05);border-color:var(--carbon-20);}
.rail-btn-primary{background:var(--clay-500);border:none;color:#fff;}
.rail-btn-primary:hover{background:var(--clay-600);}
.rail-allergy{margin-top:auto;background:var(--sol-50);border:1.5px solid var(--sol-400);border-radius:8px;padding:10px 12px;cursor:pointer;}
.rail-allergy-icon{width:24px;height:24px;border-radius:50%;background:var(--sol-400);color:#fff;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.rail-allergy-text{font-size:11px;color:var(--sol-700);line-height:1.4;}
.ps-hdr-card{background:#fff;border:1px solid var(--carbon-08);border-radius:12px;overflow:hidden;box-shadow:var(--shadow);}
.ps-hdr-stripe{height:6px;}
.ps-hdr-body{padding:18px 22px;}
.ps-hdr-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px;}
.ps-event-eyebrow{font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;margin-bottom:4px;}
.ps-event-name{font-size:28px;font-weight:700;letter-spacing:-.02em;color:var(--carbon-300);line-height:1.1;}
.ps-event-meta{font-size:13px;font-family:var(--font-serif);font-style:italic;color:var(--carbon-50);margin-top:4px;}
.ps-stat-ribbon{display:flex;gap:0;border-top:1px solid var(--carbon-08);margin-top:14px;padding-top:14px;}
.ps-stat{flex:1;text-align:center;border-right:1px solid var(--carbon-08);padding:0 8px;}
.ps-stat:last-child{border-right:none;}
.ps-stat-val{font-size:22px;font-weight:700;letter-spacing:-.02em;color:var(--carbon-300);line-height:1;}
.ps-stat-lbl{font-size:9px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--carbon-50);margin-top:3px;}
.ps-meta-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;padding-top:14px;border-top:1px solid var(--carbon-08);margin-top:14px;}
.ps-meta-lbl{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--carbon-50);margin-bottom:3px;}
.ps-meta-inp{border:none;border-bottom:1px solid var(--carbon-08);background:transparent;font-size:12px;font-weight:600;color:var(--carbon-300);width:100%;outline:none;padding:2px 0;font-family:inherit;}
.ps-meta-inp:focus{border-color:var(--clay-500);}
.ps-notes-banner{background:#FFFBEB;border:2px solid var(--sol-400);border-radius:10px;padding:14px 18px;}
.ps-notes-eyebrow{font-size:9px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:var(--sol-700);margin-bottom:6px;}
.ps-notes-ta{width:100%;border:none;background:transparent;font-size:14px;font-family:var(--font-serif);font-style:italic;color:var(--carbon-300);outline:none;resize:none;line-height:1.6;}
.ps-notes-ta::placeholder{color:var(--sol-400);opacity:.7;}
.ps-menu-bar{background:var(--cactus-50);border:1px solid var(--cactus-100);border-radius:10px;padding:12px 16px;}
.ps-menu-eyebrow{font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--cactus-500);margin-bottom:8px;}
.ps-menu-chips{display:flex;flex-wrap:wrap;gap:6px;align-items:center;}
.ps-menu-chip{background:#fff;border:1px solid var(--cactus-100);border-radius:20px;padding:4px 10px;font-size:11px;font-weight:600;color:var(--cactus-700);}
.ps-cat-section{margin-bottom:10px;border-radius:10px;overflow:hidden;box-shadow:var(--shadow);}
.ps-cat-hdr{display:flex;align-items:center;gap:10px;padding:10px 16px;cursor:pointer;user-select:none;}
.ps-cat-num{font-size:11px;font-weight:700;color:rgba(255,255,255,.6);min-width:18px;}
.ps-cat-name{font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#fff;flex:1;}
.ps-cat-count{font-size:10px;color:rgba(255,255,255,.65);}
.ps-cat-arr{font-size:10px;color:rgba(255,255,255,.5);transition:transform .2s;}
.ps-cat-arr.open{transform:rotate(180deg);}
@media print{.ctx-rail{display:none;}.ps-grid{display:block;height:auto;overflow:visible;}.ps-work{padding:0;display:block;overflow:visible;}}

.prep-print-only{display:none;}

/* ── PRINT MODE: prep sheet ── */
@media print{
  .ps-hdr-stripe{display:none;}
  .ps-stat-ribbon .ps-stat{border-right:1px solid #E5E7EB;}
  .ps-hdr-body{padding:8px 12px;}
  .ps-event-name{font-size:20px;}
  .ps-cat-section{box-shadow:none;border:1px solid #E5E7EB;margin-bottom:6px;}
  .ps-cat-hdr{padding:5px 12px;}
  .ps-cat-arr{display:none;}
  .items-wrap{display:block !important;}
}
.screen-only{display:contents;}
.print-cat{margin-bottom:10px;page-break-inside:avoid;}
.print-cat-hdr{padding:5px 10px;font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#fff;}
.print-tbl{width:100%;border-collapse:collapse;font-size:9px;}
.print-tbl th{padding:4px 8px;text-align:left;font-size:8px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6B7280;border-bottom:1px solid #E5E7EB;background:#F9FAFB;}
.print-tbl td{padding:5px 8px;border-bottom:1px dashed #E5E7EB;vertical-align:top;}
.print-tbl tr:last-child td{border-bottom:none;}
.print-meta-row{display:flex;gap:0;border-bottom:1px solid #E5E7EB;margin-bottom:8px;padding-bottom:8px;}
.print-meta-cell{flex:1;padding-right:10px;}
.print-meta-lbl{font-size:7px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9CA3AF;margin-bottom:2px;}
.print-meta-val{font-size:10px;font-weight:700;color:#1A1714;}
.print-sig-row{display:flex;gap:20px;}
.print-sig-name{font-size:9px;font-weight:700;color:#374151;margin-bottom:10px;}`;


function StepRail({current}){
  const steps=[
    {n:"01",label:"Event details",sub:"Name, date, guests, sticker"},
    {n:"02",label:"Build menu",sub:"Pick dishes & covers"},
    {n:"03",label:"Review & generate",sub:"Confirm the prep sheet"},
  ];
  return(
    <div className="step-rail">
      {steps.map((s,i)=>{
        const state=i<current?"done":i===current?"active":"upcoming";
        return(
          <div key={i} className={`step-row ${state==="active"?"current":""}`}>
            <div className={`step-badge ${state}`}>{state==="done"?"✓":s.n}</div>
            <div>
              <div className={`step-label ${state==="upcoming"?"upcoming":""}`}>{s.label}</div>
              <div className="step-sub">{s.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


function ReviewScreen({event,selections,calcItems,ING,RECIPES,onGenerate,onSaveDraft,onEditDetails,onEditMenu,onCancel}){
  const [ackAllergy,setAckAllergy]=useState(false);
  const sc=getSticker(event);
  const fmtTime=t=>{if(!t)return"—";const[h,m]=t.split(":");const hr=parseInt(h,10);return`${hr%12||12}:${m}${hr>=12?"pm":"am"}`};
  const fmtDate=d=>d?new Date(d+"T00:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}):"—";
  const daysUntil=event.date?Math.round((new Date(event.date+"T00:00:00")-new Date())/(1000*60*60*24)):null;
  const daysLabel=daysUntil===null?"":daysUntil<=0?"Today":daysUntil===1?"Tomorrow":`In ${daysUntil} days`;

  // Group calc items by group
  const byGroup=GROUP_ORDER.reduce((a,g)=>{
    a[g]=(calcItems||[]).filter(i=>(i.group||"SPECIALTY")===g);
    return a;
  },{});
  const nonEmpty=GROUP_ORDER.filter(g=>byGroup[g].length>0);

  const canGenerate=!event.notes||ackAllergy;

  return(
    <div className="wiz-layout">
      {/* Rail */}
      <aside className="wiz-rail">
        <div className="wiz-eyebrow">New event</div>
        <div className="wiz-heading">Review the <em>prep.</em></div>
        <StepRail current={2}/>
        {/* What happens next card */}
        <div style={{background:"#fff",border:"1px solid var(--carbon-08)",borderRadius:10,padding:"14px 16px"}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:"var(--carbon-50)",marginBottom:8}}>What happens next</div>
          {["Prep sheet is created with all calculated quantities","Quantities can be adjusted on the sheet","Print or share with your team","Track prepped, loaded, and returned"].map((t,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:6}}>
              <div style={{width:16,height:16,borderRadius:"50%",background:"var(--cactus-50)",border:"1px solid var(--cactus-200)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"var(--cactus-500)",flexShrink:0,marginTop:1}}>{i+1}</div>
              <div style={{fontSize:12,color:"var(--carbon-200)",lineHeight:1.4}}>{t}</div>
            </div>
          ))}
        </div>
        <div className="wiz-footer">Quantities are calculated per single serving and rounded up to whole containers.</div>
      </aside>

      {/* Main */}
      <main className="wiz-main">
        <div className="wiz-hdr">
          <div>
            <div className="wiz-step-eyebrow">Step 3 of 3</div>
            <div className="wiz-title">Review & generate</div>
          </div>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </div>

        {/* ① Event recap */}
        <div className="wiz-card" style={{padding:0,overflow:"hidden"}}>
          <div style={{height:6,background:sc.bar}}/>
          <div style={{padding:"20px 24px"}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:sc.dot,flexShrink:0}}/>
                  <span style={{fontSize:10,fontWeight:700,letterSpacing:".16em",textTransform:"uppercase",color:sc.ink}}>{daysLabel}</span>
                </div>
                <div style={{fontSize:26,fontWeight:700,letterSpacing:"-.02em",color:"var(--carbon-300)",lineHeight:1.1}}>{event.name||"Untitled event"}</div>
                <div style={{fontSize:13,fontFamily:"var(--font-serif)",fontStyle:"italic",color:"var(--carbon-50)",marginTop:3}}>{event.truck||""}{event.guests?` · ${event.guests} guests`:""}</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={onEditDetails}>Edit details</button>
            </div>
            <div className="review-meta-grid">
              {[["Date",fmtDate(event.date)],["Guests",event.guests||"—"],["Truck",event.truck||"—"],["Service",fmtTime(event.startTime)],["Order Ready",fmtTime(event.orderReadyBy)],["Load By",fmtTime(event.loadBy)],["Kitchen Mgr",event.kitchenManager||"—"],["Load Driver",event.loadDriver||"—"]].map(([l,v])=>(
                <div key={l}><div className="review-meta-label">{l}</div><div className="review-meta-val">{v}</div></div>
              ))}
            </div>
          </div>
        </div>

        {/* ② Menu recap */}
        <div className="wiz-card">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:".16em",textTransform:"uppercase",color:"var(--carbon-50)"}}>
                Menu · {selections.length} dish{selections.length!==1?"es":""} · {selections.reduce((s,x)=>s+(parseInt(x.qty)||0),0)} covers
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={onEditMenu}>Edit menu</button>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {selections.map(s=>(
              <div key={s.key} className="menu-pill">
                {s.label||(RECIPES[s.key]?.label)||s.key}
                <span className="menu-pill-count">×{s.qty}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ③ Generated prep list summary */}
        <div className="wiz-card">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:".16em",textTransform:"uppercase",color:"var(--carbon-50)"}}>
                Generated prep list · {calcItems?.length||0} ingredients
              </div>
              <div style={{fontSize:12,fontFamily:"var(--font-serif)",fontStyle:"italic",color:"var(--carbon-50)",marginTop:3}}>
                auto-merged from {selections.length} dish{selections.length!==1?"es":""}
              </div>
            </div>
          </div>
          <div className="review-prep-grid">
            {nonEmpty.map(g=>(
              <div key={g} className="review-cat-card">
                <div className="review-cat-hdr" style={{background:sc.bar}}>
                  {GROUPS[g].label} <span style={{opacity:.7,fontWeight:400,fontSize:9}}>({byGroup[g].length})</span>
                </div>
                {byGroup[g].slice(0,6).map(item=>(
                  <div key={item.name} className="review-cat-row">
                    <span style={{color:"var(--carbon-300)",fontSize:11}}>{item.name}</span>
                    <span style={{fontWeight:700,color:"var(--clay-600)",fontSize:12,marginLeft:8,whiteSpace:"nowrap"}}>{item.calculatedQty} {item.unit}</span>
                  </div>
                ))}
                {byGroup[g].length>6&&<div style={{padding:"6px 12px",fontSize:11,color:"var(--carbon-50)"}}>+{byGroup[g].length-6} more</div>}
              </div>
            ))}
          </div>
        </div>

        {/* ④ Notes & allergy ack */}
        {event.notes&&(
          <div className="allergy-ack">
            <div style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:12}}>
              <div className="allergy-icon">!</div>
              <div>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:".16em",textTransform:"uppercase",color:"var(--sol-700)",marginBottom:6}}>Notes & allergy alerts · carried to the prep sheet</div>
                <div style={{fontSize:15,fontFamily:"var(--font-serif)",fontStyle:"italic",color:"var(--carbon-300)",lineHeight:1.5}}>{event.notes}</div>
              </div>
            </div>
            <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:13,fontWeight:600,color:"var(--sol-700)"}}>
              <input type="checkbox" checked={ackAllergy} onChange={e=>setAckAllergy(e.target.checked)} style={{accentColor:"var(--sol-400)",width:16,height:16}}/>
              I've read the allergy alerts before generating.
            </label>
          </div>
        )}

        {/* Action bar */}
        <div className="wiz-action-bar">
          <div className="wiz-action-bar-left">
            <button className="btn btn-secondary" onClick={onEditMenu}>← Back to menu</button>
          </div>
          <button className="btn btn-secondary" onClick={onSaveDraft}>Save as draft</button>
          <button className="btn btn-primary" onClick={onGenerate} disabled={!canGenerate} style={{opacity:canGenerate?1:.5,cursor:canGenerate?"pointer":"not-allowed"}}>
            Generate prep sheet →
          </button>
        </div>
      </main>
    </div>
  );
}


// ─── CALENDAR VIEW ───
function CalendarView({events,onSelect}){
  const [calView,setCalView]=useState("week");
  const [anchor,setAnchor]=useState(()=>{
    const d=new Date();d.setHours(0,0,0,0);return d;
  });

  const fmtTime=t=>{if(!t)return"";const[h,m]=t.split(":");const hr=parseInt(h,10);return`${hr%12||12}:${m===undefined?"00":m}${hr>=12?"P":"A"}`;};
  const isSameDay=(a,b)=>a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
  const evDate=ev=>ev.date?new Date(ev.date+"T00:00:00"):null;
  const activeEvents=events.filter(ev=>!ev.archived&&!ev.deleted);

  const statusLabel={prep:"IN PREP",loaded:"LOADED",returned:"RETURNED",pending:"PENDING",done:"PREPPED"};
  const getStatus=ev=>{
    if(!ev.items.length)return"pending";
    if(ev.items.some(i=>parseFloat(i.returned)>=0&&i.returned!==""))return"returned";
    if(ev.items.some(i=>parseFloat(i.loaded)>0))return"loaded";
    if(ev.items.filter(i=>i.prepped?.trim()).length>0)return"prep";
    return"pending";
  };

  // ── WEEK VIEW ──
  const weekStart=()=>{
    const d=new Date(anchor);
    const dow=d.getDay();
    const diff=dow===0?-6:1-dow;
    d.setDate(d.getDate()+diff);
    return d;
  };
  const prevWeek=()=>{const d=new Date(anchor);d.setDate(d.getDate()-7);setAnchor(d);};
  const nextWeek=()=>{const d=new Date(anchor);d.setDate(d.getDate()+7);setAnchor(d);};
  const goToday=()=>{const d=new Date();d.setHours(0,0,0,0);setAnchor(d);};

  const weekDays=()=>{
    const start=weekStart();
    return Array.from({length:7},(_,i)=>{const d=new Date(start);d.setDate(d.getDate()+i);return d;});
  };

  const weekLabel=()=>{
    const days=weekDays();
    const s=days[0];const e=days[6];
    const mo=s.toLocaleDateString("en-US",{month:"long"});
    const mo2=e.toLocaleDateString("en-US",{month:"long"});
    const yr=s.getFullYear();
    if(mo===mo2)return`${mo} ${s.getDate()}–${e.getDate()}, ${yr}`;
    return`${mo} ${s.getDate()} – ${mo2} ${e.getDate()}, ${yr}`;
  };

  const weekNum=()=>{
    const d=new Date(weekStart());
    const jan1=new Date(d.getFullYear(),0,1);
    return Math.ceil(((d-jan1)/86400000+jan1.getDay()+1)/7);
  };

  const today=new Date();today.setHours(0,0,0,0);
  const DAYS=["MON","TUE","WED","THU","FRI","SAT","SUN"];

  // ── MONTH VIEW ──
  const prevMonth=()=>{const d=new Date(anchor);d.setDate(1);d.setMonth(d.getMonth()-1);setAnchor(d);};
  const nextMonth=()=>{const d=new Date(anchor);d.setDate(1);d.setMonth(d.getMonth()+1);setAnchor(d);};

  const monthDays=()=>{
    const year=anchor.getFullYear();const month=anchor.getMonth();
    const first=new Date(year,month,1);const last=new Date(year,month+1,0);
    const startDow=first.getDay();
    const offset=startDow===0?6:startDow-1;
    const days=[];
    for(let i=offset;i>0;i--){const d=new Date(first);d.setDate(d.getDate()-i);days.push({date:d,cur:false});}
    for(let i=1;i<=last.getDate();i++)days.push({date:new Date(year,month,i),cur:true});
    const rem=42-days.length;
    for(let i=1;i<=rem;i++){const d=new Date(last);d.setDate(d.getDate()+i);days.push({date:d,cur:false});}
    return days;
  };

  const monthLabel=()=>anchor.toLocaleDateString("en-US",{month:"long",year:"numeric"});

  const evColor=ev=>ev.color||"var(--accent)";
  const textColor=(bg)=>{
    if(!bg||bg.startsWith("var"))return"#fff";
    const hex=bg.replace("#","");
    const r=parseInt(hex.substr(0,2),16);const g=parseInt(hex.substr(2,2),16);const b=parseInt(hex.substr(4,2),16);
    return(r*0.299+g*0.587+b*0.114)>140?"#1A1208":"#fff";
  };
  const lightTint=(hex,opacity=0.15)=>{
    if(!hex||hex.startsWith("var"))return"rgba(196,80,42,0.12)";
    const h=hex.replace("#","");
    const r=parseInt(h.substr(0,2),16);const g=parseInt(h.substr(2,2),16);const b=parseInt(h.substr(4,2),16);
    return`rgba(${r},${g},${b},${opacity})`;
  };

  return(
    <div className="cal-wrap">
      {/* HEADER */}
      <div className="cal-header">
        <div>
          {calView==="week"&&<div className="cal-title-week">WEEK {weekNum()} · {weekDays()[0].toLocaleDateString("en-US",{month:"short",day:"numeric"}).toUpperCase()} – {weekDays()[6].toLocaleDateString("en-US",{month:"short",day:"numeric"}).toUpperCase()}, {weekDays()[0].getFullYear()}</div>}
          {calView==="month"&&<div className="cal-title-week">{anchor.toLocaleDateString("en-US",{year:"numeric"})}</div>}
          <div className="cal-title">
            {calView==="week"&&"THIS WEEK'S BOARD."}
            {calView==="month"&&monthLabel().toUpperCase().split(" ")[0]+"."}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",justifyContent:"flex-end"}}>
          <div className="cal-view-toggle">
            <button className={`cal-view-btn ${calView==="month"?"active":""}`} onClick={()=>setCalView("month")}>Month</button>
            <button className={`cal-view-btn ${calView==="week"?"active":""}`} onClick={()=>setCalView("week")}>Week</button>
          </div>
          <div className="cal-nav">
            <button className="cal-nav-btn" onClick={calView==="week"?prevWeek:prevMonth}>‹</button>
            <button className="cal-today-btn" onClick={goToday}>{calView==="week"?"This week":"This month"}</button>
            <button className="cal-nav-btn" onClick={calView==="week"?nextWeek:nextMonth}>›</button>
          </div>
        </div>
      </div>

      {/* WEEK VIEW */}
      {calView==="week"&&(
        <div className="cal-week-grid">
          {weekDays().map((day,i)=>{
            const isToday=isSameDay(day,today);
            const dayEvs=activeEvents.filter(ev=>{const d=evDate(ev);return d&&isSameDay(d,day);}).sort((a,b)=>(a.startTime||"").localeCompare(b.startTime||""));
            return(
              <div key={i}>
                <div className={`cal-day-header ${isToday?"cal-day-today":""}`}>
                  <div className="cal-day-dow">{DAYS[i]}</div>
                  <div className="cal-day-num">{day.getDate()}</div>
                  {isToday&&<div style={{fontSize:10,color:"var(--accent)",fontWeight:700,marginTop:2}}>Today</div>}
                </div>
                <div className="cal-day-cell">
                  {dayEvs.map(ev=>{
                    const st=getStatus(ev);
                    const bg=evColor(ev);
                    const tc=textColor(bg);
                    return(
                      <div key={ev.id} className="cal-ev-chip" style={{background:lightTint(bg,0.18),border:`1.5px solid ${bg}`,color:"var(--text)"}} onClick={()=>onSelect(ev.id)}>
                        {ev.startTime&&<div className="cal-ev-time" style={{color:bg,fontWeight:800}}>{fmtTime(ev.startTime)}</div>}
                        <div className="cal-ev-name" style={{color:"var(--text)"}}>{ev.name}</div>
                        {ev.guests&&<div className="cal-ev-guests" style={{color:"var(--muted)"}}>{ev.guests} guests</div>}
                        <div className="cal-ev-status" style={{background:lightTint(bg,0.35),color:bg,border:`1px solid ${bg}`}}>{statusLabel[st]||"PENDING"}</div>
                      </div>
                    );
                  })}
                  {!dayEvs.length&&<div style={{fontSize:11,color:"var(--border2)",paddingTop:4}}>—</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MONTH VIEW */}
      {calView==="month"&&(
        <div className="cal-month-grid">
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=>(
            <div key={d} className="cal-month-dow">{d}</div>
          ))}
          {monthDays().map(({date,cur},i)=>{
            const isToday=isSameDay(date,today);
            const dayEvs=activeEvents.filter(ev=>{const d=evDate(ev);return d&&isSameDay(d,date);}).sort((a,b)=>(a.startTime||"").localeCompare(b.startTime||""));
            return(
              <div key={i} className={`cal-month-cell ${!cur?"other-month":""} ${isToday?"today":""}`}>
                <div className="cal-month-date">{date.getDate()}</div>
                {dayEvs.slice(0,3).map(ev=>{
                  const bg=evColor(ev);
                  const tc=textColor(bg);
                  return(
                    <div key={ev.id} className="cal-month-chip" style={{background:lightTint(bg,0.2),color:"var(--text)",border:`1.5px solid ${bg}`,fontWeight:700}} onClick={()=>onSelect(ev.id)}>
                      <span style={{color:bg,fontWeight:800}}>{ev.startTime?fmtTime(ev.startTime)+" ":""}</span>{ev.name}
                    </div>
                  );
                })}
                {dayEvs.length>3&&<div style={{fontSize:9,color:"var(--muted)",fontWeight:600,marginTop:2}}>+{dayEvs.length-3} more</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── APP ROOT ───
export default function App() {
  const [mode,setMode]   = useState("staff");
  const [isOwner,setIsOwner] = useState(false);

  const [showPin,setShowPin] = useState(false);
  const [devData,setDevData] = useState({pin:"1234",ownerPin:"0000",customRecipes:{},customIngredients:{}});
  const [events,setEvents]   = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    try{const ev=localStorage.getItem("bgt_events");if(ev)setEvents(JSON.parse(ev));}catch{}
    try{const dd=localStorage.getItem("bgt_dev3");if(dd)setDevData(JSON.parse(dd));}catch{}
    setLoading(false);
  },[]);

  // Backfill color + updatedAt on existing events at startup
  useEffect(()=>{
    const KEYS=["orange","red","blue","green","pink","yellow","purple","navy"];
    setEvents(prev=>{
      const sorted=[...prev].sort((a,b)=>new Date(a.createdAt||0)-new Date(b.createdAt||0));
      let changed=false;
      const next=prev.map(ev=>{
        const updates={};
        if(!ev.color||!["orange","red","blue","green","pink","yellow","purple","navy"].includes(ev.color)){
          updates.color=KEYS[sorted.findIndex(e=>e.id===ev.id)%KEYS.length];
          changed=true;
        }
        if(!ev.updatedAt){updates.updatedAt=ev.createdAt||new Date().toISOString();changed=true;}
        return Object.keys(updates).length?{...ev,...updates}:ev;
      });
      if(changed){try{localStorage.setItem("bgt_events",JSON.stringify(next));}catch{};return next;}
      return prev;
    });
  },[]);

  const saveEv  = useCallback(evts=>{try{localStorage.setItem("bgt_events",JSON.stringify(evts));}catch{}}, []);
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
        <MgrApp devData={devData} mutDev={mutDev} ING={ING} RECIPES={RECIPES} onExit={()=>{setMode("staff");setIsOwner(false);}} isOwner={isOwner} events={events} mutEv={mutEv}/>
      )}
      {showPin&&<PinModal correctPin={devData.pin} ownerPin={devData.ownerPin||"0000"} onSuccess={()=>{setShowPin(false);setIsOwner(false);setMode("mgr");}} onSuccessOwner={()=>{setShowPin(false);setIsOwner(true);setMode("mgr");}} onCancel={()=>setShowPin(false)}/>}
    </>
  );
}

// ─── LOGO COMPONENT ───
function Logo({isDev,onClick}){
  return(
    <div className="logo-new" onClick={onClick}>
      <div className="logo-mark-new">BG</div>
      <div style={{lineHeight:1}}>
        <div className="logo-text-new">BORDER GRILL</div>
        <div className="logo-sub-new">Truck + Catering · Prep System</div>
      </div>
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
    truck:event.truck||"",
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
            <label className="flabel">Location</label>
            <input className="finput" value={f.truck} placeholder="e.g. Border Grill Truck" onChange={e=>s("truck",e.target.value)}/>
          </div>
          <div className="fg">
            <label className="flabel">Date</label>
            <input className="finput" type="date" value={f.date} onChange={e=>s("date",e.target.value)}/>
          </div>
          <div className="fg">
            <label className="flabel">Guest Count</label>
            <input className="finput" type="text" inputMode="numeric" placeholder="200" value={f.guests} onChange={e=>s("guests",e.target.value.replace(/\D/g,""))}/>
          </div>
          <div className="fg">
            <label className="flabel">Event Start Time</label>
            <TimeSmart value={f.startTime||""} onChange={v=>s("startTime",v)}/>
          </div>
          <div className="fg">
            <label className="flabel">Order Ready By</label>
            <TimeSmart value={f.orderReadyBy||""} onChange={v=>s("orderReadyBy",v)}/>
          </div>
          <div className="fg">
            <label className="flabel">Load By</label>
            <TimeSmart value={f.loadBy||""} onChange={v=>s("loadBy",v)}/>
          </div>
          <div className="fg full">
            <label className="flabel">Event Color — matches your sticker roll</label>
            <div className="color-picker-wrap">
              {EVENT_COLORS.map(c=>(
                <button key={c.hex} className={`color-dot-btn ${f.color===c.hex?"selected":""}`} style={{background:STICKER[c.hex]?.dot||c.hex}} title={c.name} onClick={e=>{e.preventDefault();s("color",f.color===c.hex?"":c.hex);}}/>
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
  const [pendingSelections,setPendingSelections]=useState([]);
  const [pendingCalcItems,setPendingCalcItems]=useState([]);
  const [showPrintModal,setShowPrintModal]=useState(false);
  const [showEditModal,setShowEditModal]=useState(false);

  const [printMode,setPrintMode]=useState(null);
  useEffect(()=>{
    if(!printMode)return;
    document.documentElement.setAttribute("data-pmode",printMode);
    const t=setTimeout(()=>{window.print();document.documentElement.removeAttribute("data-pmode");setPrintMode(null);},150);
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
  const exportEventDoc=ev=>{
    if(!ev)return;
    const fmtT=t=>{if(!t)return"";const[h,m]=t.split(":");const hr=parseInt(h,10);return`${hr%12||12}:${m}${hr>=12?"pm":"am"}`};
    const fmtD=d=>d?new Date(d+"T00:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}):"";
    const fmtDShort=d=>d?new Date(d+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}).replace(/ /g,"-"):"";
    const GRPS={PROTEINS:"Proteins",TORTILLAS:"Tortillas & Wraps",SALSAS:"Salsas & Sauces",VEGETABLES:"Slaws & Vegetables",DAIRY:"Dairy & Cheese",GRAINS:"Grains & Beans",SPECIALTY:"Specialty & Sweets",LIQ:"Liquor",BEER:"Beer",WINE:"Wine",BEV:"Beverages"};
    const GRP_COLORS={PROTEINS:"#7F1D1D",TORTILLAS:"#713F12",SALSAS:"#C4502A",VEGETABLES:"#14532D",DAIRY:"#1E3A5F",GRAINS:"#3B1F6E",SPECIALTY:"#4A1942",LIQ:"#1A3A4A",BEER:"#5C3317",WINE:"#6B1A3A",BEV:"#1A3A2A"};
    const GRP_ORDER=["PROTEINS","TORTILLAS","SALSAS","VEGETABLES","DAIRY","GRAINS","SPECIALTY","LIQ","BEER","WINE","BEV"];

    const metaCols=[
      ["Order Ready By", ev.orderReadyBy?fmtT(ev.orderReadyBy):""],
      ["Load By", ev.loadBy?fmtT(ev.loadBy):""],
      ["Revised On",""],
      ["Kitchen Mgr",""],
      ["Load Driver",""],
      ["Returns Driver",""]
    ];

    const groupSections=GRP_ORDER.map(g=>{
      const items=ev.items.filter(i=>(i.group||"SPECIALTY")===g);
      if(!items.length)return"";
      const color=GRP_COLORS[g]||"#374151";
      const rows=items.map(i=>`
        <tr>
          <td style="padding:5px 8px;border-bottom:1px solid #E8E2D8;font-size:11px;font-weight:600;">${i.name||""}</td>
          <td style="padding:5px 8px;border-bottom:1px solid #E8E2D8;font-size:11px;text-align:center;font-weight:700;color:#166534;">${i.quantity||i.qty||i.calcQty||""}</td>
          <td style="padding:5px 8px;border-bottom:1px solid #E8E2D8;font-size:11px;">${i.unit||""}</td>
          <td style="padding:5px 8px;border-bottom:1px solid #E8E2D8;font-size:11px;">${i.container||""}</td>
          <td style="padding:5px 8px;border-bottom:1px solid #E8E2D8;font-size:11px;color:#6B7280;font-style:italic;">${i.notes||(i.variation||"")}</td>
          <td style="padding:5px 8px;border-bottom:1px solid #E8E2D8;font-size:11px;color:#6B7280;">${i.prepped||""}</td>
          <td style="padding:5px 8px;border-bottom:1px solid #E8E2D8;font-size:11px;color:#6B7280;">${i.loaded||""}</td>
          <td style="padding:5px 8px;border-bottom:1px solid #E8E2D8;font-size:11px;color:#6B7280;">${i.returned||""}</td>
        </tr>`).join("");
      return`
      <div style="margin-bottom:10px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr style="background:${color};">
            <td colspan="8" style="padding:6px 10px;color:#fff;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;">${GRPS[g]||g} <span style="font-weight:400;opacity:.7;font-size:10px;">${items.length} item${items.length!==1?"s":""}</span></td>
          </tr>
          <tr style="background:#F5F2EC;">
            <th style="padding:4px 8px;text-align:left;font-size:9px;color:#6B7280;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #D1CBC4;">Item</th>
            <th style="padding:4px 8px;text-align:center;font-size:9px;color:#6B7280;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #D1CBC4;">Qty</th>
            <th style="padding:4px 8px;text-align:left;font-size:9px;color:#6B7280;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #D1CBC4;">Unit</th>
            <th style="padding:4px 8px;text-align:left;font-size:9px;color:#6B7280;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #D1CBC4;">Container</th>
            <th style="padding:4px 8px;text-align:left;font-size:9px;color:#6B7280;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #D1CBC4;">Notes / Variation</th>
            <th style="padding:4px 8px;text-align:left;font-size:9px;color:#6B7280;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #D1CBC4;">Prepped</th>
            <th style="padding:4px 8px;text-align:left;font-size:9px;color:#6B7280;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #D1CBC4;">Loaded</th>
            <th style="padding:4px 8px;text-align:left;font-size:9px;color:#6B7280;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #D1CBC4;">Returned</th>
          </tr>
          ${rows}
        </table>
      </div>`;
    }).join("");

    const html=`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @page{margin:0.5in 0.6in;}
  body{font-family:'Aptos Display','Aptos','Segoe UI',Arial,sans-serif;margin:0;padding:0;color:#1A1208;font-size:11px;mso-margin-top-alt:0;mso-header-margin:0;mso-footer-margin:0;}
  table{border-collapse:collapse;width:100%;}
  p{margin:0;padding:0;}
</style>
<!--[if gte mso 9]>
<xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml>
<![endif]-->
</head>
<body>
  <!-- HEADER -->
  <table style="width:100%;margin-bottom:8px;border-bottom:2px solid #1A1208;padding-bottom:8px;">
    <tr>
      <td>
        <div style="font-size:20px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;">BORDER GRILL</div>
        <div style="font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#8B7D6B;">Truck + Catering · Prep Sheet</div>
      </td>
      <td style="text-align:right;">
        <div style="font-size:14px;font-weight:800;">${ev.name||""}</div>
        <div style="font-size:10px;color:#8B7D6B;">${ev.truck||""}${ev.date?" · "+fmtD(ev.date):""}${ev.startTime?" · "+fmtT(ev.startTime):""}${ev.guests?" · "+ev.guests+" guests":""}</div>
        <div style="font-size:9px;color:#B0A090;margin-top:2px;">Printed: ${new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"})} at ${new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}</div>
      </td>
    </tr>
  </table>

  <!-- META ROW -->
  <table style="width:100%;border:1px solid #D1CBC4;border-radius:4px;margin-bottom:10px;">
    <tr>
      ${metaCols.map(([lbl,val])=>`<td style="padding:5px 10px;border-right:1px solid #D1CBC4;width:16.6%;">
        <div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#8B7D6B;">${lbl}</div>
        <div style="font-size:11px;font-weight:600;border-bottom:1px solid #D1CBC4;padding-bottom:2px;min-height:16px;">${val}</div>
      </td>`).join("")}
    </tr>
  </table>

  ${ev.notes?`
  <!-- NOTES -->
  <div style="background:#FFFBEB;border:2px solid #F0B429;border-radius:4px;padding:8px 12px;margin-bottom:10px;">
    <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#92400E;margin-bottom:4px;">Event Notes &amp; Alerts — Visible to All Staff</div>
    <div style="font-size:11px;color:#1A1208;">${ev.notes}</div>
  </div>`:""}

  <!-- INGREDIENT GROUPS -->
  ${groupSections}

  <!-- SIGNATURES -->
  <table style="width:100%;margin-top:16px;border-top:1px solid #D1CBC4;padding-top:10px;">
    <tr>
      ${["Kitchen Manager","Load Driver","Returns Driver"].map(lbl=>`
      <td style="width:33%;padding-right:20px;">
        <div style="font-size:10px;font-weight:600;color:#6B7280;margin-bottom:16px;">${lbl}</div>
        <div style="border-bottom:1px solid #374151;margin-bottom:3px;"></div>
        <div style="font-size:8px;color:#8B7D6B;text-transform:uppercase;letter-spacing:.06em;">Signature</div>
      </td>`).join("")}
    </tr>
  </table>
</body>
</html>`;

    const dateStr=ev.date?new Date(ev.date+"T00:00:00").toLocaleDateString("en-US",{month:"numeric",day:"numeric",year:"numeric"}).replace(/\//g,"."):"no-date";
    const evName=(ev.name||"prep").replace(/[^a-z0-9]/gi,"_").replace(/_+/g,"_").toLowerCase();
    const filename=`${evName}_${dateStr}_prep.doc`;
    const blob=new Blob([html],{type:"application/msword;charset=utf-8;"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download=filename;
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const duplicateEvent=id=>{
    const src=events.find(e=>e.id===id); if(!src) return;
    const ev={...src,id:uid(),name:`${src.name} (Copy)`,createdAt:new Date().toISOString(),archived:false,
      items:src.items.map(i=>({...i,id:uid(),prepped:"",loaded:"",returned:""}))};
    mutEv(p=>[ev,...p]); setActiveId(ev.id); setView("sheet");
  };
  const archiveEvent=id=>mutEv(p=>p.map(e=>e.id===id?{...e,archived:!e.archived}:e));
  const deleteEvent=id=>{mutEv(p=>p.map(e=>e.id===id?{...e,deleted:true,deletedAt:new Date().toISOString()}:e));setView("dashboard");};
  const updateEvent=(id,patch)=>mutEv(p=>p.map(e=>e.id===id?{...e,...patch}:e));
  const updateItem=(evId,iid,patch)=>mutEv(p=>p.map(e=>e.id!==evId?e:{...e,updatedAt:new Date().toISOString(),items:e.items.map(i=>i.id===iid?{...i,...patch}:i)}));
  const removeItem=(evId,iid)=>mutEv(p=>p.map(e=>e.id!==evId?e:{...e,items:e.items.filter(i=>i.id!==iid)}));
  const addItems=(evId,newItems)=>mutEv(p=>p.map(e=>{if(e.id!==evId)return e;const ex=new Set(e.items.map(i=>i.name.toLowerCase()));return{...e,items:[...e.items,...newItems.filter(i=>!ex.has(i.name.toLowerCase()))]};}));
  const applyMenu=(evId,sel,calcItems)=>mutEv(p=>p.map(e=>{
    if(e.id!==evId)return e;
    const existing=e.items.filter(i=>!i.fromMenu);
    const ingNotesMap={};
    sel.forEach(({key,qty,ingNotes:din})=>{
      if(!din||!qty)return;
      Object.entries(din).forEach(([ingName,note])=>{
        if(!note?.trim())return;
        if(!ingNotesMap[ingName])ingNotesMap[ingName]=[];
        if(!ingNotesMap[ingName].includes(note))ingNotesMap[ingName].push(note);
      });
    });
    const calc=calcItems.map(ci=>({
      id:uid(),...ci,
      quantity:String(ci.calculatedQty),fromMenu:true,calcQty:ci.calculatedQty,
      prepped:"",loaded:"",returned:"",qtyUsed:"",
      notes:[ci.notes,...(ingNotesMap[ci.name]||[])].filter(Boolean).join(" · "),
      variation:""
    }));
    return{...e,menuSelections:sel,items:[...existing,...calc]};
  }));

  return(
    <>
      <nav className="nav-new">
        <Logo onClick={()=>setView("dashboard")}/>
        <div className="nav-items-new">
          {[
            {v:"dashboard",l:"Dashboard"},
            {v:"calendar",l:"Calendar"},
            ...((view==="sheet"||view==="menu")?[{v:"sheet",l:"Sheet"},{v:"menu",l:"Menu"}]:[]),
            ...((view==="sheet"||view==="menu")?[]:[{v:"past",l:"Past Events"}]),
          ].map(({v,l})=>(
            <button key={v} className={`nav-item-new ${view===v?"on":""}`} onClick={()=>setView(v)}>{l}</button>
          ))}
        </div>
        <div className="nav-right-new">
          <div className="avatar-new">JC</div>
          <button className="gear-new" onClick={onGear} title="Manager Access">⚙</button>
        </div>
      </nav>
      {view==="dashboard"&&<Dashboard events={events} onSelect={id=>{setActiveId(id);const ev=events.find(e=>e.id===id);if(ev?.draft&&ev?.menuSelections?.length>0){const ci=calcPrepList(ev.menuSelections,ING,RECIPES);setPendingSelections(ev.menuSelections);setPendingCalcItems(ci);setView("review");}else{setView("sheet");}}} onNew={()=>setView("create")} onDuplicate={duplicateEvent} onArchive={archiveEvent} onPrint={id=>{setActiveId(id);setView("sheet");setTimeout(()=>setShowPrintModal(true),100);}} onDelete={id=>{if(events.find(e=>e.id===id))deleteEvent(id);}}/>}
      {/* Wizard views - outside wrap for full width */}
      {view==="create"&&(
        <div className="wiz-layout">
          <aside className="wiz-rail">
            <div className="wiz-eyebrow">New event</div>
            <div className="wiz-heading">Set the <em>basics.</em></div>
            <StepRail current={0}/>
            <div className="wiz-footer">All fields can be edited later from the prep sheet.</div>
          </aside>
          <main className="wiz-main">
            <EventForm onSubmit={ev=>{createEvent(ev);setTimeout(()=>setView("menu"),50);}} onCancel={()=>setView("dashboard")}/>
          </main>
        </div>
      )}
      {view==="menu"&&active&&<MenuBuilder event={active} RECIPES={RECIPES} ING={ING}
        onApply={(sel,items)=>{setPendingSelections(sel);setPendingCalcItems(items);setView("review");}}
        onSkip={()=>setView("sheet")}
        onBack={()=>setView("create")}/>}
      {view==="review"&&active&&<ReviewScreen
        event={active}
        selections={pendingSelections}
        calcItems={pendingCalcItems}
        ING={ING}
        RECIPES={RECIPES}
        onGenerate={()=>{applyMenu(active.id,pendingSelections,pendingCalcItems);mutEv(p=>p.map(e=>e.id===active.id?{...e,draft:false}:e));setView("sheet");}}
        onSaveDraft={()=>{mutEv(p=>p.map(e=>e.id===active.id?{...e,draft:true}:e));setView("dashboard");}}
        onEditDetails={()=>setView("create")}
        onEditMenu={()=>setView("menu")}
        onCancel={()=>setView("dashboard")}
      />}
      {view==="sheet"&&active&&<PrepSheet event={active} ING={ING} RECIPES={RECIPES}
        onUpdate={p=>updateEvent(active.id,p)}
        onUpdateItem={(iid,p)=>updateItem(active.id,iid,p)}
        onRemoveItem={iid=>removeItem(active.id,iid)}
        onAddItems={items=>addItems(active.id,items)}
        onEdit={()=>setShowEditModal(true)}
        onEditMenu={()=>setView("menu")}
        onPrint={()=>setShowPrintModal(true)}
        onDelete={()=>{if(confirm("Delete this event?"))deleteEvent(active.id);}}
        printMode={printMode}
      />}
      {(view==="past"||view==="calendar")&&(
        <div className="wrap">
          {view==="past"&&<PastEvents events={events.filter(ev=>ev.archived&&!ev.deleted)} onSelect={id=>{setActiveId(id);const ev=events.find(e=>e.id===id);if(ev?.draft&&ev?.menuSelections?.length>0){const ci=calcPrepList(ev.menuSelections,ING,RECIPES);setPendingSelections(ev.menuSelections);setPendingCalcItems(ci);setView("review");}else{setView("sheet");}}} onDuplicate={duplicateEvent}/>}
          {view==="calendar"&&<CalendarView events={events.filter(ev=>!ev.archived&&!ev.deleted)} onSelect={id=>{setActiveId(id);const ev=events.find(e=>e.id===id);if(ev?.draft&&ev?.menuSelections?.length>0){const ci=calcPrepList(ev.menuSelections,ING,RECIPES);setPendingSelections(ev.menuSelections);setPendingCalcItems(ci);setView("review");}else{setView("sheet");}}}/>}
        </div>
      )}
      {showPrintModal&&<PrintModal onClose={()=>setShowPrintModal(false)} onPrint={setPrintMode}/>}
      {showEditModal&&active&&<EditEventModal event={active} onSave={p=>{updateEvent(active.id,p);setShowEditModal(false);}} onClose={()=>setShowEditModal(false)}/>}
    </>
  );
}

// ─── DASHBOARD ───
function CardMenu({evId,archived,onOpen,onDuplicate,onArchive,onPrint,onDelete}){
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


function Dashboard({events,onSelect,onNew,onDuplicate,onArchive,onPrint,onDelete}){
  const [search,setSearch]=useState("");
  const [statusFilter,setStatusFilter]=useState("All");

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
  const statusMap={"In Prep":"prep","Loaded":"loaded","Returned":"returned"};
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
        {/* Today summary */}
        {(()=>{
          const todayStr=today.toISOString().split("T")[0];
          const todayEvs=activeEvents.filter(ev=>ev.date===todayStr);
          const todayGuests=todayEvs.reduce((s,ev)=>s+(parseInt(ev.guests)||0),0);
          return(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {/* Date */}
              <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:"var(--clay-500)"}}>{dayLabel}</div>
              {/* Today stats */}
              <div className="kpi-tile">
                <div className="kpi-tile-bar" style={{background:"var(--clay-500)"}}/>
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

        {/* + New Event */}
        <button className="btn btn-primary" style={{width:"100%",padding:"10px 18px",fontSize:12,letterSpacing:".02em",borderRadius:8}} onClick={onNew}>
          + New Event
        </button>

        {/* Quote */}
        <div className="sidebar-quote">
          "La cocina sin orden es solo humo y prisa."<br/>— house rule #1
        </div>
      </aside>

      {/* MAIN FEED */}
      <div className="cockpit-feed">
        {/* Filter bar */}
        <div className="feed-filter-bar">
          <div className="feed-search-wrap">
            <span className="feed-search-icon">⌕</span>
            <input className="feed-search" placeholder="Search events, clients, dishes…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          {["All","In Prep","Loaded","Returned"].map(f=>(
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
                  <div style={{fontFamily:"var(--font-serif)",fontStyle:"italic",fontSize:14,color:"var(--carbon-50)",marginTop:3}}>
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
            <div style={{padding:"28px 22px",textAlign:"center",color:"var(--carbon-50)",fontSize:13}}>
              {search||statusFilter!=="All"?"No events match your filter.":"No active events. Create one to get started."}
            </div>
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

/* ── OPTION A: Segmented h:mm AM/PM ── */
function TimeSmart({value,onChange}){
  const fmt=(v)=>{if(!v)return"";const[hh,mm]=v.split(":");const hr=parseInt(hh,10);return`${hr%12||12}:${mm}${hr>=12?"pm":"am"}`;};
  const [txt,setTxt]=useState(()=>fmt(value));
  useEffect(()=>setTxt(fmt(value)),[value]);
  const parse=(raw)=>{
    const s=raw.trim().toLowerCase().replace(/\s/g,"");
    if(!s)return"";
    const ispm=s.includes("p");const isam=s.includes("a");
    const digits=s.replace(/[^0-9:]/g,"");
    let h,m;
    if(digits.includes(":")){[h,m]=digits.split(":");}
    else if(digits.length<=2){h=digits;m="00";}
    else if(digits.length===3){h=digits[0];m=digits.slice(1);}
    else{h=digits.slice(0,2);m=digits.slice(2,4);}
    h=parseInt(h,10);m=parseInt(m||0,10);
    if(isNaN(h)||h<0||h>23)return"";
    if(ispm&&h!==12)h+=12;
    if(isam&&h===12)h=0;
    if(!ispm&&!isam&&h<7)h+=12;
    h=Math.min(h,23);m=Math.min(m,59);
    return`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
  };
  return(
    <input className="finput" value={txt} placeholder="e.g. 1:30pm or 130p" onChange={e=>setTxt(e.target.value)} onBlur={()=>{const v=parse(txt);if(v){onChange(v);setTxt(fmt(v));}else if(!txt.trim()){onChange("");setTxt("");}}}/>
  );
}

function EventForm({onSubmit,onCancel}){
  const [f,setF]=useState({name:"",truck:"",date:"",guests:"",startTime:"",orderReadyBy:"",loadBy:"",color:""});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  return(
    <div style={{maxWidth:860}}>
      <div className="page-title" style={{marginBottom:3}}>New Event</div>
      <div className="page-sub">Step 1 of 2 — Enter event details</div>
      <div className="fcard">
        <div className="fgrid">
          <div className="fg full"><label className="flabel">Event Name *</label><input className="finput" placeholder="e.g. Smith Wedding · Google HQ Catering" value={f.name} onChange={e=>s("name",e.target.value)}/></div>
          <div className="fg"><label className="flabel">Location</label><input className="finput" value={f.truck} placeholder="e.g. Border Grill Truck" onChange={e=>s("truck",e.target.value)}/></div>
          <div className="fg"><label className="flabel">Date</label><input className="finput" type="date" value={f.date} onChange={e=>s("date",e.target.value)}/></div>
          <div className="fg"><label className="flabel">Guest Count</label><input className="finput" type="text" inputMode="numeric" placeholder="200" value={f.guests} onChange={e=>s("guests",e.target.value.replace(/\D/g,""))}/></div>
          <div className="fg"><label className="flabel">Event Start Time</label><TimeSmart value={f.startTime||""} onChange={v=>s("startTime",v)}/></div>
          <div className="fg"><label className="flabel">Order Ready By</label><TimeSmart value={f.orderReadyBy||""} onChange={v=>s("orderReadyBy",v)}/></div>
          <div className="fg"><label className="flabel">Load By</label><TimeSmart value={f.loadBy||""} onChange={v=>s("loadBy",v)}/></div>
          <div className="fg full">
            <label className="flabel">Event Color <span style={{fontWeight:400,color:"var(--muted)"}}>— matches your sticker roll</span></label>
            <div className="color-picker-wrap">
              {EVENT_COLORS.map(c=>(
                <button key={c.hex} className={`color-dot-btn ${f.color===c.hex?"selected":""}`} style={{background:STICKER[c.hex]?.dot||c.hex}} title={c.name} onClick={e=>{e.preventDefault();s("color",f.color===c.hex?"":c.hex);}}/>
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
function MenuBuilder({event,RECIPES,ING,onApply,onSkip,onBack}){
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
    <div className="wiz-layout">
      {/* ── SIDEBAR ── */}
      <aside className="wiz-rail">
        <div className="wiz-eyebrow">New event</div>
        <div className="wiz-heading">Build the <em>menu.</em></div>
        <StepRail current={1}/>

        {/* Live prep calc panel */}
        <div style={{background:"#fff",border:"1px solid var(--carbon-08)",borderRadius:10,overflow:"hidden",display:"flex",flexDirection:"column",flex:1,minHeight:0}}>
          <div style={{padding:"12px 14px",borderBottom:"1px solid var(--carbon-08)",background:"var(--masa-100)",flexShrink:0}}>
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
                  <div style={{padding:"7px 14px",fontSize:9,fontWeight:700,letterSpacing:".15em",textTransform:"uppercase",color:"var(--clay-500)",background:"var(--clay-50)"}}>{GROUPS[g].label}</div>
                  {items.map((item,j)=>(
                    <div key={item.name} style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"7px 14px",borderTop:j>0?"1px dashed var(--carbon-08)":"none",fontSize:12}}>
                      <span style={{color:"var(--carbon-300)"}}>{item.name}</span>
                      <span style={{fontWeight:700,color:"var(--clay-600)",letterSpacing:"-.01em",marginLeft:8,whiteSpace:"nowrap"}}>{item.calculatedQty} {item.unit}</span>
                    </div>
                  ))}
                </div>
              );
            })}
            {calcResults.length===0&&(
              <div style={{padding:"20px 14px",textAlign:"center",fontSize:12,color:"var(--carbon-50)",fontFamily:"var(--font-serif)",fontStyle:"italic"}}>Add dishes to see ingredient totals</div>
            )}
          </div>
        </div>

        <button className="btn btn-primary" style={{width:"100%",padding:11,fontSize:13,fontWeight:700}} onClick={handleApply}>
          Review →
        </button>
      </aside>

      {/* ── MAIN ── */}
      <main style={{flex:1,minWidth:0,background:"var(--surface-feed)",overflowY:"auto",height:"calc(100vh - 52px)"}}>
        {/* Sticky header */}
        <div style={{position:"sticky",top:0,zIndex:10,background:"var(--surface-feed)",padding:"24px 30px 16px",borderBottom:"1px solid var(--carbon-08)"}}>
          {/* Title row */}
          <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:14}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:".16em",textTransform:"uppercase",color:"var(--carbon-50)",marginBottom:4}}>
                For {event.name||"new event"}
              </div>
              <div style={{fontSize:32,fontWeight:700,letterSpacing:"-.02em",color:"var(--carbon-300)",lineHeight:1}}>
                Pick dishes &amp; set covers
              </div>
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

        {/* Scrollable category cards */}
        <div style={{padding:"20px 30px"}}>

        {/* Category cards */}
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
                    <div style={{display:"grid",gridTemplateColumns:"22px 1fr 1fr 150px 28px",padding:"12px 18px",borderTop:i>0?"1px solid var(--carbon-08)":"none",alignItems:"center",gap:14,background:isSelected?"rgba(192,83,42,.03)":"transparent",transition:"background .12s"}}>
                      {/* Checkbox */}
                      <span style={{width:18,height:18,borderRadius:5,border:`1.5px solid ${isSelected?"var(--clay-500)":"var(--carbon-20)"}`,background:isSelected?"var(--clay-500)":"transparent",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0,cursor:"pointer"}} onClick={()=>{if(isSelected)adj(key,-999);else adj(key,1);}}>
                        {isSelected?"✓":""}
                      </span>
                      {/* Name */}
                      <span style={{fontSize:13,fontWeight:600,color:"var(--carbon-300)"}}>{r.label}</span>
                      {/* Dish note */}
                      {isSelected?(
                        <input value={dishNotes[key]||""} onChange={e=>setDishNotes(p=>({...p,[key]:e.target.value}))} placeholder="Dish note…" style={{width:"100%",border:"1px solid var(--carbon-12)",borderRadius:5,padding:"5px 8px",fontSize:11,color:"var(--carbon-300)",background:"#fff",outline:"none",fontFamily:"inherit"}} onClick={e=>e.stopPropagation()}/>
                      ):<span/>}
                      {/* Stepper */}
                      <div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"flex-end"}}>
                        <button style={{width:28,height:28,border:"1px solid var(--carbon-20)",borderRadius:6,background:"#fff",cursor:"pointer",fontSize:14,color:"var(--carbon-50)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,flexShrink:0}} onClick={()=>adj(key,-1)}>−</button>
                        <input value={q} placeholder="0" onChange={e=>setQty(key,e.target.value)} style={{width:56,padding:"5px 8px",border:`1px solid ${isSelected?"var(--clay-500)":"var(--carbon-20)"}`,borderRadius:6,background:isSelected?"var(--clay-50)":"#fff",fontSize:14,fontWeight:700,textAlign:"center",color:isSelected?"var(--clay-700)":"var(--carbon-300)",fontFamily:"inherit",outline:"none"}}/>
                        <button style={{width:28,height:28,border:"1px solid var(--carbon-20)",borderRadius:6,background:"#fff",cursor:"pointer",fontSize:14,color:"var(--carbon-50)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,flexShrink:0}} onClick={()=>adj(key,1)}>+</button>
                      </div>
                      {/* Expand toggle */}
                      {isSelected?(
                        <button onClick={()=>setExpanded(p=>({...p,[key]:!p[key]}))} style={{width:24,height:24,border:"1px solid var(--carbon-12)",borderRadius:5,background:"transparent",cursor:"pointer",fontSize:10,color:"var(--carbon-50)",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .12s",transform:isExpanded?"rotate(180deg)":"none"}}>▾</button>
                      ):<span/>}
                    </div>
                    {/* Expanded ingredient notes panel */}
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

        </div>{/* end scrollable padding wrapper */}
      </main>
    </div>
  );
}



function PrepSheet({event,ING,RECIPES,onUpdate,onUpdateItem,onRemoveItem,onAddItems,onDelete,onEditMenu,onEdit,onPrint,printMode}){
  const [collapsed,setCollapsed]=useState({});
  const [showDrawer,setShowDrawer]=useState(false);
  const [activeGroup,setActiveGroup]=useState(null);
  const catRefs=useRef({});
  const scrollToGroup=g=>{
    setCollapsed(p=>({...p,[g]:false}));
    setTimeout(()=>{const el=catRefs.current[g];if(el)el.scrollIntoView({behavior:"smooth",block:"start"});},50);
  };
  const sc=getSticker(event);
  const bygroup=GROUP_ORDER.reduce((a,g)=>{a[g]=event.items.filter(i=>(i.group||"SPECIALTY")===g);return a;},{});
  const nonEmptyGroups=GROUP_ORDER.filter(g=>bygroup[g]?.length>0);
  const total=event.items.length,prepped=event.items.filter(i=>i.prepped?.trim()).length,loaded=event.items.filter(i=>i.loaded?.trim()).length,returned=event.items.filter(i=>i.returned?.trim()).length;
  const pct=total>0?Math.round(prepped/total*100):0;
  const acc=(()=>{const evs=event.items.filter(i=>parseFloat(i.loaded)>0);if(!evs.length)return null;const totL=evs.reduce((s,i)=>s+(parseFloat(i.loaded)||0),0);const totR=evs.reduce((s,i)=>s+(parseFloat(i.returned)||0),0);return totL>0?Math.round((totR/totL)*100):null;})();
  const msUntil=event.date?(new Date(event.date+(event.startTime?"T"+event.startTime:"T00:00:00"))-new Date()):null;
  const daysUntil=msUntil!==null?Math.round(msUntil/(1000*60*60*24)):null;
  const hoursUntil=msUntil!==null?Math.round(msUntil/(1000*60*60)):null;
  const daysLabel=daysUntil===null?"":daysUntil<=0?"Today":daysUntil===1?"Tomorrow":`In ${daysUntil} days`;
  const fmt=d=>d?new Date(d+"T00:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}):"";
  const fmtShort=d=>d?new Date(d+"T00:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}):"";
  const fmtTime=t=>{if(!t)return"";const[h,m]=t.split(":");const hr=parseInt(h,10);return`${hr%12||12}:${m}${hr>=12?"pm":"am"}`};

  return(
    <div className="ps-grid">
      {/* ── CONTEXT RAIL ── */}
      <aside className="ctx-rail">
        <div>
          <div className="rail-event-name">{event.name}</div>
          <div className="rail-client">{event.truck}{event.guests?` · ${event.guests} guests`:""}</div>
        </div>
        <div className="rail-progress-card">
          <div className="rail-progress-label">Prep progress</div>
          <div><span className="rail-progress-nums">{prepped}</span><span className="rail-progress-denom"> / {total} items</span></div>
          <div className="rail-progress-bar"><div className="rail-progress-fill" style={{width:`${pct}%`,background:sc.bar}}/></div>
          <div className="rail-stat-row">
            <span className="rail-stat"><strong>{loaded}</strong> loaded</span>
            <span className="rail-stat"><strong>{returned}</strong> returned</span>
            {acc!==null&&<span className="rail-stat"><strong>{acc}%</strong> accuracy</span>}
          </div>
        </div>
        <div>
          <div className="rail-jump-title">Jump to category</div>
          {nonEmptyGroups.map(g=>{
            const items=bygroup[g];
            const grpPrepped=items.filter(x=>x.prepped?.trim()).length;
            const grpPct=items.length>0?Math.round(grpPrepped/items.length*100):0;
            return(
              <div key={g} className={`rail-jump-item ${activeGroup===g?"active":""}`} onClick={()=>{setActiveGroup(g);scrollToGroup(g);}}>
                <span className="rail-jump-name">{GROUPS[g].label}</span>
                <span className="rail-jump-count">{grpPrepped}/{items.length}</span>
                <div className="rail-jump-bar"><div className="rail-jump-bar-fill" style={{width:`${grpPct}%`,background:sc.bar}}/></div>
              </div>
            );
          })}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <button className="rail-btn rail-btn-ghost" onClick={()=>setShowDrawer(true)}>Add Item</button>
          <button className="rail-btn rail-btn-ghost" onClick={onEditMenu}>Edit Menu</button>
          <button className="rail-btn rail-btn-ghost" onClick={onEdit}>Edit Event</button>
          <button className="rail-btn rail-btn-ghost" onClick={onPrint}>Print</button>
          <button style={{width:"100%",padding:"9px 14px",borderRadius:8,border:"1.5px solid var(--red)",background:"var(--red-bg)",color:"var(--red)",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onDelete}>Delete Event</button>
        </div>
      </aside>

      {/* ── WORK AREA ── */}
      <main className="ps-work">

        {/* ── PRINT-ONLY HEADER (hidden on screen, shown when printing) ── */}
        <div className="prep-print-only">
          <div className="print-header">
            <div className="print-logo-wrap">
              <div className="print-logo-mark" style={{width:30,height:30,borderRadius:"50%",background:"#1A1714",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,fontWeight:800,letterSpacing:".02em",flexShrink:0}}>BG</div>
              <div>
                <div className="print-logo-text">BORDER GRILL</div>
                <div className="print-logo-sub">TRUCK + CATERING · PREP SHEET</div>
              </div>
            </div>
            <div className="print-event-right">
              <div className="print-event-title">{event.name}</div>
              <div className="print-event-meta">{event.truck}{event.date?` · ${fmt(event.date)}`:""}{event.startTime?` · ${fmtTime(event.startTime)}`:""}{event.guests?` · ${event.guests} guests`:""}</div>
              <div className="print-timestamp">Printed: {new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"})} at {new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}</div>
            </div>
          </div>
          <div className="print-meta-row">
            {[
              ["ORDER READY BY", event.orderReadyBy?fmtTime(event.orderReadyBy):""],
              ["LOAD BY",        event.loadBy?fmtTime(event.loadBy):""],
              ["REVISED ON",     event.updatedAt?new Date(event.updatedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):""],
              ["LOAD DRIVER",    event.loadDriver||""],
              ["RETURNS DRIVER", event.returnsDriver||""],
            ].map(([lbl,val])=>(
              <div key={lbl} className="print-meta-cell">
                <div className="print-meta-lbl">{lbl}</div>
                <div className="print-meta-val">{val}</div>
              </div>
            ))}
          </div>
          {event.notes?.trim()&&(
            <div className="print-notes-box">
              <div className="print-notes-lbl">EVENT NOTES &amp; ALERTS — VISIBLE TO ALL STAFF</div>
              <div className="print-notes-txt">{event.notes}</div>
            </div>
          )}
        </div>

        {/* Header card */}
        <div className="ps-hdr-card">
          <div className="ps-hdr-stripe" style={{background:sc.bar}}/>
          <div className="ps-hdr-body">
            <div style={{display:"flex",gap:24,alignItems:"flex-start"}}>
              <div style={{flex:1,minWidth:0}}>
                <div className="ps-event-eyebrow" style={{color:sc.bar}}>{event.date?fmtShort(event.date):""}{daysUntil!==null?` · ${daysLabel}`:""}</div>
                <div className="ps-event-name">{event.name}</div>
                <div className="ps-event-meta">{event.truck}{event.guests?` · ${event.guests} guests`:""}{event.startTime?` · service at ${fmtTime(event.startTime)}`:""}</div>
              </div>
              <div style={{flexShrink:0,display:"flex",flexDirection:"column",gap:12,minWidth:340}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
                  {[["Order Ready","orderReadyBy"],["Load Time","loadBy"],["Start Time","startTime"]].map(([lbl,key])=>(
                    <div key={key}>
                      <div className="ps-meta-lbl">{lbl}</div>
                      <TimeSmart value={event[key]||""} onChange={v=>onUpdate({[key]:v})}/>
                    </div>
                  ))}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
                  {[["Loaded By","loadDriver","text"],["Return By","returnsDriver","text"]].map(([lbl,key])=>(
                    <div key={key}>
                      <div className="ps-meta-lbl">{lbl}</div>
                      <input className="ps-meta-inp" type="text" value={event[key]||""} onChange={e=>onUpdate({[key]:e.target.value})} placeholder="—"/>
                    </div>
                  ))}
                  <div>
                    <div className="ps-meta-lbl">Created</div>
                    <div style={{fontSize:12,fontWeight:600,color:"var(--carbon-300)",borderBottom:"1px solid var(--carbon-08)",paddingBottom:2,marginTop:2}}>
                      {event.createdAt?new Date(event.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"—"}
                    </div>
                  </div>
                </div>
                {event.updatedAt&&<div style={{fontSize:10,color:"var(--carbon-50)",letterSpacing:".06em"}}>Last revised: {new Date(event.updatedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})} at {new Date(event.updatedAt).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}</div>}
              </div>
            </div>
            <div className="ps-stat-ribbon">
              {(()=>{
                const untilLabel=hoursUntil===null?"—":hoursUntil<=0?"Now":hoursUntil<24?`${hoursUntil}h`:`${Math.floor(hoursUntil/24)}d ${hoursUntil%24}h`;
                return[["Items",total],["Prepped",prepped],["Loaded",loaded],["Categories",nonEmptyGroups.length],["Until Service",untilLabel]].map(([l,v])=>(
                  <div key={l} className="ps-stat"><div className="ps-stat-val">{v}</div><div className="ps-stat-lbl">{l}</div></div>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* Notes banner */}
        <div className="ps-notes-banner">
          <div className="ps-notes-eyebrow">Event notes &amp; alerts · all staff read</div>
          <textarea className="ps-notes-ta" rows={3} value={event.notes||""} onChange={e=>onUpdate({notes:e.target.value})} placeholder="Add important notes here — allergies, special requests, client instructions…"/>
        </div>

        {/* Menu chips */}
        {event.menuSelections?.length>0&&(
          <div className="ps-menu-bar">
            <div className="ps-menu-eyebrow">Auto-calculated from menu</div>
            <div className="ps-menu-chips">
              {event.menuSelections.map(s=><span key={s.key} className="ps-menu-chip">{s.label||(RECIPES[s.key]?.label)||s.key}: {s.qty}</span>)}
              <button style={{fontSize:11,fontWeight:600,color:sc.bar,background:"transparent",border:`1px solid ${sc.bar}`,borderRadius:20,padding:"3px 10px",cursor:"pointer",marginLeft:4}} onClick={onEditMenu}>Edit menu →</button>
            </div>
          </div>
        )}

        {/* Category sections */}
        {GROUP_ORDER.map((g,gIdx)=>{
          const items=bygroup[g];if(!items.length)return null;
          const open=!collapsed[g];
          const grpPrepped=items.filter(x=>x.prepped?.trim()).length;
          return(
            <div key={g} className="ps-cat-section" ref={el=>catRefs.current[g]=el}>
              <div className="ps-cat-hdr" style={{background:sc.bar}} onClick={()=>setCollapsed(p=>({...p,[g]:!p[g]}))}>
                <span className="ps-cat-num">{String(gIdx+1).padStart(2,"0")}</span>
                <span className="ps-cat-name">{GROUPS[g].label}</span>
                <span className="ps-cat-count">{grpPrepped} of {items.length} prepped</span>
                <span className={`ps-cat-arr ${open?"open":""}`}>▾</span>
              </div>
              {open&&(
                <div className="items-wrap">
                  <table className="items-tbl">
                    <thead><tr>
                      <th>Ingredient</th><th>QTY</th><th>Unit</th>
                      <th style={{width:"7%"}}>Container</th>
                      <th style={{width:"32%"}}>Notes / Variation</th>
                      <th>Prepped</th><th>Loaded</th><th>Returned</th><th/>
                    </tr></thead>
                    <tbody>
                      {items.map(item=>(
                        <ItemRow key={item.id} item={item}
                          onUpdate={(patch)=>onUpdateItem(item.id,patch)}
                          onRemove={()=>onRemoveItem(item.id)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}

        {event.archived&&(
          <div className="post-notes-section">
            <div className="post-notes-title">Post-Event Notes</div>
            <textarea className="post-notes-ta" rows={4} value={event.postNotes||""} onChange={e=>onUpdate({postNotes:e.target.value})} placeholder="How did it go? Notes for next time…"/>
          </div>
        )}

        {/* ── PREP SHEET SIGNATURES (print only) ── */}
        <div className="print-sigs">
          {[["Kitchen Manager","kitchenManager"],["Load Driver","loadDriver"],["Returns Driver","returnsDriver"]].map(([lbl,key])=>(
            <div key={key} className="print-sig">
              <div className="print-sig-line"/>
              <div className="print-sig-name">{lbl}</div>
            </div>
          ))}
        </div>

        {/* ── PER DISH BREAKDOWN (print only, shown when pmode=perdish or both) ── */}
        <div className="perdish-print">
          <div className="perdish-own-header print-header">
            <div className="print-logo-wrap">
              <div style={{width:30,height:30,borderRadius:"50%",background:"#1A1714",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,fontWeight:800,flexShrink:0}}>BG</div>
              <div>
                <div className="print-logo-text">BORDER GRILL</div>
                <div className="print-logo-sub">TRUCK + CATERING · PER DISH BREAKDOWN</div>
              </div>
            </div>
            <div className="print-event-right">
              <div className="print-event-title">{event.name}</div>
              <div className="print-event-meta">{event.truck}{event.date?` · ${fmt(event.date)}`:""}{event.startTime?` · ${fmtTime(event.startTime)}`:""}{event.guests?` · ${event.guests} guests`:""}</div>
              <div className="perdish-own-timestamp print-timestamp">Printed: {new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"})} at {new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}</div>
            </div>
          </div>
          {event.notes?.trim()&&(
            <div className="print-notes-box">
              <div className="print-notes-lbl">EVENT NOTES &amp; ALERTS — VISIBLE TO ALL STAFF</div>
              <div className="print-notes-txt">{event.notes}</div>
            </div>
          )}
          <div className="perdish-section-title">Ingredient Quantities Per Dish</div>
          <div className="perdish-grid">
            {(event.menuSelections||[]).map(({key,qty,notes,ingNotes})=>{
              const recipe=RECIPES[key]; if(!recipe)return null;
              const ings=recipe.ingredients.filter(i=>ING[i.name]).map(i=>{
                const cfg=ING[i.name];
                const amount="ea" in i?Math.ceil(i.ea*qty):Math.ceil((i.oz||0)*qty/cfg.opU);
                return{name:i.name,qty:amount,unit:cfg.unit,container:cfg.container||"",note:(ingNotes||{})[i.name]||""};
              });
              return(
                <div key={key} className="perdish-dish">
                  <div className="perdish-dish-hdr" style={{background:RCAT_COLORS[recipe.cat]||"#374151"}}>
                    <span className="perdish-dish-name">{recipe.label}</span>
                    <span className="perdish-dish-qty">{qty} {recipe.servingWord}{qty!==1?"s":""}</span>
                  </div>
                  {notes?.trim()&&(
                    <div style={{fontSize:9,padding:"3px 9px",background:"#FFFBEB",borderBottom:"1px solid #F0B429",fontStyle:"italic",color:"#92400E"}}>
                      {notes}
                    </div>
                  )}
                  <table className="perdish-tbl">
                    <thead><tr>
                      <th className="pd-name">Ingredient</th>
                      <th className="pd-qty">Qty</th>
                      <th className="pd-unit">Unit</th>
                      <th className="pd-cont">Container</th>
                      <th className="pd-note">Notes</th>
                    </tr></thead>
                    <tbody>
                      {ings.map(i=>(
                        <tr key={i.name}>
                          <td className="pd-name">{i.name}</td>
                          <td className="pd-qty">{i.qty}</td>
                          <td className="pd-unit">{i.unit}</td>
                          <td className="pd-cont">{i.container||"—"}</td>
                          <td className="pd-note">{i.note||""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>

      </main>

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
function PastEvents({events,onRestore,onSelect,onDuplicate}){
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

  const exportExcel=(event)=>{
    const fmtT=t=>{if(!t)return"";const[h,m]=t.split(":");const hr=parseInt(h,10);return`${hr%12||12}:${m}${hr>=12?"pm":"am"}`};
    const rows=[];
    // Header info
    rows.push(["BORDER GRILL TRUCK + CATERING — PREP SHEET"]);
    rows.push(["Event:", event.name||""]);
    rows.push(["Date:", event.date?new Date(event.date+"T00:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}):"" ]);
    rows.push(["Guests:", event.guests||""]);
    rows.push(["Truck:", event.truck||""]);
    rows.push(["Start Time:", event.startTime?fmtT(event.startTime):"" ]);
    rows.push(["Order Ready By:", event.orderReadyBy?fmtT(event.orderReadyBy):"" ]);
    rows.push(["Load By:", event.loadBy?fmtT(event.loadBy):"" ]);
    if(event.notes) rows.push(["Notes:", event.notes]);
    rows.push([]);
    // Column headers
    rows.push(["ITEM","QTY","UNIT","CONTAINER","NOTES / VARIATION","PREPPED","LOADED","RETURNED"]);
    // Items by group
    GROUP_ORDER.forEach(g=>{
      const items=event.items.filter(i=>(i.group||"SPECIALTY")===g);
      if(!items.length) return;
      rows.push([]);
      rows.push([GROUPS[g].label.toUpperCase()]);
      items.forEach(i=>{
        rows.push([
          i.name||"",
          i.qty||"",
          i.unit||"",
          i.container||"",
          i.notes||(i.variation||""),
          i.prepped||"",
          i.loaded||"",
          i.returned||""
        ]);
      });
    });
    // Convert to CSV
    const csv=rows.map(r=>r.map(cell=>{
      const s=String(cell||"");
      return s.includes(",")||s.includes('"')||s.includes("\n")?`"${s.replace(/"/g,'""')}"`:s;
    }).join(",")).join("\n");
    // Download
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download=`${(event.name||"prep-sheet").replace(/[^a-z0-9]/gi,"-").toLowerCase()}-prep.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
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
              <td onClick={e=>e.stopPropagation()} style={{whiteSpace:"nowrap"}}>
                <button className="btn btn-secondary btn-sm" onClick={()=>onRestore(ev.id)}>Restore</button>
                <button className="btn btn-secondary btn-sm" style={{marginLeft:6}} onClick={()=>onDuplicate(ev.id)}>Duplicate</button>
              </td>
            </tr>);
          })}</tbody>
        </table>
      )}
    </div>
  );
}

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

function MgrApp({devData,mutDev,ING,RECIPES,onExit,isOwner,events,mutEv}){
  const [tab,setTab]=useState("recipes");
  const [editingRecipe,setEditingRecipe]=useState(null);

  const saveRecipe=(key,recipe)=>{mutDev(p=>({...p,customRecipes:{...p.customRecipes,[key]:recipe}}));setEditingRecipe(null);};
  const deleteRecipe=key=>{mutDev(p=>{const cr={...p.customRecipes};delete cr[key];return{...p,customRecipes:cr};}); };
  const saveIngredient=(name,cfg)=>mutDev(p=>({...p,customIngredients:{...p.customIngredients,[name]:cfg}}));
  const updateIngredient=(oldName,newName,cfg)=>{mutDev(p=>{const ci={...p.customIngredients};if(oldName!==newName)delete ci[oldName];ci[newName]=cfg;return{...p,customIngredients:ci};});};
  const deleteIngredient=name=>{mutDev(p=>{const ci={...p.customIngredients};delete ci[name];return{...p,customIngredients:ci};});};
  const savePin=newPin=>{if(newPin?.length>=3)mutDev(p=>({...p,pin:newPin}));};

  const navItems=[{tab:"recipes",label:"Recipes"},{tab:"ingredients",label:"Ingredients"},{tab:"guide",label:"Guide"},{tab:"settings",label:"Settings"},...(isOwner?[{tab:"recycle",label:"Recycle Bin"}]:[])];

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
          <span className="dev-tag">{isOwner?"OWNER":"MGR"}</span>
          <div className="sync-pill"><span className="sync-dot"/><span>Admin mode</span></div>
          <button className="gear-new" onClick={onExit} title="← Staff View" style={{fontSize:11,fontWeight:700,width:"auto",padding:"0 12px"}}>← Staff View</button>
          <div className="avatar-new">JC</div>
        </div>
      </nav>
      <div className="mgr-layout">
        <div className="mgr-sidebar">
          <div className="mgr-nav-section">Management</div>
          {navItems.map(n=>(
            <div key={n.tab} className={`mgr-nav-item ${tab===n.tab?"active":""}`} style={{paddingLeft:20}} onClick={()=>{setEditingRecipe(null);setTab(n.tab);}}>
              <span>{n.label}</span>
            </div>
          ))}
        </div>
        <div className="mgr-content">
          {tab==="recipes"&&(editingRecipe?
            <RecipeEditor recipeKey={editingRecipe==="new"?null:editingRecipe} recipe={editingRecipe==="new"?null:RECIPES[editingRecipe]} isCustom={editingRecipe==="new"||!!devData.customRecipes[editingRecipe]} ING={ING} onSave={saveRecipe} onDelete={isOwner&&editingRecipe!=="new"?()=>{deleteRecipe(editingRecipe);setEditingRecipe(null);}:null} onCancel={()=>setEditingRecipe(null)} isOwner={isOwner} events={events}/>:
            <RecipeList RECIPES={RECIPES} customKeys={Object.keys(devData.customRecipes)} onEdit={setEditingRecipe} onNew={()=>setEditingRecipe("new")} onDelete={key=>{deleteRecipe(key);setEditingRecipe(null);}} isOwner={isOwner} events={events}/>
          )}
          {tab==="ingredients"&&<IngredientManager ING={ING} customKeys={Object.keys(devData.customIngredients||{})} onSave={saveIngredient} onUpdate={updateIngredient} onDelete={deleteIngredient} isOwner={isOwner} RECIPES={RECIPES}/>}
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
                  <button className="btn btn-secondary btn-sm" onClick={()=>mutEv(p=>p.map(e=>e.id===ev.id?{...e,deleted:false,deletedAt:null}:e))}>Restore</button>
                  <button className="btn btn-danger btn-sm" onClick={()=>{if(confirm(`Permanently delete "${ev.name}"? This cannot be undone.`))mutEv(p=>p.filter(e=>e.id!==ev.id));}}>Purge</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab==="settings"&&<DevSettings currentPin={devData.pin} currentOwnerPin={devData.ownerPin} onSave={savePin} onSaveOwner={pin=>mutDev(p=>({...p,ownerPin:pin}))} isOwner={isOwner}/>}
        </div>
      </div>
    </>
  );
}

// ─── RECIPE LIST ───
function RecipeList({RECIPES,customKeys,onEdit,onNew,onDelete,isOwner,events}){
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
        <div style={{display:"flex",flexDirection:"column",gap:10,flexShrink:0}}>
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
          <div style={{display:"flex",flexDirection:"column",gap:10,flexShrink:0}}>
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
