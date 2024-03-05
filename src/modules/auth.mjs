import inquirer from "inquirer";
import select from "@inquirer/select";
import { BucketManager, GatewayManager } from "@filebase/sdk";

export default class AuthModule {
  constructor(program, credentials) {
    const subcommand = program
      .command("auth")
      .description("login and set default bucket");

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
          await credentials.set("key", key);
          await credentials.set("secret", secret);
          if (typeof bucket === "string") {
            await credentials.set("bucket", bucket);
          } else {
            await this.promptDefaultBucket(credentials);
            await this.promptDefaultGateway(credentials);
          }
        },
      );

    subcommand
      .command("bucket [name]")
      .description("sets default bucket")
      .action(async (name = undefined) => {
        if (typeof name === "string") {
          await credentials.set("bucket", name);
        } else {
          await this.promptDefaultBucket(credentials);
        }
      });

    subcommand
      .command("gateway [endpoint]")
      .description("sets default gateway endpoint")
      .action(async (endpoint = undefined) => {
        if (typeof endpoint === "string") {
          await credentials.set("endpoint", endpoint);
        } else {
          await this.promptDefaultGateway(credentials);
        }
      });

    subcommand
      .command("logout")
      .description("logs out account")
      .action(async () => {
        await credentials.clear();
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
    } else {
      await credentials.delete("bucket");
    }
  }

  async promptDefaultGateway(credentials) {
    const gatewayManager = new GatewayManager(
      await credentials.get("key"),
      await credentials.get("secret"),
    );
    const gateways = (await gatewayManager.list()).map((gateway) => {
      const gatewayEndpoint =
        gateway.domain || `${gateway.name}.myfilebase.com`;
      return {
        name: `${gateway.name} (${gatewayEndpoint})`,
        value: `https://${gatewayEndpoint}`,
      };
    });
    const choices = [{ name: "No Selection", value: "No Selection" }]
      .concat(gateways)
      .concat([{ name: "Custom", value: "Custom" }]);
    const answer = await select({
      message: "Default Gateway:",
      choices,
    });
    if (answer === "No Selection") {
      await credentials.delete("endpoint");
    } else if (answer === "Custom") {
      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "endpoint",
          message: `Custom Endpoint:`,
        },
      ]);
      await credentials.set("endpoint", answers["endpoint"]);
    } else {
      await credentials.set("endpoint", answer);
    }
  }
}
