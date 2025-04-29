"use server"

import { AdminAddUserToGroupCommand, CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider"

// Initialize the Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: "us-east-1",
  credentials: {
    // Access key and secret access key loaded from environment variables
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "", 
  },
})

// Get the User Pool ID from environment variables
const userPoolId = process.env.COGNITO_USER_POOL_ID || "us-east-1_6IShYXxsJ";

/**
 * Add a user to a Cognito group
 * @param username The username (email) of the user
 * @param groupName The name of the group to add the user to (reader or librarian)
 */

export async function addUserToGroup(username: string, groupName: string) {
  try {
    // Validate the group name
    if (groupName !== "reader" && groupName !== "librarian") {
      throw new Error("Invalid group name. Must be 'reader' or 'librarian'")
    }

    // Create the command to add the user to the group
    const command = new AdminAddUserToGroupCommand({
      UserPoolId: userPoolId,
      Username: username,
      GroupName: groupName,
    })

    // Execute the command
    await cognitoClient.send(command)
    return { success: true }
  } catch (error) {
    console.error("Error adding user to group:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
