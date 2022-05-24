const fetch = require('node-fetch');
const {
  createAltFor,
  createSrcFor,
  createCaptionFor,
  cropRectangle,
} = require('@parameter1/base-cms-image');
const { Base4RestPayload } = require('@parameter1/base-cms-base4-rest-api');
const { ObjectID } = require('@parameter1/base-cms-db').MongoDB;
const validateRest = require('../../utils/validate-rest');
const buildProjection = require('../../utils/build-projection');
const getImageDimensions = require('../../utils/get-image-dimensions');
const defaults = require('../../defaults');
const { IMAGE_IMPORT_URL } = require('../../../env');

module.exports = {
  /**
   *
   */
  AssetImage: {
    src: async (image, { input = {} }, { site, basedb }) => {
      // Use site image host otherwise fallback to global default.
      const host = site.get('imageHost', defaults.imageHost);

      // when not using a crop rectangle, return the image src the same way as before
      if (!input.useCropRectangle) return createSrcFor(host, image, input.options, { w: 320, auto: 'format' });

      // otherwise, process the image width/height and create the crop rectangle
      const { width, height } = await getImageDimensions({ image, host, basedb });
      const rect = cropRectangle({
        width,
        height,
        cropDimensions: image.cropDimensions,
      });
      const { fileName, filePath } = image;

      // when a crop is detected, set the `rect` imgix property
      const opts = rect.isCropped() ? { ...input.options, rect } : input.options;
      return createSrcFor(host, { fileName, filePath }, opts, {});
    },
    alt: (image, { input = {} }) => createAltFor(image, input),
    caption: image => createCaptionFor(image.caption),
    cropRectangle: async (image, _, { site, basedb }) => {
      const host = site.get('imageHost', defaults.imageHost);
      const { width, height } = await getImageDimensions({ image, host, basedb });
      const { cropDimensions } = image;
      return cropRectangle({ width, height, cropDimensions });
    },
    primaryImageDisplay: image => image.primaryImageDisplay || 'center',
  },

  /**
   *
   */
  Mutation: {
    /**
     *
     */
    updateAssetImage: async (_, { input }, { base4rest, basedb }, info) => {
      validateRest(base4rest);
      const type = 'platform/asset/image';
      const { id, payload } = input;
      const keys = Object.keys(payload);
      const body = new Base4RestPayload({ type });
      keys.forEach(k => body.set(k, payload[k]));
      body.set('id', id);
      await base4rest.updateOne({ model: type, id, body });
      const projection = buildProjection({ info, type: 'AssetImage' });
      return basedb.findOne('platform.Asset', { _id: id }, { projection });
    },

    /**
     *
     */
    createAssetImageFromUrl: async (_, { input }, { tenant, base4rest, basedb }, info) => {
      validateRest(base4rest);
      if (!IMAGE_IMPORT_URL) throw new Error('Unable to upload image, missing IMAGE_IMPORT_URL.');
      const [account, group] = tenant.split('_');

      const { url } = input;
      const res = await fetch(IMAGE_IMPORT_URL, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account, group, url }),
      });
      if (!res.ok) throw new Error(res.statusText);
      const { fileName, filePath } = await res.json();

      const type = 'platform/asset/image';
      const body = (new Base4RestPayload({ type }))
        .set('fileName', fileName)
        .set('filePath', filePath)
        .set('source.location', url);
      const { data } = await base4rest.insertOne({ model: type, body });
      const projection = buildProjection({ info, type: 'AssetImage' });
      return basedb.findOne('platform.Asset', { _id: ObjectID(data.id) }, { projection });
    },
  },
};
