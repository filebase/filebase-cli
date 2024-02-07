import { Command } from "commander";

export default class AuthModule {
  constructor(program, credentials) {
    const subcommand = program.command("auth");

    subcommand
      .command("login <key> <secret> [bucket]")
      .description("logs into account")
      .action((key, secret, bucket = undefined) => {
        credentials.set("key", key);
        credentials.set("secret", secret);
        if (typeof bucket === "string") {
          credentials.set("bucket", bucket);
        }
      });

    subcommand
      .command("bucket <name>")
      .description("sets default bucket")
      .action((name) => {
        credentials.set("bucket", name);
      });

    subcommand
      .command("logout")
      .description("logs out account")
      .action(() => {
        credentials.clear();
      });
  }
}
