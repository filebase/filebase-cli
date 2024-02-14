import { BucketManager } from "@filebase/sdk";
import Table from "tty-table";
import inquirer from "inquirer";

export default class BucketModule {
  constructor(program, credentials) {
    const subcommand = program
      .command("bucket")
      .description("create and manage buckets");

    subcommand
      .command("create <name>")
      .description("creates a new bucket with the specified name")
      .action(async (name) => {
        const bucketManager = new BucketManager(
          await credentials.get("key"),
          await credentials.get("secret"),
        );
        await bucketManager.create(name);
      });

    subcommand
      .command("delete <name>")
      .description("deletes a bucket with the specified name")
      .action(async (name) => {
        const bucketManager = new BucketManager(
          await credentials.get("key"),
          await credentials.get("secret"),
        );
        const answers = await inquirer.prompt([
          {
            type: "input",
            name: "confirm_delete",
            message: `Are you sure you want to delete the bucket named [${name}]? Yes/No`,
          },
        ]);
        if (answers["confirm_delete"] === "Y") {
          await bucketManager.delete(name);
          console.log(`Deleted Bucket: ${name}`);
        }
      });

    subcommand
      .command("list")
      .description("lists the buckets")
      .action(async () => {
        const bucketManager = new BucketManager(
          await credentials.get("key"),
          await credentials.get("secret"),
        );
        const buckets = await bucketManager.list();
        const table = Table(
          [
            { value: "Name", alias: "name" },
            { value: "CreationDate", alias: "date created" },
          ],
          buckets,
          undefined,
          {
            borderStyle: "solid",
            borderColor: "white",
          },
        ).render();
        console.log(table);
      });

    subcommand
      .command("privacy <name> [target]")
      .description("lists the buckets privacy")
      .action(async (name, target = undefined) => {
        const bucketManager = new BucketManager(
          await credentials.get("key"),
          await credentials.get("secret"),
        );
        if (typeof target === "string") {
          await bucketManager.setPrivacy(name, target === "true");
        } else {
          const state = await bucketManager.getPrivacy(name);
          console.log(state ? "Private" : "Public");
        }
      });
  }
}
