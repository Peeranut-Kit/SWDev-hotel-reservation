const express = require('express');
const router = express.Router({mergeParams: true});

const {getReviews, getReview, addReview, updateReview, deleteReview} = require('../controllers/reviews');
const {protect, authorize} = require('../middleware/auth');

router.route('/')
    .get(protect, getReviews)
    .post(protect, authorize('user'), addReview);
router.route('/:id')
    .get(protect, getReview)
    .put(protect, authorize('user'), updateReview)
    .delete(protect, authorize('user'), deleteReview);

module.exports = router;