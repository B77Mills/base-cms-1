const { BaseDB } = require('@parameter1/base-cms-db');
const { Base4RestPayload } = require('@parameter1/base-cms-base4-rest-api');
const { UserInputError } = require('apollo-server-express');
const { websiteSection: canonicalPathFor } = require('@parameter1/base-cms-canonical-path');

const validateRest = require('../../utils/validate-rest');
const buildProjection = require('../../utils/build-projection');
const getProjection = require('../../utils/get-projection');
const getGraphType = require('../../utils/get-graph-type');
const { createTitle, createDescription } = require('../../utils/website-section');
const getDescendantIds = require('../../utils/website-section-child-ids');
const sitemap = require('../../utils/sitemap');

const loadHierarchy = async (section, load, projection, sections = []) => {
  const ref = BaseDB.get(section, 'parent');
  const parentId = BaseDB.extractRefId(ref);
  if (!parentId) return sections;
  const parent = await load('websiteSection', parentId, projection, { status: 1 });
  if (!parent) return sections;
  sections.push(parent);
  return loadHierarchy(parent, load, projection, sections);
};

const { isArray } = Array;

module.exports = {
  /**
   *
   */
  WebsiteSection: {
    canonicalPath: (section, _, ctx) => canonicalPathFor(section, ctx),

    /**
     * Placeholder.
     * Used for consistency with content.
     */
    redirectTo: () => null,

    metadata: (section, _, { site }) => ({
      title: () => createTitle(section),
      description: () => createDescription(section, site.obj()),
    }),

    hierarchy: async (section, _, { load }, info) => {
      const {
        returnType,
        fieldNodes,
        schema,
        fragments,
      } = info;
      const projection = getProjection(
        schema,
        getGraphType(returnType),
        fieldNodes[0].selectionSet,
        fragments,
      );
      projection.parent = 1;
      const thisSection = await load('websiteSection', section._id, projection, { status: 1 });
      const sections = await loadHierarchy(section, load, projection, [thisSection]);
      return sections.reverse();
    },

    /**
     * Returns the website sections directly related to this section. This is primarily used for the
     * Leaders Program to denote a contextual relationship between two website sections.
     */
    relatedSectionIds: async ({ relatedSections }) => relatedSections || [],

    /**
     * Returns the taxonomy terms directly related to this section. This is primarily used for the
     * Leaders Program to denote a contextual relationship.
     */
    relatedTaxonomyIds: async ({ relatedTaxonomy }) => {
      const refs = relatedTaxonomy || [];
      return refs.map(BaseDB.extractRefId);
    },

    isRoot: section => !section.parent,
  },

  /**
   *
   */
  WebsiteSectionSitemapUrl: {
    loc: async (section, _, ctx) => {
      const { site } = ctx;
      if (!site.exists()) throw new UserInputError('A website context must be set to generate the `WebsiteSectionSitemapUrl.loc` field.');
      const path = await canonicalPathFor(section, ctx);
      return encodeURI(sitemap.escape(`${site.get('origin')}${path}`));
    },
    lastmod: async (section, _, { basedb }) => {
      const now = new Date();
      const descendantIds = await getDescendantIds(section._id, basedb);
      const sectionIds = isArray(descendantIds) && descendantIds.length
        ? descendantIds
        : [section._id];

      const query = {
        status: 1,
        contentStatus: 1,
        section: { $in: sectionIds },
        startDate: { $lte: now },
        $and: [
          {
            $or: [
              { endDate: { $gt: now } },
              { endDate: { $exists: false } },
            ],
          },
        ],
      };
      const schedule = await basedb.findOne('website.Schedule', query, {
        projection: { startDate: 1 },
        sort: { startDate: -1 },
        limit: 1,
      });
      if (schedule) return schedule.startDate;
      return null;
    },
  },

  /**
   *
   */
  Query: {
    /**
     *
     */
    websiteSectionSitemapUrls: async (_, { input }, { basedb, site }) => {
      const {
        changefreq,
        priority,
        pagination,
      } = input;

      const { limit, skip } = pagination;

      const query = { status: 1 };
      const siteId = input.siteId || site.id();
      if (siteId) query['site.$id'] = siteId;

      const projection = { alias: 1 };
      const sort = { alias: 1 };
      const cursor = await basedb.find('website.Section', query, {
        limit,
        skip,
        projection,
        sort,
      });

      const docs = [];
      await cursor.forEach((doc) => {
        docs.push({ ...doc, changefreq, priority });
      });
      return docs;
    },
  },

  /**
   *
   */
  Mutation: {
    /**
     *
     */
    createWebsiteSection: async (_, { input }, { base4rest, basedb }, info) => {
      validateRest(base4rest);
      const type = 'website/section';
      const {
        site,
        parent,
        logo,
        relatedSectionIds,
        ...fields
      } = input;
      const body = new Base4RestPayload({ type });
      Object.keys(fields).forEach(k => body.set(k, input[k]));
      if (site) body.setLink('site', { id: site, type: 'website/product/site' });
      if (parent) body.setLink('parent', { id: parent, type });
      if (logo) body.setLink('logo', { id: logo, type: 'platform/asset/image' });
      if (relatedSectionIds) {
        body.setLinks('relatedSections', relatedSectionIds.map(i => ({ id: i, type })));
      }
      const { data: { id } } = await base4rest.insertOne({ model: type, body });
      const projection = buildProjection({ info, type: 'WebsiteSection' });
      return basedb.findOne('website.Section', { _id: id }, { projection });
    },

    /**
     *
     */
    updateWebsiteSection: async (_, { input }, { base4rest, basedb }, info) => {
      validateRest(base4rest);
      const type = 'website/section';
      const { id, payload } = input;
      const {
        site,
        parent,
        logo,
        relatedSectionIds,
        ...fields
      } = payload;
      const body = new Base4RestPayload({ type });
      Object.keys(fields).forEach(k => body.set(k, fields[k]));
      if (site) body.setLink('site', { site, type: 'website/product/site' });
      if (parent) body.setLink('parent', { parent, type });
      if (logo) body.setLink('logo', { logo, type: 'platform/asset/image' });
      if (relatedSectionIds) {
        body.setLinks('relatedSections', relatedSectionIds.map(i => ({ id: i, type })));
      }
      body.set('id', id);
      await base4rest.updateOne({ model: type, id, body });
      const projection = buildProjection({ info, type: 'WebsiteSection' });
      return basedb.findOne('website.Section', { _id: id }, { projection });
    },
  },
};
