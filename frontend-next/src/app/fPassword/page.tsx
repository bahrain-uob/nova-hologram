"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import "./fPassword.css";
import Image from "next/image";
import { CognitoUser } from "amazon-cognito-identity-js";
import { userPool } from "@/app/aws-config";
import { useRouter } from "next/navigation";

export default function PasswordRetrieve() {
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [stage, setStage] = useState("request"); // "request" or "confirm"
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleRequestReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cognitoUser = new CognitoUser({
        Username: emailAddress,
        Pool: userPool,
      });

      cognitoUser.forgotPassword({
        onSuccess: () => {
          setSuccess("    Verification code sent to your email");
          setStage("confirm");
          setLoading(false);
        },
        onFailure: (err) => {
          console.error("Error requesting password reset:", err);
          setError(err.message || "Failed to request password reset");
          setLoading(false);
        },
      });
    } catch (err) {
      console.error("Error in forgot password process:", err);
      if (err instanceof Error) {
        setError(err.message || "An error occurred");
      } else {
        setError("An unknown error occurred");
      }
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const cognitoUser = new CognitoUser({
        Username: emailAddress,
        Pool: userPool,
      });

      cognitoUser.confirmPassword(verificationCode, newPassword, {
        onSuccess() {
          setSuccess("Password has been reset successfully");
          setLoading(false);
          // Redirect to login after a short delay
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        },
        onFailure(err) {
          console.error("Error confirming password reset:", err);
          setError(err.message || "Failed to reset password");
          setLoading(false);
        },
      });
    } catch (err) {
      console.error("Error in confirm password process:", err);
      if (err instanceof Error) {
        setError(err.message || "An error occurred");
      } else {
        setError("An unknown error occurred");
      }
      setLoading(false);
    }
  };

  return (
    <div className="verification-container">
      <div className="verification-card">
        <div className="logo">
          <Image src="/logo.svg" alt="Logo" width={50} height={50} />
        </div>

        <h1>Forgot Password?</h1>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {stage === "request" ? (
          <>
            <p className="verification-subtitle">
              No worries! Enter your email address and we&apos;ll send you a
              reset link.
            </p>

            <form onSubmit={handleRequestReset}>
              <div className="form-group">
                <label htmlFor="emailAddress">Email Address</label>
                <div className="input-container">
                  <input
                    type="email"
                    id="emailAddress"
                    placeholder="Enter your email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="verify-button"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Code"}
              </button>

              <div className="form-footer-verification">
                <Link href="/login" className="back-to-signup">
                  ← Back to Login
                </Link>
              </div>
            </form>
          </>
        ) : (
          <>
            <p className="verification-subtitle">
              Enter the verification code sent to your email and your new
              password.
            </p>

            <form onSubmit={handleConfirmReset}>
              <div className="form-group">
                <label htmlFor="verificationCode">Verification Code</label>
                <div className="input-container">
                  <input
                    type="text"
                    id="verificationCode"
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="input-container">
                  <input
                    type="password"
                    id="newPassword"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-container">
                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="verify-button"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <div className="form-footer-verification">
                <button
                  type="button"
                  className="back-to-signup"
                  onClick={() => setStage("request")}
                >
                  ← Back to Request
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
