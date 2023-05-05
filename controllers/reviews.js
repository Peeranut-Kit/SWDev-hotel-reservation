const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');

//@desc   Get all reviews
//@route  GET /api/v1/reviews
//@access Public
exports.getReviews = async (req, res, next) => {
  let query;

  query = Review.find().populate({
    path: 'booking',
    select: 'hotel'
  });

  try {
    const reviews = await query;
    res.status(200).json({
      success : true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({success: false, message: "Cannot find Review"});
  }
}

//@desc   Get single review
//@route  Get /api/v1/reviews/:id
//@access Public
exports.getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id).populate({
      path: 'booking',
      select: 'hotel'
    });
    if(!review) {
      return res.status(400).json({success: false, message:`No review with the id of ${req.params.id}`});
    }
    res.status(200).json({
      success: true,
      data: review
  });
  } catch (error) {
    console.log(error);
    res.status(400).json({success:false, message:"Cannot find Review"});
  }
}

//@desc   Add review
//@route  POST /api/v1/bookings/:bookingId/reviews
//@access Private
exports.addReview = async (req, res, next) => {
  try {
    const score = parseInt(req.body.score);
    if(isNaN(score) || score < 0 || score > 10) {
      return res.status(200).json({ success: false, message: 'Please rate the booking in range 0-10'});
    }
    req.body.booking = req.params.bookingId;
    const booking = await Booking.findById(req.params.bookingId);

    if(!booking) {
      return res.status(404).json({ success: false, message: `No booking with the id of ${req.params.bookingId}`});
    }

    //Make sure user is the booking owner
    if(booking.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to review this booking`
      });
    }

    //Add user Id to req.body
    req.body.user = req.user.id;

    //Update hotel review score
    const hotel = await Hotel.findById(booking.hotel.toString());
    const new_count = hotel.review_count + 1;
    const new_score = (hotel.score + score) / new_count;
    await Hotel.findByIdAndUpdate(booking.hotel.toString(), {"review_count" : new_count, "score" : new_score});

    
    const review = await Review.create(req.body);
    //Update review in booking
    await Booking.findByIdAndUpdate(req.params.bookingId, {"review" : review._id});
    res.status(200).json({ success: true, data: review });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: 'Cannot create Review'});
  }
}

//@desc   Update review
//@route  PUT /api/v1/reviews/:id
//@access Private
exports.updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);
    if(!review) {
      return res.status(404).json({ success: false, message: `No Review with the id of ${req.params.id}`});
    }

    //Make sure user is the review owner
    if(review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this review`
      });
    }

    //If user update review score then update hotel review score
    if(req.body.score) {
      const score = parseInt(req.body.score);
      if(isNaN(score) || score < 0 || score > 10) {
        return res.status(200).json({ success: false, message: 'Please rate the booking in range 0-10'});
      }

      const booking = await Booking.findById(review.booking.toString());
      const hotelId = booking.hotel;
      const hotel = await Hotel.findById(hotelId.toString());
      const new_score = (hotel.score + score - review.score);
      await Hotel.findByIdAndUpdate(hotelId.toString(), {"score" : new_score});
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    res.status(200).json({ success: true, data: review });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: 'Cannot update Review'});
  }
}

//@desc     Delete review
//@route    DELETE /api/v1/reviews/:id
//@access   Private
exports.deleteReview= async (req,res,next)=>{
  try {
      const review = await Review.findById(req.params.id);
      if(!review){
          return res.status(404).json({ success: false, message: `No review with the id of ${req.params.id}`});
      }

      //Make sure user is the review owner
      if(review.user.toString() !== req.user.id && req.user.role !== 'admin') {
          return res.status(401).json({
              success: false,
              message: `User ${req.user.id} is not authorized to delete this review`
          });
      }

      //Re-Calculate review score
      const booking = await Booking.findById(review.booking.toString());
      const hotelId = booking.hotel;
      const hotel = await Hotel.findById(hotelId.toString());
      const new_count = hotel.review_count - 1;
      const new_score = (hotel.score * hotel.review_count - review.score) / new_count;
      await Hotel.findByIdAndUpdate(hotelId.toString(), {"review_count" : new_count, "score" : new_score});

      //Update review in booking
      await Booking.findByIdAndUpdate(req.params.bookingId, {"review" : null});
      review.remove();
      res.status(200).json({
          success: true,
          data: {}
      });
  } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: 'Cannot delete Review'});
  }
}