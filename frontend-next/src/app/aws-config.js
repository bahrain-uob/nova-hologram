import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolConfig = {
    UserPoolId: 'me-south-1_X7adr285t',
    ClientId: '2vb47i69h5hqh01i3n0au12q8l',
    Region: 'me-south-1'
};

export const userPool = new CognitoUserPool(poolConfig);

