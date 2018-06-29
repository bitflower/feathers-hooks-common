module.exports = function basicAuth() {
    return async function (context) {
        const { params } = context;
        if (!params) {
            return context;
        }
        const { headers } = params;
        if (!headers) {
            return context;
        }
        let { authorization } = params.headers;
        if (!authorization) {
            return context;
        }
        // debug(`The authorization is ${authorization}`);

        // `Authorization` prop needs the "Basic " string and must be longer than 6 chars
        if (authorization.indexOf('Basic ') === 0 && authorization.length <= 6) {
            return context;
        }
        // Extract credentials
        const credentialsBase64 = authorization.replace('Basic ', '');
        let credentialsString = Buffer.from(credentialsBase64, 'base64').toString();
        // debug(`The credentials are ${credentialsString}.`);

        // We need a username AND a password split by :
        if (credentialsString.indexOf(':') < 0) {
            return context;
        }
        let credentials = credentialsString.split(':');
        // debug(`The username is ${credentials[0]}, the password ${credentials[1]}.`);

        // Old version, rough test
        // TODO: @eddystop "Also set context.params.user with user record"
        // context.params.authenticated = credentials[1] === 'start';

        // TODO: use prop names from config
        const login = {
            strategy: 'local',
            username: credentials[0],
            password: credentials[1]
        };
        // debug(`Login in using local strategy.`, login);

        const loggedIn = await context.app.service('/authentication').create(login);
        if (loggedIn && loggedIn.accessToken) {
            // Put JWT token into authorization header for JWT authentication in the next hooks
            authorization = `Bearer ${loggedIn.accessToken}`;
            context.params.headers.authorization = authorization;
            // debug('Logged in with ', authorization);
        }
        // debug('Returning context', context);

        return context;
    };
};