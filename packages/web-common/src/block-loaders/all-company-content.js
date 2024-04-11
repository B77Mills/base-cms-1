const buildQuery = require('../gql/query-factories/block-all-company-content');

const date = (v) => (v instanceof Date ? v.valueOf() : v);

/**
 * @param {ApolloClient} apolloClient The Apollo GraphQL client that will perform the query.
 * @param {object} params
 * @param {date} params.since The date to consider content published by
 * @param {number} params.companyId The company (content) ID.
 * @param {string[]} [params.includeContentTypes] An array of content types to include.
 * @param {string[]} [params.excludeContentTypes] An array of content types to exclude.
 * @param {string[]} [params.includeLabels] An array of labels to include.
 * @param {string[]} [params.excludeLabels] An array of labels to exclude.
 * @param {boolean} [params.requiresImage] Whether the content must have an image.
 * @param {boolean} [params.withSite] Whether to limit results to the current site context
 * @param {string} [params.siteId] A website site identifier to limit results by primarySite
 * @param {string} [params.sortField] The field to use for sorting results
 * @param {string} [params.sortOrder] The direction to sort results
 * @param {number} [params.limit] The number of results to return.
 * @param {number} [params.skip] The number of results to skip.
 * @param {string} [params.after] The cursor to start returning results from.
 * @param {string} [params.queryFragment] The `graphql-tag` fragment
 *                                        to apply to the `allCompanyContent` query.
 */
module.exports = async (apolloClient, {
  limit,
  skip,
  after,

  companyId,
  since,

  sortField: field,
  sortOrder: order,

  includeContentTypes,
  excludeContentTypes,
  includeLabels,
  excludeLabels,
  excludeContentIds,
  requiresImage,
  withSite,
  siteId,

  queryFragment,
  queryName,
} = {}) => {
  const pagination = { limit, skip, after };
  const input = {
    companyId,
    includeContentTypes,
    excludeContentTypes,
    includeLabels,
    excludeLabels,
    excludeContentIds,
    pagination,
    requiresImage,
    withSite,
    siteId,
    since: date(since),
  };
  if (field || order) input.sort = { field, order };
  const query = buildQuery({ queryFragment, queryName });
  const variables = { input };

  const { data } = await apolloClient.query({ query, variables });
  if (!data || !data.allCompanyContent) return { nodes: [], pageInfo: {} };
  const { pageInfo } = data.allCompanyContent;
  const nodes = data.allCompanyContent.edges
    .map((edge) => (edge && edge.node ? edge.node : null))
    .filter((c) => c);
  return { nodes, pageInfo };
};
