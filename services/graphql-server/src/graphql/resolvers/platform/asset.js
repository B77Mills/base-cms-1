const { createAltFor, createSrcFor, createCaptionFor } = require('@base-cms/image');

module.exports = {
  /**
   *
   */
  AssetImage: {
    src: (image, _, { imageHost }) => createSrcFor(imageHost, image, undefined, { w: 1200, auto: 'format' }),
    alt: image => createAltFor(image),
    caption: image => createCaptionFor(image.caption),
  },
};
