const ENV_FILE = '.env.local';

function readLocalEnv() {
  require('dotenv').config({ path: ENV_FILE });
}

readLocalEnv();
