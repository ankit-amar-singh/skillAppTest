/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable func-names */
const aws = require("aws-sdk");
const multer = require("multer");
const fs = require("fs");
// const multerS3 = require("multer-s3");

const { envVariables } = require("../config/vars");

aws.config.update({
  accessKeyId: envVariables.awsIamUserAccessKey,
  secretAccessKey: envVariables.awsIamUserSecretKey,
  region: envVariables.awsBucketRegion,
});

// const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg"
    || file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Wrong file type, only upload JPEG and/or PNG or pdf !"),
      false,
    );
  }
};

// const multerS3Config = multerS3({
//   acl: "public-read",
//   s3,
//   bucket: envVariables.awsBucketName,
//   key(req, file, cb) {
//     req.file = Date.now() + file.originalname;
//     cb(null, `SkillApp/${Date.now()}-${file.originalname}`);
//   },
// });

// const upload = multer({
//   fileFilter,
//   storage: multerS3Config,
// });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const path = `uploads/`;
    fs.mkdirSync(path, { recursive: true });
    cb(null, path);
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}`);
  },
});

const upload = multer({ fileFilter, storage });

module.exports = upload;
