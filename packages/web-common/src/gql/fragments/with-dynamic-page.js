const gql = require('graphql-tag');

module.exports = gql`

fragment WithDynamicPageFragment on ContentPage {
  id
  type
  alias
  redirectTo
  siteContext {
    path
  }
}

`;
