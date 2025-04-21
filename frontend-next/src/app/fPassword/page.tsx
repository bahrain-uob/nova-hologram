"use client";

import { useState } from "react";
import Link from "next/link";
import "./fPassword.css";
import Image from "next/image";

export default function PasswordRetrieve() {
  const [emailAddress, setEmailAddress] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Forgot password from email:", emailAddress);
    // Forgot Password logic here
  };

  return (
    <div className="verification-container">
      <div className="verification-card">
        <div className="logo">
          <Image src="/logo.svg" alt="Logo" width={50} height={50} />
        </div>

        <h1>Forgot Password?</h1>

        <p className="verification-subtitle">
          No worries! Enter your email address and we&apos;ll send you a reset link.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="EmailAddress">Email Address</label>
            <div className="input-container">
              <input
                type="text"
                id="emailAddress"
                placeholder="Enter your email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="verify-button">
            Send Reset Link
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
