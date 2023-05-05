const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    bookDate: {
        type: Date,
        required: true
    },
    leaveDate: {
        type: Date,
        required: true,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    hotel: {
        type: mongoose.Schema.ObjectId,
        ref: 'Hotel',
        required: true
    },
    review: {
        type: mongoose.Schema.ObjectId,
        red: 'Review'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


//Cascade delete review when a booking is deleted
BookingSchema.pre('remove', async function(next) {
    console.log(`Review being remove from booking ${this._id}`);
    await this.model('Review').deleteMany({booking: this._id} );
    next();
})

module.exports = mongoose.model('Booking', BookingSchema);