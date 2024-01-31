import { Command } from "commander";
import * as path from "node:path";
import * as os from "node:os";
import AuthModule from "./modules/auth.mjs";
import BucketModule from "./modules/bucket.mjs";
import GatewayModule from "./modules/gateway.mjs";
import NameModule from "./modules/name.mjs";
import ObjectModule from "./modules/object.mjs";
import PinModule from "./modules/pin.mjs";

const program = new Command(),
  configPath = path.resolve(os.tmpdir(), "filebase-cli", ".config");
let credentials = {
  set: () => {
    //TODO: Read config
    //TODO: Update config
    //TODO: Persist config
  },
  get: () => {
    //TODO: Read config
  },
  clear: () => {
    //TODO: Delete credentials section of config
  },
};

// Load Modules into Program
new AuthModule(program, credentials);
new BucketModule(program, credentials);
new GatewayModule(program, credentials);
new NameModule(program, credentials);
new ObjectModule(program, credentials);
new PinModule(program, credentials);

// Parse Modules and Start Program
program.parse();
