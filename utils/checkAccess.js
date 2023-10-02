const UserModel = require("../models/userModel")

const checkUserIsAdmin = async() => {
    const user = await UserModel.findById(user_id);

    return user.user_type === 'admin'?true:false;
}

const checkUserExists = async(user_id) => {
    const user = await UserModel.findById(user_id);

    return user?user:false;
}

module.exports = {
    checkUserIsAdmin,
    checkUserExists,
}