import React from 'react';
import '../styles/UsersList.css';

const UsersList=({ users, selectedUser, onSelectUser })=> {
  return (
    <div className="users-list-container">
      <h3>Contacts</h3>
      <ul className="users-list">
        {users.length > 0 ? (
          users.map(user => (
            <li 
              key={user._id}
              className={`user-item ${selectedUser && selectedUser._id === user._id ? 'active' : ''}`}
              onClick={() => onSelectUser(user)}
            >
              <div className="user-info">
                <span className="username">{user.username}</span>
                <span className={`status ${user.isOnline ? 'online' : 'offline'}`}>
                  {user.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </li>
          ))
        ) : (
          <li className="no-users">No users available</li>
        )}
      </ul>
    </div>
  );
}

export default UsersList;