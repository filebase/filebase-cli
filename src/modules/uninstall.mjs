import { dirname } from "node:path";
import { rm, rmdir } from "node:fs/promises";

export default class UninstallModule {
  constructor(program, credentials) {
    program
      .command("uninstall")
      .description("uninstalls the current version")
      .action(async () => {
        await credentials.clear();
        let removalPath = process.argv[1];
        if (process.platform === "win32") {
          removalPath = dirname(removalPath);
          await rmdir(removalPath);
        } else {
          await rm(removalPath);
        }
        console.log(`Uninstallation Completed.`);
      });
  }
}
