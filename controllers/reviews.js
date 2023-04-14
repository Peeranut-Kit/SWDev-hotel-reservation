const Review = require('../models/Review');
const Booking = require('../models/Booking');

//@desc   Get all reviews
//@route  GET /api/v1/reviews
//@access Public
exports.getReviews = async (req, res, next) => {
  // let query;

  // query = Review.find().populate({
  //   path: 'hotel',
  //   select: 'name'
  // });

  try {
    const reviews = await Review.find();
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
      path: 'hotel',
      select: 'name'
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

    const review = await Review.create(req.body);
    res.status(200).json({ success: true, data: review })

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