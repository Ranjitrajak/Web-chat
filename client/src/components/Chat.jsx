import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import UsersList from "./UsersList";
import ChatWindow from "./ChatWindow";
import "../styles/Chat.css";
import config from "../config";

const Chat = ({ currentUser, onLogout }) =>{
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const socketRef = useRef();
  const typingTimeoutRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(config.SOCKET_URL);

    // Notify server of login
    socketRef.current.emit("login", currentUser._id);

    // Listen for new messages
    socketRef.current.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Listen for user status changes
    socketRef.current.on("userStatus", ({ userId, isOnline }) => {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, isOnline } : user
        )
      );
    });

    // Listen for typing status
    socketRef.current.on("userTyping", ({ userId, isTyping }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [userId]: isTyping,
      }));
    });

    // Clean up socket on unmount
    return () => {
      socketRef.current.disconnect();
    };
  }, [currentUser._id]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/users`);
        const filteredUsers = response.data.filter(
          (user) => user._id !== currentUser._id
        );
        setUsers(filteredUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, [currentUser._id]);

  // Fetch messages when selected user changes
  useEffect(() => {
    if (selectedUser) {
      const fetchMessages = async () => {
        try {
          const response = await axios.get(
            `${config.API_URL}/messages/${currentUser._id}/${selectedUser._id}`
          );
          setMessages(response.data);
        } catch (err) {
          console.error("Error fetching messages:", err);
        }
      };

      fetchMessages();
    }
  }, [currentUser._id, selectedUser]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setMessages([]);
    setIsTyping(false);
    setNewMessage("");
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;

    const messageData = {
      senderId: currentUser._id,
      receiverId: selectedUser._id,
      content: newMessage,
    };

    // Send message via socket
    socketRef.current.emit("sendMessage", messageData);

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        _id: Date.now().toString(),
        sender: currentUser._id,
        content: newMessage,
        timestamp: new Date(),
      },
    ]);

    // Stop typing indicator
    handleStopTyping();

    // Clear input field
    setNewMessage("");
  };

  const handleTyping = () => {
    if (!isTyping && selectedUser) {
      setIsTyping(true);

      // Emit typing event
      socketRef.current.emit("typing", {
        userId: currentUser._id,
        receiverId: selectedUser._id,
        isTyping: true,
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(handleStopTyping, 2000);
  };

  const handleStopTyping = () => {
    if (isTyping && selectedUser) {
      setIsTyping(false);

      // Emit stop typing event
      socketRef.current.emit("typing", {
        userId: currentUser._id,
        receiverId: selectedUser._id,
        isTyping: false,
      });
    }
  };

  const handleLogout = () => {
    socketRef.current.disconnect();
    onLogout();
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="user-profile">
          <h3>{currentUser.username}</h3>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <UsersList
          users={users}
          selectedUser={selectedUser}
          onSelectUser={handleUserSelect}
        />
      </div>

      <div className="chat-main">
        {selectedUser ? (
          <ChatWindow
            currentUser={currentUser}
            selectedUser={selectedUser}
            messages={messages}
            newMessage={newMessage}
            isTyping={typingUsers[selectedUser._id]}
            onNewMessageChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <div className="no-chat-selected">
            <p>Select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
