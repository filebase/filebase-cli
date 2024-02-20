export default class VersionModule {
  constructor(program) {
    program
      .command("version")
      .description("prints the current version")
      .action(() => {
        console.log(`v0.0.1`);
      });
  }
}
