const Joi = require("joi");
const path = require("path");

const ImageModel = require("../../../models/imageModel");

const getAllImages = async (req, res) => {
  try {
    return res
      .status(200)
      .json({ status: true, data: [], message: "Fetched images list." });
  } catch (e) {
    return res
      .status(500)
      .json({
        status: false,
        data: [],
        message: "Something went wrong in server",
      });
  }
};

const getPaginatedImages = async (req, res) => {
  try {
    const query = url_module.parse(req.url,true).query;
    const search_term = query.search_term ? query.search_term : "";
    const page_no = query.page_no ? Number(query.page_no) : 1;
    const ITEMS_PER_PAGE = query.page_limit ? Number(query.page_limit) : 10;

    let sort_data = query.sort_data ? JSON.parse(query.sort_data) : [{ col:"createdAt", value:"desc" }];
    if (sort_data.length === 0) sort_data = [{ col:"createdAt", value:"desc" }];
    
    const sortObject = {};
    sort_data.forEach((item) => {
      sortObject[item.col] = item.value === "asc" ? 1 : -1;
    });

    const find_object = {
      // $or: [
      //   {  },
      // ],
    };
    
    const total_items = await recordModel.find(find_object).countDocuments();
    const total_pages = Math.ceil(total_items / ITEMS_PER_PAGE);

    // const data = await recordModel.find(find_object)
    //   .skip((page_no - 1) * ITEMS_PER_PAGE)
    //   .limit(ITEMS_PER_PAGE)
    //   .sort(sortObject);
    
    const recordsPipeline = [
      {
        $match: find_object,
      },
      {
        $sort: {
          createdAt: 1,
        },
      },
      {
        $sort: sortObject,
      },
    ];


    if (ITEMS_PER_PAGE > 0) {
      recordsPipeline.push({
        $skip: (page_no - 1) * ITEMS_PER_PAGE,
      });
      recordsPipeline.push({
        $limit: ITEMS_PER_PAGE,
      });
    } else {
      recordsPipeline.push({
        $skip: 0,
      });
    }

    const records = await ImageModel.aggregate([...recordsPipeline]);

    return res.status(500).json({ status: false, page_no, total_items, total_pages, data: records, message: 'Fetched image list.' })
  } catch(e) {
    return res.status(500).json({ status: false, data: [], message: 'Something went wrong in server' })
  }
}

const uploadAPublicImage = async (req, res) => {
  try {
    const new_file_path = `users/${req.user.id}/images/`;
    if (!req.file) {
      return res
        .status(405)
        .json({ status: false, message: "Image is required to process" });
    }
    const file_name = req.file.filename;
    const file_path = new_file_path + file_name;

    const { image_title, image_tags, image_description } = req.body;
    // perform the validation in this step
    const schema = Joi.object({
      image_title: Joi.string().min(3).max(100).required().label("Title"),
      image_tags: Joi.array().items(Joi.string().required()).min(1).label("Tags"),
      image_description: Joi.string().min(10).max(500).required().label("Description"),
    });
    // Validation of details recieved starts here
    const validate = schema.validate({ image_title, image_tags, image_description });
    const { error } = validate;
    if (error) {
      return res
        .status(400)
        .json({ status: false, message: error.details[0].message });
    }

    const saved_by = req.user.id;

    const image_data = await ImageModel.create({
      file_path,
      saved_by,
      title: image_title,
      tags: image_tags,
      decription: image_description,
    });

    console.log("image_data: ", image_data)
    return res
      .status(200)
      .json({
        status: true,
        data: image_data,
        message: "Uploaded the image with details.",
      });
  } catch (e) {
    console.log(e)
    return res
      .status(500)
      .json({
        status: false,
        data: [],
        message: "Something went wrong in server",
      });
  }
};

const uploadAPrivateImage = async (req, res) => {
  try {
    const new_file_path = `users/${req.user.id}/images/private/`;
    if (!req.file) {
      return res
        .status(405)
        .json({ status: false, message: "Image is required to process" });
    }
    const file_name = req.file.filename;
    const file_path = new_file_path + file_name;

    const { image_title, image_tags, image_description } = req.body;
    // perform the validation in this step
    const schema = Joi.object({
      image_title: Joi.string().min(3).max(100).required().label("Title"),
      image_tags: Joi.array().items(Joi.string().required()).min(1).label("Tags"),
      image_description: Joi.string().min(10).max(500).required().label("Description"),
    });
    // Validation of details recieved starts here
    const validate = schema.validate({ image_title, image_tags, image_description });
    const { error } = validate;
    if (error) {
      return res
        .status(400)
        .json({ status: false, message: error.details[0].message });
    }

    const saved_by = req.user.id;

    const image_data = await ImageModel.create({
      file_path,
      private: true,
      saved_by,
      title: image_title,
      tags: image_tags,
      decription: image_description,
    });

    return res
      .status(200)
      .json({
        status: true,
        data: image_data,
        message: "Uploaded the image with details.",
      });
  } catch (e) {
    return res
      .status(500)
      .json({
        status: false,
        data: [],
        message: "Something went wrong in server",
      });
  }
};

module.exports = {
  getAllImages,
  getPaginatedImages,
  uploadAPublicImage,
  uploadAPrivateImage,
};
