import React, {useState} from "react";

import './StarRating.css'
function StarRating({rating, onRate, averageRating = 0}) {
    const [hover, setHover] = useState(0);
    return(
        <div className="star-rating">
            {[...Array(5)]. map((star,index) => {
                index += 1;
                return(
                <button
                    type="button"
                    key={index}
                    className={index <= (hover|| rating) ? 'on' : 'off'}
                    onClick={() => onRate(index)}
                    onMouseEnter={() => setHover(index)}
                    onMouseLeave={() => setHover(rating)}>
                <span className="star">&#9733;</span>
                </button>
                )
            })}
            <p>Average rating: {averageRating.toFixed(2)}</p>
        </div>
    )
}
export default StarRating;
