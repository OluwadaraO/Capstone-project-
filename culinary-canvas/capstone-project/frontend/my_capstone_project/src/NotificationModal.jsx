import React from 'react';
import { useNotifications } from './useNotification';
function NotificationModal({onClose, userId}) {
    const {isSubscribed, subscribeToNotifications} = useNotifications(userId);

    const handleSubscribe = async() => {
        try{
            await subscribeToNotifications();
            onClose();
        }catch(error){
            console.error("Failed to subscribe user")
        }
    };
    return(
        <div className='modal-overlay'>
            <div className='modal-content'>
                <h3>Stay Updated With Culinary Canvas</h3>
                <p>Enable notifications to get the lastest dietary tips!</p>
                <button onClick={handleSubscribe} disabled={isSubscribed}>
                    {isSubscribed ? 'Notifications Enabled' : 'Enable Notifications'}
                </button>
                <button onClick={onClose}>Maybe Later</button>
            </div>
        </div>
    )
}
export default NotificationModal
