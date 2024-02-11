import fs from "node:fs";

export default class VersionModule {
  constructor(program) {
    program
      .command("version")
      .description("prints the current version")
      .action(() => {
        const { version } = JSON.parse(fs.readFileSync("./package.json"));
        console.log(`v${version}`);
      });
  }
}
