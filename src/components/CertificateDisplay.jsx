import { useState } from 'react'
import { Download, X } from 'lucide-react'
import './CertificateDisplay.css'

export default function CertificateDisplay({ groupData, certificateUrl, onClose }) {
    const [loading, setLoading] = useState(false)

    const handleDownload = async () => {
        try {
            setLoading(true)
            const response = await fetch(certificateUrl)
            const blob = await response.blob()

            // Create download link
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `ABIA_ARISE_CERTIFICATE_${groupData.group_license_number}.png`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error('Download error:', error)
            alert('Failed to download certificate. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="certificate-display-overlay">
            <div className="certificate-display-container">
                <button className="close-btn" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="display-header">
                    <h2>Pro-Group Registration Certificate</h2>
                    <p className="subtitle">Congratulations! Your certification has been issued successfully!</p>
                </div>

                <div className="certificate-preview-section">
                    <div className="certificate-image-wrapper">
                        <img src={certificateUrl} alt="Pro-Group Certificate" className="certificate-image" />
                    </div>

                    <div className="group-info">
                        <h3>Group Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Group Name:</label>
                                <p>{groupData.group_name}</p>
                            </div>
                            <div className="info-item">
                                <label>Group License No:</label>
                                <p>{groupData.group_license_number}</p>
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
                        {loading ? 'Downloading...' : 'Download Certificate'}
                    </button>
                    <button className="btn-close" onClick={onClose}>
                        Close
                    </button>
                </div>

                <div className="info-message">
                    <p>💡 <strong>Note:</strong> Please save and secure your certificate. This serves as official recognition of your pro-group status with Abia Arise.</p>
                </div>
            </div>
        </div>
    )
}
