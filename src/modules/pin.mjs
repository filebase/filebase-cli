import { PinManager } from "@filebase/sdk";
import inquirer from "inquirer";
import Table from "tty-table";

export default class PinModule {
  constructor(program, credentials) {
    const subcommand = program
      .command("pin")
      .description("create and manage pins");

    subcommand
      .command("list")
      .description("lists the pins")
      .action(async () => {
        const pinManager = new PinManager(
          await credentials.get("key"),
          await credentials.get("secret"),
          {
            bucket: await credentials.get("bucket"),
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
      .action(async (key, cid, options) => {
        const pinManager = new PinManager(
          await credentials.get("key"),
          await credentials.get("secret"),
          {
            bucket: await credentials.get("bucket"),
          },
        );
        let pinOptions = {};
        if (typeof options.bucket === "string") {
          pinOptions.bucket = options.bucket;
        }
        await pinManager.create(key, cid, options.metadata, pinOptions);
      });

    subcommand
      .command("replace <requestid> <cid>")
      .option("-b, --bucket <bucket>")
      .option("-m, --metadata <metadata>")
      .option("-n, --name <name>")
      .description("replaces a pin with the specified cid")
      .action(async (requestid, cid, options) => {
        const pinManager = new PinManager(
          await credentials.get("key"),
          await credentials.get("secret"),
          {
            bucket: await credentials.get("bucket"),
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
      .command("download <cid>")
      .option("-b, --bucket <bucket>")
      .option("-d, --destination <destination>")
      .description("downloads a pin with the specified cid")
      .action(async (cid) => {
        const pinManager = new PinManager(
          await credentials.get("key"),
          await credentials.get("secret"),
          {
            endpoint: await credentials.get("endpoint"),
            token: await credentials.get("token"),
          },
        );
        await pinManager.download(cid);
      });

    subcommand
      .command("get <requestid>")
      .option("-b, --bucket <bucket>")
      .description("gets information about a pin with the specified requestid")
      .action(async (requestid) => {
        const pinManager = new PinManager(
          await credentials.get("key"),
          await credentials.get("secret"),
          {
            bucket: await credentials.get("bucket"),
          },
        );
        await pinManager.get(requestid);
      });

    subcommand
      .command("delete <requestid>")
      .option("-b, --bucket <bucket>")
      .description("deletes a pin with the specified requestid")
      .action(async (requestid) => {
        const pinManager = new PinManager(
          await credentials.get("key"),
          await credentials.get("secret"),
          {
            bucket: await credentials.get("bucket"),
          },
        );
        const answers = await inquirer.prompt([
          {
            type: "input",
            name: "confirm_delete",
            message: `Are you sure you want to delete the pin with requestid [${requestid}]? Yes/No`,
          },
        ]);
        if (answers["confirm_delete"] === "Y") {
          await pinManager.delete(requestid);
          console.log(`Deleted Pin: ${requestid}`);
        }
      });

    return program;
  }
}
