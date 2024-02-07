import { ObjectManager } from "@filebase/sdk";
import inquirer from "inquirer";
import Table from "tty-table";

export default class ObjectModule {
  constructor(program, credentials) {
    const subcommand = program.command("object");

    subcommand
      .command("upload <key> <source>")
      .option("-m, --metadata <metadata>")
      .option("-b, --bucket <bucket>")
      .description("creates a new name with the specified label")
      .action(async (label, cid, options) => {
        const objectManager = new ObjectManager(
          await credentials.get("key"),
          await credentials.get("secret"),
        );
        //todo: fixup to support file and directory uploads based on the source
        let nameOptions = {};
        if (typeof options.enabled === "boolean") {
          nameOptions.enabled = options.enabled;
        }
        await objectManager.upload(label, cid, nameOptions);
      });

    subcommand
      .command("get <key>")
      .option("-b, --bucket <bucket>")
      .description("gets a object with the specified key")
      .action(async (key) => {
        const objectManager = new ObjectManager(
          await credentials.get("key"),
          await credentials.get("secret"),
        );
        await objectManager.get(key);
      });

    subcommand
      .command("download <key>")
      .option("-b, --bucket <bucket>")
      .option("-d, --destination <destination>")
      .description("downloads a object with the specified key")
      .action(async (key) => {
        const objectManager = new ObjectManager(
          await credentials.get("key"),
          await credentials.get("secret"),
        );
        await objectManager.download(key);
      });

    subcommand
      .command("delete <key>")
      .option("-b, --bucket <bucket>")
      .description("deletes a name with the specified label")
      .action(async (key) => {
        const objectManager = new ObjectManager(
          await credentials.get("key"),
          await credentials.get("secret"),
        );
        const answers = await inquirer.prompt([
          {
            type: "input",
            name: "confirm_delete",
            message: `Are you sure you want to delete the object with key [${key}]? Y/n`,
          },
        ]);
        if (answers["confirm_delete"] === "Y") {
          await objectManager.delete(key);
          console.log(`Deleted Object: ${key}`);
        }
      });

    subcommand
      .command("list")
      .option("-b, --bucket <bucket>")
      .description("lists the objects")
      .action(async () => {
        const objectManager = new ObjectManager(
          await credentials.get("key"),
          await credentials.get("secret"),
        );
        const objects = (await objectManager.list()).Contents;
        const table = Table(
          [
            { value: "Key", alias: "name" },
            { value: "CID", alias: "cid" },
            { value: "Size", alias: "size" },
            { value: "LastModified", alias: "last_modified" },
          ],
          objects,
          undefined,
          {
            borderStyle: "solid",
            borderColor: "white",
            truncate: true,
          },
        ).render();
        console.log(table);
      });

    subcommand
      .command("copy <key> <destinationBucket>")
      .option("-b, --bucket <bucket>")
      .option("-k, --key <destinationKey>")
      .description("copies the objects")
      .action(async (key, destinationBucket, options) => {
        const objectManager = new ObjectManager(
          await credentials.get("key"),
          await credentials.get("secret"),
        );
        let objectCopyOptions = {};
        await objectManager.copy(key, destinationBucket, objectCopyOptions);
      });

    return program;
  }
}
