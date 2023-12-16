const Joi = require("joi");
const jwt = require("jsonwebtoken");
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

const updateUser = async (req, res) => {
  try {
    const { user_id, first_name, last_name, email, current_password, change_password, new_password, repeat_password } =
      req.body;

    const schema = Joi.object({
      user_id: Joi.string().required().label("User ID"),
      first_name: Joi.string().min(1).max(50).required().label("First Name"),
      last_name: Joi.string().min(3).max(50).required().label("Last Name"),
      email: Joi.string().email().required().label("Email"),
      current_password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required()
        .label("Current Password"),
      change_password: Joi.boolean().required().label("Change Password"),
      new_password: Joi.when('change_password', {
        is: true,
        then: Joi.string()
          .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
          .min(6)
          .max(30)
          .required()
          .label("New Password"),
        // otherwise: Joi.forbidden(),
      }),
      repeat_password: Joi.when('change_password', {
        is: true,
        then: Joi.any()
          .valid(Joi.ref("new_password"))
          .required()
          .error((errors) => {
            errors.forEach((err) => {
              switch (err.code) {
                case "any.required":
                  err.message = `Please repeat the new password`;
                  break;
                default:
                  err.message = `Both passwords do not match`;
                  break;
              }
            });
            return errors;
          }),
        // otherwise: Joi.forbidden(),
      }),
    });
    // Validation of details recieved starts here
    const validate = schema.validate({
      user_id,
      first_name,
      last_name,
      email,
      current_password,
      change_password,
      new_password,
      repeat_password,
    });
    const { error } = validate;
    if (error) {
      return res
        .status(400)
        .json({ status: false, message: error.details[0].message });
    }

    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.status(404).json({ status: false, message: 'Could not find the user' })
    }

    // Check if current_password is valid
    const isMatch = await user.matchPassword(current_password);
    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: "Invalid current password.",
      });
    }

    let changes_present = false, updateObject = {};
    if (change_password === true) {
      if (current_password === new_password) {
        return res.status(400).json({ status: false, message: 'New password cannot be same as current password.' });
      } else {
        changes_present = true;
        updateObject.password = new_password;
      }
    }
    if (email !== user.email) {
      changes_present = true;
      updateObject.email = email;
    }
    if (first_name !== user.first_name) {
      changes_present = true;
      updateObject.first_name = first_name;
    }
    if (last_name !== user.last_name) {
      changes_present = true;
      updateObject.last_name = last_name;
    }

    if (!changes_present) {
      return res.status(500).json({ status: false, message: 'No changes were made.' });
    }

    if (changes_present) await UserModel.updateOne({ _id: user_id }, updateObject);

    // const token_payload = {
    //   id: user_id,
    //   name: `${first_name} ${last_name}`,
    //   email: email,
    //   user_type: user.user_type,
    //   user_access: user.user_access,
    // };
    // const token = generateToken(token_payload, remember_me);

    return res
      .status(200)
      .json({ status: true, user, message: "Updated user details." });
  } catch (e) {
    return res
      .status(500)
      .json({ status: false, message: "Could not update user details." });
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
    
    res.cookie("my_api_token", token);

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
    const user_id = req.params.user_id;
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
  updateUser,
  signupUser,
  loginUser,
  getAllUsers,
  getUserDetails,
};
