import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolConfig = {
    UserPoolId: 'us-east-1_U0iB4Rowp',
    ClientId: '509b3p7mb73l7rfi2h16mef65v',
    Region: 'us-east-1'
};

export const userPool = new CognitoUserPool(poolConfig);

