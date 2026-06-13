export default function StepRail({current}){
  const steps=[
    {n:"01",label:"Event details"},
    {n:"02",label:"Build menu"},
    {n:"03",label:"Review & generate"},
  ];
  return(
    <div className="step-bar">
      {steps.map((s,i)=>{
        const state=i<current?"done":i===current?"active":"upcoming";
        return(
          <div key={i} className="step-bar-item-wrap">
            <div className="step-bar-item">
              <div className={`step-badge ${state}`}>{state==="done"?"✓":s.n}</div>
              <div className="step-bar-text">
                <div className={`step-label ${state==="upcoming"?"upcoming":""}`}>{s.label}</div>
              </div>
            </div>
            {i<steps.length-1&&(
              <div className={`step-bar-line ${i<current?"done":""}`}/>
            )}
          </div>
        );
      })}
    </div>
  );
}
