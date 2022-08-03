const gql = require('graphql-tag');

module.exports = gql`

extend type Query {
  magazinePublication(input: MagazinePublicationQueryInput!): MagazinePublication @findOne(model: "platform.Product", using: { id: "_id" }, criteria: "magazinePublication")
  magazinePublications(input: MagazinePublicationsQueryInput = {}): MagazinePublicationConnection!
    @findMany(
      model: "platform.Product",
      criteria: "magazinePublication",
      queryBuilder: "magazinePublications",
    )
  magazineSubscribeUrl(input: MagazineSubscribeUrlQueryInput!): MagazinePublication @findOne(model: "platform.Product", using: { subscribeUrl: "subscribeUrl" }, criteria: "magazinePublication")
}

type MagazinePublication {
  # fields from platform.model::Product
  id: ObjectID! @projection(localField: "_id") @value(localField: "_id")
  name: String @projection
  fullName: String @projection
  tagLine: String @projection
  description: String @projection
  logo: String @projection

  # fields from platform.trait::StatusEnabled
  status: Int @projection

  # fields directly on magazine.model::Product\Publication
  activeIssues(input: MagazinePublicationActiveIssuesInput = {}): MagazineIssueConnection! @projection(localField: "_id") @refMany(model: "magazine.Issue", localField: "_id", foreignField: "publication.$id", criteria: "magazineActiveIssues")
  issues(input: MagazinePublicationIssuesInput = {}): MagazineIssueConnection! @projection(localField: "_id") @refMany(model: "magazine.Issue", localField: "_id", foreignField: "publication.$id")
  sections(input: MagazinePublicationSectionsInput = {}): MagazineSectionConnection! @projection(localField: "_id") @refMany(model: "magazine.Section", localField: "_id", foreignField: "publication.$id")
  coverImage: AssetImage @projection @refOne(loader: "platformAsset", criteria: "assetImage")
  subscribeUrl: String @projection
  renewalUrl: String @projection
  cancelUrl: String @projection
  changeAddressUrl: String @projection
  reprintsUrl: String @projection
  einquiryUrl: String @projection
  # socialLinks: [PlatformEntityStubSocial]! @arrayValue

  # GraphQL only fields
  metadata: MagazinePublicationMetadata! @projection(localField: "name", needs: ["description"])
  canonicalPath: String! @projection(localField: "_id")
}

type MagazinePublicationConnection @projectUsing(type: "MagazinePublication") {
  totalCount: Int!
  edges: [MagazinePublicationEdge]!
  pageInfo: PageInfo!
}

type MagazinePublicationEdge {
  node: MagazinePublication!
  cursor: String!
}

type MagazinePublicationMetadata {
  title: String
  description: String
}

enum MagazinePublicationSortField {
  id
  sequence
  name
  fullName
}

input MagazinePublicationQueryInput {
  id: ObjectID!
  status: ModelStatus = active
}

input MagazineSubscribeUrlQueryInput {
  subscribeUrl: String!
  status: ModelStatus = active
}

input MagazinePublicationsQueryInput {
  status: ModelStatus = active
  publicationIds: [ObjectID!] = []
  sort: MagazinePublicationSortInput = {}
  pagination: PaginationInput = {}
}

input MagazinePublicationSectionsInput {
  status: ModelStatus = active
  sort: MagazineSectionSortInput = {}
  pagination: PaginationInput = {}
}

input MagazinePublicationIssuesInput {
  status: ModelStatus = active
  sort: MagazineIssueSortInput = {}
  pagination: PaginationInput = {}
}

input MagazinePublicationActiveIssuesInput {
  status: ModelStatus = active
  sort: MagazineIssueSortInput = {}
  pagination: PaginationInput = {}
}

input MagazinePublicationSortInput {
  field: MagazinePublicationSortField = sequence
  order: SortOrder = asc
}

`;
