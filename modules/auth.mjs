import { Command } from "commander";

export default class AuthModule {
  constructor(program, credentials) {
    function makeAuthCommand() {
      const auth = new Command("auth");
      auth
        .command("auth login <key> <secret>")
        .description("logs into account")
        .action((key, secret) => {
          credentials.set("key", key);
          credentials.set("secret", secret);
        });

      auth
        .command("auth default bucket <name>")
        .description("sets default bucket")
        .action((name) => {
          credentials.set("bucket", name);
        });

      auth
        .command("auth logout")
        .description("logs out account")
        .action(() => {
          credentials.clear();
        });
      return auth;
    }
    program.addCommand(makeAuthCommand());
  }
}
