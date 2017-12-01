module.exports = {
  getType(req, res) {
    res.send({
      emailTypes: req.we.config.emailTypes
    });
  }
};