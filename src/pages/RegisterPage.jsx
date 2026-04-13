import { useState } from 'react'
import IndividualRegistration from '../components/IndividualRegistration'
import ProGroupRegistration from '../components/ProGroupRegistration'
import './RegisterPage.css'

export default function RegisterPage() {
    const [registrationType, setRegistrationType] = useState(null)

    return (
        <div className="register-page">
            <div className="register-container">
                {!registrationType ? (
                    <div className="registration-type-selection">
                        <h1>Join Abia Arise</h1>
                        <p>Choose your registration type:</p>
                        <div className="type-buttons">
                            <button
                                className="btn-primary btn-large"
                                onClick={() => setRegistrationType('individual')}
                            >
                                Individual Member
                            </button>
                            <button
                                className="btn-secondary btn-large"
                                onClick={() => setRegistrationType('progroup')}
                            >
                                Pro-Group Member
                            </button>
                        </div>
                    </div>
                ) : registrationType === 'individual' ? (
                    <IndividualRegistration onBack={() => setRegistrationType(null)} />
                ) : (
                    <ProGroupRegistration onBack={() => setRegistrationType(null)} />
                )}
            </div>
        </div>
    )
}
