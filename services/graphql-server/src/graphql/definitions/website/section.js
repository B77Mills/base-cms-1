const gql = require('graphql-tag');

module.exports = gql`

extend type Query {
  websiteSection(input: WebsiteSectionQueryInput!): WebsiteSection
    @findOne(
      model: "website.Section",
      withSite: true,
      using: { id: "_id" }
    )

  websiteSectionAlias(input: WebsiteSectionAliasQueryInput!): WebsiteSection
    @findOne(
      model: "website.Section",
      withSite: true,
      using: { alias: "alias" }
    )

  websiteSectionRedirect(input: WebsiteSectionRedirectQueryInput!): WebsiteSection
    @findOne(
      model: "website.Section",
      withSite: true,
      using: { alias: "redirects" }
    )

  websiteSections(input: WebsiteSectionsQueryInput = {}): WebsiteSectionConnection!
    @findMany(
      model: "website.Section",
      withSite: true,
      queryBuilder: "websiteSections",
    )

  rootWebsiteSections(input: RootWebsiteSectionsQueryInput = {}): WebsiteSectionConnection!
    @deprecated(reason: "Use \`Query.websiteSections\` with \`input.rootOnly = true\` instead.")
    @findMany(
      model: "website.Section",
      withSite: true,
      criteria: "rootWebsiteSection"
    )

  websiteSectionsFromIds(input: WebsiteSectionsFromIdsQueryInput!): WebsiteSectionConnection!
    @deprecated(reason: "Use \`Query.websiteSections\` with \`input.includeIds = []\` instead.")
    @findMany(
      model: "website.Section",
      withSite: true,
      using: { ids: "_id" }
    )

  websiteSectionSitemapUrls(input: WebsiteSectionSitemapUrlsQueryInput = {}): [WebsiteSectionSitemapUrl!]!
}

extend type Mutation {
  createWebsiteSection(input: CreateWebsiteSectionMutationInput!): WebsiteSection! @requiresAuth
  updateWebsiteSection(input: UpdateWebsiteSectionMutationInput!): WebsiteSection! @requiresAuth
}

type WebsiteSection {
  # fields from platform.model::Section
  id: Int! @projection(localField: "_id") @value(localField: "_id")
  name: String @projection
  description: String @projection
  fullName: String @projection
  labels: [String]! @projection @arrayValue

  # fields from trait.platform::StatusEnabled
  status: Int @projection

  # fields from trait.platform::Sequenceable
  sequence: Int @projection

  # fields directly on website.model::Section
  site(input: WebsiteSectionSiteInput = {}): WebsiteSite @projection @refOne(loader: "platformProduct", criteria: "websiteSite")
  parent(input: WebsiteSectionParentInput = {}): WebsiteSection @projection @refOne(loader: "websiteSection")
  children(input: WebsiteSectionChildrenInput = {}): WebsiteSectionConnection! @projection(localField: "_id") @refMany(model: "website.Section", localField: "_id", foreignField: "parent.$id")
  logo: AssetImage @projection @refOne(loader: "platformAsset", criteria: "assetImage")
  coverImage: AssetImage @projection @refOne(loader: "platformAsset", criteria: "assetImage")
  "Website sections that are directly related to this section. Primarily used for Leaders Program context mapping."
  relatedSections(input: WebsiteSectionRelatedSectionsInput = {}): WebsiteSectionConnection! @projection @refMany(model: "website.Section")
  relatedSectionIds: [Int]! @projection(localField: "relatedSections")

  # fields from trait.platform::Content\SeoFields

  alias: String @projection
  redirects: [String]! @projection @arrayValue
  slug: String @projection

  # GraphQL-only fields.
  metadata: WebsiteSectionMetadata! @projection(localField: "fullName", needs: ["description", "seoTitle", "alias", "name"])
  # @todo should this be renamed to websitePath?
  canonicalPath: String! @projection(localField: "alias")
  # Determines if this content item should redirect to another location.
  redirectTo: String
  # Retrieves the flattened (parent) hierarchy for this section.
  hierarchy: [WebsiteSection!]! @projection(localField: "parent")
  # Whether this is a root website section
  isRoot: Boolean! @projection(localField: "parent")
}

type WebsiteSectionConnection @projectUsing(type: "WebsiteSection") {
  totalCount: Int!
  edges: [WebsiteSectionEdge]!
  pageInfo: PageInfo!
}

type WebsiteSectionEdge {
  node: WebsiteSection!
  cursor: String!
}

type WebsiteSectionMetadata {
  title: String
  description: String
}

type WebsiteSectionSitemapUrl {
  id: String! @value(localField: "_id")
  loc: String!
  lastmod: Date
  changefreq: SitemapChangeFreq!
  priority: Float!
}

enum WebsiteSectionSortField {
  id
  name
  fullName
  sequence
}

input WebsiteSectionSitemapUrlsQueryInput {
  siteId: ObjectID
  changefreq: SitemapChangeFreq = daily
  priority: Float = 0.7
  pagination: PaginationInput = { limit: null }
}

input WebsiteSectionQueryInput {
  siteId: ObjectID
  status: ModelStatus = active
  id: Int!
}

input WebsiteSectionAliasQueryInput {
  siteId: ObjectID
  status: ModelStatus = active
  alias: String!
}

input WebsiteSectionRedirectQueryInput {
  siteId: ObjectID
  status: ModelStatus = active
  alias: String!
}

input WebsiteSectionsQueryInput {
  siteId: ObjectID
  includeAliases: [String!] = []
  excludeAliases: [String!] = []
  includeIds: [Int!] = []
  excludeIds: [Int!] = []
  rootOnly: Boolean = false
  taxonomyIds: [Int!] = []
  relatedSectionIds: [Int!] = []
  status: ModelStatus = active
  sort: WebsiteSectionSortInput = {}
  pagination: PaginationInput = {}
}

input RootWebsiteSectionsQueryInput {
  siteId: ObjectID
  status: ModelStatus = active
  sort: WebsiteSectionSortInput = {}
  pagination: PaginationInput = {}
}

input WebsiteSectionsFromIdsQueryInput {
  siteId: ObjectID
  ids: [Int!]
  sort: WebsiteSectionSortInput = {}
  pagination: PaginationInput = {}
}

input WebsiteSectionSortInput {
  field: WebsiteSectionSortField = id
  order: SortOrder = desc
}

input WebsiteSectionSiteInput {
  status: ModelStatus = active
}

input WebsiteSectionParentInput {
  status: ModelStatus = active
}

input WebsiteSectionChildrenInput {
  status: ModelStatus = active
  sort: WebsiteSectionSortInput = {}
  pagination: PaginationInput = {}
}

input WebsiteSectionRelatedSectionsInput {
  status: ModelStatus = active
  sort: WebsiteSectionSortInput = {}
  pagination: PaginationInput = {}
}

input CreateWebsiteSectionMutationInput {
  name: String!
  alias: String!
  description: String
  labels: [String]
  status: Int
  sequence: Int
  redirects: [String]
  slug: String
  # Refs
  site: ObjectID!
  parent: Int
  logo: ObjectID
}

input UpdateWebsiteSectionMutationInput {
  id: Int!
  payload: UpdateWebsiteSectionMutationPayloadInput = {}
}

input UpdateWebsiteSectionMutationPayloadInput {
  name: String
  alias: String
  description: String
  labels: [String]
  status: Int
  sequence: Int
  redirects: [String]
  slug: String
  # Refs
  site: ObjectID
  parent: Int
  logo: ObjectID
}

`;
