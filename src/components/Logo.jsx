export default function Logo({isDev,onClick}){
  return(
    <div className="logo-new" onClick={onClick}>
      <div className="logo-mark-new">BG</div>
      <div style={{lineHeight:1}}>
        <div className="logo-text-new">BORDER GRILL</div>
        <div className="logo-sub-new">Truck + Catering</div>
      </div>
    </div>
  );
}
