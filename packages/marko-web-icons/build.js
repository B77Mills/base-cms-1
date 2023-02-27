const fs = require('fs');
const path = require('path');

const vue = ({ name, contents }) => `<template>
  <icon-wrapper
    name="${name}"
    :tag="tag"
    :block-name="blockName"
    :class-name="className"
    :modifiers="modifiers"
  >
    <!-- eslint-disable-next-line -->
    ${contents}
  </icon-wrapper>
</template>

<script>
import IconWrapper from './_wrapper.vue';

export default {
  components: { IconWrapper },
  props: {
    blockName: {
      type: String,
      default: 'marko-web-icon',
    },
    className: {
      type: String,
      default: null,
    },
    modifiers: {
      type: Array,
      default: () => ([]),
    },
    tag: {
      type: String,
      default: 'span',
    },
  },
};
</script>
`;

const build = () => {
  const svgPath = path.join(__dirname, 'svg');
  const dir = fs.readdirSync(svgPath);
  dir.forEach((filename) => {
    const filepath = path.join(svgPath, filename);
    const stats = fs.statSync(filepath);
    if (stats.isFile() && path.extname(filename) === '.svg') {
      const name = path.basename(filepath, '.svg');
      const contents = fs.readFileSync(filepath, 'utf8').toString();
      const template = vue({ name, contents });
      fs.writeFileSync(path.join(__dirname, 'browser', `${name}.vue`), template);
    }
  });
};

build();
