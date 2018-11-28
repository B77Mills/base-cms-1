const gql = require('graphql-tag');

module.exports = gql`

extend type Query {
  magazineSection(input: MagazineSectionQueryInput!): MagazineSection @findOne(model: "magazine.Section", using: { id: "_id" })
  magazineSections(input: MagazineSectionsQueryInput = {}): MagazineSectionConnection! @findMany(model: "magazine.Section")
  globalMagazineSections(input: GlobalMagazineSectionsQueryInput = {}): MagazineSectionConnection! @findMany(model: "magazine.Section", criteria: "globalMagazineSection")
  issueMagazineSections(input: IssueMagazineSectionsQueryInput = {}): MagazineSectionConnection! @findMany(model: "magazine.Section", criteria: "issueMagazineSection")
}

type MagazineSection {
  # fields from platform.model::Section
  id: Int! @value(localField: "_id")
  name: String
  description: String
  fullName: String

  # fields from trait.platform::StatusEnabled
  status: Int

  # fields from trait.platform::Sequenceable
  sequence: Int

  # fields directly on magazine.model::Section
  publication(input: MagazineSectionPublicationInput = {}): MagazinePublication @refOne(model: "platform.Product", criteria: "magazinePublication")
  issue(input: MagazineSectionIssueInput = {}): MagazineIssue @refOne(model: "magazine.Issue")
}

type MagazineSectionConnection {
  totalCount: Int!
  edges: [MagazineSectionEdge]!
  pageInfo: PageInfo!
}

type MagazineSectionEdge {
  node: MagazineSection!
  cursor: String!
}

enum MagazineSectionSortField {
  id
  name
  fullName
  sequence
}

input MagazineSectionQueryInput {
  id: Int!
  status: ModelStatus = active
}

input MagazineSectionsQueryInput {
  status: ModelStatus = active
  sort: MagazineSectionSortInput = {}
  pagination: PaginationInput = {}
}

input GlobalMagazineSectionsQueryInput {
  status: ModelStatus = active
  sort: MagazineSectionSortInput = {}
  pagination: PaginationInput = {}
}

input IssueMagazineSectionsQueryInput {
  status: ModelStatus = active
  sort: MagazineSectionSortInput = {}
  pagination: PaginationInput = {}
}

input MagazineSectionPublicationInput {
  status: ModelStatus = active
}

input MagazineSectionIssueInput {
  status: ModelStatus = active
}

input MagazineSectionSortInput {
  field: MagazineSectionSortField = id
  order: SortOrder = desc
}

`;