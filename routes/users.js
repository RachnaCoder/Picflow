const mongoose = require('mongoose');
const plm = require("passport-local-mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/datastorage");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    //unique: true,
    trim: true,
  },
  password: {
    type: String,

  },
  posts: [{
    type : mongoose.Schema.Types.ObjectId,
    ref : "Post",
  }],

  savedPosts : [{   
    type: mongoose.Schema.Types.ObjectId,
    ref : "Post",
  }],
  profileImage: {
    type: String,
    
  },
  email: {
    type: String,
    required: true,
    //unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'], // Regex for email validation
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
}); 

userSchema.plugin(plm);

const User = mongoose.model('User', userSchema);

module.exports = User;



 

