import { resolve } from "node:path";
import { rm, rmdir } from "node:fs/promises";

export default class InstallModule {
  constructor(program, credentials) {
    program
      .command("uninstall")
      .description("uninstalls the current version")
      .action(async () => {
        await credentials.clear();
        let removalPath;
        if (process.platform === "win32") {
          removalPath = resolve(process.env.ProgramFiles, "filebase");
          await rmdir(removalPath);
        } else {
          if (process.env.PATH.indexOf("/usr/local/bin:") !== -1) {
            removalPath = "/usr/local/bin";
          } else if (process.env.PATH.indexOf("/usr/bin:") !== -1) {
            removalPath = "/usr/bin";
          } else if (process.env.PATH.indexOf("/bin:") !== -1) {
            removalPath = "/usr/bin";
          } else {
            throw new Error("Unable to find valid installation path");
          }
          removalPath = resolve(removalPath, "filebase");
          await rm(removalPath);
        }
        console.log(`Uninstallation Completed.`);
      });
  }
}
