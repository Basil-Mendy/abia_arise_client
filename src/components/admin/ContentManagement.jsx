import { useState } from 'react'
import axios from 'axios'
import { FileText, Trophy, Send, Trash2, Users } from 'lucide-react'
import './ContentManagement.css'

export default function ContentManagement() {
    const [contentType, setContentType] = useState('news') // 'news', 'achievement', or 'leadership'
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: null
    })
    const [leaderFormData, setLeaderFormData] = useState({
        name: '',
        role: '',
        leadership_level: 'state',
        picture: null,
        bio: '',
        lga: '',
        ward: ''
    })
    const [imagePreview, setImagePreview] = useState(null)
    const [leadershipImagePreview, setLeadershipImagePreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'Image size must be less than 5MB' })
                return
            }

            if (contentType === 'leadership') {
                setLeaderFormData(prev => ({
                    ...prev,
                    picture: file
                }))

                // Create preview
                const reader = new FileReader()
                reader.onloadend = () => {
                    setLeadershipImagePreview(reader.result)
                }
                reader.readAsDataURL(file)
            } else {
                setFormData(prev => ({
                    ...prev,
                    image: file
                }))

                // Create preview
                const reader = new FileReader()
                reader.onloadend = () => {
                    setImagePreview(reader.result)
                }
                reader.readAsDataURL(file)
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (contentType === 'leadership') {
            // Leadership form validation
            if (!leaderFormData.name.trim()) {
                setMessage({ type: 'error', text: 'Leader name is required' })
                return
            }
            if (!leaderFormData.role.trim()) {
                setMessage({ type: 'error', text: 'Leader role is required' })
                return
            }
            if (!leaderFormData.picture) {
                setMessage({ type: 'error', text: 'Leader picture is required' })
                return
            }
            if (leaderFormData.leadership_level !== 'state' && !leaderFormData.lga.trim()) {
                setMessage({ type: 'error', text: 'LGA is required for this level' })
                return
            }
            if (leaderFormData.leadership_level === 'ward' && !leaderFormData.ward.trim()) {
                setMessage({ type: 'error', text: 'Ward is required for ward level leaders' })
                return
            }

            try {
                setLoading(true)
                setMessage(null)

                const data = new FormData()
                data.append('name', leaderFormData.name)
                data.append('role', leaderFormData.role)
                data.append('leadership_level', leaderFormData.leadership_level)
                data.append('picture', leaderFormData.picture)
                if (leaderFormData.bio) data.append('bio', leaderFormData.bio)
                if (leaderFormData.lga) data.append('lga', leaderFormData.lga)
                if (leaderFormData.ward) data.append('ward', leaderFormData.ward)

                await axios.post('http://localhost:8000/api/core/leadership/', data, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                })

                setMessage({
                    type: 'success',
                    text: 'Leader added successfully!'
                })

                // Reset form
                setLeaderFormData({
                    name: '',
                    role: '',
                    leadership_level: 'state',
                    picture: null,
                    bio: '',
                    lga: '',
                    ward: ''
                })
                setLeadershipImagePreview(null)

                // Clear message after 3 seconds
                setTimeout(() => setMessage(null), 3000)
            } catch (err) {
                console.error('Error adding leader:', err)
                setMessage({
                    type: 'error',
                    text: err.response?.data?.message || 'Failed to add leader. Please try again.'
                })
            } finally {
                setLoading(false)
            }
        } else {
            // News/Achievement validation
            if (!formData.title.trim()) {
                setMessage({ type: 'error', text: 'Title is required' })
                return
            }

            if (!formData.description.trim()) {
                setMessage({ type: 'error', text: 'Description is required' })
                return
            }

            try {
                setLoading(true)
                setMessage(null)

                const data = new FormData()
                data.append('title', formData.title)
                data.append('content', formData.description)
                data.append('content_type', contentType)
                if (formData.image) {
                    data.append('image', formData.image)
                }

                const endpoint = contentType === 'news'
                    ? 'http://localhost:8000/api/core/news/'
                    : 'http://localhost:8000/api/core/achievements/'

                await axios.post(endpoint, data, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                })

                setMessage({
                    type: 'success',
                    text: `${contentType === 'news' ? 'News' : 'Achievement'} posted successfully!`
                })

                // Reset form
                setFormData({
                    title: '',
                    description: '',
                    image: null
                })
                setImagePreview(null)

                // Clear message after 3 seconds
                setTimeout(() => setMessage(null), 3000)
            } catch (err) {
                console.error('Error posting content:', err)
                setMessage({
                    type: 'error',
                    text: `Failed to post ${contentType}. Please try again.`
                })
            } finally {
                setLoading(false)
            }
        }
    }

    const handleRemoveImage = () => {
        if (contentType === 'leadership') {
            setLeaderFormData(prev => ({
                ...prev,
                picture: null
            }))
            setLeadershipImagePreview(null)
        } else {
            setFormData(prev => ({
                ...prev,
                image: null
            }))
            setImagePreview(null)
        }
    }

    const handleLeaderInputChange = (e) => {
        const { name, value } = e.target
        setLeaderFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    return (
        <div className="content-management">
            <div className="management-header">
                <h2>📝 Content Management</h2>
                <p className="subtitle">
                    {contentType === 'news' && 'Post news articles'}
                    {contentType === 'achievement' && 'Post achievements'}
                    {contentType === 'leadership' && 'Manage leadership'}
                </p>
            </div>

            <div className="content-container">
                {/* Content Type Selector */}
                <div className="type-selector">
                    <button
                        className={`type-btn ${contentType === 'news' ? 'active' : ''}`}
                        onClick={() => setContentType('news')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                    >
                        <FileText size={20} /> News
                    </button>
                    <button
                        className={`type-btn ${contentType === 'achievement' ? 'active' : ''}`}
                        onClick={() => setContentType('achievement')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                    >
                        <Trophy size={20} /> Achievement
                    </button>
                    <button
                        className={`type-btn ${contentType === 'leadership' ? 'active' : ''}`}
                        onClick={() => setContentType('leadership')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                    >
                        <Users size={20} /> Leadership
                    </button>
                </div>

                {/* Message Display */}
                {message && (
                    <div className={`message message-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* Content Form */}
                <form className="content-form" onSubmit={handleSubmit}>
                    {/* News/Achievement Form */}
                    {contentType !== 'leadership' && (
                        <>
                            <div className="form-group">
                                <label htmlFor="title">
                                    <strong>{contentType === 'news' ? 'News' : 'Achievement'} Title</strong>
                                    <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder={`Enter ${contentType} title...`}
                                    maxLength="200"
                                />
                                <span className="char-count">{formData.title.length}/200</span>
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">
                                    <strong>Description</strong>
                                    <span className="required">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder={`Enter ${contentType} description...`}
                                    rows="6"
                                    maxLength="2000"
                                />
                                <span className="char-count">{formData.description.length}/2000</span>
                            </div>

                            <div className="form-group">
                                <label htmlFor="image">
                                    <strong>Featured Image (Optional)</strong>
                                </label>
                                {imagePreview ? (
                                    <div className="image-preview">
                                        <img src={imagePreview} alt="Preview" />
                                        <button
                                            type="button"
                                            className="btn-remove-image"
                                            onClick={handleRemoveImage}
                                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <Trash2 size={16} /> Remove Image
                                        </button>
                                    </div>
                                ) : (
                                    <div className="image-upload">
                                        <input
                                            type="file"
                                            id="image"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                        <div className="upload-placeholder">
                                            <p>📷 Click to upload image (max 5MB)</p>
                                            <p style={{ fontSize: '0.85rem', color: '#999' }}>
                                                Supported: JPG, PNG, GIF, WebP
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Leadership Form */}
                    {contentType === 'leadership' && (
                        <>
                            <div className="form-group">
                                <label htmlFor="leader-name">
                                    <strong>Name</strong>
                                    <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="leader-name"
                                    name="name"
                                    value={leaderFormData.name}
                                    onChange={handleLeaderInputChange}
                                    placeholder="Enter leader name..."
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="leader-role">
                                    <strong>Role/Position</strong>
                                    <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="leader-role"
                                    name="role"
                                    value={leaderFormData.role}
                                    onChange={handleLeaderInputChange}
                                    placeholder="Enter role/position..."
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="leader-level">
                                        <strong>Leadership Level</strong>
                                    </label>
                                    <select
                                        id="leader-level"
                                        name="leadership_level"
                                        value={leaderFormData.leadership_level}
                                        onChange={handleLeaderInputChange}
                                    >
                                        <option value="state">State Level</option>
                                        <option value="local_government">Local Government</option>
                                        <option value="ward">Ward Level</option>
                                    </select>
                                </div>

                                {leaderFormData.leadership_level !== 'state' && (
                                    <div className="form-group">
                                        <label htmlFor="leader-lga">
                                            <strong>LGA</strong>
                                            <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="leader-lga"
                                            name="lga"
                                            value={leaderFormData.lga}
                                            onChange={handleLeaderInputChange}
                                            placeholder="Local Government Area"
                                        />
                                    </div>
                                )}

                                {leaderFormData.leadership_level === 'ward' && (
                                    <div className="form-group">
                                        <label htmlFor="leader-ward">
                                            <strong>Ward</strong>
                                            <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="leader-ward"
                                            name="ward"
                                            value={leaderFormData.ward}
                                            onChange={handleLeaderInputChange}
                                            placeholder="Ward name"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="leader-bio">
                                    <strong>Biography (Optional)</strong>
                                </label>
                                <textarea
                                    id="leader-bio"
                                    name="bio"
                                    value={leaderFormData.bio}
                                    onChange={handleLeaderInputChange}
                                    placeholder="Brief biography..."
                                    rows="4"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="leader-picture">
                                    <strong>Picture</strong>
                                    <span className="required">*</span>
                                </label>
                                {leadershipImagePreview ? (
                                    <div className="image-preview">
                                        <img src={leadershipImagePreview} alt="Preview" />
                                        <button
                                            type="button"
                                            className="btn-remove-image"
                                            onClick={handleRemoveImage}
                                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <Trash2 size={16} /> Remove Image
                                        </button>
                                    </div>
                                ) : (
                                    <div className="image-upload">
                                        <input
                                            type="file"
                                            id="leader-picture"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                        <div className="upload-placeholder">
                                            <p>📷 Click to upload picture (max 5MB)</p>
                                            <p style={{ fontSize: '0.85rem', color: '#999' }}>
                                                Supported: JPG, PNG, GIF, WebP
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={loading}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                        >
                            <Send size={20} />
                            {loading ? 'Publishing...' : (
                                contentType === 'leadership'
                                    ? 'Add Leader'
                                    : `Publish ${contentType === 'news' ? 'News' : 'Achievement'}`
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
