import React from 'react';

const Header = ({ activeTab, setActiveTab }) => {
  return (
    <header>
      <h1>LeetMate ⚡🚀</h1>
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'solution' ? 'active' : ''}`}
          onClick={() => setActiveTab('solution')}
        >
          Solution
        </button>
        <button 
          className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          Chat
        </button>
        <button 
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>
    </header>
  );
};

export default Header;