const { Base4RestPayload } = require('@parameter1/base-cms-base4-rest-api');
const { dasherize } = require('@parameter1/base-cms-inflector');
const { BaseDB, MongoDB } = require('@parameter1/base-cms-db');

const validateRest = require('../../utils/validate-rest');
const getProjection = require('../../utils/get-projection');

const { ObjectID } = MongoDB;

module.exports = {
  Mutation: {
    /**
     *
     */
    createMagazineSchedule: async (_, { input }, { basedb, base4rest }, info) => {
      validateRest(base4rest);

      const { contentId, issueId, sectionId } = input;

      const [content, issue, section] = await Promise.all([
        basedb.strictFindOne('platform.Content', { _id: contentId }, { projection: { type: 1 } }),
        basedb.strictFindOne('magazine.Issue', { _id: issueId }, { projection: { publication: 1 } }),
        basedb.strictFindOne('magazine.Section', { _id: sectionId }, { projection: { issue: 1, publication: 1 } }),
      ]);

      const publicationId = BaseDB.extractRefId(issue.publication);
      if (!publicationId) throw new Error(`Unable to extract a publication ID for issue ${issue._id}.`);

      const sectionPubId = BaseDB.extractRefId(section.publication);
      const sectionIssueId = BaseDB.extractRefId(section.issue);

      if (sectionPubId && `${sectionPubId}` !== `${publicationId}`) {
        throw new Error('The section publication ID does not match the issue publication ID.');
      }
      if (sectionIssueId && `${sectionIssueId}` !== `${issue._id}`) {
        throw new Error('The section issue ID does not match the issue ID.');
      }

      const body = new Base4RestPayload({ type: 'magazine/schedule' });
      body
        .set('status', 1)
        .setLink('product', { id: publicationId, type: 'magazine/product/publication' })
        .setLink('issue', { id: issue._id, type: 'magazine/issue' })
        .setLink('section', { id: section._id, type: 'magazine/section' })
        .setLink('content', { id: content._id, type: `platform/content/${dasherize(content.type)}` });

      const response = await base4rest.insertOne({ model: 'magazine/schedule', body });
      const id = ObjectID(response.data.id);

      const {
        fieldNodes,
        returnType,
        schema,
        fragments,
      } = info;
      const projection = getProjection(schema, returnType, fieldNodes[0].selectionSet, fragments);
      return basedb.findOne('magazine.Schedule', { _id: id }, { projection });
    },

    /**
     *
     */
    updateMagazineSchedule: async (_, { input }, { base4rest, basedb }, info) => {
      validateRest(base4rest);
      const { id, payload } = input;
      const {
        status,
        issueId,
        sectionId,
      } = payload;

      const [issue, section, schedule] = await Promise.all([
        basedb.strictFindOne('magazine.Issue', { _id: issueId }, { projection: { publication: 1 } }),
        basedb.strictFindOne('magazine.Section', { _id: sectionId }, { projection: { issue: 1, publication: 1 } }),
        basedb.strictFindOne('magazine.Schedule', { _id: id }, { projection: { _id: 1 } }),
      ]);

      const publicationId = BaseDB.extractRefId(issue.publication);
      if (!publicationId) throw new Error(`Unable to extract a publication ID for issue ${issue._id}.`);

      const sectionPubId = BaseDB.extractRefId(section.publication);
      const sectionIssueId = BaseDB.extractRefId(section.issue);

      if (sectionPubId && `${sectionPubId}` !== `${publicationId}`) {
        throw new Error('The section publication ID does not match the issue publication ID.');
      }
      if (sectionIssueId && `${sectionIssueId}` !== `${issue._id}`) {
        throw new Error('The section issue ID does not match the issue ID.');
      }

      const body = new Base4RestPayload({ type: 'magazine/schedule' });
      body
        .set('id', schedule._id)
        .set('status', status)
        .setLink('product', { id: publicationId, type: 'magazine/product/publication' })
        .setLink('issue', { id: issue._id, type: 'magazine/issue' })
        .setLink('section', { id: section._id, type: 'magazine/section' });

      await base4rest.updateOne({ model: 'magazine/schedule', id: schedule._id, body });

      const {
        fieldNodes,
        schema,
        fragments,
      } = info;
      const projection = getProjection(schema, schema.getType('MagazineSchedule'), fieldNodes[0].selectionSet, fragments);
      return basedb.strictFindOne('magazine.Schedule', { _id: schedule._id }, { projection });
    },

    /**
     *
     */
    deleteMagazineSchedule: async (_, { input }, { base4rest }) => {
      const { id } = input;
      validateRest(base4rest);
      await base4rest.removeOne({ model: 'magazine/schedule', id });
      return 'ok';
    },
  },
};
