const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    subtypes: {
        type: String,
        required: [true, 'Please add subtypes']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    sub_district: {
        type: String,
        required: [true, 'Please add a sub-district']
    },
    district: {
        type: String,
        required: [true, 'Please add a district']
    },
    province: {
        type: String,
        required: [true, 'Please add a province']
    },
    postal_code: {
        type: String,
        required: [true, 'Please add a postalcode'],
        maxlength: [5, 'Postal Code can not be more than 5 digits']
    },
    country: {
        type: String,
        required: [true, 'Please add a country']
    },
    latitude: {
        type: Number,
        required: [true, 'Please add a latitude']
    },
    longitude: {
        type:  Number,
        required: [true, 'Please add a longitude']
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number']
    },
    site: {
        type: String,
    },
    description: {
        type: String
    },
    score: {
        type: Number,
        default: 0,
        min: [0, 'Please rate in range 1 - 10'],
        max: [10,'Please rate in range 1 - 10'],
    }
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

//Cascade delete appointments when a hospital is deleted
HotelSchema.pre('remove', async function(next) {
    console.log(`Booking being removed from hotel ${this._id}`);
    await this.model('Booking').deleteMany( { hotel: this._id} );
    next();
})

//Reverse populate with virtuals
HotelSchema.virtual('bookings', {
    ref: 'Booking',
    localField: '_id',
    foreignField: 'hotel',
    justOne: false
});

//'Hospital' is name of Mongoose model
module.exports = mongoose.model('Hotel', HotelSchema);