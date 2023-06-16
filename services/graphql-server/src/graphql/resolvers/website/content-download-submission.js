module.exports = {
  /**
   *
   */
  Mutation: {
    /**
     *
     */
    createContentDownloadSubmission: async (_, { input }, { basedb }) => {
      const { payload, contentId } = input;
      const { ipAddress } = input;
      const clean = Object.keys(payload)
        .reduce((obj, key) => (payload[key] ? { ...obj, [key]: payload[key] } : obj), {});
      const document = {
        payload: clean,
        created: new Date(),
        contentId,
        ipAddress,
      };
      await basedb.insertOne('website.ContentDownloadSubmission', document);
      return document;
    },
  },
};
