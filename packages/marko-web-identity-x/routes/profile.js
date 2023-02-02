const gql = require('graphql-tag');
const { asyncRoute } = require('@parameter1/base-cms-utils');
const userFragment = require('../api/fragments/active-user');
const callHooksFor = require('../utils/call-hooks-for');

const mutation = gql`
  mutation UpdateUserProfile($input: UpdateOwnAppUserMutationInput!) {
    updateOwnAppUser(input: $input) {
      ...ActiveUserFragment
    }
  }

  ${userFragment}
`;

const consentAnswers = gql`
  mutation SetAppUserRegionalConsent($input: SetAppUserRegionalConsentMutationInput!) {
    setAppUserRegionalConsent(input: $input) {
      id
    }
  }
`;

const customBooleanFieldsMutation = gql`
  mutation SetAppUserCustomBooleanFields($input: UpdateOwnAppUserCustomBooleanAnswersMutationInput!) {
    updateOwnAppUserCustomBooleanAnswers(input: $input) {
      id
    }
  }
`;

const customSelectFieldsMutation = gql`
  mutation SetAppUserCustomSelectFields($input: UpdateOwnAppUserCustomSelectAnswersMutationInput!) {
    updateOwnAppUserCustomSelectAnswers(input: $input) {
      id
    }
  }
`;

module.exports = asyncRoute(async (req, res) => {
  const { identityX, body } = req;
  const {
    givenName,
    familyName,
    organization,
    organizationTitle,
    countryCode,
    regionCode,
    postalCode,
    city,
    street,
    addressExtra,
    phoneNumber,
    receiveEmail,
    regionalConsentAnswers,
    customBooleanFieldAnswers,
    customSelectFieldAnswers,
    additionalEventData = {},
  } = body;
  const input = {
    givenName,
    familyName,
    organization,
    organizationTitle,
    countryCode,
    regionCode,
    postalCode,
    city,
    street,
    addressExtra,
    phoneNumber,
    receiveEmail,
  };

  const answers = regionalConsentAnswers
    .map(answer => ({ policyId: answer.id, given: answer.given }));

  if (answers.length) {
    await identityX.client.mutate({ mutation: consentAnswers, variables: { input: { answers } } });
  }

  if (customBooleanFieldAnswers.length) {
    // only update custom questions when there some :)
    const customBooleanFieldsInput = customBooleanFieldAnswers.map(fieldAnswer => ({
      fieldId: fieldAnswer.field.id,
      // can either be true, false or null. convert null to false.
      // the form submit is effectively answers the question.
      value: Boolean(fieldAnswer.answer),
    }));
    await identityX.client.mutate({
      mutation: customBooleanFieldsMutation,
      variables: { input: { answers: customBooleanFieldsInput } },
    });
  }

  if (customSelectFieldAnswers.length) {
    // only update custom questions when there some :)
    const customSelectFieldsInput = customSelectFieldAnswers.map(fieldAnswer => ({
      fieldId: fieldAnswer.field.id,
      optionIds: fieldAnswer.answers.map(({ id }) => id),
      writeInValues: fieldAnswer.answers.reduce((arr, { id, writeInValue }) => ([
        ...arr,
        ...(writeInValue ? [{ optionId: id, value: writeInValue }] : []),
      ]), []),
    }));
    await identityX.client.mutate({
      mutation: customSelectFieldsMutation,
      variables: { input: { answers: customSelectFieldsInput } },
    });
  }

  const { data } = await identityX.client.mutate({ mutation, variables: { input } });
  const { updateOwnAppUser: user } = data;
  await callHooksFor(identityX, 'onUserProfileUpdate', {
    additionalEventData,
    ...(additionalEventData || {}),
    req,
    user,
  });
  res.json({ ok: true, user, additionalEventData });
});
