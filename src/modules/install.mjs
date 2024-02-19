export default class InstallModule {
  constructor(program, completion) {
    program
      .command("install")
      .description("installs the current version and setup autocomplete")
      .action(() => {
        completion.setupShellInitFile();
        console.log(`Installation Completed`);
      });

    program
      .command("uninstall")
      .description("uninstalls the current version")
      .action(() => {
        completion.cleanupShellInitFile();
        console.log(`Uninstallation Completed`);
      });
  }
}
