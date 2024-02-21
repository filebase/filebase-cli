import { resolve } from "node:path";
import { copyFile, rm, rmdir } from "node:fs/promises";

export default class InstallModule {
  constructor(program, credentials) {
    program
      .command("install")
      .description("installs the current version and setup autocomplete")
      .action(async () => {
        let destinationPath;
        if (process.platform === "win32") {
          destinationPath = resolve(
            process.env.ProgramFiles,
            "filebase/filebase.exe",
          );
        } else {
          if (process.env.PATH.indexOf("/usr/local/bin:") !== -1) {
            destinationPath = "/usr/local/bin";
          } else if (process.env.PATH.indexOf("/usr/bin:") !== -1) {
            destinationPath = "/usr/bin";
          } else if (process.env.PATH.indexOf("/bin:") !== -1) {
            destinationPath = "/usr/bin";
          } else {
            throw new Error("Unable to find valid installation path");
          }
          destinationPath = resolve(destinationPath, "filebase");
        }
        if (process.execPath === destinationPath) {
          console.log(`Already Installed [${destinationPath}]`);
          return;
        }
        await copyFile(process.execPath, destinationPath);
        console.log(`Installation Completed [${destinationPath}]`);
      });

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
        console.log(`Uninstallation Completed`);
      });
  }
}
