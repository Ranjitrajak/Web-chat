const express = require('express');
const router = express.Router();
const { getMessages } = require('../controllers/messageController');
const { getUsers, createUser } = require('../controllers/userController');

router.get('/users', getUsers);
router.post('/user/create', createUser);
router.get('/messages/:senderId/:receiverId', getMessages);
module.exports = router;