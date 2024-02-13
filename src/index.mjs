import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { Command } from "commander";
import AuthModule from "./modules/auth.mjs";
import BucketModule from "./modules/bucket.mjs";
import GatewayModule from "./modules/gateway.mjs";
import NameModule from "./modules/name.mjs";
import ObjectModule from "./modules/object.mjs";
import PinModule from "./modules/pin.mjs";
import VersionModule from "./modules/version.mjs";

(async () => {
  const program = new Command(),
    configPath = path.resolve(os.tmpdir(), "filebase-cli", "main.config");

  program.hook("postAction", (thisCommand, actionCommand) => {
    process.exit(0);
  });

  try {
    await fs.promises.access(configPath, fs.constants.F_OK);
  } catch (err) {
    if (err.code === "ENOENT") {
      await (await fs.promises.open(configPath, "w")).close();
    } else {
      throw err;
    }
  }
  let currentConfig = await fs.promises.readFile(configPath, "utf-8");
  if (currentConfig === "") {
    currentConfig = {};
  } else {
    currentConfig = JSON.parse(currentConfig);
  }
  let credentials = {
    set: async (key, value) => {
      currentConfig[key] = value;
      await fs.promises.writeFile(configPath, JSON.stringify(currentConfig));
    },
    get: async (key) => {
      return currentConfig[key];
    },
    clear: async () => {
      currentConfig = {};
      await fs.promises.writeFile(configPath, JSON.stringify(currentConfig));
    },
  };

  // Load Modules into Program
  new AuthModule(program, credentials);
  new BucketModule(program, credentials);
  new GatewayModule(program, credentials);
  new NameModule(program, credentials);
  new ObjectModule(program, credentials);
  new PinModule(program, credentials);
  new VersionModule(program);

  // Parse Modules and Start Program
  await program.parseAsync(process.argv);
})();
