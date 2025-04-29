"use client";

import { useState } from "react";
import "./login.css";
import { IoIosLock } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import { userPool } from "@/app/aws-config";
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
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          console.log("Login successful:", result);

          // Get user attributes to determine user type
          cognitoUser.getUserAttributes((err, attributes) => {
            if (err) {
              console.error("Error getting user attributes:", err);
              return;
            }

            // Find userType from attributes
            let userType = "reader"; // Default to reader
            if (attributes) {
              for (let i = 0; i < attributes.length; i++) {
                if (attributes[i].getName() === "custom:userType") {
                  userType = attributes[i].getValue();
                  break;
                }
              }
            }

            handleLoginSuccess({
              email,
              userType,
              accessToken: result.getAccessToken().getJwtToken(),
              idToken: result.getIdToken().getJwtToken(),
            });
          });
        },
        onFailure: (err) => {
          console.error("Login failed:", err);
          setError(
            err.message || "Invalid email or password. Please try again."
          );
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          console.log(
            "New password required",
            userAttributes,
            requiredAttributes
          );
          setError("Please contact administrator to set up your password.");
        },
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
