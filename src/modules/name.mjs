import { NameManager } from "@filebase/sdk";
import Table from "tty-table";
import inquirer from "inquirer";

export default class NameModule {
  constructor(program, completion, credentials) {
    const subcommand = program
      .command("name")
      .description("create and manage names");

    subcommand
      .command("create <label> <cid>")
      .option("-e, --enabled <state>")
      .description("creates a new name with the specified label")
      .action(async (label, cid, options) => {
        const nameManager = new NameManager(
          await credentials.get("key"),
          await credentials.get("secret"),
        );
        let nameOptions = {};
        if (typeof options.enabled === "string") {
          nameOptions.enabled = options.enabled === "true";
        }
        await nameManager.create(label, cid, nameOptions);
      });

    subcommand
      .command("import <label> <cid> <privateKey>")
      .option("-e, --enabled <state>")
      .description("creates a new name with the specified label")
      .action(async (label, cid, privateKey, options) => {
        const nameManager = new NameManager(
          await credentials.get("key"),
          await credentials.get("secret"),
        );
        let nameOptions = {};
        if (typeof options.enabled === "string") {
          nameOptions.enabled = options.enabled === "true";
        }
        await nameManager.import(label, cid, privateKey, nameOptions);
      });

    subcommand
      .command("delete <label>")
      .description("deletes a name with the specified label")
      .action(async (label) => {
        const nameManager = new NameManager(
          await credentials.get("key"),
          await credentials.get("secret"),
        );
        const answers = await inquirer.prompt([
          {
            type: "input",
            name: "confirm_delete",
            message: `Are you sure you want to delete the name labeled [${label}]? Yes/No`,
          },
        ]);
        if (answers["confirm_delete"] === "Y") {
          await nameManager.delete(label);
          console.log(`Deleted Name: ${label}`);
        }
      });

    subcommand
      .command("list")
      .description("lists the names")
      .action(async () => {
        const nameManager = new NameManager(
          await credentials.get("key"),
          await credentials.get("secret"),
        );
        const names = await nameManager.list();
        const table = Table(
          [
            { value: "label" },
            { value: "network_key" },
            { value: "cid" },
            { value: "sequence" },
            { value: "enabled" },
            { value: "published_at" },
            { value: "created_at" },
            { value: "updated_at" },
          ],
          names,
          undefined,
          {
            borderStyle: "solid",
            borderColor: "white",
            truncate: true,
          },
        ).render();
        console.log(table);
      });

    subcommand
      .command("toggle <label> <state>")
      .description("toggles the enabled state of a name")
      .action(async (label, state) => {
        const nameManager = new NameManager(
          await credentials.get("key"),
          await credentials.get("secret"),
        );
        await nameManager.toggle(label, state);
      });

    subcommand
      .command("update <label> <cid>")
      .option("-e, --enabled <state>")
      .description("creates a new gateway with the specified name")
      .action(async (label, options) => {
        const nameManager = new NameManager(
          await credentials.get("key"),
          await credentials.get("secret"),
        );
        let nameOptions = {};
        if (typeof options.enabled === "string") {
          nameOptions.enabled = options.enabled === "true";
        }
        await nameManager.update(label, nameOptions);
      });

    return program;
  }
}
