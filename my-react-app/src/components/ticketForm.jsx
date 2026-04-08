import { useState, useRef } from "react";

const TicketForm = ({ fetchTickets, setShowFrom, createTicket }) => {
    const [data, setData] = useState({
        subject: "",
        description: "",
        showAttachments: false,
        files: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        // Basic validation: max 7 files
        if (selectedFiles.length > 7) {
            alert("Maximum 7 files allowed");
            e.target.value = null;
            setData({ ...data, files: [] });
            return;
        }
        // Basic validation: max 3MB total (approximate)
        const totalSize = selectedFiles.reduce((acc, f) => acc + f.size, 0);
        if (totalSize > 3 * 1024 * 1024) {
            alert("Total file size must be less than 3 MB");
            e.target.value = null;
            setData({ ...data, files: [] });
            return;
        }
        setData({ ...data, files: selectedFiles });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!data.subject || !data.description) return;
        
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("subject", data.subject);
        formData.append("description", data.description);
        
        if (data.showAttachments && data.files.length > 0) {
            data.files.forEach(file => {
                formData.append("attachments", file); // Must match backend ticketUpload.array("attachments", 7)
            });
        }

        try {
            await createTicket(formData);
            fetchTickets();
            setShowFrom(false);
        } catch (err) {
            console.error("Failed to create ticket", err);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="ticket-form-overlay">
            <div className="ticket-form-card">
                <p className="ticket-form-info">Please fill in the details below to raise a ticket.</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="ticket-form-field">
                        <label>Subject*</label>
                        <input 
                            type="text" 
                            placeholder="Enter the ticket subject" 
                            className="ticket-form-input"
                            value={data.subject} 
                            onChange={(e) => setData({ ...data, subject: e.target.value })} 
                            required
                        />
                    </div>

                    <div className="ticket-form-field">
                        <label>Description*</label>
                        <textarea 
                            placeholder="Please explain your query..." 
                            className="ticket-form-input"
                            style={{ minHeight: "150px" }}
                            value={data.description} 
                            onChange={(e) => setData({ ...data, description: e.target.value })} 
                            required
                        />
                    </div>

                    <div className="ticket-form-attachment-check">
                        <input 
                            type="checkbox" 
                            id="attach-check"
                            checked={data.showAttachments}
                            onChange={(e) => setData({ ...data, showAttachments: e.target.checked, files: e.target.checked ? data.files : [] })}
                        />
                        <label htmlFor="attach-check">Do you want to attach related files/screenshots?</label>
                    </div>

                    {data.showAttachments && (
                        <div className="ticket-form-attachment-section">
                            <p className="attachment-help">Total file size must be less than 3 MB (Max 7 files). Allowed types: pdf, jpg, jpeg, png</p>
                            <div className="attachment-input-wrapper">
                                <button type="button" className="attachment-choose-btn" onClick={() => fileInputRef.current?.click()}>
                                    Choose Files
                                </button>
                                <span className="attachment-file-name">
                                    {data.files.length > 0 ? `${data.files.length} file(s) chosen` : "No file chosen"}
                                </span>
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    multiple
                                    accept=".pdf,image/png,image/jpeg,image/jpg"
                                    style={{ display: "none" }}
                                    onChange={handleFileChange} 
                                />
                            </div>
                        </div>
                    )}

                    <div className="ticket-form-actions">
                        <button type="button" className="ticket-form-btn-cancel" onClick={() => setShowFrom(false)}>Cancel</button>
                        <button type="submit" className="ticket-form-btn-submit" disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TicketForm;
