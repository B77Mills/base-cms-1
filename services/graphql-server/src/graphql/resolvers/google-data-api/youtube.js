const { get, getAsArray, getAsObject } = require('@parameter1/base-cms-object-path');
const googleDataApiClient = require('../../../google-data-api-client');

module.exports = {
  /**
   *
   */
  YoutubePlaylistConnection: {
    totalCount: response => get(response, 'pageInfo.totalResults', 0),
    pageInfo: response => ({
      hasNextPage: Boolean(get(response, 'nextPageToken')),
      endCursor: get(response, 'nextPageToken'),
    }),
    edges: response => getAsArray(response, 'items'),
  },
  /**
   *
   */
  YoutubePlaylistEdge: {
    node: edge => getAsObject(edge, 'snippet'),
    cursor: edge => get(edge, 'id'),
  },
  /**
   *
   */
  YoutubeVideo: {
    id: snippet => get(snippet, 'resourceId.videoId'),
    url: snippet => `https://youtu.be/${get(snippet, 'resourceId.videoId')}`,
    published: snippet => new Date(get(snippet, 'publishedAt')),
    thumbnail: (snippet, { input = {} }) => {
      const url = get(snippet, `thumbnails.${input.size}.url`, get(snippet, 'thumbnails.default.url'));
      // private/unlisted videos will not return a thumbnail. return a default icon instead.
      return url || 'https://i.ytimg.com/vi//hqdefault.jpg';
    },
  },
  /**
   *
   */
  Query: {
    /**
     *
     */
    validateYoutubePlaylistId: async (_, { input }) => {
      const { playlistId } = input;
      const response = await googleDataApiClient.request('youtube.playlistList', { part: 'id', id: playlistId });
      return getAsArray(response, 'items').length > 0;
    },
    validateYoutubeChannelId: async (_, { input }) => {
      const { channelId } = input;
      const response = await googleDataApiClient.request('youtube.channelList', { part: 'id', id: channelId });
      return getAsArray(response, 'items').length > 0;
    },
    validateYoutubeUsername: async (_, { input }) => {
      const { username } = input;
      const response = await googleDataApiClient.request('youtube.channelList', { part: 'id', forUsername: username });
      return getAsArray(response, 'items').length > 0;
    },
  },
};
