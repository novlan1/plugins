const postcss = require('postcss');

const { postCssPluginRemoveSelector } = require('../src/index');

const input = `
.t-icon-arrow-down:before {
  content: 'e65e';
}

.t-icon-arrow-up:before {
  content: 'e65f';
}

.t-icon-invitation:before {
  content: 'e6d6';
}

.t-icon-like-o:before {
  content: 'e6d7';
}

#someId {
  color: red;
}
`;


test('exclude', async () => {
  const result = await postcss([postCssPluginRemoveSelector({
    list: [{
      file: 'abc',
      exclude: ['invitation', 'like-o'],
      selectorPattern: /^\.t-icon-[\w-]+:before$/,
    }],
  })]).process(input, { from: 'abc' });

  expect(result.css).toMatchSnapshot();
  expect(result.warnings()).toHaveLength(0);
});


test('include', async () => {
  const result = await postcss([postCssPluginRemoveSelector({
    list: [{
      file: 'abc',
      include: ['arrow-down', 'arrow-up'],
      selectorPattern: /^\.t-icon-[\w-]+:before$/,
    }],
  })]).process(input, { from: 'abc' });

  expect(result.css).toMatchSnapshot();
  expect(result.warnings()).toHaveLength(0);
});


test('include & exclude', async () => {
  const result = await postcss([postCssPluginRemoveSelector({
    list: [{
      file: 'abc',
      include: ['arrow-down', 'arrow-up'],
      exclude: ['invitation', 'like-o', 'arrow-up'],
      selectorPattern: /^\.t-icon-[\w-]+:before$/,
    }],
  })]).process(input, { from: 'abc' });

  expect(result.css).toMatchSnapshot();
  expect(result.warnings()).toHaveLength(0);
});


test('file is regexp', async () => {
  const result = await postcss([postCssPluginRemoveSelector({
    list: [{
      file: /tdesign\/uniapp\/dist\/icon/,
      include: ['arrow-down', 'arrow-up'],
      selectorPattern: /^\.t-icon-[\w-]+:before$/,
    }],
  })]).process(input, { from: 'tdesign/uniapp/dist/icon/icon.css' });

  expect(result.css).toMatchSnapshot();
  expect(result.warnings()).toHaveLength(0);
});


test('empty options', async () => {
  const result = await postcss([postCssPluginRemoveSelector()]).process(input, { from: 'tdesign/uniapp/dist/icon/icon.css' });

  expect(result.css).toMatchSnapshot();
  expect(result.warnings()).toHaveLength(0);
});


test('no selectorPattern - should not remove non-icon rules', async () => {
  const result = await postcss([postCssPluginRemoveSelector({
    list: [{
      file: 'abc',
      include: ['arrow-down'],
    }],
  })]).process(input, { from: 'abc' });

  expect(result.css).toMatchSnapshot();
  expect(result.warnings()).toHaveLength(0);
});


test('file not matched - should not modify css', async () => {
  const result = await postcss([postCssPluginRemoveSelector({
    list: [{
      file: 'not-matched-file',
      exclude: ['arrow-down'],
      selectorPattern: /^\.t-icon-[\w-]+:before$/,
    }],
  })]).process(input, { from: 'abc' });

  expect(result.css).toMatchSnapshot();
  expect(result.warnings()).toHaveLength(0);
});
