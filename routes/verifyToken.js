const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
  // request token from header
  const token = req.header('authToken')
  if (!token) return res.status(401).send('Access Denied') // if no token then access denied

  try {
    //if theres token we verify the token
    const verified = jwt.verify(token, process.env.SECRET_TOKEN)
    req.user = verified
    next()
  } catch (error) {
    res.status(400).send('Invalid Token') //if wrong token then invalid token
  }
}
