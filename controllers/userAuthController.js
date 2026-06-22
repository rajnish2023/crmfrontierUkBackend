const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
 

// Login user and return JWT token
exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide both email and password' });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

  res.status(200).json({ message: 'User logged in successfully', token });
});


//user details api method

exports.getUserDetails = async (req, res) => {
  const id = req.user;
  console.log(id);
  try {
    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  }
  catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}









const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/var/data/uploads');   
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));  
  }
});

// Configure multer to accept larger file uploads (e.g., 10MB)
const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
}).single('profilePic');  

// Create User
exports.createUser = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: 'Image upload failed or file size too large' });
    }

    const { name, email, password, linkedin, aboutus, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);  
    let profilePic = req.file ? `${req.file.filename}` : '';

    // create slug using name
    const slug = name.toLowerCase().split(' ').join('-');

    // Create the new user
    const newUser = new User({
      name,
      slug,
      email,
      password: hashedPassword,   
      profilePic,   
      linkedin,
      aboutus,
      role
    });

    await newUser.save();

    return res.status(201).json({
      message: 'User created successfully',
      user: newUser
    });
  });
});

// Get all Users
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.status(200).json({ users });
});

// Update User (profile update)
exports.updateUser = asyncHandler(async (req, res) => {
 
  const { _id,name, email, linkedin, aboutus, role } = req.body;
    const updatedData = {
      name,
      email,
      linkedin,
      aboutus,
      role,
    };

    if (req.file) {
      updatedData.profilePic = `${req.file.filename}`;
    }
    const updatedUser = await User.findByIdAndUpdate(_id, updatedData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
   
});


//update user by authuser middleware


exports.updateUserDetails = async (req, res) => {
  const id = req.user;
  const { username, email, role, aboutus, profilePic, linkedin, status } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.username = username || user.username;
        user.email = email || user.email;
        user.role = role || user.role;
        user.aboutus = aboutus || user.aboutus;
        user.profilePic = profilePic || user.profilePic;
        user.linkedin = linkedin || user.linkedin;
        user.status = status || user.status;

        await user.save();
        res.status(200).json({ message: 'User updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


//update password
exports.changePassword = async (req, res) => {
  const id = req.user;
  console.log(id);
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await
    User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: 'Password updated' });
  }
  catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}




// Delete User
exports.deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  console.log(userId);

  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.status(200).json({ message: 'User deleted successfully' });
});


//forgot password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const resetLink = `https://crmforce-plusfrontend.onrender.com/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",   
      port: 465,              
      secure: true,           
      auth: {
        user: process.env.EMAIL_USER,  
        pass: process.env.EMAIL_PASS,   
      },
    });

    const mailOptions = {
      from: `"Support Team" <${process.env.EMAIL_USER}>`,  
     to: user.email,                                       
      subject: 'Password Reset Request',                    
      text: `Hello, please use the following link to reset your password: ${resetLink}`,
      html: `<p>Hello,</p>
             <p>You requested a password reset. Click the link below to reset your password:</p>
             <a href="${resetLink}" style="color:blue;">Reset Password</a>
             <p>This link will expire in 15 minutes.</p>`,   
    };
 
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Password reset link sent to email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//reset password
exports.ResetPassword = async (req, res) => {
  const {password,token} = req.body;
  try {
    if (!token) return res.status(400).json({ message: 'Invalid token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
     
    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: 'Invalid token' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
