const multer = require('multer');
const {v4:uuidv4} = require("uuid");
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/uploads/posts/')
    },
    filename: function (req, file, cb){
        const unique = uuidv4();
        cb(null, unique+ path.extname(file.originalname));
    }
});

const uploadPro = multer({ storage });

module.exports = uploadPro;
 