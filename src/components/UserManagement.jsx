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
const ROLE_LABELS = {
  staff: "Staff",
  manager: "Manager",
  owner: "Admin",
};
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
      
      // Immediately send a password reset email so they can log in
      await sendPasswordResetEmail(secondaryAuth, form.email);
      
      // Sign out of secondary app immediately
      await secondaryAuth.signOut();
      
      // Create Firestore user doc
      await setDoc(doc(db, "users", uid), {
        name:  form.name,
        email: form.email,
        role:  form.role,
      });
      setMsg(`${form.name} added successfully. A password reset email has been sent to them.`);
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

  const handleManualReset = async (email, name) => {
    if (!confirm(`Send a password reset email to ${name} (${email})?`)) return;
    try {
      await sendPasswordResetEmail(secondaryAuth, email);
      setMsg(`Password reset email sent to ${email}.`);
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="text-3xl font-extrabold text-carbon-300 leading-tight tracking-[-.02em]">Team</div>
          <div className="text-sm font-semibold text-carbon-50 mt-1">{users.length} member{users.length !== 1 ? "s" : ""}</div>
        </div>
        <button className="bg-[#E08A75] text-white border-none px-6 py-3 rounded-xl text-sm font-bold shadow-custom transition-colors hover:bg-clay-600 cursor-pointer" onClick={() => { setShowAdd(true); setError(""); }}>+ Add User</button>
      </div>

      {msg && <div className="bg-cactus-50 border border-cactus-100 rounded-xl px-4 py-3 text-[13px] font-medium text-cactus-700 mb-4">{msg}</div>}

      {/* Add user form */}
      {showAdd && (
        <div className="bg-white border border-bd rounded-2xl p-6 shadow-custom mb-6">
          <div className="text-[15px] font-extrabold text-carbon-300 mb-6 tracking-tight">New Team Member</div>
          <form onSubmit={handleAddUser}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-8">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-muted uppercase tracking-[.12em]">Full Name *</label>
                <input className="w-full box-border px-4 py-3 rounded-xl border border-carbon-20 bg-white text-[13px] font-medium outline-none focus:border-[#E08A75] transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.03)]" placeholder="e.g. Maria Garcia" value={form.name} onChange={e => sf("name", e.target.value)} required/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-muted uppercase tracking-[.12em]">Role</label>
                <select className="w-full box-border px-4 py-3 rounded-xl border border-carbon-20 bg-white text-[13px] font-medium outline-none focus:border-[#E08A75] transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.03)]" value={form.role} onChange={e => sf("role", e.target.value)}>
                  {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-muted uppercase tracking-[.12em]">Email *</label>
                <input className="w-full box-border px-4 py-3 rounded-xl border border-carbon-20 bg-white text-[13px] font-medium outline-none focus:border-[#E08A75] transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.03)]" type="email" placeholder="staff@bordergrill.com" value={form.email} onChange={e => sf("email", e.target.value)} required/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-muted uppercase tracking-[.12em]">Temporary Password *</label>
                <input className="w-full box-border px-4 py-3 rounded-xl border border-carbon-20 bg-white text-[13px] font-medium outline-none focus:border-[#E08A75] transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.03)]" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => sf("password", e.target.value)} required/>
              </div>
            </div>
            {error && <div className="text-[13px] font-semibold text-red mb-4">{error}</div>}
            <div className="flex gap-3 justify-end pt-5 border-t border-carbon-08">
              <button type="button" className="bg-white border border-[#D4CCC2] text-carbon-300 px-5 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer hover:bg-black/5 shadow-sm transition-colors" onClick={() => { setShowAdd(false); setError(""); }}>Cancel</button>
              <button type="submit" className="bg-[#E08A75] text-white border-none px-6 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer hover:bg-clay-600 shadow-sm transition-colors disabled:opacity-50" disabled={saving}>{saving ? "Adding…" : "Add to Team"}</button>
            </div>
          </form>
        </div>
      )}

      {/* User list */}
      {loading ? (
        <div className="p-10 text-center font-medium text-carbon-50">Loading…</div>
      ) : (
        <div className="bg-white border border-bd rounded-2xl overflow-hidden shadow-sm">
          {users.map((u, i) => (
            <div key={u.uid} className={`grid grid-cols-[1fr_auto_auto] gap-4 items-center px-6 py-4 ${i > 0 ? "border-t border-carbon-08" : ""}`}>
              <div>
                <div className="font-extrabold text-sm text-carbon-300">{u.name || "—"}</div>
                <div className="text-xs font-medium text-carbon-50 mt-0.5">{u.email}</div>
              </div>
              <select
                value={u.role || "staff"}
                onChange={e => handleRoleChange(u.uid, e.target.value)}
                disabled={u.uid === currentUserId}
                className="border border-carbon-12 rounded-lg px-3 py-1.5 text-xs font-bold outline-none"
                style={{ cursor: u.uid === currentUserId ? "default" : "pointer", background: ROLE_COLORS[u.role]?.bg || "var(--masa-100)", color: ROLE_COLORS[u.role]?.color || "var(--carbon-200)" }}
              >
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>)}
              </select>
              {u.uid !== currentUserId ? (
                <div className="flex gap-2">
                  <button className="bg-white border border-carbon-12 text-carbon-200 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-black/5 transition-colors" onClick={() => handleManualReset(u.email, u.name)}>Reset Auth</button>
                  <button className="bg-white border border-[#FECACA] text-red px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-[#FEF2F2] transition-colors" onClick={() => handleRemove(u.uid, u.name)}>Remove</button>
                </div>
              ) : (
                <div className="w-[155px]"/>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
