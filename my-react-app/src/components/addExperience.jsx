import { createExperience, updateExperience } from '../api/services';
import { useState } from 'react';
import { useAuth } from '../context/authContext';
import { FiX, FiStar, FiAlignLeft, FiType } from 'react-icons/fi';
import { GroupAvatar } from './avatars';
import './components.css';

const AddExperience = ({ onClose, onSuccess, editMode, expData, preselectedProduct }) => {
    const { token } = useAuth();
    const [error, setError] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(editMode && expData?.image ? `http://localhost:3001/uploads/${expData.image}` : null);
    const [form, setForm] = useState({
        expname: editMode ? expData.expname : '',
        title: editMode ? expData.title : '',
        description: editMode ? expData.description : ''
    });

    const handleClose = () => {
        onClose();
        setForm({ expname: '', title: '', description: '' });
        setError('');
        setImage(null);
        setPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editMode) {
                await updateExperience(expData._id, { expname: form.expname, title: form.title, description: form.description });
                handleClose();
                onSuccess();
                return;
            }
            const formData = new FormData();
            formData.append('expname', form.expname);
            formData.append('title', form.title);
            formData.append('description', form.description);
            if (image) formData.append('image', image);
            if (preselectedProduct) formData.append('productIds', JSON.stringify([preselectedProduct]));
            await createExperience(formData);
            handleClose();
            onSuccess();
        } catch (err) {
            setError(err?.response?.data?.message || 'Something went wrong.');
        }
    };

    return (
        <div className="form-overlay">
            <div className="form-modal">
                <button className="form-close" onClick={handleClose}><FiX size={18} /></button>

                <div className="exp-form-hero">
                    <div className="exp-form-img-wrap" onClick={() => document.getElementById('expImgInput').click()}>
                        {preview ? (
                            <img src={preview} alt="preview" className="exp-form-img-preview" />
                        ) : (
                            <div className="exp-form-img-placeholder">
                                <GroupAvatar size={64} />
                            </div>
                        )}
                        <div className="exp-form-img-overlay">
                            <span>Change Photo</span>
                        </div>
                        <input id="expImgInput" type="file" accept="image/*" className="input-hidden"
                            onChange={e => {
                                const file = e.target.files[0];
                                if (!file) return;
                                setImage(file);
                                setPreview(URL.createObjectURL(file));
                            }} />
                    </div>
                    <div className="exp-form-hero-text">
                        <h3 className="form-title">{editMode ? 'Edit Experience' : 'New Experience'}</h3>
                        <p className="form-subtitle">{editMode ? 'Update your experience details' : 'Click the image to add a cover photo'}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="product-form">
                    <div className="form-field">
                        <label className="form-label">Experience Name</label>
                        <div className="form-input-wrapper">
                            <FiStar className="form-icon" />
                            <input className="form-input" type="text" placeholder="e.g. Summer Collection"
                                value={form.expname} onChange={e => setForm({ ...form, expname: e.target.value })} required />
                        </div>
                    </div>

                    <div className="form-field">
                        <label className="form-label">Title</label>
                        <div className="form-input-wrapper">
                            <FiType className="form-icon" />
                            <input className="form-input" type="text" placeholder="e.g. Best picks of the season"
                                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                        </div>
                    </div>

                    <div className="form-field">
                        <label className="form-label">Description</label>
                        <div className="form-input-wrapper">
                            <FiAlignLeft className="form-icon form-icon--top" />
                            <textarea className="form-input form-textarea" placeholder="Describe this experience..."
                                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
                        </div>
                    </div>

                    {error && <p className="exp-error">{error}</p>}

                    <div className="form-actions">
                        <button type="submit" className="form-submit">{editMode ? 'Update Experience' : 'Create Experience'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddExperience;
