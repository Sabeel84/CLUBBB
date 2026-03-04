// App.jsx — wraps clubbb-app.jsx and adds email integration
// The main app logic lives in clubbb-app.jsx
// This file adds: email verification flow + drive notification hooks

import { useState, useEffect } from 'react'
import ClubbbApp from './clubbb-app.jsx'
import { verifyEmailToken, sendVerificationEmail, notifyDriveMembers } from './supabase.js'

// ── Verify Email Page ────────────────────────────────────────────
function VerifyEmailPage() {
  const [status, setStatus] = useState('loading')
  const [type,   setType]   = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token  = params.get('token')
    if (!token) { setStatus('error'); return }

    verifyEmailToken(token).then(({ data, error }) => {
      if (error || !data?.success) {
        setStatus('error')
      } else {
        setType(data.type || 'member')
        setStatus('success')
      }
    })
  }, [])

  const goHome = () => {
    window.history.pushState({}, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Syne:wght@800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Plus Jakarta Sans',sans-serif;background:#f7f7f8;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}
    .vbox{background:#fff;border-radius:24px;padding:56px 44px;max-width:440px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.09)}
    .icon{font-size:64px;margin-bottom:20px;display:block}
    h1{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;letter-spacing:-1px;color:#09090b;margin-bottom:12px}
    p{font-size:15px;color:#71717a;line-height:1.6;margin-bottom:32px}
    .btn{display:inline-block;background:linear-gradient(135deg,#fbbf24,#e8820c);color:#fff;font-weight:700;font-size:15px;padding:14px 36px;border-radius:14px;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(232,130,12,.4);text-decoration:none}
    .btn:hover{opacity:.9}
    .spin{width:40px;height:40px;border:3px solid #f3f3f3;border-top:3px solid #e8820c;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 24px}
    @keyframes spin{to{transform:rotate(360deg)}}
  `

  return (
    <>
      <style>{css}</style>
      <div className="vbox">
        {status === 'loading' && (
          <>
            <div className="spin" />
            <h1>Verifying…</h1>
            <p>Please wait while we verify your email address.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <span className="icon">✅</span>
            <h1>Email Verified!</h1>
            <p>
              {type === 'club'
                ? 'Your club has been registered and is now active. Sign in to manage your club.'
                : 'Your membership is confirmed. Sign in to join your first drive.'}
            </p>
            <button className="btn" onClick={goHome}>Sign In Now →</button>
          </>
        )}
        {status === 'error' && (
          <>
            <span className="icon">❌</span>
            <h1>Link Expired</h1>
            <p>This verification link has already been used or has expired. Please register again.</p>
            <button className="btn" onClick={goHome}>Back to Home</button>
          </>
        )}
      </div>
    </>
  )
}

// ── Root App ─────────────────────────────────────────────────────
export default function App() {
  const [isVerifyPage, setIsVerifyPage] = useState(
    window.location.pathname === '/verify'
  )

  useEffect(() => {
    const onPop = () => setIsVerifyPage(window.location.pathname === '/verify')
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  if (isVerifyPage) return <VerifyEmailPage />

  // Pass email hooks down into the main app via window globals
  // (avoids needing to modify clubbb-app.jsx internals)
  window.__clubbb_hooks = {
    onMemberRegister: async (formData) => {
      await sendVerificationEmail(formData.email, 'member', formData)
    },
    onClubRegister: async (formData) => {
      await sendVerificationEmail(formData.email, 'club', formData)
    },
    onDrivePosted: async (drive) => {
      await notifyDriveMembers(drive)
    },
  }

  return <ClubbbApp />
}
