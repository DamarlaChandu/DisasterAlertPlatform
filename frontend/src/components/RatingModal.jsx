import React, { useState } from 'react';
import { FiStar } from 'react-icons/fi';
import Button from './Button';

const RatingModal = ({ isOpen, onClose, onSubmit, volunteerName }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert('Please select a rating');
    
    setSubmitting(true);
    try {
      await onSubmit({ rating, feedback });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up">
        <div className="bg-primary p-8 text-white text-center">
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white border-opacity-30">
            <FiStar size={40} className="fill-current" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Rate Your Responder</h2>
          <p className="text-white text-opacity-80 text-sm">How was your experience with {volunteerName}?</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className={`transition-all transform hover:scale-125 ${
                  (hover || rating) >= star ? 'text-yellow-400' : 'text-gray-200'
                }`}
              >
                <FiStar 
                  size={36} 
                  className={star <= (hover || rating) ? 'fill-current' : ''} 
                />
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Your Feedback
            </label>
            <textarea
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary h-32 resize-none text-gray-700"
              placeholder="Tell us about the assistance you received..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            ></textarea>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Skip
            </button>
            <Button
              variant="primary"
              className="flex-[2] py-3 shadow-lg"
              loading={submitting}
            >
              Submit Rating
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
