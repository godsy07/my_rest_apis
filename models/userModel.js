const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      min: 1,
      required: true,
    },
    last_name: {
      type: String,
      min: 3,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    profile_pic_url: {
      type: String,
      default: null,
    },
    status: {
      type: Boolean,
      default: false,
    },
    user_type: {
      type: String,
      enum: ["user","admin"],
      default: "user",
    },
    password: {
      type: String,
      min: [6, "Please choose more secure password atleast 6 characters."],
      required: true,
    },
  },
  { timestamps: true }
);


UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.pre("update", async function (next) {
  const password = this.getUpdate().password;
  if (!password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    this.getUpdate().password = hash;
    next();
  } catch (error) {
    return next(error);
  }
});

UserSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const UserModel = mongoose.model("myapi_user", UserSchema);

module.exports = UserModel;