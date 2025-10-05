import React, { useState, useRef } from 'react';
import { Plus, Minus, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';

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

const FormPage = ({ onBack }) => {
    const [currentSection, setCurrentSection] = useState(0);
    const scrollRef = useRef(null);
    const [patientInfo, setPatientInfo] = useState({
        firstName: '', lastName: '', mi: '', dob: '', sex: '', social: '',
        address1: '', address2: '', city: '', state: '', zip: '',
        contactBest: '', contactSecondary: '', email: '', insurance: null,
    });
    const [demographics, setDemographics] = useState({
        language: '', pronouns: '', ethnicity: '', race: '', employment: '',
    });
    const [emergencyContacts, setEmergencyContacts] = useState([{ nameFirst: '', nameLast: '', phonePrimary: '', phoneSecondary: '', address1: '', address2: '', relation: 'Parent' }]);

    const sections = [
        'Full Name',
        'Sex at Birth',
        'Date of Birth',
        'Social Security Number',
        'Address Line 1',
        'Address Line 2',
        'City',
        'State',
        'Zip Code',
        'Best Contact Number',
        'Secondary Phone',
        'Email Address',
        'Primary Language',
        'Pronouns',
        'Ethnicity',
        'Race',
        'Employment Status',
        'Insurance',
        'Emergency Contact Name',
        'Emergency Contact Phone',
        'Signature'
    ];

    const scrollToSection = (direction) => {
        const newSection = direction === 'next' 
            ? Math.min(currentSection + 1, sections.length - 1)
            : Math.max(currentSection - 1, 0);
        
        setCurrentSection(newSection);
        const element = document.getElementById(`section-${newSection}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const addEmergencyContact = () => {
        setEmergencyContacts([...emergencyContacts, { nameFirst: '', nameLast: '', phonePrimary: '', phoneSecondary: '', address1: '', address2: '', relation: 'Parent' }]);
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
        <div className={`flex flex-col mb-8 ${className}`}>
            <label className="text-6xl font-bold text-blue-900 mb-6">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className="p-8 text-4xl text-blue-900 border-4 border-gray-300 rounded-2xl focus:ring-4 focus:ring-med-accent-blue focus:border-med-accent-blue h-24"
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

    return (
        <div className="min-h-screen bg-blue-50 overflow-hidden">
            <div ref={scrollRef} className="h-screen overflow-y-auto scroll-smooth">
                {/* Full Name */}
                <FormSection title="Full Name" id="section-0">
                    <div className="col-span-2">
                        <div className="grid grid-cols-3 gap-4">
                            <FormInput label="First Name *" name="firstName" value={patientInfo.firstName} onChange={handlePatientChange} required />
                            <FormInput label="Middle Initial" name="mi" value={patientInfo.mi} onChange={handlePatientChange} />
                            <FormInput label="Last Name *" name="lastName" value={patientInfo.lastName} onChange={handlePatientChange} required />
                        </div>
                    </div>
                </FormSection>

                {/* Sex at Birth */}
                <FormSection title="Sex at Birth" id="section-1">
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

                {/* Date of Birth */}
                <FormSection title="Date of Birth" id="section-2">
                    <div className="col-span-2 flex justify-center">
                        <div className="w-1/2">
                            <FormInput label="Date of Birth *" name="dob" value={patientInfo.dob} onChange={handlePatientChange} required type="date" />
                        </div>
                    </div>
                </FormSection>

                {/* Social Security Number */}
                <FormSection title="Social Security Number" id="section-3">
                    <div className="col-span-2 flex justify-center">
                        <div className="w-1/2">
                            <FormInput label="Social Security Number" name="social" value={patientInfo.social} onChange={handlePatientChange} />
                        </div>
                    </div>
                </FormSection>

                {/* Address Line 1 */}
                <FormSection title="Address Line 1" id="section-4">
                    <FormInput label="Address Line 1 *" name="address1" value={patientInfo.address1} onChange={handlePatientChange} required />
                </FormSection>

                {/* Address Line 2 */}
                <FormSection title="Address Line 2" id="section-5">
                    <FormInput label="Address Line 2" name="address2" value={patientInfo.address2} onChange={handlePatientChange} />
                </FormSection>

                {/* City */}
                <FormSection title="City" id="section-6">
                    <FormInput label="City" name="city" value={patientInfo.city} onChange={handlePatientChange} />
                </FormSection>

                {/* State */}
                <FormSection title="State" id="section-7">
                    <FormInput label="State" name="state" value={patientInfo.state} onChange={handlePatientChange} />
                </FormSection>

                {/* Zip Code */}
                <FormSection title="Zip Code" id="section-8">
                    <FormInput label="Zip Code" name="zip" value={patientInfo.zip} onChange={handlePatientChange} />
                </FormSection>

                {/* Best Contact Number */}
                <FormSection title="Best Contact Number" id="section-9">
                    <FormInput label="Best Number of Contact" name="contactBest" value={patientInfo.contactBest} onChange={handlePatientChange} />
                </FormSection>

                {/* Secondary Phone */}
                <FormSection title="Secondary Phone" id="section-10">
                    <FormInput label="Secondary Phone Number" name="contactSecondary" value={patientInfo.contactSecondary} onChange={handlePatientChange} />
                </FormSection>

                {/* Email Address */}
                <FormSection title="Email Address" id="section-11">
                    <FormInput label="Email Address *" name="email" value={patientInfo.email} onChange={handlePatientChange} required />
                </FormSection>

                {/* Primary Language */}
                <FormSection title="Primary Language" id="section-12">
                    <FormInput label="Primary Language" name="language" value={demographics.language} onChange={handlePatientChange} />
                </FormSection>

                {/* Pronouns */}
                <FormSection title="Pronouns" id="section-13">
                    <FormInput label="Pronouns" name="pronouns" value={demographics.pronouns} onChange={handlePatientChange} />
                </FormSection>

                {/* Ethnicity */}
                <FormSection title="Ethnicity" id="section-14">
                    <FormInput label="Ethnicity" name="ethnicity" value={demographics.ethnicity} onChange={handlePatientChange} />
                </FormSection>

                {/* Race */}
                <FormSection title="Race" id="section-15">
                    <FormInput label="Race" name="race" value={demographics.race} onChange={handlePatientChange} required />
                </FormSection>

                {/* Employment Status */}
                <FormSection title="Employment Status" id="section-16">
                    <FormInput label="Employment Status" name="employment" value={demographics.employment} onChange={handlePatientChange} />
                </FormSection>

                {/* Insurance */}
                <FormSection title="Insurance" id="section-17">
                    <div className="col-span-2">
                        <label className="text-6xl font-bold text-med-card-main mb-8 block text-center">Do you have health insurance? *</label>
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

                {/* Emergency Contact Name */}
                <FormSection title="Emergency Contact Name" id="section-18">
                    <div className="space-y-8">
                        <FormInput label="First Name *" name="emergencyFirstName" value={emergencyContacts[0]?.nameFirst || ''} required />
                        <FormInput label="Last Name *" name="emergencyLastName" value={emergencyContacts[0]?.nameLast || ''} required />
                    </div>
                </FormSection>

                {/* Emergency Contact Phone */}
                <FormSection title="Emergency Contact Phone" id="section-19">
                    <FormInput label="Primary Phone *" name="emergencyPhone" value={emergencyContacts[0]?.phonePrimary || ''} required />
                </FormSection>

                {/* Signature */}
                <FormSection title="Signature" id="section-20">
                    <div className="col-span-2">
                        <div className="border border-gray-400 w-full h-32 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 mb-4">
                            [Draw/Type Signature Placeholder]
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormInput label="Type Name" name="typeName" required />
                            <FormInput label="Relationship to Patient" name="relationType" required />
                        </div>
                        <div className="flex justify-center space-x-4 mt-8">
                            <button onClick={onBack} className="py-3 px-8 bg-red-200 text-red-800 font-bold rounded-lg hover:bg-red-300 transition">
                                Back
                            </button>
                            <button type="submit" className="py-3 px-8 bg-green-200 text-green-800 font-bold rounded-lg hover:bg-green-300 transition">
                                Submit
                            </button>
                        </div>
                    </div>
                </FormSection>
            </div>

            {/* Navigation Buttons */}
            <div className="fixed right-6 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4 z-20">
                <button 
                    onClick={() => scrollToSection('prev')}
                    disabled={currentSection === 0}
                    className="p-3 bg-blue-400 text-white rounded-full shadow-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    <ChevronUp className="w-6 h-6" />
                </button>
                <div className="text-center text-med-card-main font-semibold">
                    {currentSection + 1}/{sections.length}
                </div>
                <button 
                    onClick={() => scrollToSection('next')}
                    disabled={currentSection === sections.length - 1}
                    className="p-3 bg-blue-400 text-white rounded-full shadow-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    <ChevronDown className="w-6 h-6" />
                </button>
            </div>

            <BackButton onClick={onBack} />
        </div>
    );
};

export default FormPage;