const gql = require('graphql-tag');

module.exports = gql`

extend type Query {
  emailSchedule(input: EmailScheduleQueryInput!): EmailSchedule @findOne(
    model: "email.Schedule",
    using: { id: "_id" },
  )
  contentEmailSchedules(input: ContentEmailSchedulesQueryInput!): EmailScheduleConnection! @findMany(
    model: "email.Schedule",
    using: { contentId: "content.$id" },
  )
  "Query for newsletter schedules by newlsetter product id and specified date range"
  newsletterEmailSchedules(input: NewsletterEmailSchedulesQueryInput!): [EmailSchedule]!
}

extend type Mutation {
  quickCreateEmailSchedules(input: QuickCreateEmailSchedulesMutationInput!): [EmailSchedule!]!
  updateEmailSchedule(input: UpdateEmailScheduleMutationInput!): EmailSchedule!
  deleteEmailSchedule(input: DeleteEmailScheduleMutationInput!): String!
}

type EmailSchedule {
  # fields from email.model::Schedule
  id: ObjectID! @projection(localField: "_id") @value(localField: "_id")
  newsletter(input: EmailScheduleNewsletterInput = {}): EmailNewsletter! @projection(localField: "product") @refOne(
    loader: "platformProduct",
    localField: "product"
    criteria: "emailNewsletter",
  )
  content(input: EmailScheduleContentInput = {}): Content! @projection @refOne(
    loader: "platformContent",
    criteria: "content"
  )
  section(input: EmailScheduleSectionInput = {}): EmailSection! @projection @refOne(loader: "emailSection")
  deploymentDate: Date! @projection
  sequence: Int @projection

  # fields from trait.platform::StatusEnabled
  status: Int @projection
}

enum EmailScheduleSortField {
  id
  deploymentDate
}

type EmailScheduleConnection @projectUsing(type: "EmailSchedule") {
  totalCount: Int!
  edges: [EmailScheduleEdge]!
  pageInfo: PageInfo!
}

type EmailScheduleEdge {
  node: EmailSchedule!
  cursor: String!
}

input DeleteEmailScheduleMutationInput {
  id: ObjectID!
}

input EmailScheduleNewsletterInput {
  status: ModelStatus = active
}

input EmailScheduleContentInput {
  status: ModelStatus = active
}

input EmailScheduleSectionInput {
  status: ModelStatus = active
}

input EmailScheduleQueryInput {
  status: ModelStatus = active
  id: ObjectID!
}

input ContentEmailSchedulesQueryInput {
  contentId: Int!
  status: ModelStatus = active
  sort: EmailScheduleSortInput = {}
  pagination: PaginationInput = {}
}

input EmailScheduleSortInput {
  field: EmailScheduleSortField = id
  order: SortOrder = desc
}

"Input for retrieiving newsletter schedules for a specified time range"
input NewsletterEmailSchedulesQueryInput {
  "The newsletter product id"
  newsletterId: ObjectID!
  "The millisecond precision UNIX timestamp to start looking for schedules at (inclusive)"
  after: Date!
  "The millsecond precision UNIX timestamp to stop looking for schedules at (inclusive"
  before: Date!
}

input QuickCreateEmailSchedulesMutationInput {
  contentId: Int!
  sectionIds: [Int!]!
  deploymentDates: [Date!]!
  sequence: Int = 0
}

input UpdateEmailScheduleMutationInput {
  id: ObjectID!
  payload: UpdateEmailSchedulePayloadInput!
}

input UpdateEmailSchedulePayloadInput {
  status: Int = 1
  sectionId: Int!
  deploymentDate: Date!
  sequence: Int
}

`;
