import { handlerPath } from '@libs/handler-resolver';

// getGroups function
export const Auth = {
    handler: `${handlerPath(__dirname)}/auth0Authorizer.handler`,
};