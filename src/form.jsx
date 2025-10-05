import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Plus, Minus, ArrowLeft, Volume2 } from 'lucide-react';

// --- 1. Custom Speech Synthesis Hook ---
/**
 * A reusable hook to manage the browser's native Speech Synthesis API.
 * Provides speak/stop functions and state (isSpeaking).
 */
const useSpeechSynthesis = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [pitch] = useState(1.0);
    const [rate] = useState(1.0);

    // Fetch and set available voices
    useEffect(() => {
        const getVoices = () => {
            const voiceList = window.speechSynthesis.getVoices();
            setVoices(voiceList);
            if (voiceList.length > 0 && !selectedVoice) {
                // Try to find a general English voice
                const defaultVoice = voiceList.find(v => v.lang.startsWith('en')) || voiceList[0];
                setSelectedVoice(defaultVoice);
            }
        };

        window.speechSynthesis.onvoiceschanged = getVoices;
        getVoices();

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
            window.speechSynthesis.cancel();
        };
    }, [selectedVoice]);

    // Internal function to start speaking any text
    const speak = useCallback((textToSpeak) => {
        if (!textToSpeak.trim()) return;
        
        // Cancel any ongoing speech before starting a new one
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(textToSpeak);

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        utterance.pitch = pitch;
        utterance.rate = rate;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (event) => {
            console.error('SpeechSynthesisUtterance error:', event);
            setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
    }, [selectedVoice, pitch, rate]);

    // Function to stop speech
    const stop = useCallback(() => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, []);

    return { speak, stop, isSpeaking };
};

// --- 2. Helper Components ---

const BackButton = ({ onClick }) => (
    <button
        onClick={onClick}
        className="fixed left-0 top-0 
                   h-full w-20 bg-blue-200 
                   rounded-r-full shadow-xl z-20
                   flex items-center justify-center 
                   text-blue-800 font-bold 
                   transition transform hover:w-24 hover:shadow-2xl"
    >
        <ArrowLeft className="w-8 h-8" />
    </button>
);

const FormInput = ({ label, name, value, onChange, required = false, type = 'text', className = '' }) => (
    <div className={`flex flex-col mb-8 ${className}`}>
        <label className="text-6xl font-bold text-blue-900 mb-6">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="p-8 text-4xl text-blue-900 border-4 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 h-24"
        />
    </div>
);

const FormSection = ({ title, children, className = '', id }) => (
    <div id={id} className={`min-h-screen flex flex-col justify-center p-16 pl-48 ${className}`}>
        <div className="max-w-7xl mx-auto w-full">
            <h2 className="text-9xl font-bold text-blue-900 mb-16 text-center">{title}</h2>
            <div className="bg-white rounded-3xl shadow-2xl p-16">
                <div className="grid grid-cols-1 gap-12">
                    {children}
                </div>
            </div>
        </div>
    </div>
);


// --- 3. Start Screen Component ---

const StartScreen = ({ onStart }) => (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <button
            onClick={onStart}
            className="px-20 py-16 bg-green-200 text-green-800 text-8xl font-bold rounded-full hover:bg-green-300 transition duration-300 shadow-2xl"
        >
            START FORM
        </button>
    </div>
);

// --- 4. Form Page Component (Integrated with Sequential TTS) ---

