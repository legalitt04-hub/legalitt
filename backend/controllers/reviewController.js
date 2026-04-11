const Advocate = require('../models/Advocate');

// @POST /api/reviews
exports.addReview = async (req, res) => {
  try {
    const { advocateId, comment, rating } = req.body;

    if (!advocateId || !comment || !rating) {
      return res.status(400).json({ success: false, message: 'advocateId, comment and rating are required.' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    const advocate = await Advocate.findById(advocateId);
    if (!advocate) return res.status(404).json({ success: false, message: 'Advocate not found.' });

    // Check if user already reviewed (optional — can allow multiple)
    const existingReview = advocate.reviews.find(
      r => r.user && r.user.toString() === req.user._id.toString()
    );
    if (existingReview) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this advocate.' });
    }

    advocate.reviews.push({
      user: req.user._id,
      userName: req.user.name,
      comment: comment.trim(),
      rating: parseInt(rating)
    });

    advocate.updateRating();
    await advocate.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully.',
      data: {
        reviews: advocate.reviews,
        rating: advocate.rating
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/reviews/:advocateId
exports.getReviews = async (req, res) => {
  try {
    const advocate = await Advocate.findById(req.params.advocateId).select('reviews rating');
    if (!advocate) return res.status(404).json({ success: false, message: 'Advocate not found.' });
    res.json({ success: true, data: { reviews: advocate.reviews, rating: advocate.rating } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
