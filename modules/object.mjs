import { ObjectManager } from "@filebase/sdk";

export default class ObjectModule {
  constructor(program, credentials) {
    program
      .command("object upload <key> <source>")
      .option("-m, --metadata <metadata>")
      .option("-b, --bucket <bucket>")
      .description("creates a new name with the specified label")
      .action(async (label, cid, options) => {
        const objectManager = new ObjectManager(
          credentials.get("key"),
          credentials.get("secret"),
        );
        //todo: fixup to support file and directory uploads based on the source
        let nameOptions = {};
        if (typeof options.enabled === "boolean") {
          nameOptions.enabled = options.enabled;
        }
        await objectManager.upload(label, cid, nameOptions);
      });

    program
      .command("object get <key>")
      .option("-b, --bucket <bucket>")
      .description("gets a object with the specified key")
      .action(async (key) => {
        const objectManager = new ObjectManager(
          credentials.get("key"),
          credentials.get("secret"),
        );
        await objectManager.get(key);
      });

    program
      .command("object download <key>")
      .option("-b, --bucket <bucket>")
      .option("-d, --destination <destination>")
      .description("downloads a object with the specified key")
      .action(async (key) => {
        const objectManager = new ObjectManager(
          credentials.get("key"),
          credentials.get("secret"),
        );
        await objectManager.download(key);
      });

    program
      .command("object delete <key>")
      .option("-b, --bucket <bucket>")
      .description("deletes a name with the specified label")
      .action(async (key) => {
        const objectManager = new ObjectManager(
          credentials.get("key"),
          credentials.get("secret"),
        );
        //TODO: Confirm with inquirer
        await objectManager.delete(key);
      });

    program
      .command("object list")
      .option("-b, --bucket <bucket>")
      .description("lists the objects")
      .action(async () => {
        const objectManager = new ObjectManager(
          credentials.get("key"),
          credentials.get("secret"),
        );
        await objectManager.list();
      });

    program
      .command("object copy <key> <destinationBucket>")
      .option("-b, --bucket <bucket>")
      .option("-k, --key <destinationKey>")
      .description("copies the objects")
      .action(async (key, destinationBucket, options) => {
        const objectManager = new ObjectManager(
          credentials.get("key"),
          credentials.get("secret"),
        );
        let objectCopyOptions = {};
        await objectManager.copy(key, destinationBucket, objectCopyOptions);
      });

    return program;
  }
}
