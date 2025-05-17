import React from 'react';
import '../styles/ChatWindow.css';

const ChatWindow=({
  currentUser,
  selectedUser,
  messages,
  newMessage,
  isTyping,
  onNewMessageChange,
  onSendMessage
}) =>{
  const messagesEndRef = React.useRef(null);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>{selectedUser.username}</h3>
        <span className={`status ${selectedUser.isOnline ? 'online' : 'offline'}`}>
          {selectedUser.isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
      
      <div className="messages-container">
        {messages.length > 0 ? (
          messages.map(message => (
            <div 
              key={message._id}
              className={`message ${message.sender === currentUser._id ? 'sent' : 'received'}`}
            >
              <div className="message-content">{message.content}</div>
              <div className="message-time">{formatTime(message.timestamp)}</div>
            </div>
          ))
        ) : (
          <div className="no-messages">
            <p>No messages yet. Start a conversation!</p>
          </div>
        )}
        
        {isTyping && (
          <div className="typing-indicator">
            <p>{selectedUser.username} is typing...</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="message-input">
        <textarea
          placeholder="Type a message..."
          value={newMessage}
          onChange={onNewMessageChange}
          onKeyPress={handleKeyPress}
        />
        <button onClick={onSendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatWindow;