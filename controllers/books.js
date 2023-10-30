const Book = require("../models/Book");
const fs = require("fs");

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename.split('.')[0]}.webp`,
  });
  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Livre enregistré!" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename.split('.')[0]}.webp`,
  }
    : { ...req.body };
  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "non autorisé" });
      } else {
        const fileToDelete = `images/${book.imageUrl.split('images/')[1]}`;
        fs.unlink(fileToDelete, (err) => {
          if (err) throw err;
          Book.updateOne(
            { _id: req.params.id },
            { ...bookObject, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: "Objet modifié" }))
            .catch((error) => res.status(401).json({ error }));
        })
      }
    });
};

exports.deleteBook = (req, res, next) => {
  console.log(req.params.id);
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "non autorisé" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Objet supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getBestRatedBooks = (req, res) => {
  Book.find().sort({ averageRating: -1 }).limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(401).json({ error }));
};

exports.getOneBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.rateABook = (req, res) => {

  const grade = req.body.rating;
  if (isNaN(grade) || grade < 0 || grade > 5) {
    return res.status(400).json({ message: 'Note invalide' })
  }

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      const alreadyGaveAGrade = book.ratings.find(rating => rating.userId === req.auth.userId);
      if (alreadyGaveAGrade) {
        throw new Error('Vous avez déjà noté ce livre');
      }
      book.ratings.push(
        {
          userId: req.auth.userId,
          grade: grade
        }
      )
      const totalGrades = book.ratings.reduce((acc, curr) => acc + curr.grade, 0);
      book.averageRating = Math.round(totalGrades / book.ratings.length);
      return book.save();
    })
    .then((updatedBook) => {
      res.status(200).json(updatedBook);
    })
    .catch(error => {
      if (error.message === 'Vous avez déjà noté ce livre') {
        res.status(401).json({ message: error.message });
      } else {
        res.status(400).json({ error });
      }
    });
}
