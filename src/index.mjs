import { constants as fsConstants } from "node:fs";
import { access, open, readFile, writeFile, mkdir } from "node:fs/promises";
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
import InstallModule from "./modules/install.mjs";

(async () => {
  const program = new Command(),
    configRoot = resolve(tmpdir(), "filebase-cli"),
    configPath = resolve(configRoot, "main.config");

  program.hook("postAction", (thisCommand, actionCommand) => {
    process.exit(0);
  });

  try {
    await access(configPath, fsConstants.F_OK);
  } catch (err) {
    if (err.code === "ENOENT") {
      await mkdir(configRoot);
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
  const completion = omelette("filebase|fb")
    .tree({
      auth: ["login", "bucket", "logout", "help"],
      bucket: ["create", "delete", "list", "privacy", "help"],
      gateway: ["create", "delete", "list", "toggle", "update", "help"],
      name: ["create", "import", "delete", "list", "toggle", "update", "help"],
      object: ["upload", "get", "download", "delete", "list", "copy", "help"],
      pin: ["create", "replace", "download", "get", "delete", "list", "help"],
      version: [],
    })
    .init();

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
  new AuthModule(program, credentials);
  new BucketModule(program, credentials);
  new GatewayModule(program, credentials);
  new InstallModule(program, completion);
  new NameModule(program, credentials);
  new ObjectModule(program, credentials, stdin);
  new PinModule(program, credentials);
  new VersionModule(program);

  // Parse Modules and Start Program
  await program.parseAsync(process.argv);
})();
