"use client";

import { useState } from "react";
import "./login.css";
import { IoIosLock } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { signIn } from "@/lib/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleBackToHome = () => {
    router.push("/");
  };

  const handleSignupClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push("/signup");
  };

  const handleForgotPasswordClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push("/fPassword");
  };

  interface UserData {
    email: string;
    userType: string;
    accessToken: string;
    idToken: string;
  }

  const handleLoginSuccess = (userData: UserData) => {
    // Store in localStorage for client-side access
    localStorage.setItem("userSession", JSON.stringify(userData));

    // Store in cookies for middleware access
    document.cookie = `userSession=${JSON.stringify(userData)}; path=/; max-age=86400; SameSite=Strict`;

    // Redirect based on user type
    if (userData.userType === "reader") {
      router.push("/reader-dashboard");
    } else if (userData.userType === "librarian") {
      router.push("/dashboard");
    } else {
      // Default fallback if userType is not specified
      router.push("/dashboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      // Use Cognito SDK directly
      const result = await signIn({ email, password });
      
      console.log("Login successful:", result.user);
      
      // Extract user attributes
      const userAttributes = result.user.attributes || {};
      const userEmail = email;
      const userType = userAttributes['custom:userType'] || 'reader';
      const userName = userAttributes['name'] || '';
      
      // Store user info for client-side access
      localStorage.setItem("userEmail", userEmail);
      localStorage.setItem("userType", userType);
      localStorage.setItem("userName", userName);
      
      handleLoginSuccess({
        email: userEmail,
        userType: userType,
        accessToken: result.accessToken,
        idToken: result.idToken,
      });
    } catch (err: Error | unknown) {
      const error = err as Error;
      console.error("Login error:", err);
      setError(error.message || "An error occurred during login.");
      console.log("Login error:", error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo">
          <Image
            src="/logo.svg"
            alt="Logo"
            onClick={handleBackToHome}
            width={50}
            height={50}
          />
        </div>

        <h1>Welcome back!</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
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

          <button type="submit" className="login-button">
            Login
          </button>

          <div className="form-footer">
            <a
              href="#"
              onClick={handleForgotPasswordClick}
              className="forgot-password"
            >
              Forgot password?
            </a>
            <a href="#" onClick={handleSignupClick} className="back-to-signup">
              ← Back to Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
