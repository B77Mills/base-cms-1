const { magazinePublication: canonicalPathFor } = require('@parameter1/base-cms-canonical-path');
const { createTitle, createDescription } = require('../../utils/magazine-publication');

module.exports = {
  /**
   *
   */
  MagazinePublication: {
    canonicalPath: (publication, _, ctx) => canonicalPathFor(publication, ctx),
    metadata: (publication) => ({
      title: () => createTitle(publication),
      description: () => createDescription(publication),
    }),
  },
};
