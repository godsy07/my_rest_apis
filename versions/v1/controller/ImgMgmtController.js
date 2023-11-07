const fs = require('fs');
const url = require('url');
const Joi = require("joi");
const path = require('path');
const mongoose = require('mongoose');

const ImageModel = require("../../../models/imageModel");

const getPaginatedImages = async (req, res) => {
  try {
    const query = url.parse(req.url,true).query;
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
      file_path: { $regex: `^public/images`, }
    }

    const { total_items, total_pages, records } = await getPaginatedImageDetails({ find_object, page_no, ITEMS_PER_PAGE, sortObject });

    return res.status(200).json({ status: false, page_no, total_items, total_pages, data: records, message: 'Fetched image list.' })
  } catch(e) {
    return res.status(500).json({ status: false, data: [], message: 'Something went wrong in server' })
  }
}

const getPaginatedImageDetails = async({ find_object, page_no, ITEMS_PER_PAGE, sortObject }) => {
  try {
    const total_items = await ImageModel.find(find_object).countDocuments();
    const total_pages = Math.ceil(total_items / ITEMS_PER_PAGE);
    
    domainName = process.env.SERVER_DOMAIN?process.env.SERVER_DOMAIN:"http://localhost:5001";
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
      {
        $project: {
          _id: 1,
          saved_by: 1,
          title: 1,
          private: 1,
          tags: 1,
          description: 1,
          createdAt: 1,
          updatedAt: 1,
          file_path: { $concat: [domainName, '/', '$file_path'] },
        },
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

    return { total_items, total_pages, records };
  } catch(e) {
    return false
  }
}

const getMyPaginatedImages = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const query = url.parse(req.url, true).query;
    const search_term = query.search_term ? query.search_term : "";
    const page_no = query.page_no ? Number(query.page_no) : 1;
    const ITEMS_PER_PAGE = query.page_limit ? Number(query.page_limit) : 10;

    let sort_data = query.sort_data ? JSON.parse(query.sort_data) : [{ col:"createdAt", value:"desc" }];
    if (sort_data.length === 0) sort_data = [{ col:"createdAt", value:"desc" }];
    
    const sortObject = {};
    sort_data.forEach((item) => {
      sortObject[item.col] = item.value === "asc" ? 1 : -1;
    });

    // const user_id = req.user.id;
    const find_object = {
      saved_by: new mongoose.Types.ObjectId(user_id),
      file_path: { $regex: `^public/images`, },
    };

    const { total_items, total_pages, records } = await getPaginatedImageDetails({ find_object, page_no, ITEMS_PER_PAGE, sortObject });

    return res.status(200).json({ status: false, page_no, total_items, total_pages, data: records, message: 'Fetched image list.' })
  } catch(e) {
    return res.status(500).json({ status: false, data: [], message: 'Something went wrong in server' })
  }
}

const deleteImage = async (req, res) => {
  try {
    const image_id = req.params.image_id;

    const imageData = await ImageModel.findById(image_id);
    const relativeFilePath = imageData.file_path;
    const absoluteFilePath = path.resolve(path.join(__dirname, "..", "..","..",'uploads'), relativeFilePath);
    fs.unlinkSync(absoluteFilePath);
    await ImageModel.deleteOne({ _id: image_id });

    return res.status(200).json({ status: true, message: 'Image has been deleted.' })
  } catch(e) {
    return res.status(500).json({ status: false, message: 'Something went wrong in server' })
  }
}

const uploadAPublicImage = async (req, res) => {
  try {
    const new_file_path = `public/images/`;
    if (!req.file) {
      return res
        .status(405)
        .json({ status: false, message: "Image is required to process" });
    }
    const file_name = req.file.filename;
    const file_path = new_file_path + file_name;
    const actualRelativeFilePath = req.file.path;

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
      // Delete file from directory
      fs.unlinkSync(actualRelativeFilePath);
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
      description: image_description,
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

const uploadAPrivateImage = async (req, res) => {
  try {
    const new_file_path = `users/${req.user.id}/images/`;
    if (!req.file) {
      return res
        .status(405)
        .json({ status: false, message: "Image is required to process" });
    }
    const file_name = req.file.filename;
    const file_path = new_file_path + file_name;
    const actualRelativeFilePath = req.file.path;

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
      // Delete file from directory
      fs.unlinkSync(actualRelativeFilePath);
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
      description: image_description,
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
  getPaginatedImages,
  deleteImage,
  getMyPaginatedImages,
  uploadAPublicImage,
  uploadAPrivateImage,
};
