const express = require("express");
let router = express.Router();
const FileUploader = require("../services/fileUpload");
const mw = FileUploader.single("photo[file]");

const { User, Photo } = require("../models");

router.get("/", (req, res, next) => {
    //get all the photos
    User.find({})
    .populate('photos')
    .then((usersWithPhotos) => {
        console.log("userswith Photos", usersWithPhotos);
        let photos = [];
        usersWithPhotos.forEach((user) => {
            user.photos.forEach((photo) => {
                photos.push({
                    id: photo.id,
                    link: photo.link,
                    username: user.username
                });
            });
        });
        res.render("photos/index", { photos });
    });
});

router.get("/new", (req, res) => {
  res.render("photos/new");
});

router.post("/", mw, (req, res, next) => {
  //file contents should be at req.file as per multer middleware

  //req.file
  // { fieldname: 'photo[file]',
  // originalname: 'leejungho-2.jpg',
  // encoding: '7bit',
  // mimetype: 'image/jpeg',
  // buffer: <Buffer ff d8 ff e1 0b 01 45 78 69 66 00 00 49 49 2a 00 08 00 00 00 0c 00 00 01 03 00 01 00 00 00 6e 04 00 00 01 01 03 00 01 00 00 00 e9 02 00 00 02 01 03 00 ... >,
  // size: 172978 }

  //create file object with data
  FileUploader.upload({
    data: req.file.buffer,
    name: req.file.originalname,
    mimetype: req.file.mimetype
  })
    .then(response => {
      //     { ETag: '"3aa25b6f7452e9342fe233aac92bcf53"',
      // Location: 'https://s3photogallery.s3.amazonaws.com/leejungho-2-0cc3e17228213e0c377b23dcb53f8e5d.jpeg',
      // key: 'leejungho-2-0cc3e17228213e0c377b23dcb53f8e5d.jpeg',
      // Key: 'leejungho-2-0cc3e17228213e0c377b23dcb53f8e5d.jpeg',
      // Bucket: 's3photogallery' }

      return Photo.create({
        id: response.Key,
        link: response.Location
      })
      .then(photo => {
        req.user.photos.push(photo);
        return req.user.save();
      })
      .then(user => {
        res.redirect("/photos");
      })
    })
    .catch(next);
});

router.delete("/:id", (req, res, next) => {
  let id = req.params.id;

  FileUploader.remove(id)
    .then(() => {
      res.redirect("/photos");
    })
    .catch(next);
});

module.exports = router;
