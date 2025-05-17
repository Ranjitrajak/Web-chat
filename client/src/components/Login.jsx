import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Login.css';
import config from '../config';

const Login=({ onLogin })=> {
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/users`);
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Username cannot be empty');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${config.API_URL}/user/create`, { username });
      onLogin(response.data);
    } catch (err) {
      console.error('Error creating user:', err);
      if (err.response && err.response.status === 400 && err.response.data?.message) {
         setError(err.response.data.message); 
       } else {
          setError('Failed to create user. Please try again.');
        }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectUser = (user) => {
    onLogin(user);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Simple Chat App</h1>
        
        <form onSubmit={handleCreateUser}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create New User'}
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </form>
        
        <div className="existing-users">
          <h3>Or select an existing user:</h3>
          <ul className="users-list">
            {users.map(user => (
              <li key={user._id} onClick={() => handleSelectUser(user)}>
                {user.username}
                <span className={user.isOnline ? 'status online' : 'status offline'}>
                  {user.isOnline ? 'Online' : 'Offline'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Login;