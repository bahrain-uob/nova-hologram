"use client";

import type React from "react";
import { useState } from "react";
import "./signup.css";
import { IoIosLock } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { CognitoUserAttribute, CognitoUser } from "amazon-cognito-identity-js";
import { userPool } from "@/app/aws-config";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { addUserToGroup } from "@/app/actions/cognito-actions";

export default function Signup() {
  const router = useRouter();  

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("reader");
  const [error, setError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  // const [username, setUsername] = useState("");

  const handleBackToHome = () => {
    router.push("/");
  };

  const handleLoginClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push("/login");
  };

  // const handleLoginSuccess = (userData) => {
  //   localStorage.setItem('userSession', JSON.stringify(userData));
  //   router.push('/dashboard');
  // };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
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

      userPool.signUp(
        email, // Use email instead of username
        password,
        attributeList,
        [],
        (err, result) => {
          if (err) {
            console.error("Error signing up:", err);
            if (err instanceof Error) {
              setError(err.message || "An error occurred during signup");
            } else {
              setError("An error occurred during signup");
            }
            return;
          }
          console.log("Sign up successful:", result);
          setIsConfirming(true);
        }
      );
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error in signup process:", err);
        setError(err.message || "An error occurred during signup");
      } else {
        console.error("Unknown error in signup process:", err);
        setError("An unknown error occurred during signup");
      }
    }
  };

  const handleVerification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const cognitoUser = new CognitoUser({
        Username: email, // Use email instead of username
        Pool: userPool,
      });

      cognitoUser.confirmRegistration(verificationCode, true, async (err, result) => {
        if (err) {
          console.error("Error confirming sign up:", err);
          if (err instanceof Error) {
            setError(err.message || "Error confirming verification code");
          } else {
            setError("Error confirming verification code");
          }
          return;
        }
        console.log("Verification successful", result);

        try {
          // Add the user to the selected group
          const groupResult = await addUserToGroup(email, userType)

          if (!groupResult.success) {
            console.error("Error adding user to group:", groupResult.error)
            // We dont want to block the user from proceeding if group assignment fails, log & continue
          }

          // Redirect to login after successful verification
          router.push("/login")
        } catch (error) {
          console.error("Error in group assignment:", error)
          // Still redirect to login even if group assignment fails
          router.push("/login")
        }
      })
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error in verification process:", err)
        setError(err.message || "Error confirming verification code")
      } else {
        console.error("Unknown error in verification process:", err)
        setError("An unknown error occurred during verification")
      }
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="logo">
          <Image src="/logo.svg" alt="Logo" onClick={handleBackToHome} width={50} height={50} />
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
            {/* Comment out the username field in the form */}
            {/* <div className="form-group">
              <label htmlFor="userName">Username</label>
              <div className="input-container">
                <span className="input-icon">
                  <FaUser />
                </span>
                <input
                  type="text"
                  id="userName"
                  placeholder="Enter a unique username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div> */}

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
