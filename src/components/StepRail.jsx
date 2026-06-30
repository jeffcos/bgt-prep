export default function StepRail({current}){
  const steps=[
    {n:"01",label:"Event details"},
    {n:"02",label:"Build menu"},
    {n:"03",label:"Review & generate"},
  ];
  return(
    <div className="flex items-center gap-4 mb-10">
      {steps.map((s,i)=>{
        const state=i<current?"done":i===current?"active":"upcoming";
        return(
          <div key={i} className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold tracking-wider transition-colors ${state==="done"?"bg-[#E08A75] text-white":state==="active"?"border-2 border-[#E08A75] text-[#E08A75]":"border-2 border-bd text-muted"}`}>{state==="done"?"✓":s.n}</div>
              <div className="flex flex-col">
                <div className={`text-[11px] font-extrabold uppercase tracking-widest ${state==="upcoming"?"text-muted opacity-60":"text-carbon-300"}`}>{s.label}</div>
              </div>
            </div>
            {i<steps.length-1&&(
              <div className={`w-12 h-px ${i<current?"bg-[#E08A75]":"bg-bd"}`}/>
            )}
          </div>
        );
      })}
    </div>
  );
}
