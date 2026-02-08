const MESSAGE_LIST = [
  {
    text: 'Press UI',
    link: 'https://novlan1.github.io/docs/press-ui/',
  },
  {
    link: 'https://novlan1.github.io/docs/next-admin/',
    text: 'Next Admin',
  },
];

export function getFooterMessage() {
  return MESSAGE_LIST
    .map(item => `<a href="${item.link}" target="_blank" style="text-decoration: none;">${item.text}</a>`)
    .join('<span style="width: 20px;display: inline-block;"> | </span>');
}
