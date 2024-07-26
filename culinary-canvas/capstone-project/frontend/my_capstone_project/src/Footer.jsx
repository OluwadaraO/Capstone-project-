import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './RedirectToAuthentication';
import { useNavigate } from 'react-router-dom';
import './Footer.css'
function Footer() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeImageIndex, setActiveIImageIndex] = useState(0);
  const images = ['../top-image-background-macaroons.jpg', '../top-image-background-onions.jpg', '../top-image-background-pancakes.jpg', '../top-image-background-chanwalrus.jpg'];

  useEffect(() => {
    const interval = setInterval(() => {
        setActiveIImageIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 5000);

    return () => clearInterval(interval)
  }, []);

  function handleHomePageClick() {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }
  return (
      <footer className="footer">
        <div className="footer-content">
          <h3>Culinary Canvas</h3>
          <p>Explore the art of cooking with us.</p>
        </div>
        <div className="footer-section">
          <h3>Quick Links</h3>
          <Link to="/">
            <button onClick={handleHomePageClick}>Home</button>
          </Link>
          <Link to='/login'>
            <button>Log In</button>
          </Link>
          <Link to='/create'>
            <button>Sign Up</button>
          </Link>
        </div>
        <div className="footer-section">
          <h3>Connect With Us</h3>
        </div>
        <div className='moving-images'>
           {images.map((image, index) => (
            <div
                key={image}
                className={`moving-image ${index===activeImageIndex ? 'active' : ''}`}
                style={{backgroundImage: `url(${image})`}}>
            </div>
           ))}
        </div>
        <div className='footer-bottom'>
            <p>&copy; 2024 Culinary Canvas. All rights reserved.</p>
        </div>
      </footer>

  );
};
export default Footer;
