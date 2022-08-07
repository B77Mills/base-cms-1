const gql = require('graphql-tag');

module.exports = gql`

extend type Query {
  emailNewsletter(input: EmailNewsletterQueryInput!): EmailNewsletter @findOne(
    model: "platform.Product",
    withSite: true,
    siteField: "siteId",
    using: { id: "_id" },
    criteria: "emailNewsletter"
  )
  emailNewsletterAlias(input: EmailNewsletterAliasQueryInput!): EmailNewsletter @findOne(
    model: "platform.Product",
    withSite: true,
    siteField: "siteId",
    using: { alias: "alias" },
    criteria: "emailNewsletter"
  )
  emailNewsletters(input: EmailNewslettersQueryInput = {}): EmailNewsletterConnection! @findMany(
    model: "platform.Product",
    withSite: true,
    siteField: "siteId",
    criteria: "emailNewsletter"
  )
}

extend type Mutation {
  updateEmailNewsletterProvider(input: UpdateEmailNewsletterProviderInput!): EmailNewsletter! @requiresAuth
}

type EmailNewsletter {
  # fields from platform.model::Product
  id: ObjectID! @projection(localField: "_id") @value(localField: "_id")
  name: String @projection
  fullName: String @projection
  tagLine: String @projection
  description: String @projection
  logo: String @projection

  # fields from platform.trait::StatusEnabled
  status: Int @projection

  # fields from email.model::Product
  provider: EmailProductStubProvider @projection
  sourceProvider: EmailProductStubHtmlSourceProvider @projection
  defaultTesters: [EmailCampaignTestRecipient]! @projection @arrayValue
  defaultFromName: String @projection
  defaultSubjectLine: String @projection

  # fields directly on email.model::Product\Newsletter
  parent(input: EmailNewsletterParentInput = {}): EmailNewsletter @projection @refOne(loader: "platformProducts", criteria: "emailNewsletter")
  sections(input: EmailNewsletterSectionsInput = {}): EmailSectionConnection! @projection(localField: "_id") @refMany(model: "email.Section", localField: "_id", foreignField: "deployment.$id")
  alias: String @projection
  usesDeploymentDates: Boolean @projection
  teaser: String @projection

  # GraphQL-only fields.
  site(input: EmailNewsletterSiteInput = {}): WebsiteSite @projection(localField: "siteId") @refOne(loader: "platformProduct", localField: "siteId", criteria: "websiteSite")
  campaigns(input: EmailNewsletterCampaignsInput = {}): EmailCampaignConnection @projection(localField: "_id") @refMany(
    model: "email.Campaign",
    localField: "_id",
    foreignField: "product.$id",
    refQueryBuilder: "emailNewsletterCampaigns"
  )

  "Loads all alpha configuration objects for this newsletter, if present."
  alphaThemeConfigs(input: EmailNewsletterAlphaConfigInput = {}): EmailThemeAlphaConfigConnection! @projection @refMany(
    model: "configuration.Email",
    criteria: "emailThemeAlphaConfig",
    localField: "_id",
    foreignField: "newsletter"
  )
}

type EmailNewsletterConnection @projectUsing(type: "EmailNewsletter") {
  totalCount: Int!
  edges: [EmailNewsletterEdge]!
  pageInfo: PageInfo!
}

type EmailNewsletterEdge {
  node: EmailNewsletter!
  cursor: String!
}

type EmailProductStubProvider {
  type: String
  providerId: String
  attributes: JSON
}

type EmailProductStubHtmlSourceProvider {
  handlerKey: String
  host: String
  path: String
}

enum EmailNewsletterSortField {
  id
  name
  fullName
  sequence
}

input EmailNewsletterAlphaConfigInput {
  status: ModelStatus = active
  sort: EmailThemeAlphaConfigSortInput = {}
}

input EmailNewsletterQueryInput {
  id: ObjectID!
  siteId: ObjectID
  status: ModelStatus = active
}

input EmailNewsletterAliasQueryInput {
  siteId: ObjectID
  status: ModelStatus = active
  alias: String!
}

input EmailNewslettersQueryInput {
  siteId: ObjectID
  status: ModelStatus = active
  sort: EmailNewsletterSortInput = {}
  pagination: PaginationInput = {}
}

input EmailNewsletterCampaignsInput {
  scheduledAfter: Date
  scheduledBefore: Date
  status: ModelStatus = active
  sort: EmailCampaignSortInput = {}
  pagination: PaginationInput = {}
}

input EmailNewsletterParentInput {
  status: ModelStatus = active
}

input EmailNewsletterSectionsInput {
  status: ModelStatus = active
  sort: EmailSectionSortInput = {}
  pagination: PaginationInput = {}
}

input EmailNewsletterSiteInput {
  status: ModelStatus = active
}

input EmailNewsletterSortInput {
  field: EmailNewsletterSortField = id
  order: SortOrder = desc
}

input UpdateEmailNewsletterProviderInput {
  "The id of the newsletter product to update the provider information for"
  id: ObjectID!
  "The provider type for the email service provider (typically set to omeda)"
  type: String
  "The provider id for the newsletter product from an email service provider"
  providerId: String
  "The key-values to append to the newsletter provider attributes. Send ``null`` value to unset a key."
  attributes: JSON
}

`;
