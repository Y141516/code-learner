import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

function Field({ label, type='text', placeholder, value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      <input type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{...s.input,...(focused?s.inputFocus:{})}} />
    </div>
  );
}

export default function AuthPage() {
  const [mode, setMode]   = useState('login');
  const [form, setForm]   = useState({name:'',email:'',password:''});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, loginUser } = useApp();

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handle = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    await new Promise(r=>setTimeout(r,600));
    if (mode==='signup') {
      if (!form.name.trim())          { setError('Please enter your name');                 setLoading(false); return; }
      if (!form.email.trim())         { setError('Please enter your email');                setLoading(false); return; }
      if (form.password.length < 6)   { setError('Password must be at least 6 characters'); setLoading(false); return; }
      const r = signup(form);
      if (r.error) { setError(r.error); setLoading(false); return; }
    } else {
      if (!form.email || !form.password) { setError('Please fill all fields'); setLoading(false); return; }
      const r = loginUser(form.email, form.password);
      if (r.error) { setError(r.error); setLoading(false); return; }
    }
    setLoading(false);
  };

  return (
    <div style={s.page}>
      <div style={s.bg}>
        <div style={s.orb1}/><div style={s.orb2}/><div style={s.orb3}/>
        <div style={s.grid}/>
      </div>

      {/* Left panel */}
      <div style={s.left}>
        <div style={s.brand}>
          <div style={s.logo}>⚡</div>
          <span style={s.brandName}>Code Learner</span>
        </div>
        <h1 style={s.hero}>Master Code.<br/><span className="glow-text">Shape the Future.</span></h1>
        <p style={s.heroSub}>Learn Python, JavaScript, HTML & CSS, and Full Stack Development through video-style lessons, live coding, quizzes, and challenges — from beginner to expert.</p>
        <div style={s.features}>
          {[['📹','Video-Style Lessons','Timestamps + theory + concept breakdowns'],
            ['💻','Code Panel','Clear explanations + focused code examples'],
            ['🎯','Quizzes & Challenges','Code in a terminal or answer MCQs'],
            ['🏆','XP, Badges & Streaks','Stay motivated every single day'],
            ['🔓','Progressive Unlocking','Complete levels to unlock the next'],
          ].map(([icon,title,sub])=>(
            <div key={title} style={s.feat}>
              <span style={s.featIcon}>{icon}</span>
              <div><div style={s.featTitle}>{title}</div><div style={s.featSub}>{sub}</div></div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={s.right}>
        <div className="glass anim-scale-in" style={s.card}>
          <div style={s.tabs}>
            {['login','signup'].map(t=>(
              <button key={t} onClick={()=>{setMode(t);setError('');setForm({name:'',email:'',password:''});}}
                style={{...s.tab,...(mode===t?s.tabActive:{})}}>
                {t==='login'?'Sign In':'Sign Up'}
              </button>
            ))}
          </div>
          <h2 style={s.cardTitle}>{mode==='login'?'Welcome back 👋':'Start your journey 🚀'}</h2>
          <p style={s.cardSub}>{mode==='login'?'Sign in to continue learning':'Create your free account'}</p>
          <form onSubmit={handle} style={s.form}>
            {mode==='signup' && <Field label="Full Name" placeholder="Alice Johnson" value={form.name} onChange={v=>set('name',v)}/>}
            <Field label="Email Address" type="email" placeholder="alice@example.com" value={form.email} onChange={v=>set('email',v)}/>
            <Field label="Password" type="password" placeholder={mode==='signup'?'At least 6 characters':'••••••••'} value={form.password} onChange={v=>set('password',v)}/>
            {error && <div style={s.errorBox}>⚠️ {error}</div>}
            <button type="submit" style={s.submitBtn} disabled={loading}>
              {loading ? <span style={s.spinner}/> : mode==='login'?'Sign In →':'Create Account →'}
            </button>
          </form>
          <p style={s.switchText}>
            {mode==='login'?"Don't have an account? ":"Already have an account? "}
            <button onClick={()=>{setMode(mode==='login'?'signup':'login');setError('');setForm({name:'',email:'',password:''});}} style={s.switchBtn}>
              {mode==='login'?'Sign Up free':'Sign In'}
            </button>
          </p>
          <div style={s.divider}><span style={s.line}/><span style={s.divTxt}>100% free · No credit card</span><span style={s.line}/></div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:{display:'flex',minHeight:'100vh',position:'relative',overflow:'hidden'},
  bg:{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'},
  orb1:{position:'absolute',top:'-15%',left:'-8%',width:700,height:700,borderRadius:'50%',background:'radial-gradient(circle,rgba(99,102,241,0.2)0%,transparent 65%)'},
  orb2:{position:'absolute',bottom:'-15%',right:'25%',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.15)0%,transparent 65%)'},
  orb3:{position:'absolute',top:'35%',right:'-8%',width:450,height:450,borderRadius:'50%',background:'radial-gradient(circle,rgba(16,185,129,0.1)0%,transparent 65%)'},
  grid:{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(99,102,241,0.04)1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04)1px,transparent 1px)',backgroundSize:'64px 64px'},
  left:{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',padding:'60px 72px',position:'relative',zIndex:1},
  brand:{display:'flex',alignItems:'center',gap:12,marginBottom:48},
  logo:{width:48,height:48,borderRadius:14,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,boxShadow:'0 4px 20px rgba(99,102,241,0.45)',flexShrink:0},
  brandName:{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:700},
  hero:{fontFamily:'Syne,sans-serif',fontSize:50,fontWeight:800,lineHeight:1.12,marginBottom:18},
  heroSub:{fontSize:16,color:'#94a3b8',lineHeight:1.75,maxWidth:500,marginBottom:44},
  features:{display:'flex',flexDirection:'column',gap:11},
  feat:{display:'flex',alignItems:'center',gap:14,padding:'12px 18px',background:'rgba(22,29,46,0.55)',border:'1px solid rgba(30,45,69,0.9)',borderRadius:13},
  featIcon:{fontSize:20,width:40,height:40,background:'rgba(99,102,241,0.12)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0},
  featTitle:{fontWeight:600,fontSize:14,marginBottom:1},
  featSub:{fontSize:12,color:'#64748b'},
  right:{width:480,display:'flex',alignItems:'center',justifyContent:'center',padding:'40px',position:'relative',zIndex:1},
  card:{width:'100%',borderRadius:24,padding:'36px 34px'},
  tabs:{display:'flex',background:'rgba(6,9,18,0.7)',borderRadius:12,padding:4,marginBottom:28,gap:4},
  tab:{flex:1,padding:'10px',borderRadius:9,fontSize:14,fontWeight:500,color:'#64748b',transition:'all 0.2s',fontFamily:'DM Sans,sans-serif'},
  tabActive:{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',boxShadow:'0 2px 14px rgba(99,102,241,0.45)'},
  cardTitle:{fontFamily:'Syne,sans-serif',fontSize:24,fontWeight:800,marginBottom:5},
  cardSub:{fontSize:14,color:'#64748b',marginBottom:24},
  form:{display:'flex',flexDirection:'column',gap:16},
  field:{display:'flex',flexDirection:'column',gap:6},
  label:{fontSize:13,fontWeight:500,color:'#94a3b8'},
  input:{padding:'13px 16px',background:'rgba(6,9,18,0.65)',border:'1px solid #1e2d45',borderRadius:11,color:'#e8edf5',fontSize:15,outline:'none',transition:'border-color 0.2s,box-shadow 0.2s'},
  inputFocus:{borderColor:'#6366f1',boxShadow:'0 0 0 3px rgba(99,102,241,0.15)'},
  errorBox:{display:'flex',alignItems:'center',gap:8,padding:'11px 14px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:10,color:'#fca5a5',fontSize:13},
  submitBtn:{marginTop:4,padding:'14px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',borderRadius:12,fontSize:16,fontWeight:700,fontFamily:'DM Sans,sans-serif',boxShadow:'0 4px 20px rgba(99,102,241,0.4)',display:'flex',alignItems:'center',justifyContent:'center',minHeight:50,cursor:'pointer',border:'none'},
  spinner:{width:22,height:22,borderRadius:'50%',border:'2.5px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',animation:'spin 0.8s linear infinite',display:'inline-block'},
  switchText:{textAlign:'center',marginTop:18,fontSize:14,color:'#64748b'},
  switchBtn:{color:'#818cf8',fontWeight:600,fontFamily:'DM Sans,sans-serif',fontSize:14,cursor:'pointer',background:'none',border:'none'},
  divider:{display:'flex',alignItems:'center',gap:10,marginTop:20},
  line:{flex:1,height:1,background:'#1e2d45'},
  divTxt:{fontSize:11,color:'#475569',whiteSpace:'nowrap'},
};
