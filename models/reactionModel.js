const mongoose = require("mongoose");

const ReactionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'myapi_user',
      required: true,
    },
    image_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'myapi_image',
      required: true,
    },
    type: {
        type: String,   // like, comment, report
        required: true,
    },
    status: {
        type: String,
        default: 'active', // active, flagged
    }
    content: {
      type: String,
      max: 500,
      default: '',
    },
  },
  { timestamps: true }
);


const ReactionModel = mongoose.model("myapi_reaction", ReactionSchema);

module.exports = ReactionModel;