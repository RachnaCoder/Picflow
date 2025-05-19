const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  postText: {
    type: String,
    required: true,
    trim: true,
  }, 
image:{
type:String,

},

category : {
  type : String,
},

  user :{
    type : mongoose.Schema.Types.ObjectId,
    ref:"User",
  },

  likes:{
    type : Array,
    default : [],
  },  // Assuming users can like posts


  createdAt: {
    type: Date,
    default: Date.now
  }

}, 

);   

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
