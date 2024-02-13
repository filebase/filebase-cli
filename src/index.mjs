import { constants as fsConstants } from "node:fs";
import { access, open, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import { once } from "node:events";
import { Command } from "commander";
import omelette from "omelette";
import AuthModule from "./modules/auth.mjs";
import BucketModule from "./modules/bucket.mjs";
import GatewayModule from "./modules/gateway.mjs";
import NameModule from "./modules/name.mjs";
import ObjectModule from "./modules/object.mjs";
import PinModule from "./modules/pin.mjs";
import VersionModule from "./modules/version.mjs";

(async () => {
  const program = new Command(),
    configPath = resolve(tmpdir(), "filebase-cli", "main.config");

  program.hook("postAction", (thisCommand, actionCommand) => {
    process.exit(0);
  });

  try {
    await access(configPath, fsConstants.F_OK);
  } catch (err) {
    if (err.code === "ENOENT") {
      await (await open(configPath, "w")).close();
    } else {
      throw err;
    }
  }
  let currentConfig = await readFile(configPath, "utf-8");
  if (currentConfig === "") {
    currentConfig = {};
  } else {
    currentConfig = JSON.parse(currentConfig);
  }
  let credentials = {
    set: async (key, value) => {
      currentConfig[key] = value;
      await writeFile(configPath, JSON.stringify(currentConfig));
    },
    get: (key) => {
      return currentConfig[key];
    },
    clear: async () => {
      currentConfig = {};
      await writeFile(configPath, JSON.stringify(currentConfig));
    },
  };

  // Setup Auto Completion
  const completion = omelette(
    `filebase-cli <auth> <bucket> <gateway> <object> <name> <pin> <version>`,
  );

  // Handle Piped Input
  let stdin = "";
  if (!process.stdin.isTTY) {
    process.stdin.on("readable", function () {
      let chunk = this.read();
      if (chunk !== null) {
        stdin += chunk;
      }
    });
    await once(process.stdin, "end");
  }

  // Load Modules into Program
  new AuthModule(program, completion, credentials);
  new BucketModule(program, completion, credentials);
  new GatewayModule(program, completion, credentials);
  new NameModule(program, completion, credentials);
  new ObjectModule(program, completion, credentials, stdin);
  new PinModule(program, completion, credentials);
  new VersionModule(program);

  // Parse Modules and Start Program
  await program.parseAsync(process.argv);
  completion.init();
})();
