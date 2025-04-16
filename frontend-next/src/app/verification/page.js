"use client";

import { useState } from "react";
import Link from "next/link";
import "./verification.css";

export default function Verification() {
  const [verificationCode, setVerificationCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Verification attempt with code:", verificationCode);
    // Verification logic here
  };

  return (
    <div className="verification-container">
      <div className="verification-card">
        <div className="logo">
          <div className="circle"></div>
        </div>

        <h1>Verification</h1>

        <p className="verification-subtitle">
          Enter the verification code we sent you through your email.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="verificationCode">Verification code</label>
            <div className="input-container">
              <input
                type="text"
                id="verificationCode"
                placeholder="Enter the code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="verify-button">
            Verify
          </button>

          <div className="form-footer-verification">
            <Link href="/signup" className="back-to-signup">
              ← Back to Signup
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
