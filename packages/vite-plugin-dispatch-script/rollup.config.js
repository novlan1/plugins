import { getRollupConfig } from '../../script/build/rollup.config.js';


export default getRollupConfig('', [], {
  fileUrl: import.meta.url,
});
