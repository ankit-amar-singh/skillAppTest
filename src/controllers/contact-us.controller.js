const httpStatus = require("http-status");
const ContactQuery = require("../models/contact-us.model");

const { CREATED } = httpStatus;

exports.submitQuery = async (req, res, next) => {
  try {
    const contactUsData = req.body;
    const contactUsQuery = await new ContactQuery(contactUsData).save();
    return res
      .status(CREATED)
      .json({ queryResponse: contactUsQuery.transform() });
  } catch (error) {
    return next(error);
  }
};
