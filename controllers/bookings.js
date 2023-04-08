const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const { login } = require('./auth');

//@desc     Get all bookings
//@route    GET /api/v1/bookings
//@access   Public
exports.getBookings= async (req,res,next)=>{
    let query;
    //General users can see only their bookings!
    if (req.user.role !== 'admin') {
        query = Booking.find( { user: req.user.id} ).populate({
            path: 'hotel',
            select: 'name province tel'
        });
    }
    else { //If you are an admin, you can see all!
        query = Booking.find().populate({
            path: 'hotel',
            select: 'name province tel'
        });
    }
    try {
        const bookings = await query;

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message: "Cannot find Booking"}); 
    }
};

//@desc     Get single booking
//@route    GET /api/v1/bookings/:id
//@access   Public
exports.getBooking= async (req,res,next)=>{
    try {
        const booking = await Booking.findById(req.params.id).populate({
            path: 'hotel',
            select: 'name description tel'
        });
        if(!booking){
            return res.status(400).json({success:false, message:`No booking with the id of ${req.params.id}`});
        }
        res.status(200).json({
            success:true,
            data:booking
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({success:false, message:"Cannot find Booking"});
    }
};

//@desc     Add booking
//@route    POST /api/v1/hotels/:hotelId/booking
//@access   Private
exports.addBooking= async (req,res,next)=>{
    try {
        req.body.hotel = req.params.hotelId;
        const hotel = await Hotel.findById(req.params.hotelId);

        if (!hotel) {
            return res.status(404).json({ success: false, message: `No hotel with the id of ${req.params.hotelId}`});
        }

        //Add user Id to req.body
        req.body.user = req.user.id;
        //Check if the duration is longer than 3 nights
        const start = new Date(req.body.bookDate);
        const stop = new Date(req.body.leaveDate);
        const timeDiff = stop.getTime() - start.getTime();
        duration =  timeDiff / (1000*60*60*24);
        if (duration > 3) {
            return res.status(400).json({
                success: false,
                message: 'The booking duration cannot be more than 3 nights'
            });
        }
        if (duration < 1) {
            return res.status(400).json({
                success: false,
                message: 'The booking duration cannot be less than 1 nights'
            });
        }

        //Check for existed booking
        const existedBookings = await Booking.find( {user: req.user.id} );
        //If the user is not an admin, they can only create 3 bookings.
        if(existedBookings.length >= 3 && req.user.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: `The user with ID ${req.user.id} has already made 3 bookings`
            });
        }

        const booking = await Booking.create(req.body);
        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Cannot create Booking'});
    }
};

//@desc     Update booking
//@route    PUT /api/v1/bookings/:id
//@access   Private
exports.updateBooking= async (req,res,next)=>{
    try {
        let booking = await Booking.findById(req.params.id);
        if(!booking){
            return res.status(404).json({ success: false, message: `No booking with the id of ${req.params.id}`});
        }

        //Make sure user is the booking owner
        if(booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to update this booking`
            });
        }

        //Check if the duration is longer than 3 nights
        const start = new Date(req.body.bookDate);
        const stop = new Date(req.body.leaveDate);
        const timeDiff = stop.getTime() - start.getTime();
        duration =  timeDiff / (1000*60*60*24);
        if (duration > 3) {
            return res.status(400).json({
                success: false,
                message: 'The booking duration cannot be more than 3 nights'
            });
        }
        if (duration < 1) {
            return res.status(400).json({
                success: false,
                message: 'The booking duration cannot be less than 1 nights'
            });
        }
        
        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Cannot update Booking'});
    }
}

//@desc     Delete booking
//@route    DELETE /api/v1/bookings/:id
//@access   Private
exports.deleteBooking= async (req,res,next)=>{
    try {
        const booking = await Booking.findById(req.params.id);
        if(!booking){
            return res.status(404).json({ success: false, message: `No booking with the id of ${req.params.id}`});
        }

        //Make sure user is the booking owner
        if(booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to delete this booking`
            });
        }
        
        booking.remove();
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Cannot delete Booking'});
    }
}