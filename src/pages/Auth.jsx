import { useState } from "react";
import tokenStore from "../config/tokenStore";
import { saveTokenToFirestore } from "../services/tokenService";
import "../styles/auth.css";

const LOGIN_URL     = "https://pwthor.live/api/auth/login";
const TOKEN_URL     = "https://api.penpencil.co/v3/oauth/token";
const CLIENT_ID     = "system-admin";
const CLIENT_SECRET = "KjPXuAVfC5xbmgreETNMaL7z";
const ORG_ID        = "5eb393ee95fab7468a79d189";

function Auth() {
    const [step, setStep]           = useState("phone"); // "phone" | "otp" | "done"
    const [phone, setPhone]         = useState("");
    const [otp, setOtp]             = useState("");
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState("");
    const [tokenInfo, setTokenInfo] = useState(null);

    // ── Step 1: request OTP ─────────────────────────────────────────────────
    const requestOtp = async (e) => {
        e.preventDefault();
        setError("");

        const digits = phone.replace(/\D/g, "");
        if (digits.length !== 10) {
            setError("Enter a valid 10-digit phone number.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(LOGIN_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber: digits })
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.message || `Request failed (${res.status})`);
            }

            setStep("otp");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2: verify OTP → extract token → save to Firestore + memory ─────
    const verifyOtp = async (e) => {
        e.preventDefault();
        setError("");

        const otpDigits = otp.replace(/\D/g, "");
        if (otpDigits.length < 4) {
            setError("Enter the OTP you received.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(TOKEN_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username:       phone.replace(/\D/g, ""),
                    otp:            otpDigits,
                    client_id:      CLIENT_ID,
                    client_secret:  CLIENT_SECRET,
                    grant_type:     "password",
                    organizationId: ORG_ID,
                    latitude:       0,
                    longitude:      0
                })
            });

            const body = await res.json();

            if (!res.ok || !body?.data?.access_token) {
                throw new Error(
                    body.message || body.error || `Auth failed (${res.status})`
                );
            }

            const token     = "Bearer " + body.data.access_token;
            const expiresIn = body.data.expires_in ?? null;

            // 1. Put in memory immediately so uploads work right away
            tokenStore.set(token);

            // 2. Persist to Firestore so next app load skips login
            await saveTokenToFirestore(token, expiresIn);

            const expiresAt = expiresIn
                ? new Date(expiresIn).toLocaleString()
                : "unknown";

            setTokenInfo({ token, expiresAt });
            setStep("done");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setStep("phone");
        setPhone("");
        setOtp("");
        setError("");
        setTokenInfo(null);
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                {/* ── Header ── */}
                <div className="auth-header">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <h1>Authenticate</h1>
                    <p>Login once — token is saved and reused automatically.</p>
                </div>

                {/* ── Step: phone ── */}
                {step === "phone" && (
                    <form onSubmit={requestOtp} className="auth-form">
                        <label htmlFor="auth-phone">Phone Number</label>
                        <div className="auth-input-row">
                            <span className="auth-prefix">+91</span>
                            <input
                                id="auth-phone"
                                type="tel"
                                inputMode="numeric"
                                maxLength={10}
                                placeholder="10-digit number"
                                value={phone}
                                onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                                autoFocus
                                autoComplete="tel"
                                disabled={loading}
                            />
                        </div>
                        {error && <p className="auth-error">{error}</p>}
                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? "Sending OTP…" : "Send OTP"}
                        </button>
                    </form>
                )}

                {/* ── Step: otp ── */}
                {step === "otp" && (
                    <form onSubmit={verifyOtp} className="auth-form">
                        <p className="auth-hint">
                            OTP sent to <strong>+91 {phone}</strong>
                        </p>
                        <label htmlFor="auth-otp">Enter OTP</label>
                        <input
                            id="auth-otp"
                            type="text"
                            inputMode="numeric"
                            maxLength={8}
                            placeholder="• • • • • •"
                            value={otp}
                            onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                            autoFocus
                            autoComplete="one-time-code"
                            disabled={loading}
                            className="auth-otp-input"
                        />
                        {error && <p className="auth-error">{error}</p>}
                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? "Verifying…" : "Verify & Login"}
                        </button>
                        <button
                            type="button"
                            className="auth-btn-ghost"
                            onClick={() => { setStep("phone"); setError(""); }}
                            disabled={loading}
                        >
                            ← Change number
                        </button>
                    </form>
                )}

                {/* ── Step: done ── */}
                {step === "done" && tokenInfo && (
                    <div className="auth-success">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <h2>Token saved!</h2>
                        <p>
                            Stored in Firestore. You won't need to login again
                            until this token expires.
                        </p>
                        <div className="auth-token-box">
                            <span className="auth-token-label">Expires</span>
                            <code>{tokenInfo.expiresAt}</code>
                        </div>
                        <div className="auth-token-box">
                            <span className="auth-token-label">Token (preview)</span>
                            <code>{tokenInfo.token.slice(0, 40)}…</code>
                        </div>
                        <button className="auth-btn" onClick={reset}>
                            Login with different number
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}

export default Auth;
