import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ArrowLeft, Volume2, Mic, MicOff } from 'lucide-react';

// --- 1. Custom Speech Recognition Hook ---
/**
 * A reusable hook to manage the browser's native Speech Recognition API.
 * Provides startListening/stopListening functions and state (isListening, transcript).
 */
const useSpeechRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        // Check if speech recognition is supported
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            setIsSupported(true);
            recognitionRef.current = new SpeechRecognition();
            
            const recognition = recognitionRef.current;
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event) => {
                const result = event.results[0][0].transcript;
                setTranscript(result);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };
        } else {
            console.warn('Speech recognition not supported in this browser');
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            recognitionRef.current.start();
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        isListening,
        transcript,
        isSupported,
        startListening,
        stopListening,
        resetTranscript
    };
};

// --- 2. Custom Speech Synthesis Hook ---
/**
 * A reusable hook to manage the browser's native Speech Synthesis API.
 * Provides speak/stop functions and state (isSpeaking).
 */
const useSpeechSynthesis = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [pitch] = useState(1.0);
    const [rate] = useState(0.9); // Slightly slower for better comprehension

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

    // Internal function to start speaking any text with optional callback
    const speak = useCallback((textToSpeak, onEndCallback = null) => {
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
        utterance.onend = () => {
            setIsSpeaking(false);
            if (onEndCallback) {
                // Small delay to ensure speech has completely finished
                setTimeout(onEndCallback, 500);
            }
        };
        utterance.onerror = (event) => {
            console.error('SpeechSynthesisUtterance error:', event);
            setIsSpeaking(false);
            if (onEndCallback) {
                onEndCallback();
            }
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

const FormInput = ({ label, name, value, onChange, required = false, type = 'text', className = '', autoListen = false, onStartListening = null, onVoiceCommand = null }) => {
    const { isListening, transcript, isSupported, startListening, stopListening, resetTranscript } = useSpeechRecognition();
    const hasAutoStarted = useRef(false);

    // Handle auto-start listening when component mounts or autoListen changes
    useEffect(() => {
        if (autoListen && isSupported && !isListening && !hasAutoStarted.current && type === 'text') {
            hasAutoStarted.current = true;
            if (onStartListening) {
                onStartListening();
            }
            // Small delay to ensure the prompt has finished
            setTimeout(() => {
                startListening();
            }, 1000);
        }
    }, [autoListen, isSupported, isListening, type, startListening, onStartListening]);

    // Handle speech input completion
    useEffect(() => {
        if (transcript && !isListening) {
            const lowerTranscript = transcript.toLowerCase();
            
            // Check for voice commands first
            if (lowerTranscript.includes('next') || lowerTranscript.includes('skip')) {
                if (onVoiceCommand) onVoiceCommand('next');
                resetTranscript();
                hasAutoStarted.current = false;
                return;
            } else if (lowerTranscript.includes('back') || lowerTranscript.includes('previous')) {
                if (onVoiceCommand) onVoiceCommand('back');
                resetTranscript();
                hasAutoStarted.current = false;
                return;
            } else if (lowerTranscript.includes('repeat') || lowerTranscript.includes('again')) {
                if (onVoiceCommand) onVoiceCommand('repeat');
                resetTranscript();
                hasAutoStarted.current = false;
                return;
            }
            
            // Create a synthetic event to maintain compatibility with existing onChange handler
            const syntheticEvent = {
                target: {
                    name,
                    value: transcript,
                    type
                }
            };
            onChange(syntheticEvent);
            resetTranscript();
            hasAutoStarted.current = false; // Reset for next time
        }
    }, [transcript, isListening, name, type, onChange, resetTranscript, onVoiceCommand]);

    const handleSpeechToggle = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    return (
        <div className={`flex flex-col mb-8 ${className}`}>
            <label className="text-6xl font-bold text-blue-900 mb-6">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="p-8 text-4xl text-blue-900 border-4 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 h-24 pr-32"
                    required={required}
                />
                {isSupported && type === 'text' && (
                    <button
                        type="button"
                        onClick={handleSpeechToggle}
                        className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-4 rounded-xl transition-all duration-200 ${
                            isListening 
                                ? 'bg-red-500 text-white animate-pulse' 
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                        title={isListening ? "Stop recording" : "Start voice input"}
                    >
                        {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                    </button>
                )}
            </div>
            {isListening && (
                <div className="mt-4 text-2xl text-blue-600 font-semibold text-center">
                    🎤 Listening... Speak your answer or say "next", "back", or "repeat"
                </div>
            )}
            {autoListen && !isListening && !value && (
                <div className="mt-4 text-2xl text-green-600 font-semibold text-center">
                    Voice input will start automatically after the prompt finishes
                </div>
            )}
        </div>
    );
};

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

const SpeechRadioGroup = ({ label, name, value, onChange, options = ['Yes', 'No'], autoListen = false, onStartListening = null, onVoiceCommand = null }) => {
    const { isListening, transcript, isSupported, startListening, stopListening, resetTranscript } = useSpeechRecognition();
    const hasAutoStarted = useRef(false);

    // Handle auto-start listening when component mounts or autoListen changes
    useEffect(() => {
        if (autoListen && isSupported && !isListening && !hasAutoStarted.current && !value) {
            hasAutoStarted.current = true;
            if (onStartListening) {
                onStartListening();
            }
            // Small delay to ensure the prompt has finished
            setTimeout(() => {
                startListening();
            }, 1000);
        }
    }, [autoListen, isSupported, isListening, value, startListening, onStartListening]);

    useEffect(() => {
        if (transcript && !isListening) {
            const normalizedTranscript = transcript.toLowerCase().trim();
            
            // Check for voice commands first
            if (normalizedTranscript.includes('next') || normalizedTranscript.includes('skip')) {
                if (onVoiceCommand) onVoiceCommand('next');
                resetTranscript();
                hasAutoStarted.current = false;
                return;
            } else if (normalizedTranscript.includes('back') || normalizedTranscript.includes('previous')) {
                if (onVoiceCommand) onVoiceCommand('back');
                resetTranscript();
                hasAutoStarted.current = false;
                return;
            } else if (normalizedTranscript.includes('repeat') || normalizedTranscript.includes('again')) {
                if (onVoiceCommand) onVoiceCommand('repeat');
                resetTranscript();
                hasAutoStarted.current = false;
                return;
            }
            
            // Match transcript to available options
            const matchedOption = options.find(option => 
                normalizedTranscript === option.toLowerCase() ||
                normalizedTranscript.includes(option.toLowerCase())
            );

            if (matchedOption) {
                const syntheticEvent = {
                    target: {
                        name,
                        value: matchedOption,
                        type: 'radio',
                        checked: true
                    }
                };
                onChange(syntheticEvent);
            }
            resetTranscript();
            hasAutoStarted.current = false; // Reset for next time
        }
    }, [transcript, isListening, name, onChange, options, resetTranscript, onVoiceCommand]);

    const handleSpeechToggle = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    return (
        <div className="col-span-2">
            <div className="flex items-center justify-center mb-8">
                <label className="text-6xl font-bold text-blue-900 text-center mr-8">{label}</label>
                {isSupported && (
                    <button
                        type="button"
                        onClick={handleSpeechToggle}
                        className={`p-4 rounded-xl transition-all duration-200 ${
                            isListening 
                                ? 'bg-red-500 text-white animate-pulse' 
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                        title={isListening ? "Stop recording" : "Start voice input"}
                    >
                        {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                    </button>
                )}
            </div>
            <div className="flex space-x-20 justify-center">
                {options.map((option) => (
                    <label key={option} className="flex items-center text-blue-600 text-6xl">
                        <input 
                            type="radio" 
                            name={name} 
                            value={option} 
                            checked={value === option} 
                            onChange={onChange} 
                            className="mr-8 w-16 h-16" 
                        />
                        {option}
                    </label>
                ))}
            </div>
            {isListening && (
                <div className="mt-4 text-2xl text-blue-600 font-semibold text-center">
                    🎤 Say "{options.join('" or "')}" or "next", "back", "repeat"
                </div>
            )}
            {autoListen && !isListening && !value && (
                <div className="mt-4 text-2xl text-green-600 font-semibold text-center">
                    Voice input will start automatically after the prompt finishes
                </div>
            )}
        </div>
    );
};

// --- 3. Start Screen Component ---

const StartScreen = ({ onStart, speak }) => {
    const handleStart = () => {
        // Immediately speak welcome message and start the form
        speak("Welcome to the medical form. I will guide you through each question. Press start when you're ready to begin.");
        setTimeout(() => {
            onStart();
        }, 4000); // Start after welcome message
    };

    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-blue-900 mb-8">Voice-Guided Medical Form</h1>
                <p className="text-3xl text-blue-700 mb-12">Click start and I'll guide you through each question with voice prompts</p>
                <button
                    onClick={handleStart}
                    className="px-20 py-16 bg-green-200 text-green-800 text-8xl font-bold rounded-full hover:bg-green-300 transition duration-300 shadow-2xl"
                >
                    START FORM
                </button>
            </div>
        </div>
    );
};

// --- 4. Form Page Component (Integrated with Sequential TTS) ---

const FormPage = ({ onBack, stop, isSpeaking, speak }) => {
    const [currentSection, setCurrentSection] = useState(0);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [isAutoListening, setIsAutoListening] = useState(false);
    const scrollRef = useRef(null);
    const autoAdvanceTimeoutRef = useRef(null);
    const currentSectionRef = useRef(0);
    
    // Update the ref whenever currentSection changes
    useEffect(() => {
        currentSectionRef.current = currentSection;
    }, [currentSection]);
    
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
        isReducedSchedule: null,
        employeeSignature: '',
        signatureDate: ''
    });
    
    // Define all section content based on FMLA/CFRA form structure
    const sectionContent = useMemo(() => ([
        'Please state your full name',
        'Please state the patient\'s full name if different from yours, then say yes if the patient is your family member, or no if they are not',
        'Please state the date the medical condition commenced',
        'Please state the probable duration of the condition, for example, 6 weeks, 3 months, or permanent',
        'Does the patient\'s condition qualify as a serious health condition? Please say yes or no',
        'Is the employee able to perform work of any kind? Please say yes or no',
        'Does the patient require assistance for basic needs such as medical or hygiene? Please say yes or no',
        'Please state the estimated period of time care is needed',
        'Is intermittent leave medically necessary? Please say yes or no',
        'Is a reduced work schedule or time off for appointments medically necessary? Please say yes or no',
        'Please provide your digital signature and today\'s date'
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
        if (currentSection < sectionContent.length) {
            const content = sectionContent[currentSection];
            
            // Speak section content and then enable auto-listening
            speak(content, () => {
                setIsAutoListening(true);
            });
        }
    }, [currentSection, sectionContent, speak]); 

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
            setIsAutoListening(false); // Stop auto-listening since we got input
            
            autoAdvanceTimeoutRef.current = setTimeout(() => {
                // Only advance if we're still on the same section
                if (currentSectionRef.current === currentSection) {
                    goToNextSection();
                }
            }, 2000); // 2 second delay for user to register the change
        }
    };

    const handleStartListening = () => {
        // Called when auto-listening starts
        console.log('Auto-listening started for section:', currentSection);
    };

    const goToPreviousSection = () => {
        stop(); // Stop speech before navigating
        setIsAutoListening(false);
        if (autoAdvanceTimeoutRef.current) {
            clearTimeout(autoAdvanceTimeoutRef.current);
        }
        
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
        setIsAutoListening(false);
        if (autoAdvanceTimeoutRef.current) {
            clearTimeout(autoAdvanceTimeoutRef.current);
        }
        
        if (currentSection < sectionContent.length - 1) {
            const newSection = currentSection + 1;
            setCurrentSection(newSection);
            const element = document.getElementById(`section-${newSection}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    // Voice commands handler
    const handleVoiceCommand = useCallback((command) => {
        console.log('Voice command received:', command);
        
        if (command === 'next') {
            goToNextSection();
        } else if (command === 'back') {
            goToPreviousSection();
        } else if (command === 'repeat') {
            speak(sectionContent[currentSection], () => setIsAutoListening(true));
        }
    }, [currentSection, sectionContent, speak]);
    
    // Render Form
    return (
        <div className="min-h-screen bg-blue-50 overflow-hidden">
            <div ref={scrollRef} className="h-screen overflow-y-auto scroll-smooth">
                
                {/* 1. Employee Name (Q1) */}
                <FormSection title="Question 1 of 11" id="section-0">
                    <FormInput 
                        label="Full Name *" 
                        name="employeeName" 
                        value={formData.employeeName} 
                        onChange={handleFormChange} 
                        required 
                        autoListen={currentSection === 0 && isAutoListening}
                        onStartListening={handleStartListening}
                        onVoiceCommand={handleVoiceCommand}
                    />
                </FormSection>

                {/* 2. Patient Name and Relationship (Q2) */}
                <FormSection title="Question 2 of 11" id="section-1">
                    <FormInput 
                        label="Patient Full Name (if different) *" 
                        name="patientName" 
                        value={formData.patientName} 
                        onChange={handleFormChange} 
                        required 
                        autoListen={currentSection === 1 && isAutoListening && !formData.patientName}
                        onStartListening={handleStartListening}
                        onVoiceCommand={handleVoiceCommand}
                    />
                    <SpeechRadioGroup 
                        label="Is the patient the employee's family member?"
                        name="isFamilyMember"
                        value={formData.isFamilyMember}
                        onChange={handleFormChange}
                        autoListen={currentSection === 1 && isAutoListening && formData.patientName && !formData.isFamilyMember}
                        onStartListening={handleStartListening}
                        onVoiceCommand={handleVoiceCommand}
                    />
                </FormSection>

                {/* 3. Date Medical Condition Commenced (Q3) */}
                <FormSection title="Question 3 of 11" id="section-2">
                    <div className="col-span-2 flex justify-center">
                        <div className="w-1/2">
                            <FormInput 
                                label="Date Condition Commenced *" 
                                name="conditionCommenced" 
                                value={formData.conditionCommenced} 
                                onChange={handleFormChange} 
                                required 
                                type="date" 
                                autoListen={currentSection === 2 && isAutoListening}
                                onStartListening={handleStartListening}
                                onVoiceCommand={handleVoiceCommand}
                            />
                        </div>
                    </div>
                </FormSection>

                {/* 4. Probable Duration of Condition (Q4) */}
                <FormSection title="Question 4 of 11" id="section-3">
                    <FormInput 
                        label="Probable Duration (e.g., 6 weeks, 3 months, permanent)" 
                        name="conditionDuration" 
                        value={formData.conditionDuration} 
                        onChange={handleFormChange} 
                        required 
                        autoListen={currentSection === 3 && isAutoListening}
                        onStartListening={handleStartListening}
                        onVoiceCommand={handleVoiceCommand}
                    />
                </FormSection>

                {/* 5. Serious Health Condition Check (Q5) */}
                <FormSection title="Question 5 of 11" id="section-4">
                    <SpeechRadioGroup 
                        label="Does the patient's condition qualify as a serious health condition?"
                        name="isSeriousHealthCondition"
                        value={formData.isSeriousHealthCondition}
                        onChange={handleFormChange}
                        autoListen={currentSection === 4 && isAutoListening}
                        onStartListening={handleStartListening}
                        onVoiceCommand={handleVoiceCommand}
                    />
                </FormSection>

                {/* 6. Employee Ability to Work (Q6 - simplified) */}
                <FormSection title="Question 6 of 11" id="section-5">
                    <SpeechRadioGroup 
                        label="Is the employee able to perform work of any kind?"
                        name="employeeAbleToWork"
                        value={formData.employeeAbleToWork}
                        onChange={handleFormChange}
                        autoListen={currentSection === 5 && isAutoListening}
                        onStartListening={handleStartListening}
                        onVoiceCommand={handleVoiceCommand}
                    />
                </FormSection>

                {/* 7. Patient Assistance Needs (Q7 - simplified) */}
                <FormSection title="Question 7 of 11" id="section-6">
                    <SpeechRadioGroup 
                        label="Does the patient require assistance for basic needs (medical, hygiene, etc.)?"
                        name="patientRequiresAssistance"
                        value={formData.patientRequiresAssistance}
                        onChange={handleFormChange}
                        autoListen={currentSection === 6 && isAutoListening}
                        onStartListening={handleStartListening}
                        onVoiceCommand={handleVoiceCommand}
                    />
                </FormSection>

                {/* 8. Estimated Period of Care (Q8) */}
                <FormSection title="Question 8 of 11" id="section-7">
                    <FormInput 
                        label="Estimated Period of Time Care is Needed" 
                        name="careTimeNeeded" 
                        value={formData.careTimeNeeded} 
                        onChange={handleFormChange} 
                        required 
                        autoListen={currentSection === 7 && isAutoListening}
                        onStartListening={handleStartListening}
                        onVoiceCommand={handleVoiceCommand}
                    />
                </FormSection>

                {/* 9. Intermittent Leave Request (Q9 - Intermittent) */}
                <FormSection title="Question 9 of 11" id="section-8">
                    <SpeechRadioGroup 
                        label="Is intermittent leave medically necessary?"
                        name="isIntermittentLeave"
                        value={formData.isIntermittentLeave}
                        onChange={handleFormChange}
                        autoListen={currentSection === 8 && isAutoListening}
                        onStartListening={handleStartListening}
                        onVoiceCommand={handleVoiceCommand}
                    />
                </FormSection>

                {/* 10. Reduced Schedule / Time Off (Q9 - Reduced Schedule/Appointments) */}
                <FormSection title="Question 10 of 11" id="section-9">
                    <SpeechRadioGroup 
                        label="Is a reduced work schedule or time off for appointments medically necessary?"
                        name="isReducedSchedule"
                        value={formData.isReducedSchedule}
                        onChange={handleFormChange}
                        autoListen={currentSection === 9 && isAutoListening}
                        onStartListening={handleStartListening}
                        onVoiceCommand={handleVoiceCommand}
                    />
                </FormSection>

                {/* 11. Employee Signature and Date (Q10/Signature Area) */}
                <FormSection title="Question 11 of 11" id="section-10">
                    <div className="col-span-2">
                        <label className="text-6xl font-bold text-blue-900 mb-8 block text-center">Employee Signature and Date</label>
                        <FormInput 
                            label="Digital Signature" 
                            name="employeeSignature" 
                            value={formData.employeeSignature} 
                            onChange={handleFormChange} 
                            required 
                            autoListen={currentSection === 10 && isAutoListening && !formData.employeeSignature}
                            onStartListening={handleStartListening}
                            onVoiceCommand={handleVoiceCommand}
                        />
                        <FormInput 
                            label="Date Signed" 
                            name="signatureDate" 
                            value={formData.signatureDate}
                            onChange={handleFormChange}
                            type="date" 
                            required 
                            autoListen={currentSection === 10 && isAutoListening && formData.employeeSignature && !formData.signatureDate}
                            onStartListening={handleStartListening}
                            onVoiceCommand={handleVoiceCommand}
                        />
                        
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
            
            {/* Control Bar - Moved to bottom */}
            <div className="fixed bottom-6 right-6 flex items-center space-x-4 z-30">
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
                        onClick={() => speak(sectionContent[currentSection], () => setIsAutoListening(true))}
                        className="p-3 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 transition flex items-center space-x-2"
                        aria-label="Re-read current section content"
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
                <StartScreen onStart={handleStart} speak={speak} />
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