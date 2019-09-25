const { asyncRoute } = require('@base-cms/utils');
const gql = require('graphql-tag');
const moment = require('moment');

const query = gql`

query WebsiteSectionSitemapUrls {
  websiteSectionSitemapUrls {
    id
    loc
    lastmod
    changefreq
    priority
  }
}

`;

const createUrl = ({
  loc,
  lastmod,
  changefreq,
  priority,
}) => {
  if (!lastmod) return null;
  const parts = [];
  if (changefreq) parts.push(`<changefreq>${changefreq}</changefreq>`);
  if (priority) parts.push(`<priority>${priority}</priority>`);
  return `<url><loc>${loc}</loc><lastmod>${moment(lastmod).toISOString()}</lastmod>${parts.join('')}</url>`;
};

module.exports = asyncRoute(async (req, res) => {
  const { apollo } = res.locals;
  const { data } = await apollo.query({ query });
  const { websiteSectionSitemapUrls: urls } = data;

  const urlset = urls.map(url => createUrl(url)).filter(v => v);
  const lines = ['<?xml version="1.0" encoding="utf-8"?>'];
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  lines.push(...urlset);
  lines.push('</urlset>');

  res.send(lines.join(''));
});
