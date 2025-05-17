const {User} = require('../models/userModel');

const createUser = async (req, res) => {
  try {
    const { username } = req.body;
    const findUser= await User.findOne({username:username}).select('-password');
    if(findUser){
      return res.status(400).json({message:'User already exists'});
    }
    const user = new User({ username });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err });
  }
};

module.exports = {
  createUser,
  getUsers
};