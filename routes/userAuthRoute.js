const express = require('express');
const router = express.Router();
const userController = require('./../controllers/userAuthController');
const { authUser: authenticate } = require('../middleware/authMiddleware');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '//uploads');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + file.originalname);  
    },
  });
  const upload = multer({ storage: storage });

 
router.post('/login', userController.loginUser);

router.get('/userdetails', authenticate , userController.getUserDetails);
router.get('/getusers', userController.getUsers);
router.post('/createuser', userController.createUser);

router.post('/updateuser', upload.single('profilePic'), userController.updateUser); 

router.delete('/deleteuser/:userId', userController.deleteUser);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.ResetPassword);

router.put('/updateuserdetails', authenticate, userController.updateUserDetails);
router.put('/changePassword',authenticate,userController.changePassword);

module.exports = router;
