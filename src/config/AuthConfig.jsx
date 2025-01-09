//let uri = 'https://dkgqm8d3sc8l1.cloudfront.net';
let uri = 'https://d21f3o8hvyitp3.cloudfront.net';
 
if (window.location.href.includes('localhost')) {
  // uri = 'http://localhost:5173/';
  uri = 'http://localhost:3000';
}

const AuthConfig = {
  Auth: {
    // identityPoolId: 'ap-south-1:852b3e63-e23e-48bd-9ebf-a7fba4be788a',
    // region: 'ap-south-1',
    // userPoolId: 'ap-south-1_ZJqyRUTlW',
    // userPoolWebClientId: 'asc4njk8gjop7ccr192ke6gri',
    identityPoolId: "ap-south-1:a4bcb78f-278f-4f4c-80a3-61bc434fb0bf",
    region: "ap-south-1",
    userPoolId: "ap-south-1_cDQo1I0VD",
    userPoolWebClientId: "45d44vo7tuap8rtsm6vpar8kvd",
  },
  oauth: {
    //domain: 'demos-cloudthat.auth.ap-south-1.amazoncognito.com',
    domain: "ap-south-1cdqo1i0vd.auth.ap-south-1.amazoncognito.com",
    scope: ['phone', 'email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
    redirectSignIn: uri,
    redirectSignOut: uri,
    responseType: 'token',

    flow:'implicit'
  },
};

export default AuthConfig;



