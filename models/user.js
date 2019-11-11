const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    password: {
        required: true,
        type: String
    },
    is_admin: {
        type: Boolean,
        default: false
    },
    is_vet: {
        type: Boolean,
        default: false
    },
    activated: {
        type: Boolean,
        default: false
    }
}, {
    collection: 'Users',
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const Users = mongoose.model('User', userSchema);
module.exports = Users;