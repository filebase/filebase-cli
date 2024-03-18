import { dirname } from "node:path";
import { rm, rmdir } from "node:fs/promises";
import inquirer from "inquirer";

export default class UninstallModule {
  constructor(program, credentials) {
    program
      .command("uninstall")
      .description("uninstalls the current version")
      .action(async () => {
        const answers = await inquirer.prompt([
          {
            type: "input",
            name: "confirm_uninstall",
            message: `Are you sure you want to uninstall the Filebase CLI? Yes/No`,
          },
        ]);
        if (answers["confirm_uninstall"] === "Yes") {
          await credentials.clear();
          let removalPath = process.argv[1];
          if (process.platform === "win32") {
            removalPath = dirname(removalPath);
            await rmdir(removalPath);
          } else {
            await rm(removalPath);
          }
          console.log(`Uninstallation Completed.`);
        }
      });
  }
}
