const cheerio = require('cheerio');

const winston = require.main.require('winston');
const meta = require.main.require('./src/meta');
const controllers = require('./lib/controllers');

const plugin = {};

let cdnDomain = null;

const addDomain = url => (cdnDomain ? (new URL(url, cdnDomain)).href : url);

plugin.init = async (params) => {
  const { router } = params;
  const hostMiddleware = params.middleware;
  // const hostControllers = params.controllers;

  // admin route
  router.get(
    '/admin/plugins/assetsdomain',
    hostMiddleware.admin.buildHeader,
    controllers.renderAdminPage,
  );
  router.get('/api/admin/plugins/assetsdomain', controllers.renderAdminPage);

  cdnDomain = await meta.settings.getOne('assetsdomain', 'domain');
  try {
    cdnDomain = (new URL('', cdnDomain)).origin;
    winston.info('[plugins/assetsdomain] 初始化成功');
  } catch (error) {
    cdnDomain = null;
    winston.error(`[plugins/assetsdomain] ${error.message}, use source path.`);
  }
};

plugin.addAdminNavigation = async (header) => {
  header.plugins.push({
    route: '/plugins/assetsdomain',
    icon: 'fa-tint',
    name: 'Assets Domain设置',
  });
  return header;
};

plugin.metaLink = async ({ req, data, links }) => {
  const linksWithCdn = links.map((link) => {
    let { href } = link;
    if (!['icon', 'manifest'].includes(link.rel)) {
      href = addDomain(link.href);
    }

    return { ...link, href };
  });
  return { req, data, links: linksWithCdn };
};

plugin.postImage = async ({ postData }) => {
  const $ = cheerio.load(postData.content, {
    xml: {
      xmlMode: true,
    },
  });
  const assetsPattern = /^\/assets\/uploads\/.+/;

  $('img').map((_, element) => {
    const oldSrc = $(element).attr('src');
    if (assetsPattern.test(oldSrc)) {
      const newSrc = addDomain(oldSrc);
      $(element).attr('src', newSrc);
    }
    return null;
  });

  const content = $.html();
  return { postData: { ...postData, content } };
};

plugin.userImage = async users => users.map(user => ({
  ...user,
  // picture: user.picture && addDomain(user.picture), // 可能会污染数据
  // uploadedpicture: user.uploadedpicture && addDomain(user.uploadedpicture),
  'cover:url': user['cover:url'] && addDomain(user['cover:url']),
}));

module.exports = plugin;
