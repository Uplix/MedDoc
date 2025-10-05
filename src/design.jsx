import React, { useState, useEffect } from 'react';
import { LogIn, Lock, User, Plus, Minus, ArrowLeft } from 'lucide-react';

// --- 1. SHARED COMPONENTS ---

const Header = ({ onLoginClick }) => (
  // Uses custom color med-bg-soft
  <header className="fixed top-0 left-0 w-full bg-med-bg-soft shadow-lg z-10">
    <div className="container mx-auto px-4 py-3 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        {/* Uses custom color med-accent */}
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md">
          <Plus className="w-6 h-6 text-med-accent-blue" strokeWidth={3} />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 tracking-wider">MedDoc</h1>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={() => onLoginClick('login')}
          className="text-gray-700 hover:text-med-accent-blue font-semibold transition duration-200"
        >
          Login
        </button>
        <button
          onClick={() => onLoginClick('form')}
          className="text-gray-700 hover:text-med-accent-blue font-semibold transition duration-200"
        >
          Form
        </button>
      </div>
    </div>
  </header>
);

const BackButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="fixed bottom-6 left-6 z-20 
               w-40 h-14 p-4 rounded-full shadow-xl 
               bg-gradient-to-r from-blue-300 to-white 
               border-4 border-med-accent-blue 
               flex items-center justify-center space-x-2 
               text-lg font-bold text-med-accent-blue 
               transition transform hover:scale-105 hover:shadow-2xl active:scale-95"
  >
    <span>BACK</span>
    <ArrowLeft className="w-6 h-6" />
  </button>
);

// --- 2. SCREENS ---

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      onLogin('loading');
    }
  };

  return (
    // Uses custom color med-card-main
    <div className="p-8 md:p-12 bg-med-card-main rounded-3xl shadow-2xl w-full max-w-sm mx-auto">
      <div className="flex justify-center mb-10">
        {/* Uses custom color med-card-main */}
        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-med-card-main shadow-inner">
          <User className="w-12 h-12" strokeWidth={1.5} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center bg-white rounded-xl shadow-md overflow-hidden">
          <User className="w-5 h-5 ml-4 text-gray-400" />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-grow p-3 outline-none border-none text-gray-700 placeholder-gray-400"
            required
          />
        </div>

        <div className="flex items-center bg-white rounded-xl shadow-md overflow-hidden">
          <Lock className="w-5 h-5 ml-4 text-gray-400" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-grow p-3 outline-none border-none text-gray-700 placeholder-gray-400"
            required
          />
        </div>

        <div className="pt-2">
          {/* Uses custom color med-btn-login */}
          <button
            type="submit"
            className="w-full py-3 bg-med-login-red text-white font-bold text-lg rounded-xl shadow-lg transition duration-200 hover:bg-red-700 active:bg-red-800"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
};



// --- 3. MAIN APP COMPONENT ---

const App = () => {
  const [screen, setScreen] = useState('login');

  const navigateTo = (newScreen) => {
    setScreen(newScreen);
  };

  const renderScreen = () => {
    switch (screen) {
      case 'login':
        return <LoginPage onLogin={navigateTo} />;
      case 'loading':
        return <LoadingPage onComplete={navigateTo} />;
      case 'form':
        return <FormPage onBack={() => navigateTo('login')} />;
      default:
        return <LoginPage onLogin={navigateTo} />;
    }
  };

  return (
    <div className={`min-h-screen ${screen === 'form' ? 'bg-white' : 'bg-med-bg-soft'} transition-colors duration-500`}>
      <Header onLoginClick={navigateTo} />
      <main className={`pt-24 ${screen !== 'form' ? 'flex items-center justify-center' : ''} min-h-[calc(100vh-6rem)]`}>
        {renderScreen()}
      </main>
    </div>
  );
};

export default App;
