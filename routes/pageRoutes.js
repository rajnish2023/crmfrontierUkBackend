const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const { authUser: authenticate, authorizeRole } = require('../middleware/authMiddleware'); // using same auth as blogposts

router.post('/createpage', authenticate, authorizeRole('superAdmin'), pageController.createPage);
router.get('/getpages', pageController.getPages);
router.get('/getpagebyId/:id', authenticate, pageController.getPageById);
router.patch('/updatepage/:id', authenticate, authorizeRole('superAdmin'), pageController.updatePage);
router.delete('/deletepage/:id', authenticate, authorizeRole('superAdmin'), pageController.deletePage);
router.get('/getpagebyslug/:slug', pageController.getPageBySlug);

module.exports = router;
