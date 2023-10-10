const Joi = require("joi");
const UserModel = require("../../../models/userModel");
const { generateToken } = require("../../../middleware/auth");

const createUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password, repeat_password } =
      req.body;

    const schema = Joi.object({
      first_name: Joi.string().min(1).max(50).required().label("First Name"),
      last_name: Joi.string().min(3).max(50).required().label("Last Name"),
      email: Joi.string().email().required().label("Email"),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .min(6)
        .max(30)
        .required()
        .label("Password"),
      repeat_password: Joi.any()
        .valid(Joi.ref("password"))
        .required()
        .error((errors) => {
          errors.forEach((err) => {
            switch (err.code) {
              case "any.required":
                err.message = `Please repeat the password`;
                break;
              default:
                err.message = `Both passwords do not match`;
                break;
            }
          });
          return errors;
        }),
    });
    // Validation of details recieved starts here
    const validate = schema.validate({
      first_name,
      last_name,
      email,
      password,
      repeat_password,
    });
    const { error } = validate;
    if (error) {
      return res
        .status(400)
        .json({ status: false, message: error.details[0].message });
    }

    const user = await UserModel.create({
      first_name,
      last_name,
      email,
      password,
    });

    return res
      .status(200)
      .json({ status: true, user, message: "Created a new user." });
  } catch (e) {
    return res
      .status(500)
      .json({ status: false, message: "Something went wrong in server" });
  }
};

const signupUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password, repeat_password } =
      req.body;

    const schema = Joi.object({
      first_name: Joi.string().min(1).max(50).required().label("First Name"),
      last_name: Joi.string().min(3).max(50).required().label("Last Name"),
      email: Joi.string().email().required().label("Email"),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .min(6)
        .max(30)
        .required()
        .label("Password"),
      repeat_password: Joi.any()
        .valid(Joi.ref("password"))
        .required()
        .error((errors) => {
          errors.forEach((err) => {
            switch (err.code) {
              case "any.required":
                err.message = `Please repeat the password`;
                break;
              default:
                err.message = `Both passwords do not match`;
                break;
            }
          });
          return errors;
        }),
    });
    // Validation of details recieved starts here
    const validate = schema.validate({
      first_name,
      last_name,
      email,
      password,
      repeat_password,
    });
    const { error } = validate;
    if (error) {
      return res
        .status(400)
        .json({ status: false, message: error.details[0].message });
    }

    const user = await UserModel.create({
      first_name,
      last_name,
      email,
      password,
    });

    const token_payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      user_type: user.user_type,
      user_access: user.user_access,
    };
    const token = generateToken(token_payload);

    return res
      .status(200)
      .json({ status: true, token, message: "Created a new user." });
  } catch (e) {
    return res
      .status(500)
      .json({ status: false, message: "Something went wrong in server" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password, remember_me } = req.body;

    const schema = Joi.object({
      email: Joi.string().email().required().label("Email"),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .max(30)
        .required()
        .label("Password"),
    });
    // Validation of details recieved starts here
    const validate = schema.validate({ email, password });
    const { error } = validate;
    if (error) {
      return res
        .status(400)
        .json({ status: false, message: error.details[0].message });
    }

    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid credentials entered." });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: "Invalid credentials entered.",
      });
    }

    const token_payload = {
      id: user._id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      user_type: user.user_type,
      user_access: user.user_access,
    };
    const token = generateToken(token_payload, remember_me);

    return res
      .status(200)
      .json({ status: true, token, message: "User logged in" });
  } catch (e) {
    return res
      .status(500)
      .json({ status: false, message: "Something went wrong in server" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const user_list = await UserModel.find();

    return res
      .status(200)
      .json({ status: true, data: user_list, message: "Fetched users list." });
  } catch (e) {
    return res
      .status(500)
      .json({ status: false, data:[], message: "Something went wrong in server" });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const user_id = req.user.id;
    const user_data = await UserModel.findById(user_id).select("-password");

    if (!user_data) {
      return res.status(404).json({ status: false, message: 'User does not exist.' });
    }

    return res
      .status(200)
      .json({ status: true, data: user_data, message: "Fetched users details." });
  } catch (e) {
    return res
      .status(500)
      .json({ status: false, data:[], message: "Something went wrong in server" });
  }
};

module.exports = {
  createUser,
  signupUser,
  loginUser,
  getAllUsers,
  getUserDetails,
};
