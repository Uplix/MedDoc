import React, { useState, useEffect } from 'react';
import { LogIn, Lock, User, Plus, Minus, ArrowLeft } from 'lucide-react';

// --- 1. SHARED COMPONENTS ---

const Header = ({ onLoginClick }) => (
  // Uses custom color med-bg-soft
  <header className="fixed top-0 left-0 w-full med-bg-soft shadow-lg z-10">
    <div className="container mx-auto px-4 py-3 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        {/* Uses custom color med-accent */}
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md">
          <Plus className="w-6 h-6 text-med-accent" strokeWidth={3} />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 tracking-wider">MedDoc</h1>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={() => onLoginClick('login')}
          className="text-gray-700 hover:text-med-accent font-semibold transition duration-200"
        >
          Login
        </button>
        <button
          onClick={() => onLoginClick('form')}
          className="text-gray-700 hover:text-med-accent font-semibold transition duration-200"
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
               border-4 border-med-accent 
               flex items-center justify-center space-x-2 
               text-lg font-bold text-med-accent 
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
            className="w-full py-3 bg-med-btn-login text-white font-bold text-lg rounded-xl shadow-lg transition duration-200 hover:bg-red-700 active:bg-red-800"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

const LoadingPage = ({ onComplete }) => {
  const [dots, setDots] = useState([true, false, false, false]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete('form');
    }, 4000);

    const interval = setInterval(() => {
      setDots(prev => {
        const next = [...prev];
        const activeIndex = next.findIndex(d => d);
        next[activeIndex] = false;
        next[(activeIndex + 1) % next.length] = true;
        return next;
      });
    }, 300);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [onComplete]);

  // Dot logic using standard Tailwind classes + custom animation
  const dotClasses = (isActive, index) => {
    let color = ['bg-blue-600', 'bg-blue-400', 'bg-blue-300', 'bg-blue-200'][index];
    if (!isActive) {
      color = 'bg-gray-200';
    }
    return `w-4 h-4 rounded-full ${color} transition-all duration-300 ${isActive ? 'animate-loading-pulse' : ''}`;
  };

  return (
    // Uses custom color med-bg-light
    <div className="p-16 bg-med-bg-light rounded-lg shadow-2xl w-full max-w-lg mx-auto transform -translate-y-16">
      <div className="flex justify-center space-x-4 mb-8">
        {dots.map((isActive, index) => (
          <div key={index} className={dotClasses(isActive, index)}></div>
        ))}
      </div>
      <p className="text-3xl tracking-widest font-light text-center text-gray-600">
        L O A D I N G
      </p>
    </div>
  );
};

