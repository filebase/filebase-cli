import { GatewayManager } from "@filebase/sdk";

export default class GatewayModule {
  constructor(program, credentials) {
    program
      .command("gateway create <name>")
      .option("-d, --domain <domain>")
      .option("-e, --enabled <state>")
      .option("-p, --private <private>")
      .description("creates a new gateway with the specified name")
      .action(async (name, options) => {
        const gatewayManager = new GatewayManager(
          credentials.get("key"),
          credentials.get("secret"),
        );
        let gatewayOptions = {};
        if (typeof options.domain === "string") {
          gatewayOptions.domain = options.domain;
        }
        if (typeof options.enabled === "boolean") {
          gatewayOptions.enabled = options.enabled;
        }
        if (typeof options.private === "boolean") {
          gatewayOptions.private = options.private;
        }
        await gatewayManager.create(name, gatewayOptions);
      });

    program
      .command("gateway delete <name>")
      .description("deletes a gateway with the specified name")
      .action(async (name) => {
        const gatewayManager = new GatewayManager(
          credentials.get("key"),
          credentials.get("secret"),
        );
        //TODO: Confirm with inquirer
        await gatewayManager.delete(name);
      });

    program
      .command("gateway list")
      .description("lists the gateways")
      .action(async () => {
        const gatewayManager = new GatewayManager(
          credentials.get("key"),
          credentials.get("secret"),
        );
        await gatewayManager.list();
      });

    program
      .command("gateway toggle <name> <state>")
      .description("toggles the enabled state of a gateway")
      .action(async (name, state) => {
        const gatewayManager = new GatewayManager(
          credentials.get("key"),
          credentials.get("secret"),
        );
        await gatewayManager.toggle(name, state);
      });

    program
      .command("gateway update <name>")
      .option("-d, --domain <domain>")
      .option("-e, --enabled <state>")
      .option("-p, --private <private>")
      .description("creates a new gateway with the specified name")
      .action(async (name, options) => {
        const gatewayManager = new GatewayManager(
          credentials.get("key"),
          credentials.get("secret"),
        );
        let gatewayOptions = {};
        if (typeof options.domain === "string") {
          gatewayOptions.domain = options.domain;
        }
        if (typeof options.enabled === "boolean") {
          gatewayOptions.enabled = options.enabled;
        }
        if (typeof options.private === "boolean") {
          gatewayOptions.private = options.private;
        }
        await gatewayManager.update(name, gatewayOptions);
      });

    return program;
  }
}
