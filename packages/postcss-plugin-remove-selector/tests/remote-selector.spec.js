const postcss = require('postcss');

const plugin = require('../src/index');

const input = `
.press-icon-plus-arrow-down:before {
  content: 'e65e';
}

.press-icon-plus-arrow-up:before {
  content: 'e65f';
}

.press-icon-plus-invitation:before {
  content: 'e6d6';
}

.press-icon-plus-like-o:before {
  content: 'e6d7';
}

#someId {
  color: red;
}
`;


const getFullIconName = (name  =>  `.press-icon-plus-${name}:before`);

test('exclude', async () => {
  const result = await postcss([plugin({
    list: [{
      file: 'abc',
      exclude: ['invitation', 'like-o'].map(getFullIconName),
    }],
  })]).process(input, { from: 'abc' });

  expect(result.css).toMatchSnapshot();
  expect(result.warnings()).toHaveLength(0);
});


test('include', async () => {
  const result = await postcss([plugin({
    list: [{
      file: 'abc',
      include: ['arrow-down', 'arrow-up'].map(getFullIconName),
    }],
  })]).process(input, { from: 'abc' });

  expect(result.css).toMatchSnapshot();
  expect(result.warnings()).toHaveLength(0);
});


test('include & exclude', async () => {
  const result = await postcss([plugin({
    list: [{
      file: 'abc',
      include: ['arrow-down', 'arrow-up'].map(item => `.press-icon-plus-${item}:before`),
      exclude: ['invitation', 'like-o', 'arrow-up'].map(getFullIconName),
    }],
  })]).process(input, { from: 'abc' });

  expect(result.css).toMatchSnapshot();
  expect(result.warnings()).toHaveLength(0);
});


test('file is regexp', async () => {
  const result = await postcss([plugin({
    list: [{
      file: new RegExp('press-ui/press-icon-plus/css/icon.scss'),
      include: ['arrow-down', 'arrow-up'].map(getFullIconName),
    }],
  })]).process(input, { from: 'press-ui/press-icon-plus/css/icon.scss' });

  expect(result.css).toMatchSnapshot();
  expect(result.warnings()).toHaveLength(0);
});


test('empty options', async () => {
  const result = await postcss([plugin()]).process(input, { from: 'press-ui/press-icon-plus/css/icon.scss' });

  expect(result.css).toMatchSnapshot();
  expect(result.warnings()).toHaveLength(0);
});
