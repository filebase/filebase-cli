import inquirer from "inquirer";
import select from "@inquirer/select";
import { BucketManager } from "@filebase/sdk";

export default class AuthModule {
  constructor(program, credentials) {
    const subcommand = program.command("auth");

    subcommand
      .command("login [key] [secret] [bucket]")
      .description("logs into account")
      .action(
        async (key = undefined, secret = undefined, bucket = undefined) => {
          if (typeof key === "undefined" || typeof secret === "undefined") {
            let questions = [];
            if (typeof key === "undefined") {
              questions.push({
                type: "input",
                name: "s3_key",
                message: `Key:`,
              });
            }
            if (typeof secret === "undefined") {
              questions.push({
                type: "password",
                name: "s3_secret",
                message: `Secret:`,
              });
            }
            console.log(
              `S3 Credentials for Filebase can be found at https://console.filebase.com/keys`,
            );
            const answers = await inquirer.prompt(questions);
            key = key || answers["s3_key"];
            secret = secret || answers["s3_secret"];
          }
          credentials.set("key", key);
          credentials.set("secret", secret);
          if (typeof bucket === "string") {
            credentials.set("bucket", bucket);
          } else {
            await this.promptDefaultBucket(credentials);
          }
        },
      );

    subcommand
      .command("bucket [name]")
      .description("sets default bucket")
      .action(async (name = undefined) => {
        if (typeof name === "string") {
          credentials.set("bucket", name);
        } else {
          await this.promptDefaultBucket(credentials);
        }
      });

    subcommand
      .command("logout")
      .description("logs out account")
      .action(() => {
        credentials.clear();
      });
  }

  async promptDefaultBucket(credentials) {
    const bucketManager = new BucketManager(
      await credentials.get("key"),
      await credentials.get("secret"),
    );
    const buckets = (await bucketManager.list()).map((bucket) => {
      return bucket.Name;
    });
    const choices = [{ name: "No Selection", value: "No Selection" }].concat(
      buckets.map((bucket) => {
        return {
          name: bucket,
          value: bucket,
        };
      }),
    );
    const answer = await select({
      message: "Default Bucket:",
      choices,
    });
    if (answer !== "No Selection") {
      await credentials.set("bucket", answer);
    }
  }
}
