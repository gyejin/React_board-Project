import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const updateUserFromToken = (currentToken) => {
    if (currentToken) {
      const decoded = jwtDecode(currentToken);
      setUser({ id: decoded.sub, username: decoded.username, nickname: decoded.nickname });
      setToken(currentToken);
    } else {
      setUser(null);
      setToken(null);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      updateUserFromToken(storedToken);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post('/auth/login', {
        username,
        password,
      });
      
      const newToken = response.data.access_token;
      localStorage.setItem('access_token', newToken);
      updateUserFromToken(newToken);
      return true;
    } catch (error) {
      console.error('로그인 실패 (AuthContext)', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    updateUserFromToken(null);
  };

  const value = {
    token,
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}