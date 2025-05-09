import { CognitoUser, CognitoUserPool, AuthenticationDetails, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { awsConfig } from '../config/aws-config';

// Create a user pool with the configuration from environment variables
const userPool = new CognitoUserPool({
  UserPoolId: awsConfig.cognito.userPoolId,
  ClientId: awsConfig.cognito.clientId,
});

// Interface for login parameters
interface LoginParams {
  email: string;
  password: string;
}

// Interface for signup parameters
interface SignupParams {
  // username: string;
  password: string;
  email: string;
  name: string;
  userType: 'reader' | 'librarian';
}

// Interface for verification parameters
interface VerifyParams {
  username: string;
  code: string;
}

/**
 * Sign in a user with Cognito
 */
export const signIn = (params: LoginParams): Promise<any> => {
  const { email, password } = params;
  
  const authenticationDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });
  
  const cognitoUser = new CognitoUser({
    Username: email,
    Pool: userPool,
  });
  
  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        resolve({
          accessToken: result.getAccessToken().getJwtToken(),
          idToken: result.getIdToken().getJwtToken(),
          refreshToken: result.getRefreshToken().getToken(),
          user: cognitoUser,
        });
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
};

/**
 * Sign up a new user with Cognito
 */
export const signUp = (params: SignupParams): Promise<any> => {
  const { email, password, name, userType } = params;
  
  const attributeList = [
    new CognitoUserAttribute({ Name: 'email', Value: email }),
    new CognitoUserAttribute({ Name: 'name', Value: name }),
    new CognitoUserAttribute({ Name: 'custom:userType', Value: userType }),
  ];
  
  return new Promise((resolve, reject) => {
    userPool.signUp(email, password, attributeList, null as any, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

/**
 * Verify a user's account with the verification code
 */
export const verifyAccount = (params: VerifyParams): Promise<any> => {
  const { username, code } = params;
  
  const cognitoUser = new CognitoUser({
    Username: username,
    Pool: userPool,
  });
  
  return new Promise((resolve, reject) => {
    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

/**
 * Sign out the current user
 */
export const signOut = (): void => {
  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut();
  }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = (): Promise<any> => {
  const cognitoUser = userPool.getCurrentUser();
  
  if (!cognitoUser) {
    return Promise.reject(new Error('No user found'));
  }
  
  return new Promise((resolve, reject) => {
    cognitoUser.getSession((err: Error | null, session: any) => {
      if (err) {
        reject(err);
        return;
      }
      
      cognitoUser.getUserAttributes((err, attributes) => {
        if (err) {
          reject(err);
          return;
        }
        
        const userData = {
          username: cognitoUser.getUsername(),
          attributes: attributes?.reduce((acc: Record<string, string>, attr) => {
            acc[attr.getName()] = attr.getValue();
            return acc;
          }, {}),
          tokens: {
            accessToken: session.getAccessToken().getJwtToken(),
            idToken: session.getIdToken().getJwtToken(),
            refreshToken: session.getRefreshToken().getToken(),
          },
        };
        
        resolve(userData);
      });
    });
  });
};

export default {
  signIn,
  signUp,
  verifyAccount,
  signOut,
  getCurrentUser,
};
