import { useState } from 'react'
import { Download, X } from 'lucide-react'
import './IDCardDisplay.css'

export default function IDCardDisplay({ memberData, cardUrl, onClose }) {
    const [loading, setLoading] = useState(false)

    const handleDownload = async () => {
        try {
            setLoading(true)
            const response = await fetch(cardUrl)
            const blob = await response.blob()

            // Create download link
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `ABIA_ARISE_ID_${memberData.abia_arise_id}.png`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error('Download error:', error)
            alert('Failed to download ID card. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="id-card-display-overlay">
            <div className="id-card-display-container">
                <button className="close-btn" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="display-header">
                    <h2>Your Membership ID Card</h2>
                    <p className="subtitle">Your card has been generated successfully!</p>
                </div>

                <div className="card-preview-section">
                    <div className="card-image-wrapper">
                        <img src={cardUrl} alt="Membership ID Card" className="card-image" />
                    </div>

                    <div className="member-info">
                        <h3>Member Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Full Name:</label>
                                <p>{memberData.full_name}</p>
                            </div>
                            <div className="info-item">
                                <label>Abia Arise ID:</label>
                                <p>{memberData.abia_arise_id}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="display-actions">
                    <button
                        className="btn-download"
                        onClick={handleDownload}
                        disabled={loading}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Download size={20} />
                        {loading ? 'Downloading...' : 'Download ID Card'}
                    </button>
                    <button className="btn-close" onClick={onClose}>
                        Close
                    </button>
                </div>

                <div className="info-message">
                    <p>💡 <strong>Note:</strong> Please save and secure your ID card. You will need it for future reference.</p>
                </div>
            </div>
        </div>
    )
}
