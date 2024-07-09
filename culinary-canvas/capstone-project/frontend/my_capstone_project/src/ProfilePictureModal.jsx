import React from 'react';
import './ProfilePictureModal.css';
function ProfilePictureModal({isOpen, onClose, onUpload}){
    if (!isOpen){
        return null;
    }
    const handleUpload = (event) => {
        event.preventDefault();
        const file = event.target.elements.profilePicture.files[0];
        onUpload(file)
    }
    return(
        <div className='modal-overlay'>
            <div className='modal-content'>
                <h2>Upload Profile Picture</h2>
                <form onSubmit={handleUpload}>
                    <input type='file' name='profilePicture' accept='image/*' required/>
                    <button type='submit'>Upload</button>
                </form>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    )
}
export default ProfilePictureModal
