const mongoose = require('mongoose');

const userschema = new mongoose.Schema({
    
    author: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required:true,
    },
    time:{
        type:String,
        default:Date.now(),
    },
    flag:{
        type:String,
        default:0
    }
});

module.exports = new mongoose.model('user', userschema);