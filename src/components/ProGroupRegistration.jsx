import { useState } from 'react'
import axios from 'axios'
import { UserPlus, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react'
import CertificateDisplay from './CertificateDisplay'
import { generateLgaAcronym, getNigerianStates, getLgasForState, getCountryOptions } from '../utils/locationUtils'
import './ProGroupRegistration.css'

const instructionText = `
Pro-Group Member Registration Instructions

Welcome to Abia Arise! This registration is for your pro-group organization. 
Follow these steps:

1. Required Information:
   - Group name, State, LGA, and Country
   - Chairman and Secretary details (contact info, passport)
   - Total number of members
   - Group address

2. Member Registration:
   - After completing this registration, you will receive a Group License Number
   - A group certificate will be generated immediately
   - Download and save your certificate
   - Use the Members tab in your dashboard to upload member data later

3. Required Member Information (upload after registration):
   - First name, middle name, last name
   - Gender, NIN, Voter's Card No
   - Phone number, email
   - LGA, Ward, Polling Unit
   - Bank details (for future transactions)

4. After Registration:
   - Your group will receive a Group License Number
   - A group certificate will be generated immediately
   - Download and save your certificate
   - Group leaders can manage members through the Members tab

Click "Continue Registration" to proceed with registration.
`

export default function ProGroupRegistration({ onBack }) {
    const [showInstructions, setShowInstructions] = useState(true)
    const [loading, setLoading] = useState(false)
    const [registrationSuccess, setRegistrationSuccess] = useState(false)
    const [certificateData, setCertificateData] = useState(null)
    const [showCertificate, setShowCertificate] = useState(false)
    const [submissionErrors, setSubmissionErrors] = useState({})

    // States for dropdowns
    const [nigerianStates] = useState(getNigerianStates())
    const [countryOptions] = useState(getCountryOptions())
    const [availableLgas, setAvailableLgas] = useState([])

    const [formData, setFormData] = useState({
        country: 'Nigeria',
        state: '',
        lga: '',
        groupName: '',
        totalMembers: '',
        groupAddress: '',
        resetPin: '',
        chairmanName: '',
        chairmanPhone: '',
        chairmanEmail: '',
        chairmanResidentialAddress: '',
        chairmanPassport: null,
        secretaryName: '',
        secretaryPhone: '',
        secretaryEmail: '',
        secretaryResidentialAddress: '',
        secretaryPassport: null,
        logo: null
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Handle country changes
        if (name === 'country') {
            setFormData(prev => ({
                ...prev,
                state: '',
                lga: ''
            }))
            if (value === 'Nigeria') {
                setAvailableLgas([])
            }
        }

        // Handle state changes for Nigeria only
        if (name === 'state' && formData.country === 'Nigeria') {
            const lgas = getLgasForState(value)
            setAvailableLgas(lgas)
            setFormData(prev => ({
                ...prev,
                lga: ''
            }))
        }
    }

    const handleFileChange = (e) => {
        const { name, files } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: files[0]
        }))
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
            const data = new FormData()
            data.append('name', formData.groupName)
            data.append('country', formData.country)
            data.append('state', formData.state)
            data.append('lga', formData.lga)
            data.append('total_members', formData.totalMembers)
            data.append('address', formData.groupAddress)
            data.append('reset_pin', formData.resetPin)
            data.append('chairman_name', formData.chairmanName)
            data.append('chairman_phone', formData.chairmanPhone)
            data.append('chairman_email', formData.chairmanEmail)
            data.append('chairman_residential_address', formData.chairmanResidentialAddress)
            if (formData.chairmanPassport) {
                data.append('chairman_passport', formData.chairmanPassport)
            }
            data.append('secretary_name', formData.secretaryName)
            data.append('secretary_phone', formData.secretaryPhone)
            data.append('secretary_email', formData.secretaryEmail)
            data.append('secretary_residential_address', formData.secretaryResidentialAddress)
            if (formData.secretaryPassport) {
                data.append('secretary_passport', formData.secretaryPassport)
            }
            if (formData.logo) {
                data.append('logo', formData.logo)
            }

            // Submit registration to backend
            const response = await axios.post(
                'http://localhost:8000/api/auth/groups/register/',
                data,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            )

            if (response.data.success) {
                const groupId = response.data.group_id

                // Log success message with License Number to console
                console.log(`%c✅ REGISTRATION SUCCESSFUL`, 'color: green; font-size: 16px; font-weight: bold;')
                console.log(`%cYour Group License Number: ${groupId}`, 'color: green; font-size: 14px;')

                // Show success alert
                alert(`✅ Registration Successful!\n\nYour Group License Number: ${groupId}\n\nGenerating your certificate...`)

                // Generate certificate
                try {
                    const certResponse = await axios.post(
                        'http://localhost:8000/api/auth/groups/generate_certificate/',
                        { group_id: groupId }
                    )

                    if (certResponse.data.success) {
                        console.log(`%cCertificate Generated Successfully`, 'color: green; font-size: 14px;')

                        setCertificateData({
                            certificate_url: certResponse.data.certificate_url,
                            group_data: certResponse.data.group_data
                        })
                        setRegistrationSuccess(true)

                        // Trigger download of certificate
                        const link = document.createElement('a')
                        link.href = `http://localhost:8000${certResponse.data.certificate_url}`
                        link.download = `certificate_${groupId}.png`
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)

                        setShowCertificate(true)
                    } else {
                        console.warn(`⚠️ Registration successful, but certificate generation failed`)
                        alert('⚠️ Registration successful, but certificate generation failed.\n\nYou can generate it later from your dashboard.')
                    }
                } catch (certError) {
                    console.error('Certificate generation error:', certError)
                    console.log(`⚠️ Registration successful (License: ${groupId}), but certificate generation failed.\n\nYou can generate it later from your dashboard.`)
                    alert('⚠️ Registration successful, but certificate generation failed.\n\nYou can generate it later from your dashboard.')
                }
            }
        } catch (error) {
            console.error('Registration error:', error)

            // Log error to console
            console.log(`%c❌ REGISTRATION FAILED`, 'color: red; font-size: 16px; font-weight: bold;')

            if (error.response && error.response.status === 400) {
                const serverErrors = error.response.data
                const errorMessages = {}

                // Map backend field names to state field names
                if (serverErrors.name) {
                    errorMessages.groupName = Array.isArray(serverErrors.name) ? serverErrors.name[0] : serverErrors.name
                }
                if (serverErrors.lga) {
                    errorMessages.lga = Array.isArray(serverErrors.lga) ? serverErrors.lga[0] : serverErrors.lga
                }
                if (serverErrors.country) {
                    errorMessages.country = Array.isArray(serverErrors.country) ? serverErrors.country[0] : serverErrors.country
                }
                if (serverErrors.reset_pin) {
                    errorMessages.resetPin = Array.isArray(serverErrors.reset_pin) ? serverErrors.reset_pin[0] : serverErrors.reset_pin
                }
                if (serverErrors.total_members) {
                    errorMessages.totalMembers = Array.isArray(serverErrors.total_members) ? serverErrors.total_members[0] : serverErrors.total_members
                }
                if (serverErrors.address) {
                    errorMessages.groupAddress = Array.isArray(serverErrors.address) ? serverErrors.address[0] : serverErrors.address
                }
                if (serverErrors.chairman_name) {
                    errorMessages.chairmanName = Array.isArray(serverErrors.chairman_name) ? serverErrors.chairman_name[0] : serverErrors.chairman_name
                }
                if (serverErrors.chairman_phone) {
                    errorMessages.chairmanPhone = Array.isArray(serverErrors.chairman_phone) ? serverErrors.chairman_phone[0] : serverErrors.chairman_phone
                }
                if (serverErrors.chairman_email) {
                    errorMessages.chairmanEmail = Array.isArray(serverErrors.chairman_email) ? serverErrors.chairman_email[0] : serverErrors.chairman_email
                }
                if (serverErrors.secretary_name) {
                    errorMessages.secretaryName = Array.isArray(serverErrors.secretary_name) ? serverErrors.secretary_name[0] : serverErrors.secretary_name
                }
                if (serverErrors.secretary_phone) {
                    errorMessages.secretaryPhone = Array.isArray(serverErrors.secretary_phone) ? serverErrors.secretary_phone[0] : serverErrors.secretary_phone
                }
                if (serverErrors.secretary_email) {
                    errorMessages.secretaryEmail = Array.isArray(serverErrors.secretary_email) ? serverErrors.secretary_email[0] : serverErrors.secretary_email
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
        <div className="pro-group-registration">
            {showInstructions ? (
                <div className="instruction-box">
                    <h2>Pro-Group Member Registration</h2>
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
                    <h2>Pro-Group Registration Form</h2>

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

                    {/* Group Information */}
                    <fieldset>
                        <legend>Group Information</legend>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="country">Country *</label>
                                <select
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    required
                                    className={submissionErrors.country ? 'input-error' : ''}
                                >
                                    {countryOptions.map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
                                {submissionErrors.country && (
                                    <span className="error-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <AlertCircle size={16} /> {submissionErrors.country}
                                    </span>
                                )}
                            </div>
                        </div>

                        {formData.country === 'Nigeria' ? (
                            <>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="state">State *</label>
                                        <select
                                            id="state"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            required
                                            className={submissionErrors.state ? 'input-error' : ''}
                                        >
                                            <option value="">Select State</option>
                                            {nigerianStates.map(state => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                        {submissionErrors.state && (
                                            <span className="error-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <AlertCircle size={16} /> {submissionErrors.state}
                                            </span>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="lga">LGA *</label>
                                        <select
                                            id="lga"
                                            name="lga"
                                            value={formData.lga}
                                            onChange={handleInputChange}
                                            required
                                            disabled={!formData.state}
                                            className={submissionErrors.lga ? 'input-error' : ''}
                                        >
                                            <option value="">Select LGA</option>
                                            {availableLgas.map(lga => (
                                                <option key={lga} value={lga}>{lga}</option>
                                            ))}
                                        </select>
                                        {submissionErrors.lga && (
                                            <span className="error-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <AlertCircle size={16} /> {submissionErrors.lga}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="state">State/Province *</label>
                                        <input
                                            type="text"
                                            id="state"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            placeholder="Enter state/province name"
                                            required
                                            className={submissionErrors.state ? 'input-error' : ''}
                                        />
                                        {submissionErrors.state && (
                                            <span className="error-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <AlertCircle size={16} /> {submissionErrors.state}
                                            </span>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="lga">District/Region *</label>
                                        <input
                                            type="text"
                                            id="lga"
                                            name="lga"
                                            value={formData.lga}
                                            onChange={handleInputChange}
                                            placeholder="Enter district/region name"
                                            required
                                            className={submissionErrors.lga ? 'input-error' : ''}
                                        />
                                        {submissionErrors.lga && (
                                            <span className="error-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <AlertCircle size={16} /> {submissionErrors.lga}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="groupName">Group Name *</label>
                                <input
                                    type="text"
                                    id="groupName"
                                    name="groupName"
                                    value={formData.groupName}
                                    onChange={handleInputChange}
                                    placeholder="Enter group name"
                                    required
                                    className={submissionErrors.groupName ? 'input-error' : ''}
                                />
                                {submissionErrors.groupName && (
                                    <span className="error-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <AlertCircle size={16} /> {submissionErrors.groupName}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="totalMembers">Total Number of Members *</label>
                                <input
                                    type="number"
                                    id="totalMembers"
                                    name="totalMembers"
                                    value={formData.totalMembers}
                                    onChange={handleInputChange}
                                    required
                                    className={submissionErrors.totalMembers ? 'input-error' : ''}
                                />
                                {submissionErrors.totalMembers && (
                                    <span className="error-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <AlertCircle size={16} /> {submissionErrors.totalMembers}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="groupAddress">Group Address *</label>
                            <textarea
                                id="groupAddress"
                                name="groupAddress"
                                value={formData.groupAddress}
                                onChange={handleInputChange}
                                placeholder="Enter group address"
                                rows="3"
                                required
                                className={submissionErrors.groupAddress ? 'input-error' : ''}
                            ></textarea>
                            {submissionErrors.groupAddress && (
                                <span className="error-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <AlertCircle size={16} /> {submissionErrors.groupAddress}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="resetPin">Reset PIN (Security Password) *</label>
                            <input
                                type="password"
                                id="resetPin"
                                name="resetPin"
                                value={formData.resetPin}
                                onChange={handleInputChange}
                                placeholder="Enter 6-digit security PIN"
                                maxLength="6"
                                required
                                className={submissionErrors.resetPin ? 'input-error' : ''}
                            />
                            <small style={{ color: '#6b7280', marginTop: '4px', display: 'block' }}>This PIN will be required for making changes in the group dashboard. Must be 6 digits.</small>
                            {submissionErrors.resetPin && (
                                <span className="error-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <AlertCircle size={16} /> {submissionErrors.resetPin}
                                </span>
                            )}
                        </div>
                    </fieldset>

                    {/* Chairman Information */}
                    <fieldset>
                        <legend>Chairman Information</legend>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="chairmanName">Name *</label>
                                <input
                                    type="text"
                                    id="chairmanName"
                                    name="chairmanName"
                                    value={formData.chairmanName}
                                    onChange={handleInputChange}
                                    required
                                    className={submissionErrors.chairmanName ? 'input-error' : ''}
                                />
                                {submissionErrors.chairmanName && (
                                    <span className="error-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <AlertCircle size={16} /> {submissionErrors.chairmanName}
                                    </span>
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor="chairmanPhone">Phone Number *</label>
                                <input
                                    type="tel"
                                    id="chairmanPhone"
                                    name="chairmanPhone"
                                    value={formData.chairmanPhone}
                                    onChange={handleInputChange}
                                    className={submissionErrors.chairmanPhone ? 'input-error' : ''}
                                    required
                                />
                                {submissionErrors.chairmanPhone && (
                                    <span className="error-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <AlertCircle size={16} /> {submissionErrors.chairmanPhone}
                                    </span>
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor="chairmanEmail">Email *</label>
                                <input
                                    type="email"
                                    id="chairmanEmail"
                                    name="chairmanEmail"
                                    value={formData.chairmanEmail}
                                    onChange={handleInputChange}
                                    required
                                    className={submissionErrors.chairmanEmail ? 'input-error' : ''}
                                />
                                {submissionErrors.chairmanEmail && (
                                    <span className="error-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <AlertCircle size={16} /> {submissionErrors.chairmanEmail}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="chairmanResidentialAddress">Residential Address *</label>
                            <textarea
                                id="chairmanResidentialAddress"
                                name="chairmanResidentialAddress"
                                value={formData.chairmanResidentialAddress}
                                onChange={handleInputChange}
                                rows="2"
                                required
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label htmlFor="chairmanPassport">Passport Upload *</label>
                            <input
                                type="file"
                                id="chairmanPassport"
                                name="chairmanPassport"
                                onChange={handleFileChange}
                                accept="image/*"
                                required
                            />
                        </div>
                    </fieldset>

                    {/* Secretary Information */}
                    <fieldset>
                        <legend>Secretary Information</legend>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="secretaryName">Name *</label>
                                <input
                                    type="text"
                                    id="secretaryName"
                                    name="secretaryName"
                                    value={formData.secretaryName}
                                    onChange={handleInputChange}
                                    required
                                    className={submissionErrors.secretaryName ? 'input-error' : ''}
                                />
                                {submissionErrors.secretaryName && (
                                    <span className="error-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <AlertCircle size={16} /> {submissionErrors.secretaryName}
                                    </span>
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor="secretaryPhone">Phone Number *</label>
                                <input
                                    type="tel"
                                    id="secretaryPhone"
                                    name="secretaryPhone"
                                    value={formData.secretaryPhone}
                                    onChange={handleInputChange}
                                    required
                                    className={submissionErrors.secretaryPhone ? 'input-error' : ''}
                                />
                                {submissionErrors.secretaryPhone && (
                                    <span className="error-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <AlertCircle size={16} /> {submissionErrors.secretaryPhone}
                                    </span>
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor="secretaryEmail">Email *</label>
                                <input
                                    type="email"
                                    id="secretaryEmail"
                                    name="secretaryEmail"
                                    value={formData.secretaryEmail}
                                    onChange={handleInputChange}
                                    required
                                    className={submissionErrors.secretaryEmail ? 'input-error' : ''}
                                />
                                {submissionErrors.secretaryEmail && (
                                    <span className="error-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <AlertCircle size={16} /> {submissionErrors.secretaryEmail}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="secretaryResidentialAddress">Residential Address *</label>
                            <textarea
                                id="secretaryResidentialAddress"
                                name="secretaryResidentialAddress"
                                value={formData.secretaryResidentialAddress}
                                onChange={handleInputChange}
                                rows="2"
                                required
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label htmlFor="secretaryPassport">Passport Upload *</label>
                            <input
                                type="file"
                                id="secretaryPassport"
                                name="secretaryPassport"
                                onChange={handleFileChange}
                                accept="image/*"
                                required
                            />
                        </div>
                    </fieldset>

                    {/* Group Logo */}
                    <fieldset>
                        <legend>Group Logo</legend>
                        <div className="form-group">
                            <label htmlFor="logo">Upload Group Logo</label>
                            <input
                                type="file"
                                id="logo"
                                name="logo"
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                            {formData.logo && (
                                <div className="file-preview">
                                    <p>Selected: {formData.logo.name}</p>
                                    <img
                                        src={URL.createObjectURL(formData.logo)}
                                        alt="Logo preview"
                                        style={{ maxWidth: '150px', marginTop: '10px' }}
                                    />
                                </div>
                            )}
                        </div>
                    </fieldset>

                    {/* Form Actions */}
                    <div className="form-actions">
                        <button type="submit" className="btn-primary btn-large" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                            <UserPlus size={20} /> Complete Pro-Group Registration
                        </button>
                        <button type="button" className="btn-secondary btn-large" onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                            <ChevronLeft size={20} /> Back
                        </button>
                    </div>
                </form>
            )}

            {showCertificate && certificateData && (
                <CertificateDisplay
                    groupData={certificateData.group_data}
                    certificateUrl={certificateData.certificate_url}
                    onClose={() => {
                        setShowCertificate(false)
                        onBack()
                    }}
                />
            )}
        </div>
    )
}
