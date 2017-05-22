const User = require('../models/').User;


module.exports = function(req, res, next) {

    if (req.session.userId === void 0) {
        return next();
    }
    User.findById(req.session.userId)
      .then(user => {
          if (!user) {
            return res.redirect('/login');
          }
          req.user = user;
          return next();
      })
      .catch(next);
};
