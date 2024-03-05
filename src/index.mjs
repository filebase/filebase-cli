#! /usr/bin/env node
// threading setup
import os from "node:os";
const CPU_COUNT = os.cpus().length;
process.env.UV_THREADPOOL_SIZE = String(CPU_COUNT);
// node imports
import { constants as fsConstants } from "node:fs";
import { access, open, readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { homedir } from "node:os";
import { once } from "node:events";
// external imports
import { Command } from "commander";
import omelette from "omelette";
// application imports
import AuthModule from "./modules/auth.mjs";
import BucketModule from "./modules/bucket.mjs";
import GatewayModule from "./modules/gateway.mjs";
import NameModule from "./modules/name.mjs";
import ObjectModule from "./modules/object.mjs";
import PinModule from "./modules/pin.mjs";
import VersionModule from "./modules/version.mjs";
import UninstallModule from "./modules/uninstall.mjs";

(async () => {
  const program = new Command(),
    configRoot = resolve(homedir(), ".filebase"),
    configPath = resolve(configRoot, "config");

  program.hook("postAction", (thisCommand, actionCommand) => {
    process.exit(0);
  });

  try {
    await access(configPath, fsConstants.F_OK);
  } catch (err) {
    if (err.code === "ENOENT") {
      try {
        await mkdir(configRoot);
      } catch (dirErr) {
        if (dirErr.code !== "EEXIST") {
          throw dirErr;
        }
      }
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
    delete: async (key) => {
      delete currentConfig[key];
      await writeFile(configPath, JSON.stringify(currentConfig));
    },
    get: (key) => {
      if (typeof currentConfig[key] !== "undefined") {
        return currentConfig[key];
      } else if (key === "key") {
        return (
          process.env.FILEBASE_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID
        );
      } else if (key === "secret") {
        return (
          process.env.FILEBASE_SECRET_ACCESS_KEY ||
          process.env.AWS_SECRET_ACCESS_KEY
        );
      }
      return undefined;
    },
    clear: async () => {
      currentConfig = {};
      await rm(configPath);
    },
  };

  // Setup Auto Completion
  const completion = omelette("filebase").tree({
    auth: ["login", "bucket", "logout", "help"],
    bucket: ["create", "delete", "list", "privacy", "help"],
    gateway: ["create", "delete", "list", "toggle", "update", "help"],
    name: ["create", "import", "delete", "list", "toggle", "update", "help"],
    object: ["upload", "get", "download", "delete", "list", "copy", "help"],
    pin: ["create", "replace", "download", "get", "delete", "list", "help"],
    uninstall: [],
    version: [],
  });
  completion.init();

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
  new UninstallModule(program, credentials);
  new NameModule(program, credentials);
  new ObjectModule(program, credentials, stdin);
  new PinModule(program, credentials);
  new VersionModule(program);

  // Parse Modules and Start Program
  await program.parseAsync(process.argv);
})();
