"use client";

import { useState } from "react";
import "./signup.css";
import { IoIosLock } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { CognitoUserAttribute, CognitoUser } from "amazon-cognito-identity-js";
import { userPool } from "@/app/aws-config";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();

  const generateUsername = (name) => {
    // Generate a username from the name (removing spaces) and add a random suffix
    return (
      name.replace(/\s+/g, "").toLowerCase() + Math.floor(Math.random() * 1000)
    );
  };

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("reader");
  const [error, setError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [username, setUsername] = useState("");

  const handleBackToHome = () => {
    router.push("/");
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    router.push("/login");
  };

  // const handleLoginSuccess = (userData) => {
  //   localStorage.setItem('userSession', JSON.stringify(userData));
  //   router.push('/dashboard');
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Generate a username from the full name
      const generatedUsername = generateUsername(fullName);
      setUsername(generatedUsername);

      const attributeList = [
        new CognitoUserAttribute({
          Name: "name",
          Value: fullName,
        }),
        new CognitoUserAttribute({
          Name: "custom:userType",
          Value: userType,
        }),
        new CognitoUserAttribute({
          Name: "email",
          Value: email,
        }),
      ];

      const clientId = userPool.clientId; // Cognito User Pool Client ID

      userPool.signUp(
        generatedUsername,
        password,
        attributeList,
        null,
        (err, result) => {
          if (err) {
            console.error("Error signing up:", err);
            setError(err.message || "An error occurred during signup");
            return;
          }
          console.log("Sign up successful:", result);
          setIsConfirming(true);
        }
      );
    } catch (err) {
      console.error("Error in signup process:", err);
      setError(err.message || "An error occurred during signup");
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const cognitoUser = new CognitoUser({
        Username: username, // Use the stored username instead of email
        Pool: userPool,
      });

      cognitoUser.confirmRegistration(verificationCode, true, (err, result) => {
        if (err) {
          console.error("Error confirming sign up:", err);
          setError(err.message || "Error confirming verification code");
          return;
        }
        console.log("Verification successful", result);
        router.push("/login"); // Redirect to login after successful verification
      });
    } catch (err) {
      console.error("Error in verification process:", err);
      setError(err.message || "Error confirming verification code");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="logo">
          <Image
            src="/logo.svg"
            alt="Logo"
            onClick={handleBackToHome}
            width={50}
            height={50}
          />
        </div>

        <div className="user-type-selector">
          <label className="radio-label">
            <input
              type="radio"
              name="userType"
              value="reader"
              checked={userType === "reader"}
              onChange={() => setUserType("reader")}
            />
            <span className="radio-text">I&apos;m a Reader</span>
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="userType"
              value="librarian"
              checked={userType === "librarian"}
              onChange={() => setUserType("librarian")}
            />
            <span className="radio-text">I&apos;m a Librarian</span>
          </label>
        </div>

        <h1>Get started!</h1>

        {error && <div className="error-message">{error}</div>}

        {!isConfirming ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Full name</label>
              <div className="input-container">
                <span className="input-icon">
                  <FaUser />
                </span>
                <input
                  type="text"
                  id="fullName"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-container">
                <span className="input-icon">
                  <MdEmail />
                </span>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-container">
                <span className="input-icon">
                  <IoIosLock />
                </span>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="signup-button">
              Sign Up
            </button>

            <div className="form-footer">
              <a href="/dashboard" className="guest-link">
                Enter as a Guest
              </a>
              <a href="#" className="login-link" onClick={handleLoginClick}>
                ← Go to Login
              </a>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerification} className="verification-form">
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
            <button type="submit" className="signup-button">
              Verify Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
