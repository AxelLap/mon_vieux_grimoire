const emailValidator = require('email-validator');

module.exports = (req, res, next) => {
    const email = req.body.email;

    if (emailValidator.validate(email)) {
        next();
    } else {
        res.status(400).json({ message: "Adresse invalide" })
    }
}