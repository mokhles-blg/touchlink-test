const User = require("../models/User");
const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);
const jwt = require("jsonwebtoken");

exports.Signup = async (req, res) => {
  try {
    // req.body
    const { username, email, password } = req.body;

    // check if the email already exists in the database
    const FoundUser = await User.findOne({ email });

    if (FoundUser) {
      res.status(400).send({
        errors: [{ msg: "user already exists, email should be unique" }],
      });
      return;
    }
    const newUser = new User({ username, email, password });

    // hash the password
    const hashedpassword = bcrypt.hashSync(password, salt);
    newUser.password = hashedpassword;

    // create a key using json webtoken
    const token = jwt.sign(
      {
        id: newUser._id,
      },
      process.env.SECRET_KEY,
      { expiresIn: 60 * 60 }
    );
    // save the new user in the database
    await newUser.save();
    res
      .status(200)
      .send({ msg: "User registered successfully", user: newUser, token });
  } catch (error) {
    console.log(error);
    res.status(400).send({ errors: [{ msg: "Can not register the user" }] });
  }
};

exports.SignIn = async (req, res) => {
  try {
    // get the req.body
    const { email, password } = req.body;
    // search if the user exists
    const searchUser = await User.findOne({ email });

    // send an error if he didnt exist
    if (!searchUser) {
      res.status(400).send({ errors: [{ msg: "Bad Credential" }] });
      return;
    }
    // check if the sent password is equal to the current Password
    const hashedpass = searchUser.password;
    const result = await bcrypt.compare(password, hashedpass);
    if (!result) {
      res.status(400).send({ errors: [{ msg: "Bad Credential" }] });
      return;
    }
    // else create a key
    const token = jwt.sign(
      {
        id: searchUser._id,
      },
      process.env.SECRET_KEY,
      { expiresIn: 60 * 60 }
    );

    // send the details + a key
    res.status(200).send({ msg: "Auth success", user: searchUser, token });
  } catch (error) {
    console.log(error);
    res.status(400).send({ errors: [{ msg: "Can not get the currentUser" }] });
  }
};

exports.ShowUserInfos = async (req, res) => {
  try {
    const id = req.params.id;
    const userToFind = await User.findOne({ _id: id });
    console.log(userToFind);
    res.status(200).send({ msg: "I found the user ...", userToFind });
  } catch (error) {
    res.status(400).send({ msg: "Can not get user with this id !!", error });
  }
};

exports.ShowAllUsers = async (req, res) => {
  try {
    const listUsers = await User.find();
    res.status(200).send({ msg: "This is the list of users ...", listUsers });
  } catch (error) {
    res.status(400).send({ msg: "Can not get all users !!", error });
  }
};

exports.DeleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const userToDelete = await User.findOneAndRemove({ _id: userId });
    // console.log(contactToDelete)
    if (!userToDelete) {
      res.status(200).send({ msg: "User already deleted ..." });
      return;
    }
    res.status(200).send({ msg: "User deleted ...", userToDelete });
  } catch (error) {
    res.status(400).send({ msg: "Can not delete user with this id !!", error });
  }
};
