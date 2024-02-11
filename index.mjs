import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { Command } from "commander";
import knex from "knex";
import AuthModule from "./modules/auth.mjs";
import BucketModule from "./modules/bucket.mjs";
import GatewayModule from "./modules/gateway.mjs";
import NameModule from "./modules/name.mjs";
import ObjectModule from "./modules/object.mjs";
import PinModule from "./modules/pin.mjs";
import VersionModule from "./modules/version.mjs";

const program = new Command(),
  configPath = path.resolve(os.tmpdir(), "filebase-cli", "main.db");

program.hook("postAction", (thisCommand, actionCommand) => {
  process.exit(0);
});

try {
  await fs.promises.access(configPath, fs.constants.F_OK);
} catch (err) {
  if (err.code === "ENOENT") {
    await fs.promises.cp("./main.db", configPath);
  } else {
    throw err;
  }
}
const databaseClient = knex({
  client: "sqlite",
  connection: {
    filename: configPath,
  },
  useNullAsDefault: true,
});
let credentials = {
  set: async (key, value) => {
    await databaseClient("config")
      .insert({ key, value })
      .onConflict("key")
      .merge();
  },
  get: async (key) => {
    const value = await databaseClient("config").where("key", key).first();
    return value.value;
  },
  clear: async () => {
    await databaseClient("config").truncate();
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
