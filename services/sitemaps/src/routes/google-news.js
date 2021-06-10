const { asyncRoute } = require('@parameter1/base-cms-utils');
const { xmlEntities: xml } = require('@parameter1/base-cms-html');
const gql = require('graphql-tag');
const moment = require('moment');
const createImage = require('../utils/create-image');
const URLSet = require('../utils/urlset');

const parseJson = (value) => {
  try {
    return JSON.parse(value);
  } catch (e) {
    return null;
  }
};

const query = gql`

query ContentSitemapNewsUrls($input: ContentSitemapNewsUrlsQueryInput = {}) {
  contentSitemapNewsUrls(input: $input) {
    id
    loc
    title
    published
    publication {
      id
      name
    }
    images {
      id
      loc
      caption
    }
  }
}

`;

const createPublication = (name, language) => {
  const parts = [
    `<news:name>${name}</news:name>`,
    `<news:language>${language}</news:language>`,
  ];
  return `<news:publication>${parts.join('')}</news:publication>`;
};

const createUrl = (website, {
  loc,
  title,
  published,
  publication,
  images,
}) => {
  // News requires a publication, a published date and a title.
  if (!publication || !published || !title) return null;
  const parts = [
    createPublication(publication.name, website.language.primaryCode),
    `<news:publication_date>${moment(published).toISOString()}</news:publication_date>`,
    `<news:title>${xml.encode(title)}</news:title>`,
  ];
  const imageParts = [];
  if (images && images.length) imageParts.push(...images.map(image => createImage(image)));
  return `<loc>${loc}</loc><news:news>${parts.join('')}</news:news>${imageParts.join('')}`;
};

module.exports = asyncRoute(async (req, res) => {
  const input = parseJson(req.get('x-google-news-input') || '{}');
  const variables = input ? { input } : undefined;

  const { apollo, websiteContext: website } = res.locals;
  const { data } = await apollo.query({ query, variables });
  const { contentSitemapNewsUrls } = data;

  const urlset = new URLSet();
  urlset
    .setAttr('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
    .setAttr('xmlns:news', 'http://www.google.com/schemas/sitemap-news/0.9')
    .setAttr('xmlns:image', 'http://www.google.com/schemas/sitemap-image/1.1')
    .setAttr('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
    .setAttr('xsi:schemaLocation', 'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-news/0.9 http://www.google.com/schemas/sitemap-news/0.9/sitemap-news.xsd')
    .setUrls(contentSitemapNewsUrls.map(url => createUrl(website, url)));

  res.end(urlset.build());
});
