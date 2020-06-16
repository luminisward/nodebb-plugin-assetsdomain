const Controllers = {};

Controllers.renderAdminPage = (req, res/* , next */) => {
  res.render('admin/plugins/assetsdomain', {});
};

module.exports = Controllers;