const FormPage = ({ onBack }) => {
    // State for managing sections and emergency contacts (simplified for demo)
    const [patientInfo, setPatientInfo] = useState({
        firstName: '', lastName: '', mi: '', dob: '', sex: '', social: '',
        address1: '', address2: '', city: '', state: '', zip: '',
        contactBest: '', contactSecondary: '', email: '', insurance: null,
    });
    const [demographics, setDemographics] = useState({
        language: '', pronouns: '', ethnicity: '', race: '', employment: '',
    });
    const [emergencyContacts, setEmergencyContacts] = useState([{ nameFirst: '', nameLast: '', phonePrimary: '', phoneSecondary: '', address: '', relation: 'Parent' }]);

    const addEmergencyContact = () => {
        setEmergencyContacts([...emergencyContacts, { nameFirst: '', nameLast: '', phonePrimary: '', phoneSecondary: '', address: '', relation: 'Parent' }]);
    };

    const removeEmergencyContact = (index) => {
        const newContacts = emergencyContacts.filter((_, i) => i !== index);
        setEmergencyContacts(newContacts);
    };

    const handlePatientChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPatientInfo(prev => ({
            ...prev,
            [name]: type === 'radio' ? (checked ? value : prev[name]) : value
        }));
    };

    const FormInput = ({ label, name, value, onChange, required = false, type = 'text', className = '' }) => (
        <div className={`flex flex-col mb-4 ${className}`}>
            <label className="text-sm font-semibold text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                // Uses custom colors med-input-border and med-accent
                className="p-2 border border-med-input-border rounded-lg focus:ring-1 focus:ring-med-accent focus:border-med-accent"
            />
        </div>
    );

    const FormSection = ({ title, children, className = '' }) => (
        <div className={`p-4 ${className}`}>
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 border-gray-200">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {children}
            </div>
        </div>
    );


    return (
        // Uses custom color med-bg-light
        <div className="min-h-screen pt-4 pb-32 bg-med-bg-light shadow-2xl rounded-xl w-full max-w-7xl mx-auto animate-fade-in">
            <div className="p-8">
                {/* 1. PATIENT INFORMATION */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 border-r border-gray-200 pr-8">
                         <FormSection title="Patient Information" className="p-0">
                            <div className="col-span-1 md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700">Full Name *</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <FormInput label="First" name="firstName" value={patientInfo.firstName} onChange={handlePatientChange} required className="mb-0" />
                                    <FormInput label="MI" name="mi" value={patientInfo.mi} onChange={handlePatientChange} className="mb-0" />
                                    <FormInput label="Last" name="lastName" value={patientInfo.lastName} onChange={handlePatientChange} required className="mb-0" />
                                </div>
                            </div>
                            <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Sex at Birth *</label>
                                    <div className="flex space-x-4 pt-2">
                                        <label className="flex items-center text-gray-600">
                                            <input type="radio" name="sex" value="Male" checked={patientInfo.sex === 'Male'} onChange={handlePatientChange} className="mr-2 text-med-accent" />
                                            Male
                                        </label>
                                        <label className="flex items-center text-gray-600">
                                            <input type="radio" name="sex" value="Female" checked={patientInfo.sex === 'Female'} onChange={handlePatientChange} className="mr-2 text-med-accent" />
                                            Female
                                        </label>
                                    </div>
                                </div>
                                <FormInput label="Date of Birth *" name="dob" value={patientInfo.dob} onChange={handlePatientChange} required type="date" />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <FormInput label="Social Security #" name="social" value={patientInfo.social} onChange={handlePatientChange} />
                            </div>
                        </FormSection>

                        <FormSection title="Home Address" className="p-0 mt-8">
                            <div className="col-span-1 md:col-span-2">
                                <FormInput label="Address Line 1 *" name="address1" value={patientInfo.address1} onChange={handlePatientChange} required />
                                <FormInput label="Address Line 2" name="address2" value={patientInfo.address2} onChange={handlePatientChange} />
                                <div className="grid grid-cols-3 gap-2">
                                    <FormInput label="City" name="city" value={patientInfo.city} onChange={handlePatientChange} />
                                    <FormInput label="State" name="state" value={patientInfo.state} onChange={handlePatientChange} />
                                    <FormInput label="Zip Code" name="zip" value={patientInfo.zip} onChange={handlePatientChange} />
                                </div>
                            </div>
                        </FormSection>

                        <FormSection title="Contact" className="p-0 mt-8">
                            <FormInput label="Best Number of Contact" name="contactBest" value={patientInfo.contactBest} onChange={handlePatientChange} className="col-span-1" />
                            <FormInput label="Secondary Phone Number" name="contactSecondary" value={patientInfo.contactSecondary} onChange={handlePatientChange} className="col-span-1" />
                            <FormInput label="Email Address *" name="email" value={patientInfo.email} onChange={handlePatientChange} required className="col-span-1" />
                        </FormSection>
                    </div>

                    {/* 2. DEMOGRAPHICS AND EMERGENCY CONTACT */}
                    <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormSection title="Demographics" className="p-0">
                                <FormInput label="Primary Language *" name="language" value={demographics.language} onChange={handlePatientChange} required />
                                <FormInput label="Preferred Pronouns" name="pronouns" value={demographics.pronouns} onChange={handlePatientChange} />
                                <FormInput label="Ethnicity *" name="ethnicity" value={demographics.ethnicity} onChange={handlePatientChange} required />
                                <FormInput label="Race *" name="race" value={demographics.race} onChange={handlePatientChange} required />
                                <FormInput label="Employment Status" name="employment" value={demographics.employment} onChange={handlePatientChange} />
                            </FormSection>

                            <FormSection title="Insurance" className="p-0 mt-8 md:mt-0">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="text-lg font-bold text-gray-800 mb-2 block">Do you have health insurance? *</label>
                                    <div className="flex space-x-6 pt-2">
                                        <label className="flex items-center text-gray-600">
                                            <input type="radio" name="insurance" value="Yes" checked={patientInfo.insurance === 'Yes'} onChange={handlePatientChange} className="mr-2 text-med-accent" />
                                            Yes
                                        </label>
                                        <label className="flex items-center text-gray-600">
                                            <input type="radio" name="insurance" value="No" checked={patientInfo.insurance === 'No'} onChange={handlePatientChange} className="mr-2 text-med-accent" />
                                            No
                                        </label>
                                    </div>
                                </div>
                            </FormSection>
                        </div>

                        {/* EMERGENCY CONTACTS */}
                        <div className="mt-8 border-t pt-8 border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Emergency Contact Information</h2>
                            {emergencyContacts.map((contact, index) => (
                                // Uses custom color med-accent
                                <div key={index} className="p-4 mb-6 bg-white rounded-lg shadow-md border border-med-accent/20 relative">
                                    {/* Uses custom color med-accent */}
                                    <h3 className="text-lg font-semibold text-med-accent mb-4">Emergency Contact {index + 1}</h3>

                                    {emergencyContacts.length > 1 && (
                                        <button
                                            onClick={() => removeEmergencyContact(index)}
                                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition"
                                            title="Remove Contact"
                                        >
                                            <Minus className="w-5 h-5" />
                                        </button>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="col-span-2 lg:col-span-3 grid grid-cols-2 gap-2">
                                            <FormInput label="Name *" name="nameFirst" value={contact.nameFirst} onChange={(e) => { /* update logic */ }} required />
                                            <FormInput label="Last" name="nameLast" value={contact.nameLast} onChange={(e) => { /* update logic */ }} required />
                                        </div>
                                        <FormInput label="Primary Phone *" name="phonePrimary" value={contact.phonePrimary} onChange={(e) => { /* update logic */ }} required />
                                        <FormInput label="Secondary Phone" name="phoneSecondary" value={contact.phoneSecondary} onChange={(e) => { /* update logic */ }} />
                                        <div className="col-span-3 grid grid-cols-2 gap-2">
                                            <FormInput label="Address Line 1" name="address1" value={contact.address1} onChange={(e) => { /* update logic */ }} />
                                            <FormInput label="Address Line 2" name="address2" value={contact.address2} onChange={(e) => { /* update logic */ }} />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="text-sm font-semibold text-gray-700 mb-1 block">Relationship to Patient *</label>
                                        <div className="flex flex-wrap gap-4 pt-2">
                                            {['Parent', 'Significant Other', 'Sibling', 'Child', 'Friend', 'Other'].map(r => (
                                                <label key={r} className="flex items-center text-gray-600">
                                                    <input type="radio" name={`relation-${index}`} value={r} checked={contact.relation === r} onChange={(e) => { /* update logic */ }} className="mr-2 text-med-accent" />
                                                    {r}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            ))}

                            <button
                                // Uses custom color med-accent
                                onClick={addEmergencyContact}
                                className="mt-4 flex items-center text-med-accent font-bold hover:text-blue-700 transition duration-200"
                            >
                                <Plus className="w-5 h-5 mr-1" />
                                Add Emergency Contact
                            </button>

                            {/* SIGNATURE SECTION */}
                            <div className="mt-10 p-4 bg-white rounded-lg shadow-inner">
                                <label className="text-sm font-semibold text-gray-700 mb-1 block">Signature *</label>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="border border-gray-400 w-full h-24 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                        [Draw/Type Signature Placeholder]
                                    </div>
                                    <p className="ml-4 text-xs text-gray-500 whitespace-nowrap">Date: {new Date().toLocaleDateString()}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <FormInput label="Type Name" name="typeName" required />
                                    <FormInput label="Relationship to Patient" name="relationType" required />
                                </div>

                                <div className="flex justify-end space-x-4 mt-6">
                                    <button onClick={onBack} className="py-2 px-6 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition">
                                        Back
                                    </button>
                                    <button type="submit" className="py-2 px-6 bg-lime-500 text-white font-bold rounded-lg hover:bg-lime-600 transition">
                                        Submit
                                    </button>
                                    <button className="py-2 px-6 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition">
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Back button is fixed */}
            <BackButton onClick={onBack} />
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
