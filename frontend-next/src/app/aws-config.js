import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolConfig = {
    UserPoolId: 'us-east-1_U0iB4Rowp',
    ClientId: '509b3p7mb73l7rfi2h16mef65v',
    Region: 'us-east-1'
    // add the client secret
    
};

export const CLIENT_SECRET = '1ubm054n3ic02h1t1e90ofhb3rup4pao56cdipqfoglgcvqsae07'; // <- export separately

export const userPool = new CognitoUserPool(poolConfig);

