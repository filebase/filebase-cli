import { BucketManager } from "@filebase/sdk";

export default class BucketModule {
  constructor(program, credentials) {
    program
      .command("bucket create <name>")
      .description("creates a new bucket with the specified name")
      .action(async (name) => {
        const bucketManager = new BucketManager(
          credentials.get("key"),
          credentials.get("secret"),
        );
        await bucketManager.create(name);
      });

    program
      .command("bucket delete <name>")
      .description("deletes a bucket with the specified name")
      .action(async (name) => {
        const bucketManager = new BucketManager(
          credentials.get("key"),
          credentials.get("secret"),
        );
        //TODO: Confirm with inquirer
        await bucketManager.delete(name);
      });

    program
      .command("bucket list")
      .description("lists the buckets")
      .action(async (name) => {
        const bucketManager = new BucketManager(
          credentials.get("key"),
          credentials.get("secret"),
        );
        await bucketManager.list();
      });

    program
      .command("bucket privacy <name>")
      .description("lists the buckets")
      .action(async (name) => {
        const bucketManager = new BucketManager(
          credentials.get("key"),
          credentials.get("secret"),
        );
        await bucketManager.getPrivacy(name);
      });

    program
      .command("bucket privacy <name> <state>")
      .description("lists the buckets")
      .action(async (name, state) => {
        const bucketManager = new BucketManager(
          credentials.get("key"),
          credentials.get("secret"),
        );
        await bucketManager.setPrivacy(name, state);
      });

    return program;
  }
}
