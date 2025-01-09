import React, { useState, useEffect } from 'react';
import { Auth, Amplify } from 'aws-amplify';
import AuthConfig from './config/AuthConfig'; // Adjust the path if needed
import { useNavigate } from 'react-router-dom';
import Router from './router';
import { RecoilRoot } from 'recoil';
import UserContext from './Context/UserContext';

Amplify.configure(AuthConfig); // Configure AWS Amplify

const App = () => {
  const navigate = useNavigate();
  const [userState, setUserState] = useState({
    fetchNewData: false,
    successfullyFetchedDetails: false,
    currentPage: window.localStorage.getItem('currentPage') || '/login', // Default to login page
  });
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenData = urlParams.get('token');
    setToken(tokenData);

    if (window.location.href.includes('localhost')) {
      updateCurrentUser();
    } else {
      if (tokenData) {
        validateToken(tokenData);
      } else {
        setError('No token provided');
        navigate('/login'); // If token is missing, redirect to login
      }
    }
  }, []); // Run once on component mount

  // Function to update current user details when using AWS Amplify
  const updateCurrentUser = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser({ bypassCache: true });
      if (user) {
        setUserState({
          ...userState,
          userDetails: user,
        });
        setIsAuthenticated(true);
        const storedPage = window.localStorage.getItem('currentPage');
        navigate(storedPage || '/'); // Navigate to the stored page or default to '/'
      }
    } catch (err) {
      console.log('Authentication failed:', err);
      setIsAuthenticated(false);
      navigate('/login'); // Redirect to login page on failure
    }
  };

  // Function to validate token passed in URL
  const validateToken = async (token) => {
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        setError('Invalid token format');
        navigate('/login');
        return;
      }

      const payload = JSON.parse(atob(tokenParts[1]));

      // Verify token's issuer and client ID
      if (payload.iss !== 'https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_cDQo1I0VD') {
        setError('Token is not from the correct user pool');
        navigate('/login');
        return;
      }

      if (payload.client_id !== '45d44vo7tuap8rtsm6vpar8kvd') {
        setError('Token is not from the correct application');
        navigate('/login');
        return;
      }

      // If token is valid, fetch user information
      const userInfo = await getUserInfo(token);
      if (userInfo) {
        setUserState({
          userDetails: userInfo.UserAttributes,
        });
        setIsAuthenticated(true);
        const storedPage = window.localStorage.getItem('currentPage');
        navigate(storedPage || '/');
      } else {
        setError('Invalid token data');
        navigate('/login');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('Token validation failed');
      navigate('/login');
    }
  };

  // Fetch user details using the provided token
  const getUserInfo = async (token) => {
    try {
      const region = 'ap-south-1'; // Example region
      const endpoint = `https://cognito-idp.${region}.amazonaws.com/`;

      const headers = {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.GetUser',
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          AccessToken: token,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get user info');
      }

      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error('Detailed error:', error);
      throw error;
    }
  };

  return (
    <UserContext.Provider
      value={{
        userDetails: userState?.userDetails,
        userState,
        setUserState,
        updateCurrentUser,
        isAuthenticated,
        validateToken,
      }}
    >
      <RecoilRoot>
        <div className="min-h-screen bg-dark-navy flex flex-col">
          <div className="flex-grow">
            <Router />
          </div>
        </div>
      </RecoilRoot>
    </UserContext.Provider>
  );
};

export default App;
