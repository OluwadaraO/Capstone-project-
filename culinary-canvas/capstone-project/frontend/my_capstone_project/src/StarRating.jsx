import React, { useState } from 'react';

function StarRating({ rating, onRate, averageRating = 0 }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-rating">
      {[...Array(5)].map((star, index) => {
        index += 1;
        return (
          <div className="stars">
            <button
              type="button"
              key={index}
              className={index <= (hover || rating) ? 'on' : 'off'}
              onClick={() => onRate(index)}
              onMouseEnter={() => setHover(index)}
              onMouseLeave={() => setHover(rating)}
            >
              <span className="star">&#9733;</span>
            </button>
          </div>
        );
      })}
      <div>
        <p className="average-rating">Average rating: {averageRating.toFixed(2)}</p>
      </div>
    </div>
  );
}
export default StarRating;