const FormPage = ({ onBack, stop, isSpeaking, speak }) => {
    const [currentSection, setCurrentSection] = useState(0);
    const scrollRef = useRef(null);
    const autoAdvanceTimeoutRef = useRef(null);
    const [patientInfo, setPatientInfo] = useState({
        firstName: '', lastName: '', mi: '', dob: '', sex: '', social: '',
        address1: '', address2: '', city: '', state: '', zip: '',
        contactBest: '', contactSecondary: '', email: '', insurance: null,
    });
    const [demographics, setDemographics] = useState({
        language: '', pronouns: '', ethnicity: '', race: '', employment: '',
    });
    const [emergencyContacts] = useState([{ nameFirst: '', nameLast: '', phonePrimary: '', phoneSecondary: '', address1: '', address2: '', relation: 'Parent' }]);
    
    // Define all section titles
    const sections = useMemo(() => ([
        'Full Name', 'Sex at Birth', 'Date of Birth', 'Social Security Number',
        'Address Line 1', 'Address Line 2', 'City', 'State', 'Zip Code',
        'Best Contact Number', 'Secondary Phone', 'Email Address',
        'Primary Language', 'Pronouns', 'Ethnicity', 'Race', 'Employment Status',
        'Insurance', 'Emergency Contact Name', 'Emergency Contact Phone',
        'Signature'
    ]), []);

    // TTS Logic for Sequential Reading (Triggered when currentSection changes)
    useEffect(() => {
        // Stop speech when component unmounts
        return () => {
            stop();
        };
    }, [stop]);

    // This effect runs on mount (currentSection 0) and whenever navigation changes the index.
    useEffect(() => {
        if (currentSection < sections.length) {
            const sectionTitle = sections[currentSection];
            
            // Speak only the current section's title
            speak( sectionTitle);
        }
    }, [currentSection, sections, speak]); 

    // Form Handlers
    const handlePatientChange = (e) => {
        const { name, value, type, checked } = e.target;
        const targetState = name in patientInfo ? setPatientInfo : setDemographics;
        targetState(prev => ({
            ...prev,
            [name]: type === 'radio' ? (checked ? value : prev[name]) : value
        }));
        
        // Clear existing timeout
        if (autoAdvanceTimeoutRef.current) {
            clearTimeout(autoAdvanceTimeoutRef.current);
        }
        
        // Auto-advance to next section when field is filled
        if (value.trim() !== '' || (type === 'radio' && checked)) {
            autoAdvanceTimeoutRef.current = setTimeout(() => {
                goToNextSection();
            }, 1500);
        }
    };

    const goToPreviousSection = () => {
        if (currentSection > 0) {
            const newSection = currentSection - 1;
            setCurrentSection(newSection);
            const element = document.getElementById(`section-${newSection}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            onBack();
        }
    };

    const goToNextSection = () => {
        if (currentSection < sections.length - 1) {
            const newSection = currentSection + 1;
            setCurrentSection(newSection);
            const element = document.getElementById(`section-${newSection}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };
    
    // Render Form (omitted for brevity, remains the same as previous versions)
    return (
        <div className="min-h-screen bg-blue-50 overflow-hidden">
            <div ref={scrollRef} className="h-screen overflow-y-auto scroll-smooth">
                
                {/* Full Name (Section 0) */}
                <FormSection title={sections[0]} id="section-0">
                    <div className="col-span-2">
                        <div className="grid grid-cols-3 gap-4">
                            <FormInput label="First Name *" name="firstName" value={patientInfo.firstName} onChange={handlePatientChange} required />
                            <FormInput label="Middle Initial" name="mi" value={patientInfo.mi} onChange={handlePatientChange} />
                            <FormInput label="Last Name *" name="lastName" value={patientInfo.lastName} onChange={handlePatientChange} required />
                        </div>
                    </div>
                </FormSection>

                {/* Sex at Birth (Section 1) */}
                <FormSection title={sections[1]} id="section-1">
                    <div className="col-span-2">
                        <div className="flex space-x-20 justify-center">
                            <label className="flex items-center text-blue-600 text-6xl">
                                <input type="radio" name="sex" value="Male" checked={patientInfo.sex === 'Male'} onChange={handlePatientChange} className="mr-8 w-16 h-16" />
                                Male
                            </label>
                            <label className="flex items-center text-blue-600 text-6xl">
                                <input type="radio" name="sex" value="Female" checked={patientInfo.sex === 'Female'} onChange={handlePatientChange} className="mr-8 w-16 h-16" />
                                Female
                            </label>
                        </div>
                    </div>
                </FormSection>

                {/* Date of Birth (Section 2) */}
                <FormSection title={sections[2]} id="section-2">
                    <div className="col-span-2 flex justify-center">
                        <div className="w-1/2">
                            <FormInput label="Date of Birth *" name="dob" value={patientInfo.dob} onChange={handlePatientChange} required type="date" />
                        </div>
                    </div>
                </FormSection>

                {/* Social Security Number (Section 3) */}
                <FormSection title={sections[3]} id="section-3">
                    <div className="col-span-2 flex justify-center">
                        <div className="w-1/2">
                            <FormInput label="Social Security Number" name="social" value={patientInfo.social} onChange={handlePatientChange} />
                        </div>
                    </div>
                </FormSection>

                {/* Address Line 1 (Section 4) */}
                <FormSection title={sections[4]} id="section-4">
                    <FormInput label="Address Line 1 *" name="address1" value={patientInfo.address1} onChange={handlePatientChange} required />
                </FormSection>

                {/* Address Line 2 (Section 5) */}
                <FormSection title={sections[5]} id="section-5">
                    <FormInput label="Address Line 2" name="address2" value={patientInfo.address2} onChange={handlePatientChange} />
                </FormSection>

                {/* City (Section 6) */}
                <FormSection title={sections[6]} id="section-6">
                    <FormInput label="City" name="city" value={patientInfo.city} onChange={handlePatientChange} />
                </FormSection>

                {/* State (Section 7) */}
                <FormSection title={sections[7]} id="section-7">
                    <FormInput label="State" name="state" value={patientInfo.state} onChange={handlePatientChange} />
                </FormSection>

                {/* Zip Code (Section 8) */}
                <FormSection title={sections[8]} id="section-8">
                    <FormInput label="Zip Code" name="zip" value={patientInfo.zip} onChange={handlePatientChange} />
                </FormSection>

                {/* Best Contact Number (Section 9) */}
                <FormSection title={sections[9]} id="section-9">
                    <FormInput label="Best Number of Contact" name="contactBest" value={patientInfo.contactBest} onChange={handlePatientChange} />
                </FormSection>

                {/* Secondary Phone (Section 10) */}
                <FormSection title={sections[10]} id="section-10">
                    <FormInput label="Secondary Phone Number" name="contactSecondary" value={patientInfo.contactSecondary} onChange={handlePatientChange} />
                </FormSection>

                {/* Email Address (Section 11) */}
                <FormSection title={sections[11]} id="section-11">
                    <FormInput label="Email Address *" name="email" value={patientInfo.email} onChange={handlePatientChange} required />
                </FormSection>

                {/* Primary Language (Section 12) */}
                <FormSection title={sections[12]} id="section-12">
                    <FormInput label="Primary Language" name="language" value={demographics.language} onChange={handlePatientChange} />
                </FormSection>

                {/* Pronouns (Section 13) */}
                <FormSection title={sections[13]} id="section-13">
                    <FormInput label="Pronouns" name="pronouns" value={demographics.pronouns} onChange={handlePatientChange} />
                </FormSection>

                {/* Ethnicity (Section 14) */}
                <FormSection title={sections[14]} id="section-14">
                    <FormInput label="Ethnicity" name="ethnicity" value={demographics.ethnicity} onChange={handlePatientChange} />
                </FormSection>

                {/* Race (Section 15) */}
                <FormSection title={sections[15]} id="section-15">
                    <FormInput label="Race" name="race" value={demographics.race} onChange={handlePatientChange} required />
                </FormSection>

                {/* Employment Status (Section 16) */}
                <FormSection title={sections[16]} id="section-16">
                    <FormInput label="Employment Status" name="employment" value={demographics.employment} onChange={handlePatientChange} />
                </FormSection>

                {/* Insurance (Section 17) */}
                <FormSection title={sections[17]} id="section-17">
                    <div className="col-span-2">
                        <label className="text-6xl font-bold text-blue-900 mb-8 block text-center">Do you have health insurance? *</label>
                        <div className="flex space-x-20 justify-center">
                            <label className="flex items-center text-blue-600 text-6xl">
                                <input type="radio" name="insurance" value="Yes" checked={patientInfo.insurance === 'Yes'} onChange={handlePatientChange} className="mr-8 w-16 h-16" />
                                Yes
                            </label>
                            <label className="flex items-center text-blue-600 text-6xl">
                                <input type="radio" name="insurance" value="No" checked={patientInfo.insurance === 'No'} onChange={handlePatientChange} className="mr-8 w-16 h-16" />
                                No
                            </label>
                        </div>
                    </div>
                </FormSection>

                {/* Emergency Contact Name (Section 18) */}
                <FormSection title={sections[18]} id="section-18">
                    <div className="space-y-8">
                        <FormInput label="First Name *" name="emergencyFirstName" value={emergencyContacts[0]?.nameFirst || ''} required />
                        <FormInput label="Last Name *" name="emergencyLastName" value={emergencyContacts[0]?.nameLast || ''} required />
                    </div>
                </FormSection>

                {/* Emergency Contact Phone (Section 19) */}
                <FormSection title={sections[19]} id="section-19">
                    <FormInput label="Primary Phone *" name="emergencyPhone" value={emergencyContacts[0]?.phonePrimary || ''} required />
                </FormSection>

                {/* Signature (Section 20) */}
                <FormSection title={sections[20]} id="section-20">
                    <div className="col-span-2">
                        <div className="border border-gray-400 w-full h-32 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 mb-4">
                            [Draw/Type Signature Placeholder]
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormInput label="Type Name" name="typeName" required />
                            <FormInput label="Relationship to Patient" name="relationType" required />
                        </div>
                        <div className="flex justify-center space-x-4 mt-8">
                            <button onClick={onBack} className="py-3 px-8 bg-red-200 text-red-800 font-bold rounded-xl hover:bg-red-300 transition">
                                Back
                            </button>
                            <button type="submit" className="py-3 px-8 bg-green-200 text-green-800 font-bold rounded-xl hover:bg-green-300 transition">
                                Submit
                            </button>
                        </div>
                    </div>
                </FormSection>

            </div>
            
            {/* Control Bar */}
            <div className="fixed top-6 right-6 flex items-center space-x-4 z-30">
                {isSpeaking ? (
                    <button
                        onClick={stop}
                        className="p-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition flex items-center space-x-2"
                    >
                        <Volume2 className="w-6 h-6" />
                        <span className="font-semibold">Stop Reading</span>
                    </button>
                ) : (
                    <button
                        onClick={() => speak(sections[currentSection])} // Re-reads ONLY the current section
                        className="p-3 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 transition flex items-center space-x-2"
                        aria-label="Re-read current section title"
                    >
                        <Volume2 className="w-6 h-6" />
                        <span className="font-semibold">Re-Read Section</span>
                    </button>
                )}
            </div>

            <BackButton onClick={goToPreviousSection} />
        </div>
    );
};

// --- 5. Main Application Component (Handling Routing) ---

const App = () => {
    // State to manage the view: 'start' or 'form'
    const [view, setView] = useState('start');
    
    // Initialize TTS hook once at the top level
    const { speak, stop, isSpeaking } = useSpeechSynthesis();

    // Use a fixed Tailwind config and style injection for the entire application
    const cssInjection = (
        <>
            <script src="https://cdn.tailwindcss.com"></script>
            <style dangerouslySetInnerHTML={{
                __html: `
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
                    body { font-family: 'Inter', sans-serif; }
                `
            }} />
        </>
    );

    const handleStart = () => {
        stop();
        setView('form');
    };

    const handleBack = () => {
        stop();
        setView('start');
    };

    return (
        <div className="relative">
            {cssInjection}
            {view === 'start' ? (
                <StartScreen onStart={handleStart} />
            ) : (
                <FormPage 
                    onBack={handleBack} 
                    stop={stop} 
                    isSpeaking={isSpeaking}
                    speak={speak} // Passing the generic speak function
                />
            )}
        </div>
    );
};

export default App;
