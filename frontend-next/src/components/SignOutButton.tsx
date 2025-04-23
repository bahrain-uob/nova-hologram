"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { userPool } from "@/app/aws-config";

export function SignOutButton({
  className = "",
}: {
  variant?: string;
  className?: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const cognitoUser = userPool.getCurrentUser();

      if (cognitoUser) {
        cognitoUser.signOut();

        localStorage.removeItem("userSession");

        router.push("/login");
      } else {
        console.error("No user found to sign out");
        router.push("/login");
      }
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className={`w-full justify-start hover:bg-primary/5 ${className}`}
      onClick={handleSignOut}
      disabled={isLoading}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isLoading ? "Signing out..." : "Sign Out"}
    </Button>
  );
}
