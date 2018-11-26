const formatStatus = require('../../utils/format-status');

module.exports = {
  /**
   *
   */
  Query: {
    /**
     *
     */
    websiteSite: async (_, { input }, { basedb }) => {
      const { id, status } = input;
      return basedb.findOne('platform.Product', {
        _id: id,
        type: 'Site',
        ...formatStatus(status),
      });
    },
  },
};
