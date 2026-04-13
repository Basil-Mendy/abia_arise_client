import { useState, useRef } from 'react'
import axios from 'axios'
import { UserPlus, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react'
import IDCardDisplay from './IDCardDisplay'
import { generateLgaAcronym, getNigerianStates, getLgasForState, getCountryOptions } from '../utils/locationUtils'
import './IndividualRegistration.css'

const instructionText = `
Individual Member Registration Instructions

Welcome to Abia Arise! This registration process is simple and straightforward. 
Please follow these steps:

1. Prepare your documents:
   - Your National Identification Number (NIN)
   - Your Voter's Card Number
   - Your contact information
   
2. Complete all required sections:
   - Identification (NIN and Voter's Card)
   - Personal Information (name, email, phone, etc.)
   - Location Details (residential and origin details)
   - Membership Purpose (reason for joining)

3. After successful registration:
   - You will receive your membership card immediately
   - Download and save your digital card
   - Use your Abia Arise ID and last 4 digits of phone as login credentials

4. Important:
   - You cannot register with the same NIN or phone number twice
   - All information must be accurate
   - You can update your profile picture and residential info later in your dashboard

Click "Continue Registration" to proceed.
`

export default function IndividualRegistration({ onBack }) {
    const [showInstructions, setShowInstructions] = useState(true)
    const [loading, setLoading] = useState(false)
    const [registrationSuccess, setRegistrationSuccess] = useState(false)
    const [idCardData, setIdCardData] = useState(null)
    const [showIDCard, setShowIDCard] = useState(false)
    const [submissionErrors, setSubmissionErrors] = useState({})

    // Duplicate validation state
    const [duplicateErrors, setDuplicateErrors] = useState({
        nin: null,
        votersCardNo: null,
        email: null,
        phoneNumber: null
    })
    const [validatingFields, setValidatingFields] = useState({})
    const debounceTimers = useRef({})

    const [formData, setFormData] = useState({
        nin: '',
        votersCardNo: '',
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        age: '',
        gender: '',
        occupation: '',
        // Origin Details
        countryOfOrigin: 'Nigeria',
        stateOfOrigin: '',
        lgaOfOrigin: '',
        lgaOfOriginAcronym: '',
        // Residence Details
        countryOfResidence: 'Nigeria',
        stateOfResidence: '',
        lgaOfResidence: '',
        lgaOfResidenceAcronym: '',
        electoralWard: '',
        pollingUnit: '',
        membershipPurpose: '',
        profilePicture: null
    })

    // Derived state for dropdowns
    const [nigerianStates] = useState(getNigerianStates())
    const [originLgas, setOriginLgas] = useState([])
    const [residenceLgas, setResidenceLgas] = useState([])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Handle country changes for origin
        if (name === 'countryOfOrigin') {
            setFormData(prev => ({
                ...prev,
                stateOfOrigin: '',
                lgaOfOrigin: '',
                lgaOfOriginAcronym: ''
            }))
            if (value === 'Nigeria') {
                setOriginLgas([])
            }
        }

        // Handle state changes for origin
        if (name === 'stateOfOrigin' && formData.countryOfOrigin === 'Nigeria') {
            const lgas = getLgasForState(value)
            setOriginLgas(lgas)
            setFormData(prev => ({
                ...prev,
                lgaOfOrigin: '',
                lgaOfOriginAcronym: ''
            }))
        }

        // Handle LGA change for origin and generate acronym
        if (name === 'lgaOfOrigin') {
            const acronym = generateLgaAcronym(value)
            setFormData(prev => ({
                ...prev,
                lgaOfOriginAcronym: acronym
            }))
        }

        // Handle country changes for residence
        if (name === 'countryOfResidence') {
            setFormData(prev => ({
                ...prev,
                stateOfResidence: '',
                lgaOfResidence: '',
                lgaOfResidenceAcronym: ''
            }))
            if (value === 'Nigeria') {
                setResidenceLgas([])
            }
        }

        // Handle state changes for residence
        if (name === 'stateOfResidence' && formData.countryOfResidence === 'Nigeria') {
            const lgas = getLgasForState(value)
            setResidenceLgas(lgas)
            setFormData(prev => ({
                ...prev,
                lgaOfResidence: '',
                lgaOfResidenceAcronym: ''
            }))
        }

        // Handle LGA change for residence and generate acronym
        if (name === 'lgaOfResidence') {
            const acronym = generateLgaAcronym(value)
            setFormData(prev => ({
                ...prev,
                lgaOfResidenceAcronym: acronym
            }))
        }

        // Check for duplicates only for specific fields
        const fieldsToCheck = ['nin', 'votersCardNo', 'email', 'phoneNumber']
        if (fieldsToCheck.includes(name) && value.trim()) {
            // Clear existing timer
            if (debounceTimers.current[name]) {
                clearTimeout(debounceTimers.current[name])
            }

            // Set validating state
            setValidatingFields(prev => ({ ...prev, [name]: true }))

            // Debounce the API call
            debounceTimers.current[name] = setTimeout(async () => {
                try {
                    const checkData = {}
                    if (name === 'nin') checkData.nin = value
                    if (name === 'votersCardNo') checkData.voters_card_no = value
                    if (name === 'email') checkData.email = value
                    if (name === 'phoneNumber') checkData.phone_number = value

                    const response = await axios.post(
                        'http://localhost:8000/api/auth/members/check_duplicate/',
                        JSON.stringify(checkData),
                        {
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    )

                    if (response.data.exists) {
                        setDuplicateErrors(prev => ({
                            ...prev,
                            [name]: `This ${name === 'votersCardNo' ? 'Voter\'s Card Number' : name} already exists`
                        }))
                    } else {
                        setDuplicateErrors(prev => ({
                            ...prev,
                            [name]: null
                        }))
                    }
                } catch (error) {
                    console.error('Validation error:', error)
                }
                setValidatingFields(prev => ({ ...prev, [name]: false }))
            }, 500)
        }
    }

    const handleFileChange = (e) => {
        const { name, files } = e.target
        if (files && files[0]) {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }))
        }
    }

    const handleContinue = () => {
        setShowInstructions(false)
    }

    const handleBack = () => {
        if (!showInstructions) {
            setShowInstructions(true)
        } else {
            onBack()
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setSubmissionErrors({})

        try {
            // Create FormData for file upload
            const formDataToSend = new FormData()
            formDataToSend.append('nin', formData.nin)
            formDataToSend.append('voters_card_no', formData.votersCardNo)
            formDataToSend.append('first_name', formData.firstName)
            formDataToSend.append('middle_name', formData.middleName)
            formDataToSend.append('last_name', formData.lastName)
            formDataToSend.append('email', formData.email)
            formDataToSend.append('phone_number', formData.phoneNumber)
            formDataToSend.append('age', formData.age)
            formDataToSend.append('gender', formData.gender)
            formDataToSend.append('occupation', formData.occupation)
            formDataToSend.append('state_of_origin', formData.stateOfOrigin)
            formDataToSend.append('lga_of_origin', formData.lgaOfOrigin)
            formDataToSend.append('country_of_origin', formData.countryOfOrigin)
            formDataToSend.append('lga_of_residence', formData.lgaOfResidence)
            formDataToSend.append('state_of_residence', formData.stateOfResidence)
            formDataToSend.append('country_of_residence', formData.countryOfResidence)
            formDataToSend.append('electoral_ward', formData.electoralWard)
            formDataToSend.append('polling_unit', formData.pollingUnit)
            formDataToSend.append('membership_purpose', formData.membershipPurpose)
            if (formData.profilePicture) {
                formDataToSend.append('profile_picture', formData.profilePicture)
            }

            // Submit registration to backend
            const response = await axios.post(
                'http://localhost:8000/api/auth/members/register/',
                formDataToSend,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            )

            if (response.data.success) {
                const memberId = response.data.member_id

                // Log success message with ID to console
                console.log(`%c✅ REGISTRATION SUCCESSFUL`, 'color: green; font-size: 16px; font-weight: bold;')
                console.log(`%cYour Abia Arise ID: ${memberId}`, 'color: green; font-size: 14px;')

                // Show success alert
                alert(`✅ Registration Successful!\n\nYour Abia Arise ID: ${memberId}\n\nGenerating your ID card...`)

                // Generate ID card
                try {
                    const idCardResponse = await axios.post(
                        'http://localhost:8000/api/auth/members/generate_id_card/',
                        { member_id: memberId }
                    )

                    if (idCardResponse.data.success) {
                        console.log(`%cID Card Generated Successfully`, 'color: green; font-size: 14px;')

                        setIdCardData({
                            card_url: idCardResponse.data.card_url,
                            member_data: idCardResponse.data.member_data
                        })
                        setRegistrationSuccess(true)

                        // Trigger download of ID card
                        const link = document.createElement('a')
                        link.href = `http://localhost:8000${idCardResponse.data.card_url}`
                        link.download = `id_card_${memberId}.png`
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)

                        setShowIDCard(true)
                    } else {
                        console.warn(`⚠️ Registration successful, but ID card generation failed`)
                        alert('⚠️ Registration successful, but ID card generation failed.\n\nYou can generate it later from your dashboard.')
                    }
                } catch (idCardError) {
                    console.error('ID card generation error:', idCardError)
                    console.log(`⚠️ Registration successful (ID: ${memberId}), but ID card generation failed.\n\nYou can generate it later from your dashboard.`)
                    alert('⚠️ Registration successful, but ID card generation failed.\n\nYou can generate it later from your dashboard.')
                }
            }
        } catch (error) {
            console.error('Registration error:', error)

            // Log error to console
            console.log(`%c❌ REGISTRATION FAILED`, 'color: red; font-size: 16px; font-weight: bold;')

            if (error.response && error.response.status === 400) {
                const serverErrors = error.response.data
                const errorMessages = {}

                // Map backend field names to display names
                if (serverErrors.nin) {
                    errorMessages.nin = Array.isArray(serverErrors.nin) ? serverErrors.nin[0] : serverErrors.nin
                }
                if (serverErrors.voters_card_no) {
                    errorMessages.votersCardNo = Array.isArray(serverErrors.voters_card_no) ? serverErrors.voters_card_no[0] : serverErrors.voters_card_no
                }
                if (serverErrors.email) {
                    errorMessages.email = Array.isArray(serverErrors.email) ? serverErrors.email[0] : serverErrors.email
                }
                if (serverErrors.phone_number) {
                    errorMessages.phoneNumber = Array.isArray(serverErrors.phone_number) ? serverErrors.phone_number[0] : serverErrors.phone_number
                }
                if (serverErrors.first_name) {
                    errorMessages.firstName = Array.isArray(serverErrors.first_name) ? serverErrors.first_name[0] : serverErrors.first_name
                }
                if (serverErrors.last_name) {
                    errorMessages.lastName = Array.isArray(serverErrors.last_name) ? serverErrors.last_name[0] : serverErrors.last_name
                }

                // Log each error to console
                Object.entries(errorMessages).forEach(([field, message]) => {
                    console.log(`%c  • ${field}: ${message}`, 'color: red; font-size: 12px;')
                })

                setSubmissionErrors(errorMessages)
                alert(`❌ Registration Failed\n\nPlease check the errors and try again.`)
            } else {
                console.log(`%c  ${error.message}`, 'color: red; font-size: 12px;')
                alert('❌ Registration failed. Please check your information and try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="individual-registration">
            {showInstructions ? (
                <div className="instruction-box">
                    <h2>Individual Member Registration</h2>
                    <div className="instruction-content">
                        {instructionText.split('\n').map((line, idx) => (
                            <p key={idx}>{line}</p>
                        ))}
                    </div>
                    <div className="instruction-actions">
                        <button className="btn-primary" onClick={handleContinue} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <UserPlus size={20} /> Continue Registration
                        </button>
                        <button className="btn-secondary" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ChevronLeft size={20} /> Back
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="registration-form">
                    <h2>Individual Member Registration Form</h2>

                    {Object.keys(submissionErrors).length > 0 && (
                        <div className="error-alert" style={{
                            backgroundColor: '#ffebee',
                            border: '1px solid #ff4444',
                            borderRadius: '4px',
                            padding: '12px',
                            marginBottom: '20px',
                            color: '#c0392b'
                        }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <AlertCircle size={18} /> Registration Failed
                            </div>
                            <ul style={{ margin: '0', paddingLeft: '20px' }}>
                                {Object.entries(submissionErrors).map(([field, message]) => (
                                    <li key={field}>{message}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Identification Section */}
                    <fieldset>
                        <legend>Identification</legend>
                        <div className="form-group">
                            <label htmlFor="nin">National Identification Number (NIN) *</label>
                            <input
                                type="text"
                                id="nin"
                                name="nin"
                                value={formData.nin}
                                onChange={handleInputChange}
                                placeholder="Enter your NIN"
                                required
                                className={duplicateErrors.nin || submissionErrors.nin ? 'input-error' : ''}
                            />
                            {validatingFields.nin && (
                                <span className="validating-text">Checking...</span>
                            )}
                            {duplicateErrors.nin && (
                                <span className="error-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <AlertCircle size={16} /> {duplicateErrors.nin}
                                </span>
                            )}
                            {submissionErrors.nin && (
                                <span className="error-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <AlertCircle size={16} /> {submissionErrors.nin}
                                </span>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="votersCardNo">Voter's Card Number *</label>
                            <input
                                type="text"
                                id="votersCardNo"
                                name="votersCardNo"
                                value={formData.votersCardNo}
                                onChange={handleInputChange}
                                placeholder="Enter your Voter's Card Number"
                                required
                                className={duplicateErrors.votersCardNo || submissionErrors.votersCardNo ? 'input-error' : ''}
                            />
                            {validatingFields.votersCardNo && (
                                <span className="validating-text">Checking...</span>
                            )}
                            {duplicateErrors.votersCardNo && (
                                <span className="error-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <AlertCircle size={16} /> {duplicateErrors.votersCardNo}
                                </span>
                            )}
                            {submissionErrors.votersCardNo && (
                                <span className="error-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <AlertCircle size={16} /> {submissionErrors.votersCardNo}
                                </span>
                            )}
                        </div>
                    </fieldset>

                    {/* Personal Information Section */}
                    <fieldset>
                        <legend>Personal Information</legend>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="firstName">First Name *</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    required
                                    className={submissionErrors.firstName ? 'input-error' : ''}
                                />
                                {submissionErrors.firstName && (
                                    <span className="error-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <AlertCircle size={16} /> {submissionErrors.firstName}
                                    </span>
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor="middleName">Middle Name</label>
                                <input
                                    type="text"
                                    id="middleName"
                                    name="middleName"
                                    value={formData.middleName}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="lastName">Last Name *</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    required
                                    className={submissionErrors.lastName ? 'input-error' : ''}
                                />
                                {submissionErrors.lastName && (
                                    <span className="error-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <AlertCircle size={16} /> {submissionErrors.lastName}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="email">Email *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className={duplicateErrors.email || submissionErrors.email ? 'input-error' : ''}
                                />
                                {validatingFields.email && (
                                    <span className="validating-text">Checking...</span>
                                )}
                                {duplicateErrors.email && (
                                    <span className="error-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <AlertCircle size={16} /> {duplicateErrors.email}
                                    </span>
                                )}
                                {submissionErrors.email && (
                                    <span className="error-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <AlertCircle size={16} /> {submissionErrors.email}
                                    </span>
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor="phoneNumber">Phone Number *</label>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    required
                                    className={duplicateErrors.phoneNumber || submissionErrors.phoneNumber ? 'input-error' : ''}
                                />
                                {validatingFields.phoneNumber && (
                                    <span className="validating-text">Checking...</span>
                                )}
                                {duplicateErrors.phoneNumber && (
                                    <span className="error-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <AlertCircle size={16} /> {duplicateErrors.phoneNumber}
                                    </span>
                                )}
                                {submissionErrors.phoneNumber && (
                                    <span className="error-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <AlertCircle size={16} /> {submissionErrors.phoneNumber}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="age">Age *</label>
                                <input
                                    type="number"
                                    id="age"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="gender">Gender *</label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="occupation">Occupation *</label>
                                <input
                                    type="text"
                                    id="occupation"
                                    name="occupation"
                                    value={formData.occupation}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>
                    </fieldset>

                    {/* Origin Details */}
                    <fieldset>
                        <legend>Origin Details</legend>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="countryOfOrigin">Country of Origin *</label>
                                <select
                                    id="countryOfOrigin"
                                    name="countryOfOrigin"
                                    value={formData.countryOfOrigin}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Country</option>
                                    {getCountryOptions().map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {formData.countryOfOrigin === 'Nigeria' ? (
                            <>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="stateOfOrigin">State of Origin *</label>
                                        <select
                                            id="stateOfOrigin"
                                            name="stateOfOrigin"
                                            value={formData.stateOfOrigin}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select State</option>
                                            {nigerianStates.map(state => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="lgaOfOrigin">LGA of Origin *</label>
                                        <select
                                            id="lgaOfOrigin"
                                            name="lgaOfOrigin"
                                            value={formData.lgaOfOrigin}
                                            onChange={handleInputChange}
                                            required
                                            disabled={!formData.stateOfOrigin}
                                        >
                                            <option value="">Select LGA</option>
                                            {originLgas.map(lga => (
                                                <option key={lga} value={lga}>{lga}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {formData.lgaOfOrigin && (
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="lgaOfOriginAcronym">LGA Acronym</label>
                                            <input
                                                type="text"
                                                id="lgaOfOriginAcronym"
                                                name="lgaOfOriginAcronym"
                                                value={formData.lgaOfOriginAcronym}
                                                readOnly
                                                className="readonly-input"
                                            />
                                            <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                                Auto-generated: {formData.lgaOfOriginAcronym}
                                            </small>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="stateOfOrigin">State/Province of Origin *</label>
                                        <input
                                            type="text"
                                            id="stateOfOrigin"
                                            name="stateOfOrigin"
                                            value={formData.stateOfOrigin}
                                            onChange={handleInputChange}
                                            placeholder="Enter state/province name"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="lgaOfOrigin">District/Region of Origin *</label>
                                        <input
                                            type="text"
                                            id="lgaOfOrigin"
                                            name="lgaOfOrigin"
                                            onChange={handleInputChange}
                                            value={formData.lgaOfOrigin}
                                            placeholder="Enter district/region name"
                                            required
                                        />
                                    </div>
                                </div>
                                {formData.lgaOfOrigin && (
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="lgaOfOriginAcronym">District Acronym</label>
                                            <input
                                                type="text"
                                                id="lgaOfOriginAcronym"
                                                name="lgaOfOriginAcronym"
                                                value={formData.lgaOfOriginAcronym}
                                                readOnly
                                                className="readonly-input"
                                            />
                                            <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                                Auto-generated: {formData.lgaOfOriginAcronym}
                                            </small>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </fieldset>

                    {/* Location Details */}
                    <fieldset>
                        <legend>Location Details (Residence)</legend>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="countryOfResidence">Country of Residence *</label>
                                <select
                                    id="countryOfResidence"
                                    name="countryOfResidence"
                                    value={formData.countryOfResidence}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Country</option>
                                    {getCountryOptions().map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {formData.countryOfResidence === 'Nigeria' ? (
                            <>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="stateOfResidence">State of Residence *</label>
                                        <select
                                            id="stateOfResidence"
                                            name="stateOfResidence"
                                            value={formData.stateOfResidence}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select State</option>
                                            {nigerianStates.map(state => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="lgaOfResidence">LGA of Residence *</label>
                                        <select
                                            id="lgaOfResidence"
                                            name="lgaOfResidence"
                                            value={formData.lgaOfResidence}
                                            onChange={handleInputChange}
                                            required
                                            disabled={!formData.stateOfResidence}
                                        >
                                            <option value="">Select LGA</option>
                                            {residenceLgas.map(lga => (
                                                <option key={lga} value={lga}>{lga}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {formData.lgaOfResidence && (
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="lgaOfResidenceAcronym">LGA Acronym</label>
                                            <input
                                                type="text"
                                                id="lgaOfResidenceAcronym"
                                                name="lgaOfResidenceAcronym"
                                                value={formData.lgaOfResidenceAcronym}
                                                readOnly
                                                className="readonly-input"
                                            />
                                            <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                                Auto-generated: {formData.lgaOfResidenceAcronym}
                                            </small>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="stateOfResidence">State/Province of Residence *</label>
                                        <input
                                            type="text"
                                            id="stateOfResidence"
                                            name="stateOfResidence"
                                            value={formData.stateOfResidence}
                                            onChange={handleInputChange}
                                            placeholder="Enter state/province name"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="lgaOfResidence">District/Region of Residence *</label>
                                        <input
                                            type="text"
                                            id="lgaOfResidence"
                                            name="lgaOfResidence"
                                            value={formData.lgaOfResidence}
                                            onChange={handleInputChange}
                                            placeholder="Enter district/region name"
                                            required
                                        />
                                    </div>
                                </div>
                                {formData.lgaOfResidence && (
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="lgaOfResidenceAcronym">District Acronym</label>
                                            <input
                                                type="text"
                                                id="lgaOfResidenceAcronym"
                                                name="lgaOfResidenceAcronym"
                                                value={formData.lgaOfResidenceAcronym}
                                                readOnly
                                                className="readonly-input"
                                            />
                                            <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                                Auto-generated: {formData.lgaOfResidenceAcronym}
                                            </small>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="electoralWard">Electoral Ward *</label>
                                <input
                                    type="text"
                                    id="electoralWard"
                                    name="electoralWard"
                                    value={formData.electoralWard}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="pollingUnit">Polling Unit *</label>
                                <input
                                    type="text"
                                    id="pollingUnit"
                                    name="pollingUnit"
                                    value={formData.pollingUnit}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>
                    </fieldset>

                    {/* Membership Purpose */}
                    <fieldset>
                        <legend>Membership Purpose</legend>
                        <div className="form-group">
                            <label htmlFor="membershipPurpose">Why are you joining Abia Arise? *</label>
                            <textarea
                                id="membershipPurpose"
                                name="membershipPurpose"
                                value={formData.membershipPurpose}
                                onChange={handleInputChange}
                                placeholder="Tell us your reason for joining..."
                                rows="4"
                                required
                            ></textarea>
                        </div>
                    </fieldset>

                    {/* Profile Picture */}
                    <fieldset>
                        <legend>Profile Picture</legend>
                        <div className="form-group">
                            <label htmlFor="profilePicture">Upload Profile Picture</label>
                            <input
                                type="file"
                                id="profilePicture"
                                name="profilePicture"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            {formData.profilePicture && (
                                <div className="file-preview">
                                    <p>Selected: {formData.profilePicture.name}</p>
                                    <img
                                        src={URL.createObjectURL(formData.profilePicture)}
                                        alt="Profile preview"
                                        style={{ maxWidth: '150px', marginTop: '10px' }}
                                    />
                                </div>
                            )}
                        </div>
                    </fieldset>

                    {/* Form Actions */}
                    <div className="form-actions">
                        <button type="submit" className="btn-primary btn-large" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                            <UserPlus size={20} /> Complete Registration
                        </button>
                        <button type="button" className="btn-secondary btn-large" onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                            <ChevronLeft size={20} /> Back
                        </button>
                    </div>
                </form>
            )}

            {showIDCard && idCardData && (
                <IDCardDisplay
                    memberData={idCardData.member_data}
                    cardUrl={idCardData.card_url}
                    onClose={() => {
                        setShowIDCard(false)
                        onBack()
                    }}
                />
            )}
        </div>
    )
}
