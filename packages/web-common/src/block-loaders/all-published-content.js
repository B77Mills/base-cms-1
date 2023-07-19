const buildQuery = require('../gql/query-factories/block-all-published-content');

const date = (v) => (v instanceof Date ? v.valueOf() : v);

/**
 * @param {ApolloClient} apolloClient The Apollo GraphQL client that will perform the query.
 * @param {object} params
 * @param {date} params.since The date to consider content published by
 * @param {date} params.publishedAfer
 * @param {date} params.beginningAfter The date to include content by
 * @param {date} params.beginningBefore The date to include content by
 * @param {date} params.endingAfter The date to include content by
 * @param {date} params.endingBefore The date to include content by
 * @param {number} params.sectionId The section ID.
 * @param {number[]} [params.includeTaxonomyIds] An array of taxonomies to include.
 * @param {string[]} [params.includeLabels] An array of labels to include.
 * @param {string[]} [params.contentTypes] An array of content types to include.
 * @param {boolean} [params.withSite] Whether the content must belong to the current site.
 * @param {boolean} [params.requiresImage] Whether the content must have an image.
 * @param {boolean} [params.sectionBubbling] Whether automatic section bubbling is applied.
 * @param {string} [params.sortField] The field to use for sorting results
 * @param {string} [params.sortOrder] The direction to sort results
 * @param {number} [params.limit] The number of results to return.
 * @param {number} [params.skip] The number of results to skip.
 * @param {string} [params.after] The cursor to start returning results from.
 * @param {string} [params.queryFragment] The `graphql-tag` fragment
 *                                        to apply to the `allPublishedContent` query.
 */
module.exports = async (apolloClient, {
  limit,
  skip,
  after,

  since,
  publishedAfter,
  beginningAfter,
  beginningBefore,
  endingAfter,
  endingBefore,

  sortField: field,
  sortOrder: order,

  includeContentTypes,
  excludeContentTypes,

  includeTaxonomyIds,

  includeLabels,

  excludeContentIds,

  sectionId,
  contentTypes,
  siteId,
  withSite,
  requiresImage,
  sectionBubbling,

  requiresIndexed,

  queryFragment,
  queryName,
} = {}) => {
  const pagination = { limit, skip, after };
  const input = {
    pagination,
    includeContentTypes: includeContentTypes || contentTypes,
    excludeContentTypes,
    includeTaxonomyIds,
    includeLabels,
    excludeContentIds,
    siteId,
    withSite,
    requiresImage,
    sectionBubbling,
    sectionId,
    since: date(since),
    beginning: { after: date(beginningAfter), before: date(beginningBefore) },
    ending: { after: date(endingAfter), before: date(endingBefore) },
    requiresIndexed,
    ...(publishedAfter && { after: date(publishedAfter) }),
  };
  if (field || order) input.sort = { field, order };
  const query = buildQuery({ queryFragment, queryName });
  const variables = { input };

  const { data } = await apolloClient.query({ query, variables });
  if (!data || !data.allPublishedContent) return { nodes: [], pageInfo: {} };
  const { pageInfo } = data.allPublishedContent;
  const nodes = data.allPublishedContent.edges
    .map((edge) => (edge && edge.node ? edge.node : null))
    .filter((c) => c);
  return { nodes, pageInfo };
};
