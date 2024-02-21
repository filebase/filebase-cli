import { GatewayManager } from "@filebase/sdk";
import Table from "tty-table";
import inquirer from "inquirer";

export default class GatewayModule {
  constructor(program, credentials) {
    const subcommand = program
      .command("gateway")
      .description("create and manage gateways");

    subcommand
      .command("create <name>")
      .option("-d, --domain <domain>")
      .option("-e, --enabled <state>")
      .option("-p, --private <private>")
      .description("creates a new gateway with the specified name")
      .action(async (name, options) => {
        const gatewayManager = new GatewayManager(
          await credentials.get("key"),
          await credentials.get("secret"),
        );
        let gatewayOptions = {};
        if (typeof options.domain === "string") {
          gatewayOptions.domain = options.domain;
        }
        if (typeof options.enabled === "string") {
          gatewayOptions.enabled = options.enabled === "true";
        }
        if (typeof options.private === "string") {
          gatewayOptions.private = options.private === "true";
        }
        await gatewayManager.create(name, gatewayOptions);
      });

    subcommand
      .command("delete <name>")
      .description("deletes a gateway with the specified name")
      .action(async (name) => {
        const gatewayManager = new GatewayManager(
          await credentials.get("key"),
          await credentials.get("secret"),
        );
        const answers = await inquirer.prompt([
          {
            type: "input",
            name: "confirm_delete",
            message: `Are you sure you want to delete the gateway named [${name}]? Yes/No`,
          },
        ]);
        if (answers["confirm_delete"] === "Yes") {
          await gatewayManager.delete(name);
          console.log(`Deleted Gateway: ${name}`);
        }
      });

    subcommand
      .command("list")
      .description("lists the gateways")
      .action(async () => {
        const gatewayManager = new GatewayManager(
          await credentials.get("key"),
          await credentials.get("secret"),
        );
        const gateways = await gatewayManager.list();
        const table = Table(
          [
            { value: "name" },
            { value: "domain" },
            { value: "enabled" },
            { value: "private" },
            { value: "created_at" },
            { value: "updated_at" },
          ],
          gateways,
          undefined,
          {
            borderStyle: "solid",
            borderColor: "white",
          },
        ).render();
        console.log(table);
      });

    subcommand
      .command("toggle <name> <state>")
      .description("toggles the enabled state of a gateway")
      .action(async (name, state) => {
        const gatewayManager = new GatewayManager(
          await credentials.get("key"),
          await credentials.get("secret"),
        );
        await gatewayManager.toggle(name, state);
      });

    subcommand
      .command("update <name>")
      .option("-d, --domain <domain>")
      .option("-e, --enabled <state>")
      .option("-p, --private <private>")
      .description("creates a new gateway with the specified name")
      .action(async (name, options) => {
        const gatewayManager = new GatewayManager(
          await credentials.get("key"),
          await credentials.get("secret"),
        );
        let gatewayOptions = {};
        if (typeof options.domain === "string") {
          gatewayOptions.domain = options.domain;
        }
        if (typeof options.enabled === "string") {
          gatewayOptions.enabled = options.enabled === "true";
        }
        if (typeof options.private === "string") {
          gatewayOptions.private = options.private === "true";
        }
        await gatewayManager.update(name, gatewayOptions);
      });

    return program;
  }
}
