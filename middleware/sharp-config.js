const sharp = require("sharp");

const fs = require("fs");

const optimizedImg = async (req, res, next) => {

  if (!req.file) {
    return next();
  }

  try {
    const fileName = `${req.file.path.split(".")[0]}.webp`;
    await sharp(req.file.path)
      .resize(450, 600)
      .webp({ quality: 80 })
      .toFile(fileName);

    fs.unlink(req.file.path, (error) => {
      req.file.path = fileName;

      if (error) {
        console.log(error);
      }
      next();
    });
  } catch {
    (error) => {
      res.status(500).json({ error });
    };
  }
};

module.exports = optimizedImg;
