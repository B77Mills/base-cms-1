const buildQuery = require('../gql/query-factories/block-magazine-active-issues');

/**
 * @param {ApolloClient} apolloClient The Apollo GraphQL client that will perform the query.
 * @param {object} params
 * @param {string} [params.queryFragment] The `graphql-tag` fragment
 *                                        to apply to the `magazineActiveIssues` query.
 */
module.exports = async (apolloClient, {
  publicationId,
  excludeIssueIds,
  requiresCoverImage,
  mailing,

  queryFragment,
  queryName,
  limit,
  skip,
  after,
  sort,
} = {}) => {
  const query = buildQuery({ queryFragment, queryName });
  const pagination = { limit, skip, after };
  const input = {
    publicationId,
    excludeIssueIds,
    requiresCoverImage,
    mailing,
    sort,
    pagination,
  };
  const variables = { input };

  const { data } = await apolloClient.query({ query, variables });
  if (!data || !data.magazineActiveIssues) return { nodes: [], pageInfo: {} };
  const { pageInfo } = data.magazineActiveIssues;
  const nodes = data.magazineActiveIssues.edges
    .map((edge) => (edge && edge.node ? edge.node : null))
    .filter((c) => c);
  return { nodes, pageInfo };
};
