const gql = require('graphql-tag');

module.exports = gql`

extend type Query {
  websiteRedirect(input: WebsiteRedirectQueryInput!): WebsiteRedirect
  websiteRedirects(input: WebsiteRedirectsQueryInput = {}): WebsiteRedirectConnection! @findMany(
    model: "website.Redirects"
    withSite: true
    siteField: "siteId"
  )
}

extend type Mutation {
  createWebsiteRedirect(input: CreateWebsiteRedirectMutationInput!): WebsiteRedirect! @requiresAuth
  deleteWebsiteRedirect(input: DeleteWebsiteRedirectMutationInput!): String @requiresAuth
  updateWebsiteRedirect(input: UpdateWebsiteRedirectMutationInput!): WebsiteRedirect! @requiresAuth
  updateWebsiteRedirectSite(input: UpdateWebsiteRedirectSiteMutationInput!): WebsiteRedirect! @requiresAuth
}

type WebsiteRedirect {
  id: ObjectID! @projection(localField: "_id") @value(localField: "_id")
  site: WebsiteSite! @projection(localField: "siteId") @refOne(loader: "platformProduct", criteria: "websiteSite", localField: "siteId")
  "The URL path to redirect from, such as \`/some/path\`"
  from: String! @projection
  "The URI that should be redirected to, such as \`https://google.com/search\` or \`/new/path\`"
  to: String! @projection
  "The HTTP status code that should be used when redirecting. By default this value is 301"
  code: Int! @projection
}

type WebsiteRedirectConnection @projectUsing(type: "WebsiteRedirect") {
  totalCount: Int!
  edges: [WebsiteRedirectEdge]!
  pageInfo: PageInfo!
}

type WebsiteRedirectEdge {
  node: WebsiteRedirect!
  cursor: String!
}

enum WebsiteRedirectSortField {
  id
  from
}

enum WebsiteRedirectSiteQueryOperatorEnum {
  equal
  notEqual
}

input WebsiteRedirectQueryInput {
  id: ObjectID
  siteId: ObjectID
  from: String
  params: JSON
  "Determines whether to check for a redirect on the _current_ site or from a site _other_ than the current site."
  siteQueryOperator: WebsiteRedirectSiteQueryOperatorEnum = equal
}

input WebsiteRedirectsQueryInput {
  siteId: ObjectID
  sort: WebsiteRedirectSortInput = {}
  pagination: PaginationInput = {}
}

input WebsiteRedirectSortInput {
  field: WebsiteRedirectSortField = id
  order: SortOrder = desc
}

input CreateWebsiteRedirectMutationInput {
  "The site that this redirect will be valid for"
  siteId: ObjectID!
  payload: CreateWebsiteRedirectMutationPayloadInput!
}

input CreateWebsiteRedirectMutationPayloadInput {
  "The URL path to redirect from, such as \`/some/path\`"
  from: String!
  "The URI that should be redirected to, such as \`https://google.com/search\` or \`/new/path\`"
  to: String!
  "The HTTP status code that should be used when redirecting. By default this value is 301"
  code: Int = 301
}

input DeleteWebsiteRedirectMutationInput {
  id: ObjectID!
}

input UpdateWebsiteRedirectMutationInput {
  id: ObjectID!
  payload: UpdateWebsiteRedirectMutationPayloadInput!
}

input UpdateWebsiteRedirectMutationPayloadInput {
  "The URL path to redirect from, such as \`/some/path\`"
  from: String
  "The URI that should be redirected to, such as \`https://google.com/search\` or \`/new/path\`"
  to: String
  "The HTTP status code that should be used when redirecting."
  code: Int
}

input UpdateWebsiteRedirectSiteMutationInput {
  id: ObjectID!
  siteId: ObjectID!
}

`;
