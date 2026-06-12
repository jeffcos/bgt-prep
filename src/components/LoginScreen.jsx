import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function LoginScreen(){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  const handleLogin=async(e)=>{
    e.preventDefault();
    setError("");
    setLoading(true);
    try{
      await signInWithEmailAndPassword(auth,email,password);
    } catch(err){
      const code=err.code||"";
      if(code==="auth/invalid-credential"||code==="auth/wrong-password"||code==="auth/user-not-found"){
        setError("Incorrect email or password.");
      } else if(code==="auth/too-many-requests"){
        setError("Too many attempts. Try again in a few minutes.");
      } else if(code==="auth/network-request-failed"){
        setError("Network error. Check your connection.");
      } else {
        setError(`Error: ${code||err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return(
    <div style={{minHeight:"100vh",background:"var(--surface-sidebar)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:380}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{width:52,height:52,borderRadius:"50%",background:"var(--clay-500)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",color:"#fff",fontSize:18,fontWeight:800,letterSpacing:".02em"}}>BG</div>
          <div style={{fontSize:20,fontWeight:800,letterSpacing:".12em",textTransform:"uppercase",color:"var(--clay-500)"}}>Border Grill</div>
          <div style={{fontSize:11,fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",color:"var(--carbon-50)",marginTop:4}}>Truck + Catering · Prep System</div>
        </div>

        {/* Card */}
        <div style={{background:"#fff",borderRadius:14,padding:"32px 28px",boxShadow:"0 4px 24px rgba(43,24,16,.10)"}}>
          <div style={{fontSize:18,fontWeight:700,color:"var(--carbon-300)",marginBottom:4}}>Sign in</div>
          <div style={{fontSize:13,color:"var(--carbon-50)",marginBottom:24}}>Use the credentials your manager set up for you.</div>

          <form onSubmit={handleLogin}>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <label style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"var(--carbon-50)",display:"block",marginBottom:5}}>Email</label>
                <input
                  className="finput"
                  type="email" value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder="you@bordergrill.com" required autoFocus
                />
              </div>
              <div>
                <label style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"var(--carbon-50)",display:"block",marginBottom:5}}>Password</label>
                <input
                  className="finput"
                  type="password" value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder="••••••••" required
                />
              </div>
            </div>

            {error&&(
              <div style={{marginTop:12,fontSize:13,color:"var(--red)",background:"var(--red-bg)",padding:"8px 12px",borderRadius:7}}>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading||!email||!password}
              style={{width:"100%",marginTop:20,padding:"12px",background:"var(--clay-500)",color:"#fff",border:"none",borderRadius:8,fontSize:14,fontWeight:700,cursor:loading?"wait":"pointer",opacity:(loading||!email||!password)?0.4:1,transition:"opacity .15s"}}
            >
              {loading?"Signing in…":"Sign In"}
            </button>
          </form>
        </div>

        <div style={{textAlign:"center",marginTop:20,fontSize:12,color:"var(--carbon-50)"}}>
          Need access? Contact your manager.
        </div>
      </div>
    </div>
  );
}
