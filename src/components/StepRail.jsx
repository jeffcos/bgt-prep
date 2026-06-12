export default function StepRail({current}){
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
