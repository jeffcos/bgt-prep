import { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import logoImg from "../assets/logo.jpg";

export default function LoginScreen(){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [msg,setMsg]=useState("");
  const [loading,setLoading]=useState(false);
  const [mode,setMode]=useState("login"); // "login" or "forgot"

  const handleLogin=async(e)=>{
    e.preventDefault();
    setError(""); setMsg("");
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

  const handleReset=async(e)=>{
    e.preventDefault();
    if(!email) { setError("Please enter your email."); return; }
    setError(""); setMsg("");
    setLoading(true);
    try{
      await sendPasswordResetEmail(auth,email);
      setMsg("Password reset email sent! Check your inbox.");
      setMode("login");
    } catch(err){
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return(
    <div style={{minHeight:"100vh",background:"var(--surface-sidebar)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:380}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <img 
            src={logoImg} 
            alt="Border Grill" 
            style={{ 
              height: "32px", 
              width: "auto", 
              margin: "0 auto 10px", 
              display: "block",
              mixBlendMode: "multiply",
              objectFit: "contain"
            }} 
          />
          <div style={{fontSize:11,fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",color:"var(--carbon-50)",marginTop:4}}>Truck + Catering · Prep System</div>
        </div>

        {/* Card */}
        <div style={{background:"#fff",borderRadius:14,padding:"32px 28px",boxShadow:"0 4px 24px rgba(43,24,16,.10)"}}>
          <div style={{textAlign: "center"}}>
            <div style={{fontSize:18,fontWeight:700,color:"var(--carbon-300)",marginBottom:4}}>{mode==="login"?"Sign in":"Reset Password"}</div>
            <div style={{fontSize:13,color:"var(--carbon-50)",marginBottom:24}}>{mode==="login"?"Use the credentials your manager set up for you.":"Enter your email to receive a reset link."}</div>
          </div>

          {msg&&(
            <div style={{marginBottom:24,fontSize:13,color:"#15803d",background:"#f0fdf4",padding:"12px",borderRadius:7,fontWeight:600,textAlign:"center"}}>
              {msg}
            </div>
          )}

          {mode==="login" ? (
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
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:5}}>
                    <label style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"var(--carbon-50)"}}>Password</label>
                    <button type="button" onClick={()=>{setMode("forgot");setError("");setMsg("");}} style={{background:"none",border:"none",color:"var(--color-clay-500)",fontSize:11,fontWeight:700,cursor:"pointer",padding:0}}>Forgot?</button>
                  </div>
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
                style={{width:"100%",marginTop:20,padding:"12px",background:"var(--color-clay-500)",color:"#fff",border:"none",borderRadius:8,fontSize:14,fontWeight:700,cursor:loading?"wait":"pointer",opacity:(loading||!email||!password)?0.4:1,transition:"opacity .15s"}}
              >
                {loading?"Signing in…":"Sign In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset}>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div>
                  <label style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"var(--carbon-50)",display:"block",marginBottom:5}}>Email</label>
                  <input
                    className="finput"
                    type="email" value={email} onChange={e=>setEmail(e.target.value)}
                    placeholder="you@bordergrill.com" required autoFocus
                  />
                </div>
              </div>

              {error&&(
                <div style={{marginTop:12,fontSize:13,color:"var(--red)",background:"var(--red-bg)",padding:"8px 12px",borderRadius:7}}>
                  {error}
                </div>
              )}

              <button
                type="submit" disabled={loading||!email}
                style={{width:"100%",marginTop:20,padding:"12px",background:"var(--color-clay-500)",color:"#fff",border:"none",borderRadius:8,fontSize:14,fontWeight:700,cursor:loading?"wait":"pointer",opacity:(loading||!email)?0.4:1,transition:"opacity .15s"}}
              >
                {loading?"Sending…":"Send Reset Link"}
              </button>
              
              <button
                type="button" onClick={()=>{setMode("login");setError("");}}
                style={{width:"100%",marginTop:12,padding:"12px",background:"transparent",color:"var(--carbon-200)",border:"1px solid var(--carbon-12)",borderRadius:8,fontSize:14,fontWeight:700,cursor:"pointer"}}
              >
                Back to Sign In
              </button>
            </form>
          )}
        </div>

        <div style={{textAlign:"center",marginTop:20,fontSize:12,color:"var(--carbon-50)"}}>
          Need access? Contact your manager.
        </div>
      </div>
    </div>
  );
}
