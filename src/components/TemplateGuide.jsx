import { Info } from 'lucide-react'
import './TemplateGuide.css'

export default function TemplateGuide() {
    const columns = [
        { name: 'First Name', example: 'John', required: true },
        { name: 'Middle Name', example: 'Michael', required: false },
        { name: 'Last Name', example: 'Doe', required: true },
        { name: 'Gender', example: 'Male/Female', required: true },
        { name: 'NIN', example: '12345678901', required: true },
        { name: "Voter's Card No", example: 'VC123456789', required: true },
        { name: 'Phone Number', example: '08012345678', required: true },
        { name: 'Email', example: 'john@email.com', required: true },
        { name: 'LGA', example: 'Umuahia North', required: true },
        { name: 'Electoral Ward', example: 'Ward 1', required: true },
        { name: 'Polling Unit', example: 'Polling Unit 001', required: true },
        { name: 'Occupation', example: 'Teacher', required: false },
        { name: 'Bank Name', example: 'GTBank', required: false },
        { name: 'Bank Account No', example: '0123456789', required: false },
        { name: 'BVN', example: '12345678901', required: false },
    ]

    return (
        <div className="template-guide">
            <div className="guide-header">
                <Info size={24} />
                <h3>Excel Template Format Guide</h3>
            </div>

            <p className="guide-intro">
                The Excel template should contain the following columns. Required fields must be filled for all rows.
            </p>

            <div className="guide-table-wrapper">
                <table className="guide-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Column Name</th>
                            <th>Example Value</th>
                            <th>Required</th>
                        </tr>
                    </thead>
                    <tbody>
                        {columns.map((col, idx) => (
                            <tr key={idx}>
                                <td>{idx + 1}</td>
                                <td className="col-name">{col.name}</td>
                                <td className="col-example">{col.example}</td>
                                <td>
                                    <span className={`required-badge ${col.required ? 'required' : 'optional'}`}>
                                        {col.required ? 'Required' : 'Optional'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="guide-tips">
                <h4>Tips for Filling the Template:</h4>
                <ul>
                    <li>Do not modify or delete any column headers</li>
                    <li>Fill all required fields for each member row</li>
                    <li>Phone numbers should include the country code (e.g., 08XXXXXXXXX)</li>
                    <li>NIN should be 11 digits</li>
                    <li>Gender should be either "Male" or "Female"</li>
                    <li>Email addresses should be valid format (e.g., name@domain.com)</li>
                    <li>Do not add blank rows in between member data</li>
                    <li>Save the completed file and upload it during registration</li>
                </ul>
            </div>
        </div>
    )
}
