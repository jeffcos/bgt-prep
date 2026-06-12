// ─── GROUPS ───
export const GROUPS = {
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
export const GROUP_ORDER = ["PROTEINS","TORTILLAS","SALSAS","VEGETABLES","DAIRY","GRAINS","SPECIALTY","LIQ","BEER","WINE","BEV"];

export const STICKER={
  orange:{bar:"#E09A78",dot:"#C47652",soft:"#FBF0EA",ink:"#7A4530"},
  red:   {bar:"#D98080",dot:"#BF5C5C",soft:"#FBEDEC",ink:"#7A3030"},
  blue:  {bar:"#7AAFD4",dot:"#5590BB",soft:"#EAF3FA",ink:"#2D5A7A"},
  green: {bar:"#7AB87A",dot:"#5A9A5A",soft:"#EAF4EA",ink:"#2D5A2D"},
  pink:  {bar:"#E0A0BC",dot:"#C47898",soft:"#FBEFF4",ink:"#7A3A54"},
  yellow:{bar:"#E0C070",dot:"#C4A040",soft:"#FBF6E4",ink:"#7A5C10"},
  purple:{bar:"#A888CC",dot:"#8A64B0",soft:"#F3EDF9",ink:"#4A3066"},
  navy:  {bar:"#7090B8",dot:"#4E6E9A",soft:"#EAF0F8",ink:"#2A3E5A"},
};
export const STICKER_KEYS=["orange","red","blue","green","pink","yellow","purple","navy"];
export const getStickerKey=ev=>ev.color&&STICKER[ev.color]?ev.color:"orange";
export const getSticker=ev=>STICKER[getStickerKey(ev)];

export const EVENT_COLORS=[
  {name:"Orange",hex:"orange"},{name:"Red",hex:"red"},{name:"Blue",hex:"blue"},
  {name:"Green",hex:"green"},{name:"Pink",hex:"pink"},{name:"Yellow",hex:"yellow"},
  {name:"Purple",hex:"purple"},{name:"Navy",hex:"navy"},
];

export const RECIPE_CATS = ["TACOS","QUESADILLAS","BURRITOS","BOWLS","ENTREES","SIDES","APPETIZERS","SWEETS"];
export const RCAT_COLORS = {TACOS:"#C9541E",QUESADILLAS:"#6D4FA3",BURRITOS:"#B38B18",BOWLS:"#1F7A6E",ENTREES:"#374151",SIDES:"#2563EB",APPETIZERS:"#0F766E",SWEETS:"#BE185D"};
