const gql = require('graphql-tag');

module.exports = gql`

extend type Query {
  contentPromotion(input: ContentPromotionQueryInput!): ContentPromotion @findOne(model: "platform.Content", using: { id: "_id" }, criteria: "contentPromotion")
}

type ContentPromotion implements Content @applyInterfaceFields {
  id: Int! @value(localField: "_id")
}

type ContentPromotionConnection {
  totalCount: Int!
  edges: [ContentPromotionEdge]!
  pageInfo: PageInfo!
}

type ContentPromotionEdge {
  node: ContentPromotion!
  cursor: String!
}

input ContentPromotionQueryInput {
  id: Int!
  status: ModelStatus = active
}

input ContentPromotionSortInput {
  field: ContentSortField = id
  order: SortOrder = desc
}

`;
