const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const contactQuerySchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      maxlength: 128,
      trim: true,
    },
    message: {
      type: String,
      maxlength: 800,
    },
  },
  {
    timestamps: true,
  },
);

contactQuerySchema.method({
  transform() {
    const transformed = {};
    const fields = ["id", "name", "email", "message"];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

module.exports = model("ContactQuery", contactQuerySchema);
