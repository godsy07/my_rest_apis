const Joi = require("joi");
const UserModel = require("../../../models/userModel")

const createUser = async (req, res) => {
    try {
        const { first_name, last_name, email, password, repeat_password } = req.body;

        const schema = Joi.object({
            first_name: Joi.string().min(1).max(50).required().label("First Name"),
            last_name: Joi.string().min(3).max(50).required().label("Last Name"),
            email: Joi.string().email().required().label("Email"),
            password: Joi.string()
              .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
              .min(6).max(30)
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
          const validate = schema.validate({ first_name, last_name, email, password, repeat_password });
          const { error } = validate;
          if (error) {;
            return res.status(400).json({ status: false, message: error.details[0].message });
        }

        const user = await UserModel.create({ first_name, last_name, email, password });

        return res.status(200).json({ status: true, user, message: "Created a new user." });
    } catch(e) {
        console.log(e)
        return res.status(200).json({ status: false, message: "Something went wrong in server" })
    }
}

module.exports = {
    createUser,
}
