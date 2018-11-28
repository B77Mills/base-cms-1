const gql = require('graphql-tag');

module.exports = gql`

extend type Query {
  contentPodcast(input: ContentPodcastQueryInput!): ContentPodcast @findOne(model: "platform.Content", using: { id: "_id" }, criteria: "contentPodcast")
}

type ContentPodcast implements Content @applyInterfaceFields {
  id: Int! @value(localField: "_id")
}

type ContentPodcastConnection {
  totalCount: Int!
  edges: [ContentPodcastEdge]!
  pageInfo: PageInfo!
}

type ContentPodcastEdge {
  node: ContentPodcast!
  cursor: String!
}

input ContentPodcastQueryInput {
  id: Int!
  status: ModelStatus = active
}

input ContentPodcastSortInput {
  field: ContentSortField = id
  order: SortOrder = desc
}

`;
