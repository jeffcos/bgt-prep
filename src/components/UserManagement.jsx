import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { collection, getDocs, doc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

// Secondary Firebase app so creating a user doesn't sign out the current owner
const secondaryApp = initializeApp({
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}, "secondary");
const secondaryAuth = getAuth(secondaryApp);

const ROLES = ["staff", "manager", "owner"];
const ROLE_COLORS = {
  staff:   { bg:"var(--masa-100)",   color:"var(--carbon-200)" },
  manager: { bg:"var(--sol-100)",    color:"var(--sol-700)" },
  owner:   { bg:"var(--clay-50)",    color:"var(--clay-600)" },
};

export default function UserManagement({ currentUserId }){
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showAdd, setShowAdd]   = useState(false);
  const [form, setForm]         = useState({ name:"", email:"", password:"", role:"staff" });
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState("");
  const [error, setError]       = useState("");

  const loadUsers = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "users"));
    setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const handleRoleChange = async (uid, role) => {
    await updateDoc(doc(db, "users", uid), { role });
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role } : u));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return;
    setSaving(true);
    setError("");
    try {
      // Create auth account using secondary app (won't affect current session)
      const cred = await createUserWithEmailAndPassword(secondaryAuth, form.email, form.password);
      const uid = cred.user.uid;
      // Sign out of secondary app immediately
      await secondaryAuth.signOut();
      // Create Firestore user doc
      await setDoc(doc(db, "users", uid), {
        name:  form.name,
        email: form.email,
        role:  form.role,
      });
      setMsg(`${form.name} added successfully.`);
      setForm({ name:"", email:"", password:"", role:"staff" });
      setShowAdd(false);
      loadUsers();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      const code = err.code || "";
      if (code === "auth/email-already-in-use") setError("That email is already registered.");
      else if (code === "auth/weak-password") setError("Password must be at least 6 characters.");
      else setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (uid, name) => {
    if (!confirm(`Remove ${name} from the team? They won't be able to log in.`)) return;
    await deleteDoc(doc(db, "users", uid));
    setUsers(prev => prev.filter(u => u.uid !== uid));
  };

  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:16 }}>
        <div>
          <div className="mgr-page-title">Team</div>
          <div className="mgr-page-sub">{users.length} member{users.length !== 1 ? "s" : ""}</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowAdd(true); setError(""); }}>+ Add User</button>
      </div>

      {msg && <div style={{ background:"var(--cactus-50)", border:"1px solid var(--cactus-100)", borderRadius:8, padding:"10px 14px", fontSize:13, color:"var(--cactus-700)", marginBottom:14 }}>{msg}</div>}

      {/* Add user form */}
      {showAdd && (
        <div style={{ background:"#fff", border:"1px solid var(--carbon-08)", borderRadius:12, padding:"22px 24px", marginBottom:20 }}>
          <div style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>New Team Member</div>
          <form onSubmit={handleAddUser}>
            <div className="fgrid">
              <div className="fg">
                <label className="flabel">Full Name *</label>
                <input className="finput" placeholder="e.g. Maria Garcia" value={form.name} onChange={e => sf("name", e.target.value)} required/>
              </div>
              <div className="fg">
                <label className="flabel">Role</label>
                <select className="finput" value={form.role} onChange={e => sf("role", e.target.value)}>
                  {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
                </select>
              </div>
              <div className="fg">
                <label className="flabel">Email *</label>
                <input className="finput" type="email" placeholder="staff@bordergrill.com" value={form.email} onChange={e => sf("email", e.target.value)} required/>
              </div>
              <div className="fg">
                <label className="flabel">Temporary Password *</label>
                <input className="finput" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => sf("password", e.target.value)} required/>
              </div>
            </div>
            {error && <div style={{ fontSize:13, color:"var(--red)", marginTop:10 }}>{error}</div>}
            <div style={{ display:"flex", gap:8, marginTop:16, justifyContent:"flex-end" }}>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowAdd(false); setError(""); }}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Adding…" : "Add to Team"}</button>
            </div>
          </form>
        </div>
      )}

      {/* User list */}
      {loading ? (
        <div style={{ padding:28, textAlign:"center", color:"var(--carbon-50)" }}>Loading…</div>
      ) : (
        <div style={{ background:"#fff", border:"1px solid var(--carbon-08)", borderRadius:12, overflow:"hidden" }}>
          {users.map((u, i) => (
            <div key={u.uid} style={{ display:"grid", gridTemplateColumns:"1fr auto auto", gap:16, alignItems:"center", padding:"14px 20px", borderTop: i > 0 ? "1px solid var(--carbon-08)" : "none" }}>
              <div>
                <div style={{ fontWeight:600, fontSize:14, color:"var(--carbon-300)" }}>{u.name || "—"}</div>
                <div style={{ fontSize:12, color:"var(--carbon-50)", marginTop:2 }}>{u.email}</div>
              </div>
              <select
                value={u.role || "staff"}
                onChange={e => handleRoleChange(u.uid, e.target.value)}
                disabled={u.uid === currentUserId}
                style={{ border:"1px solid var(--carbon-12)", borderRadius:7, padding:"5px 10px", fontSize:12, fontWeight:600, fontFamily:"inherit", cursor: u.uid === currentUserId ? "default" : "pointer", background: ROLE_COLORS[u.role]?.bg || "var(--masa-100)", color: ROLE_COLORS[u.role]?.color || "var(--carbon-200)", outline:"none" }}
              >
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
              </select>
              {u.uid !== currentUserId ? (
                <button className="btn btn-secondary btn-sm" style={{ color:"var(--red)", borderColor:"#FECACA" }} onClick={() => handleRemove(u.uid, u.name)}>Remove</button>
              ) : (
                <div style={{ width:68 }}/>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
