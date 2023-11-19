const passwordValidator = require('password-validator');

const schema = new passwordValidator();

schema
    .is().min(8)
    .is().max(100)
    .has().uppercase()
    .has().lowercase()
    .has().digits(1)
    .has().not().spaces()
    .is().not().oneOf(['Passw0rd'])

module.exports = (req, res, next) => {
    const password = req.body.password;

    if (schema.validate(password)) {
        next();
    } else {
        res.status(400).json({ message: 'Mot de passe non conforme' })
    }
}