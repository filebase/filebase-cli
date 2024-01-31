import { PinManager } from "@filebase/sdk";

export default class PinModule {
  constructor(program, credentials) {
    program
      .command("pin create <key> <cid>")
      .option("-b, --bucket <bucket>")
      .option("-m, --metadata <metadata>")
      .description("creates a new pin with the specified key")
      .action(async (key, cid, options) => {
        const pinManager = new PinManager(
          credentials.get("key"),
          credentials.get("secret"),
        );
        let pinOptions = {};
        if (typeof options.bucket === "string") {
          pinOptions.bucket = options.bucket;
        }
        await pinManager.create(key, cid, options.metadata, pinOptions);
      });

    program
      .command("pin replace <requestid> <cid>")
      .option("-b, --bucket <bucket>")
      .option("-m, --metadata <metadata>")
      .option("-n, --name <name>")
      .description("replaces a pin with the specified cid")
      .action(async (requestid, cid, options) => {
        const pinManager = new PinManager(
          credentials.get("key"),
          credentials.get("secret"),
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

    program
      .command("pin download <cid>")
      .option("-b, --bucket <bucket>")
      .option("-d, --destination <destination>")
      .description("downloads a pin with the specified cid")
      .action(async (cid) => {
        const pinManager = new PinManager(
          credentials.get("key"),
          credentials.get("secret"),
          {
            endpoint: credentials.get("endpoint"),
            token: credentials.get("token"),
          },
        );
        await pinManager.download(cid);
      });

    program
      .command("pin get <requestid>")
      .option("-b, --bucket <bucket>")
      .description("gets information about a pin with the specified requestid")
      .action(async (requestid) => {
        const pinManager = new PinManager(
          credentials.get("key"),
          credentials.get("secret"),
        );
        await pinManager.get(requestid);
      });

    program
      .command("pin delete <requestid>")
      .option("-b, --bucket <bucket>")
      .description("deletes a pin with the specified requestid")
      .action(async (requestid) => {
        const pinManager = new PinManager(
          credentials.get("key"),
          credentials.get("secret"),
        );
        //TODO: Confirm with inquirer
        await pinManager.delete(requestid);
      });

    return program;
  }
}
