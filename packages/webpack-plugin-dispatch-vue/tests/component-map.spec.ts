import {
  formatComponentPath,
  genMoveComponents,
  replaceAllPolyfill,
} from '../src/helper';

replaceAllPolyfill();

describe('genMoveComponents', () => {
  it('genMoveComponents', () => {
    expect(genMoveComponents({
      component: 'views/index/local-component/ui/pages/user/home/components/guide-simulate/index',
      subPackage: 'views/index',
      outputDir: '/Users/yang/Documents/xxx/web/dist/build/mp-weixin',
    })).toEqual({
      sourceRef: '/views/index/local-component/ui/pages/user/home/components/guide-simulate/index',
      targetRef: '/views/index/views-index-lcu-pages-user-home-components-guide-simulate/index',
    });
  });
});


describe('formatComponentPath', () => {
  it('formatComponentPath', () => {
    expect(formatComponentPath([
      'index-tip-draggable-default',
      'a',
      'b',
      '/c',
    ], '../../local-component/ui/tip-match/tip-match-rank-award/index'))
      .toEqual({
        a: '/../../local-component/ui/tip-match/tip-match-rank-award/a',
        b: '/../../local-component/ui/tip-match/tip-match-rank-award/b',
        'index-tip-draggable-default': '/../../local-component/ui/tip-match/tip-match-rank-award/index-tip-draggable-default',
        '/c': '/c',
      });
  });


  it('slot', () => {
    expect(formatComponentPath([
      'index-tip-draggable-default',
    ], 'views/match-update/local-component/ui/tip-match/tip-match-rank-award/index')).toEqual({
      'index-tip-draggable-default': '/views/match-update/local-component/ui/tip-match/tip-match-rank-award/index-tip-draggable-default',
    });
  });
});


