import React, { useState } from 'react';
import { Plus, Minus, ArrowLeft } from 'lucide-react';

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

const FormPage = ({ onBack }) => {
    const [patientInfo, setPatientInfo] = useState({
        firstName: '', lastName: '', mi: '', dob: '', sex: '', social: '',
        address1: '', address2: '', city: '', state: '', zip: '',
        contactBest: '', contactSecondary: '', email: '', insurance: null,
    });
    const [demographics, setDemographics] = useState({
        language: '', pronouns: '', ethnicity: '', race: '', employment: '',
    });
    const [emergencyContacts, setEmergencyContacts] = useState([{ nameFirst: '', nameLast: '', phonePrimary: '', phoneSecondary: '', address1: '', address2: '', relation: 'Parent' }]);

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
        <div className={`flex flex-col mb-4 ${className}`}>
            <label className="text-sm font-semibold text-med-card-main mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className="p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-med-accent-blue focus:border-med-accent-blue"
            />
        </div>
    );

    const FormSection = ({ title, children, className = '' }) => (
        <div className={`p-4 ${className}`}>
            <h2 className="text-xl font-bold text-med-card-main mb-4 border-b pb-2 border-gray-200">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {children}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pt-4 pb-32 bg-med-bg-soft shadow-2xl rounded-xl w-full max-w-7xl mx-auto animate-fade-in">
            <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 border-r border-gray-200 pr-8">
                         <FormSection title="Patient Information" className="p-0">
                            <div className="col-span-1 md:col-span-2">
                                <label className="text-sm font-semibold text-med-card-main">Full Name *</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <FormInput label="First" name="firstName" value={patientInfo.firstName} onChange={handlePatientChange} required className="mb-0" />
                                    <FormInput label="MI" name="mi" value={patientInfo.mi} onChange={handlePatientChange} className="mb-0" />
                                    <FormInput label="Last" name="lastName" value={patientInfo.lastName} onChange={handlePatientChange} required className="mb-0" />
                                </div>
                            </div>
                            <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-med-card-main mb-1 block">Sex at Birth *</label>
                                    <div className="flex space-x-4 pt-2">
                                        <label className="flex items-center text-gray-600">
                                            <input type="radio" name="sex" value="Male" checked={patientInfo.sex === 'Male'} onChange={handlePatientChange} className="mr-2 text-med-accent-blue" />
                                            Male
                                        </label>
                                        <label className="flex items-center text-gray-600">
                                            <input type="radio" name="sex" value="Female" checked={patientInfo.sex === 'Female'} onChange={handlePatientChange} className="mr-2 text-med-accent-blue" />
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

                    <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormSection title="Demographics" className="p-0">
                                <FormInput label="Primary Language" name="language" value={demographics.language} onChange={handlePatientChange} />
                                <FormInput label="Pronouns" name="pronouns" value={demographics.pronouns} onChange={handlePatientChange} />
                                <FormInput label="Ethnicity" name="ethnicity" value={demographics.ethnicity} onChange={handlePatientChange} />
                                <FormInput label="Race" name="race" value={demographics.race} onChange={handlePatientChange} required />
                                <FormInput label="Employment Status" name="employment" value={demographics.employment} onChange={handlePatientChange} />
                            </FormSection>

                            <FormSection title="Insurance" className="p-0 mt-8 md:mt-0">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="text-lg font-bold text-med-card-main mb-2 block">Do you have health insurance? *</label>
                                    <div className="flex space-x-6 pt-2">
                                        <label className="flex items-center text-gray-600">
                                            <input type="radio" name="insurance" value="Yes" checked={patientInfo.insurance === 'Yes'} onChange={handlePatientChange} className="mr-2 text-med-accent-blue" />
                                            Yes
                                        </label>
                                        <label className="flex items-center text-gray-600">
                                            <input type="radio" name="insurance" value="No" checked={patientInfo.insurance === 'No'} onChange={handlePatientChange} className="mr-2 text-med-accent-blue" />
                                            No
                                        </label>
                                    </div>
                                </div>
                            </FormSection>
                        </div>

                        <div className="mt-8 border-t pt-8 border-gray-200">
                            <h2 className="text-xl font-bold text-med-card-main mb-4">Emergency Contact Information</h2>
                            {emergencyContacts.map((contact, index) => (
                                <div key={index} className="p-4 mb-6 bg-white rounded-lg shadow-md border border-med-accent-blue/20 relative">
                                    <h3 className="text-lg font-semibold text-med-accent-blue mb-4">Emergency Contact {index + 1}</h3>

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
                                        <label className="text-sm font-semibold text-med-card-main mb-1 block">Relationship to Patient *</label>
                                        <div className="flex flex-wrap gap-4 pt-2">
                                            {['Parent', 'Significant Other', 'Sibling', 'Child', 'Friend', 'Other'].map(r => (
                                                <label key={r} className="flex items-center text-gray-600">
                                                    <input type="radio" name={`relation-${index}`} value={r} checked={contact.relation === r} onChange={(e) => { /* update logic */ }} className="mr-2 text-med-accent-blue" />
                                                    {r}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={addEmergencyContact}
                                className="mt-4 flex items-center text-med-accent-blue font-bold hover:text-blue-700 transition duration-200"
                            >
                                <Plus className="w-5 h-5 mr-1" />
                                Add Emergency Contact
                            </button>

                            <div className="mt-10 p-4 bg-white rounded-lg shadow-inner">
                                <label className="text-sm font-semibold text-med-card-main mb-1 block">Signature *</label>
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
            <BackButton onClick={onBack} />
        </div>
    );
};

export default FormPage;