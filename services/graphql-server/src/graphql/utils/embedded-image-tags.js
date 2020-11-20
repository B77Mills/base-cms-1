const { extractEmbeddedTags } = require('@base-cms/embedded-media');
const { createAltFor, createSrcFor, createCaptionFor } = require('@base-cms/image');

module.exports = async (body, { imageHost, basedb }) => {
  if (!body) return [];
  const imageTags = extractEmbeddedTags(body).filter(tag => tag.type === 'image');
  return Promise.all(imageTags.map(async (tag) => {
    const image = await basedb.findById('platform.Asset', tag.id, {
      projection: {
        credit: 1,
        caption: 1,
        name: 1,
        fileName: 1,
        filePath: 1,
        cropDimensions: 1,
      },
    });
    if (!image) {
      tag.setValid(false);
      return tag;
    }
    // const defaultSize = ['left', 'right'].includes(tag.get('align')) ? '320' : '640';
    // const size = tag.get('size', defaultSize).replace('w', '');
    // @todo Adjust this. Hardcoding for now to allow for crisp images until proper w/h is handled.
    const size = '1440';

    tag.set('alt', createAltFor(image));
    tag.set('src', createSrcFor(imageHost, image, {
      w: size,
      fit: 'max',
      auto: 'format',
    }));
    tag.set('caption', createCaptionFor(image.caption));
    tag.set('credit', image.credit);
    return tag;
  }));
};
