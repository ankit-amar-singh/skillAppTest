const mongoose = require("mongoose");
const { envVariables } = require("./vars.js");

const { mongoUrl } = envVariables;

exports.connectDB = async () => {
  try {
    const con = await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // eslint-disable-next-line no-console
    console.log(`Database connected : ${con.connection.host}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
