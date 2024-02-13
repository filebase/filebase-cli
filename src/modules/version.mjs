import fs from "node:fs";

export default class VersionModule {
  constructor(program) {
    program
      .command("version")
      .description("prints the current version")
      .action(() => {
        console.log(`v1.0.0`);
      });
  }
}
