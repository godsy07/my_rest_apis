const ReactionModel = require("../models/reactionModel");

const getImageStats = async (image_id) => {
  const stats = { likes: 0, comments: 0 };
  try {
    stats.likes = await ReactionModel.find({
      image_id,
      type: "like",
      status: "active",
    }).count();
    stats.comments = await ReactionModel.find({
      image_id,
      type: "comment",
      status: "active",
    }).count();
  } catch (e) {
    stats.error = e;
  }
  return stats;
};

module.exports = { getImageStats };
