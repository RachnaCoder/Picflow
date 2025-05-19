

var express = require('express');
var path = require("path");

const app = express();

app.use(express.static('public')); // Serve the 'public' folder

app.use(express.static(path.join(__dirname, 'public')));

app.use('/images/uploads', express.static(path.join(__dirname, 'public/images/uploads')));  

app.use('/uploads', express.static('uploads'));


// ... rest of your code
var router = express.Router();
const usermodel = require("./users");
const postmodel = require("./posts");
const passport = require("passport");
const upload = require("./multer");
const uploadPro = require("./multerprofile");
const localStrategy = require("passport-local");
passport.use(new localStrategy(usermodel.authenticate()));

/* GET home page. */
router.get('/', function(req, res, next) { 
  res.render('index', { title: 'Express' });
});


router.get("/login", function(req, res, next){
  res.render("login" , {error: req.flash("error")});
});


// router.get("/feed", function(req, res, next){
//   res.render("feed")
// })


router.get('/feed', async(req, res) => {
  try {
    const posts = await postmodel.find({}).populate('user').sort({ createdAt: -1 });
    console.log("Fetched posts:", posts); 

    
    res.render('feed', { posts });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading feed");
  }
});


router.post("/upload", isLoggedIn, upload.single("file"), async function (req, res, next) {


  if (!req.file) {
      return res.status(404).send("no files are uploaded");
  }

  const user = await usermodel.findOne({ username: req.session.passport.user });
  const post = await postmodel.create({
      postText: req.body.text,
      image: req.file.filename, 
      Category : req.body.Category,
      user: user._id,
      createdAt: new Date(), // optional, Mongoose sets this automatically
  });

  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});



router.get("/category/:category", async(req, res) => {
  const category = req.params.category.toLowerCase();
  const posts = await postmodel.find({ category }).populate('user');
  res.render("category", { posts, category });
});


router.get("/search-category", (req, res) => {
  const category = (req.query.category || "").toLowerCase().trim();
  if (!category) return res.redirect("/feed");
  res.redirect(`/category/${category}`);
});



//////for changing profile image //////

app.post("/uploadprofile",isLoggedIn, uploadPro.single("image"),  async function(req, res, next){
  
  //res.send("uploaded");
  const user = await usermodel.findOne({username: req.session.passport.user});

  
  user.profileImage =  req.file.filename;
await user.save();
   

 res.redirect("/profile"); // Go back to profile page
});


/////////////////////////////////////

// Assuming you are using mongoose and have models like usermodel and postmodel
router.get("/profile", isLoggedIn, async function (req, res, next) {
  try{
      const user = await usermodel
          .findOne({ username: req.session.passport.user })
          //.populate("posts"); // Populate the 'posts' field
          .populate({
            path: "posts",
            options: { sort: { createdAt: -1 } }  //  Sort posts by newest first
          })
          

      if(!user) {
          return res.status(404).send("User not found");
      }

      // res.render("profile", { user: user, posts: user.posts }); // Pass the posts array

      res.render("profile", {user}); // Pass the posts array

  } catch (err) {
      console.error("Error fetching user and posts:", err);
      res.status(500).send("Internal server error");
  }
});

router.post("/save-post/:postId" , isLoggedIn, async(req, res) =>{
  try{
const user = await usermodel.findById(req.user._id);
const postId = req.params.postId;

// prevent duplicates
if(!user.savedPosts.includes(postId)){
user.savedPosts.push(postId);
await user.save();
  }

res.redirect("/feed");
} catch(err){
console.error(err);

res.status(500).send("could not save posts");

}
});

router.get("/saved-posts", isLoggedIn , async(req, res) => {
try{
const user =await usermodel.findById(req.user._id).populate("savedPosts");

res.render("saved",{savedPosts: user.savedPosts})
}
catch(err){
  console.error(err);
  res.status(500).send("error loading saved posts");

}
});


router.post("/register", function(req,res){
const userdata = new usermodel({
  username: req.body.username, 
    email: req.body.email,
    fullName: req.body.fullname,
});
usermodel.register(userdata, req.body.password).then(function(){
  passport.authenticate("local")(req, res, function(){
    res.redirect("/profile");
  })
})
})

router.post("/login",passport.authenticate("local",{
  successRedirect : "/profile",
  failureRedirect : "/login",
  failureFlash: true,
}), function(req,res){
  
  });

  router.get("/logout", function(req, res){
    req.logout(function(err){
      if(err){return next (err);}
      res.redirect("/");
    });
  })

  function isLoggedIn(req, res, next){
    if(req.isAuthenticated()) return next();
    res.redirect("/login");
  }

 module.exports = router;


    








