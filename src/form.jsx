import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ArrowLeft, Volume2 } from 'lucide-react';

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
            required={required}
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
    
    // State to hold form data (simplified for this demo)
    const [formData, setFormData] = useState({
        employeeName: '',
        patientName: '',
        isFamilyMember: null,
        conditionCommenced: '',
        conditionDuration: '',
        isSeriousHealthCondition: null,
        employeeAbleToWork: null,
        patientRequiresAssistance: null,
        careTimeNeeded: '',
        isIntermittentLeave: null,
        employeeSignature: '',
        signatureDate: ''
    });
    
    // Define all section titles based on FMLA/CFRA form structure
    const sections = useMemo(() => ([
        'Full Name', // Maps to Q1
        'Patient Name and Relationship', // Maps to Q2
        'Date Medical Condition Commenced', // Maps to Q3
        'Probable Duration of Condition', // Maps to Q4
        'Serious Health Condition Check', // Maps to Q5
        'Employee Ability to Work', // Maps to Q6
        'Patient Assistance Needs', // Maps to Q7
        'Estimated Period of Care', // Maps to Q8
        'Intermittent Leave Request', // Maps to Q9 (part 1)
        'Reduced Schedule / Time Off', // Maps to Q9 (part 2)
        'Employee Signature and Date', // Maps to Q10 / Signature Area
    ]), []);

    // TTS Logic for Sequential Reading (Triggered when currentSection changes)
    useEffect(() => {
        // Cleanup function: stop speech when component unmounts
        return () => {
            stop();
            if (autoAdvanceTimeoutRef.current) {
                clearTimeout(autoAdvanceTimeoutRef.current);
            }
        };
    }, [stop]);

    // This effect runs on mount (currentSection 0) and whenever navigation changes the index.
    useEffect(() => {
        if (currentSection < sections.length) {
            const sectionTitle = sections[currentSection];
            
            // Speak only the current section's title
            speak(sectionTitle);
        }
    }, [currentSection, sections, speak]); 

    // General Form Handlers
    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'radio' ? (checked ? value : prev[name]) : value
        }));
        
        // Clear existing timeout
        if (autoAdvanceTimeoutRef.current) {
            clearTimeout(autoAdvanceTimeoutRef.current);
        }
        
        // Auto-advance logic: if a field is filled/selected, wait and move to the next section
        if (value.trim() !== '' || (type === 'radio' && checked)) {
            autoAdvanceTimeoutRef.current = setTimeout(() => {
                goToNextSection();
            }, 2000); // 2 second delay for user to register the change
        }
    };

    const goToPreviousSection = () => {
        stop(); // Stop speech before navigating
        if (currentSection > 0) {
            const newSection = currentSection - 1;
            setCurrentSection(newSection);
            const element = document.getElementById(`section-${newSection}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            // If on the first section, go back to the start screen
            onBack(); 
        }
    };

    const goToNextSection = () => {
        stop(); // Stop speech before navigating
        if (currentSection < sections.length - 1) {
            const newSection = currentSection + 1;
            setCurrentSection(newSection);
            const element = document.getElementById(`section-${newSection}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };
    
    // Render Form
    return (
        <div className="min-h-screen bg-blue-50 overflow-hidden">
            <div ref={scrollRef} className="h-screen overflow-y-auto scroll-smooth">
                
                {/* 1. Employee Name (Q1) */}
                <FormSection title={sections[0]} id="section-0">
                    <FormInput label="Full Name *" name="employeeName" value={formData.employeeName} onChange={handleFormChange} required />
                </FormSection>

                {/* 2. Patient Name and Relationship (Q2) */}
                <FormSection title={sections[1]} id="section-1">
                    <FormInput label="Patient Full Name (if different) *" name="patientName" value={formData.patientName} onChange={handleFormChange} required />
                    <div className="col-span-2">
                        <label className="text-6xl font-bold text-blue-900 mb-8 block text-center">Is the patient the employee's family member?</label>
                        <div className="flex space-x-20 justify-center">
                            <label className="flex items-center text-blue-600 text-6xl">
                                <input type="radio" name="isFamilyMember" value="Yes" checked={formData.isFamilyMember === 'Yes'} onChange={handleFormChange} className="mr-8 w-16 h-16" />
                                Yes
                            </label>
                            <label className="flex items-center text-blue-600 text-6xl">
                                <input type="radio" name="isFamilyMember" value="No" checked={formData.isFamilyMember === 'No'} onChange={handleFormChange} className="mr-8 w-16 h-16" />
                                No
                            </label>
                        </div>
                    </div>
                </FormSection>

                {/* 3. Date Medical Condition Commenced (Q3) */}
                <FormSection title={sections[2]} id="section-2">
                    <div className="col-span-2 flex justify-center">
                        <div className="w-1/2">
                            <FormInput label="Date Condition Commenced *" name="conditionCommenced" value={formData.conditionCommenced} onChange={handleFormChange} required type="date" />
                        </div>
                    </div>
                </FormSection>

                {/* 4. Probable Duration of Condition (Q4) */}
                <FormSection title={sections[3]} id="section-3">
                    <FormInput label="Probable Duration (e.g., 6 weeks, 3 months, permanent)" name="conditionDuration" value={formData.conditionDuration} onChange={handleFormChange} required />
                </FormSection>

                {/* 5. Serious Health Condition Check (Q5) */}
                <FormSection title={sections[4]} id="section-4">
                    <div className="col-span-2">
                        <label className="text-6xl font-bold text-blue-900 mb-8 block text-center">Does the patient's condition qualify as a serious health condition?</label>
                        <div className="flex space-x-20 justify-center">
                            <label className="flex items-center text-blue-600 text-6xl">
                                <input type="radio" name="isSeriousHealthCondition" value="Yes" checked={formData.isSeriousHealthCondition === 'Yes'} onChange={handleFormChange} className="mr-8 w-16 h-16" />
                                Yes
                            </label>
                            <label className="flex items-center text-blue-600 text-6xl">
                                <input type="radio" name="isSeriousHealthCondition" value="No" checked={formData.isSeriousHealthCondition === 'No'} onChange={handleFormChange} className="mr-8 w-16 h-16" />
                                No
                            </label>
                        </div>
                    </div>
                </FormSection>

                {/* 6. Employee Ability to Work (Q6 - simplified) */}
                <FormSection title={sections[5]} id="section-5">
                    <div className="col-span-2">
                        <label className="text-6xl font-bold text-blue-900 mb-8 block text-center">Is the employee able to perform work of any kind?</label>
                        <div className="flex space-x-20 justify-center">
                            <label className="flex items-center text-blue-600 text-6xl">
                                <input type="radio" name="employeeAbleToWork" value="Yes" checked={formData.employeeAbleToWork === 'Yes'} onChange={handleFormChange} className="mr-8 w-16 h-16" />
                                Yes
                            </label>
                            <label className="flex items-center text-blue-600 text-6xl">
                                <input type="radio" name="employeeAbleToWork" value="No" checked={formData.employeeAbleToWork === 'No'} onChange={handleFormChange} className="mr-8 w-16 h-16" />
                                No
                            </label>
                        </div>
                    </div>
                </FormSection>

                {/* 7. Patient Assistance Needs (Q7 - simplified) */}
                <FormSection title={sections[6]} id="section-6">
                    <div className="col-span-2">
                        <label className="text-6xl font-bold text-blue-900 mb-8 block text-center">Does the patient require assistance for basic needs (medical, hygiene, etc.)?</label>
                        <div className="flex space-x-20 justify-center">
                            <label className="flex items-center text-blue-600 text-6xl">
                                <input type="radio" name="patientRequiresAssistance" value="Yes" checked={formData.patientRequiresAssistance === 'Yes'} onChange={handleFormChange} className="mr-8 w-16 h-16" />
                                Yes
                            </label>
                            <label className="flex items-center text-blue-600 text-6xl">
                                <input type="radio" name="patientRequiresAssistance" value="No" checked={formData.patientRequiresAssistance === 'No'} onChange={handleFormChange} className="mr-8 w-16 h-16" />
                                No
                            </label>
                        </div>
                    </div>
                </FormSection>

                {/* 8. Estimated Period of Care (Q8) */}
                <FormSection title={sections[7]} id="section-7">
                    <FormInput label="Estimated Period of Time Care is Needed" name="careTimeNeeded" value={formData.careTimeNeeded} onChange={handleFormChange} required />
                </FormSection>

                {/* 9. Intermittent Leave Request (Q9 - Intermittent) */}
                <FormSection title={sections[8]} id="section-8">
                    <div className="col-span-2">
                        <label className="text-6xl font-bold text-blue-900 mb-8 block text-center">Is intermittent leave medically necessary?</label>
                        <div className="flex space-x-20 justify-center">
                            <label className="flex items-center text-blue-600 text-6xl">
                                <input type="radio" name="isIntermittentLeave" value="Yes" checked={formData.isIntermittentLeave === 'Yes'} onChange={handleFormChange} className="mr-8 w-16 h-16" />
                                Yes
                            </label>
                            <label className="flex items-center text-blue-600 text-6xl">
                                <input type="radio" name="isIntermittentLeave" value="No" checked={formData.isIntermittentLeave === 'No'} onChange={handleFormChange} className="mr-8 w-16 h-16" />
                                No
                            </label>
                        </div>
                    </div>
                    {/* Simplified for space - a real form would have frequency/duration inputs here */}
                </FormSection>

                {/* 10. Reduced Schedule / Time Off (Q9 - Reduced Schedule/Appointments) */}
                <FormSection title={sections[9]} id="section-9">
                    <div className="col-span-2">
                        <label className="text-6xl font-bold text-blue-900 mb-8 block text-center">Is a reduced work schedule or time off for appointments medically necessary?</label>
                        <div className="flex space-x-20 justify-center">
                            <label className="flex items-center text-blue-600 text-6xl">
                                <input type="radio" name="isReducedSchedule" value="Yes" checked={formData.isReducedSchedule === 'Yes'} onChange={handleFormChange} className="mr-8 w-16 h-16" />
                                Yes
                            </label>
                            <label className="flex items-center text-blue-600 text-6xl">
                                <input type="radio" name="isReducedSchedule" value="No" checked={formData.isReducedSchedule === 'No'} onChange={handleFormChange} className="mr-8 w-16 h-16" />
                                No
                            </label>
                        </div>
                    </div>
                </FormSection>

                {/* 11. Employee Signature and Date (Q10/Signature Area) */}
                <FormSection title={sections[10]} id="section-10">
                    <div className="col-span-2">
                        <label className="text-6xl font-bold text-blue-900 mb-8 block text-center">Employee Signature</label>
                        <FormInput label="Digital Signature" name="employeeSignature" value={formData.employeeSignature} onChange={handleFormChange} required />
                        <FormInput label="Date Signed" name="signatureDate" type="date" required />
                        
                        <div className="flex justify-center space-x-4 mt-8">
                            <button onClick={onBack} className="py-3 px-8 bg-red-200 text-red-800 font-bold rounded-xl hover:bg-red-300 transition">
                                Back to Start
                            </button>
                            <button type="submit" className="py-3 px-8 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition">
                                SUBMIT FORM
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
                        aria-label="Stop reading"
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
                    speak={speak}
                />
            )}
        </div>
    );
};

export default App;