import { NameManager } from "@filebase/sdk";

export default class NameModule {
  constructor(program, credentials) {
    program
      .command("name create <label> <cid>")
      .option("-e, --enabled <state>")
      .description("creates a new name with the specified label")
      .action(async (label, cid, options) => {
        const nameManager = new NameManager(
          credentials.get("key"),
          credentials.get("secret"),
        );
        let nameOptions = {};
        if (typeof options.enabled === "boolean") {
          nameOptions.enabled = options.enabled;
        }
        await nameManager.create(label, cid, nameOptions);
      });

    program
      .command("name import <label> <cid> <privateKey>")
      .option("-e, --enabled <state>")
      .description("creates a new name with the specified label")
      .action(async (label, cid, privateKey, options) => {
        const nameManager = new NameManager(
          credentials.get("key"),
          credentials.get("secret"),
        );
        let nameOptions = {};
        if (typeof options.enabled === "boolean") {
          nameOptions.enabled = options.enabled;
        }
        await nameManager.import(label, cid, privateKey, nameOptions);
      });

    program
      .command("name delete <label>")
      .description("deletes a name with the specified label")
      .action(async (label) => {
        const nameManager = new NameManager(
          credentials.get("key"),
          credentials.get("secret"),
        );
        //TODO: Confirm with inquirer
        await nameManager.delete(label);
      });

    program
      .command("name list")
      .description("lists the names")
      .action(async () => {
        const nameManager = new NameManager(
          credentials.get("key"),
          credentials.get("secret"),
        );
        await nameManager.list();
      });

    program
      .command("name toggle <label> <state>")
      .description("toggles the enabled state of a name")
      .action(async (label, state) => {
        const nameManager = new NameManager(
          credentials.get("key"),
          credentials.get("secret"),
        );
        await nameManager.toggle(label, state);
      });

    program
      .command("name update <label> <cid>")
      .option("-e, --enabled <state>")
      .description("creates a new gateway with the specified name")
      .action(async (label, options) => {
        const nameManager = new NameManager(
          credentials.get("key"),
          credentials.get("secret"),
        );
        let nameOptions = {};
        if (typeof options.enabled === "boolean") {
          nameOptions.enabled = options.enabled;
        }
        await nameManager.update(label, nameOptions);
      });

    return program;
  }
}
