import { PinManager } from "@filebase/sdk";
import inquirer from "inquirer";
import Table from "tty-table";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export default class PinModule {
  constructor(program, credentials) {
    const subcommand = program
      .command("pin")
      .description("create and manage pins");

    subcommand.hook("preAction", async (thisCommand, actionCommand) => {
      if (["download"].includes(actionCommand.name())) {
        return;
      }

      const options = thisCommand.opts();
      if (typeof options.bucket === "string") {
        return;
      }
      const defaultBucket = await credentials.get("bucket");
      if (typeof defaultBucket === "undefined") {
        throw new Error(
          `Bucket must be passed as an option if no default bucket is set!`,
        );
      }
    });

    subcommand
      .command("list")
      .description("lists the pins")
      .option("-b, --bucket <bucket>")
      .action(async () => {
        const options = program.opts();
        const pinManager = new PinManager(
          await credentials.get("key"),
          await credentials.get("secret"),
          {
            bucket: options.bucket || (await credentials.get("bucket")),
          },
        );
        const pins = (await pinManager.list()).results.map((pin) => {
          const newPinInfo = {
            ...pin,
            ...pin.pin,
          };
          newPinInfo.delegates = pin.delegates.join("\n");
          newPinInfo.info = JSON.stringify(pin.info);
          newPinInfo.meta = JSON.stringify(pin.pin.meta);
          return newPinInfo;
        });
        const table = Table(
          [
            { value: "requestid" },
            { value: "status" },
            { value: "created" },
            { value: "cid" },
            { value: "name" },
            { value: "origins" },
            { value: "meta" },
            { value: "delegates" },
            { value: "info" },
          ],
          pins,
          undefined,
          {
            borderStyle: "solid",
            borderColor: "white",
          },
        ).render();
        console.log(table);
      });

    subcommand
      .command("create <key> <cid>")
      .option("-b, --bucket <bucket>")
      .option("-m, --metadata <metadata>")
      .description("creates a new pin with the specified key")
      .action(async (key, cid) => {
        const options = program.opts();
        const pinManager = new PinManager(
          await credentials.get("key"),
          await credentials.get("secret"),
          {
            bucket: options.bucket || (await credentials.get("bucket")),
          },
        );
        let pinOptions = {};
        if (typeof options.metadata === "string") {
          pinOptions.metadata = options.metadata;
        }
        await pinManager.create(key, cid, options.metadata, pinOptions);
      });

    subcommand
      .command("replace <requestid> <cid>")
      .option("-b, --bucket <bucket>")
      .option("-m, --metadata <metadata>")
      .option("-n, --name <name>")
      .description("replaces a pin with the specified cid")
      .action(async (requestid, cid) => {
        const options = program.opts();
        const pinManager = new PinManager(
          await credentials.get("key"),
          await credentials.get("secret"),
          {
            bucket: options.bucket || (await credentials.get("bucket")),
          },
        );
        let pinOptions = {};
        if (typeof options.metadata === "string") {
          pinOptions.metadata = options.metadata;
        }
        if (typeof options.name === "string") {
          pinOptions.name = options.name;
        }
        await pinManager.replace(requestid, cid, pinOptions);
      });

    subcommand
      .command("download <cid> [outputPath]")
      .description("downloads a pin with the specified cid")
      .action(async (cid, output = undefined) => {
        const pinManager = new PinManager(
          await credentials.get("key"),
          await credentials.get("secret"),
          {
            gateway: {
              endpoint: await credentials.get("endpoint"),
              token: await credentials.get("token"),
            },
          },
        );
        const readStream = await pinManager.download(cid);
        await writeFile(
          output ? resolve(output) : resolve(process.cwd(), cid),
          readStream,
        );
      });

    subcommand
      .command("get <requestid>")
      .option("-b, --bucket <bucket>")
      .description("gets information about a pin with the specified requestid")
      .action(async (requestid) => {
        const options = program.opts();
        const pinManager = new PinManager(
          await credentials.get("key"),
          await credentials.get("secret"),
          {
            bucket: options.bucket || (await credentials.get("bucket")),
          },
        );
        const pin = await pinManager.get(requestid);
        const pinDetails = {
          ...pin,
          ...pin.pin,
        };
        pinDetails.delegates = pin.delegates.join("\n");
        pinDetails.info = JSON.stringify(pin.info);
        pinDetails.meta = JSON.stringify(pin.pin.meta);
        const table = Table(
          [
            { value: "requestid" },
            { value: "status" },
            { value: "created" },
            { value: "cid" },
            { value: "name" },
            { value: "origins" },
            { value: "meta" },
            { value: "delegates" },
            { value: "info" },
          ],
          [pinDetails],
          undefined,
          {
            borderStyle: "solid",
            borderColor: "white",
          },
        ).render();
        console.log(table);
      });

    subcommand
      .command("delete <requestid>")
      .option("-b, --bucket <bucket>")
      .description("deletes a pin with the specified requestid")
      .action(async (requestid) => {
        const options = program.opts();
        const pinManager = new PinManager(
          await credentials.get("key"),
          await credentials.get("secret"),
          {
            bucket: options.bucket || (await credentials.get("bucket")),
          },
        );
        const answers = await inquirer.prompt([
          {
            type: "input",
            name: "confirm_delete",
            message: `Are you sure you want to delete the pin with requestid [${requestid}]? Yes/No`,
          },
        ]);
        if (answers["confirm_delete"] === "Yes") {
          await pinManager.delete(requestid);
          console.log(`Deleted Pin: ${requestid}`);
        }
      });

    return program;
  }
}
