const express = require('express');
const router = express.Router({mergeParams: true});

const {getBookings, getBooking, addBooking, updateBooking, deleteBooking} = require('../controllers/bookings');
const {protect, authorize} = require('../middleware/auth');

//Include other resource routers
const reviewRouter = require('./reviews');

//Re-route into other resource routers
router.use('/:bookingId/reviews/', reviewRouter);

router.route('/')
    .get(protect, getBookings)
    .post(protect, authorize('admin','user'), addBooking);
router.route('/:id')
    .get(protect, getBooking)
    .put(protect, authorize('admin', 'user'), updateBooking)
    .delete(protect, authorize('admin', 'user'), deleteBooking);

module.exports = router;