const { body, validationResult } = require('express-validator');

const Genre = require("../models/genre");
const Book = require("../models/book");

const asyncHandler = require('express-async-handler')

exports.genre_list = asyncHandler(async (req, res, next) => {
  const allGenres = await Genre.find().sort({ name: 1 }).exec();
  res.render("genre_list", {
    title: "Genre List",
    genre_list: allGenres,
  });
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, 'title summary').exec(),
  ]);

  if (genre === null) {
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  res.render("genre_detail", {
    title: 'Genre Detail',
    genre: genre, 
    genre_books: booksInGenre,
  });
});

// Display Genre create form on GET.
exports.genre_create_get = asyncHandler(async (req, res, next) => {
  res.render("genre_form", { title: "Create Genre" });
});

// Handle Genre create on POST.
exports.genre_create_post = [
  // Validate and sanitize name field
  body("name", "Genre name must contain at least 3 characters")
  .trim()
  .isLength({ min: 3 })
  .escape(),

  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    // Extract validation errors from req
    const errors = validationResult(req);

    // Create new genre object with escaped and trimmed data
    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      // Errors exist. Render form again with sanitized values/ error msgs
      res.render("genre_form", {
        title: "Create Genre",
        genre: genre, 
        errors: errors.array(),
      });
      return;
    } else {
      // Data is valid. Check if genre with same name already exists
      const genreExists = await Genre.findOne({ name: req.body.name }).exec();

      if(genreExists) {
        res.redirect(genreExists.url);
      } else {
        // Save and redirect to new detail page
        console.log("saving");
        await genre.save();
        res.redirect(genre.url);
      }
    }
  }),
];

 


// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id).exec();
  const genreBooks = await Book.find({genre: genre}).exec();

  if (genre === null) {
    res.redirect("/catalog/genres");
  }

  res.render("genre_delete", {
    title: "Delete genre",
    genre: genre,
    genre_books: genreBooks,
  });
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id).exec();
  const genreBooks = await Book.find({genre: genre}).exec();

  if (genre === null) {
    res.redirect("/catalog/genres");
  }

  if (genreBooks.length > 0) {
    res.render("genre_delete", {
      title: "Delete genre",
      genre: genre,
      genre_books: genreBooks,
    });
    return; 
  } else {
    await Genre.findByIdAndDelete(req.body.genreid).exec();
    res.redirect("/catalog/genres");
  }
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre update GET");
});

// Handle Genre update on POST.
exports.genre_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre update POST");
});
