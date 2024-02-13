import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { resolve } from "node:path";
import { ObjectManager } from "@filebase/sdk";
import inquirer from "inquirer";
import Table from "tty-table";
import rfs from "recursive-fs";

export default class ObjectModule {
  constructor(program, credentials, stdin) {
    const subcommand = program.command("object");

    subcommand
      .command("upload <key> [source]")
      .option("-m, --metadata <metadata>")
      .option("-b, --bucket <bucket>")
      .description("creates a new name with the specified label")
      .action(async (key, source, options) => {
        const objectManager = new ObjectManager(
          credentials.get("key"),
          credentials.get("secret"),
          {
            bucket: credentials.get("bucket"),
          },
        );
        let objectToUpload = stdin;
        if (!stdin) {
          if (typeof source === "undefined") {
            throw new Error(`Source must be defined if not piping in a file`);
          }
          const resolvedSource = resolve(source);
          const pathStats = await stat(resolvedSource);
          if (pathStats.isFile()) {
            objectToUpload = createReadStream(resolvedSource);
          } else {
            const { files } = await rfs.read(resolvedSource);
            objectToUpload = files.map((file) => {
              return {
                path: file.replace(resolvedSource, ""),
                content: createReadStream(file),
              };
            });
          }
        }
        const uploadedObject = await objectManager.upload(key, objectToUpload);
        console.log(uploadedObject.cid);
      });

    subcommand
      .command("get <key>")
      .option("-b, --bucket <bucket>")
      .description("gets a object with the specified key")
      .action(async (key) => {
        const objectManager = new ObjectManager(
          credentials.get("key"),
          credentials.get("secret"),
          {
            bucket: credentials.get("bucket"),
          },
        );
        await objectManager.get(key);
      });

    subcommand
      .command("download <key>")
      .option("-b, --bucket <bucket>")
      .option("-d, --destination <destination>")
      .description("downloads a object with the specified key")
      .action(async (key) => {
        const objectManager = new ObjectManager(
          credentials.get("key"),
          credentials.get("secret"),
          {
            bucket: credentials.get("bucket"),
          },
        );
        await objectManager.download(key);
      });

    subcommand
      .command("delete <key>")
      .option("-b, --bucket <bucket>")
      .description("deletes a name with the specified label")
      .action(async (key) => {
        const objectManager = new ObjectManager(
          credentials.get("key"),
          credentials.get("secret"),
          {
            bucket: credentials.get("bucket"),
          },
        );
        const answers = await inquirer.prompt([
          {
            type: "input",
            name: "confirm_delete",
            message: `Are you sure you want to delete the object with key [${key}]? Yes/No`,
          },
        ]);
        if (answers["confirm_delete"] === "Y") {
          await objectManager.delete(key);
          console.log(`Deleted Object: ${key}`);
        }
      });

    subcommand
      .command("list")
      .option("-b, --bucket <bucket>")
      .description("lists the objects")
      .action(async () => {
        const objectManager = new ObjectManager(
          credentials.get("key"),
          credentials.get("secret"),
          {
            bucket: credentials.get("bucket"),
          },
        );
        const objects = (await objectManager.list()).Contents;
        const table = Table(
          [
            { value: "Key", alias: "name" },
            { value: "CID", alias: "cid" },
            { value: "ETag", alias: "etag" },
            { value: "Size", alias: "size" },
            { value: "LastModified", alias: "last_modified" },
          ],
          objects,
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
      .command("copy <key> <destinationBucket>")
      .option("-b, --bucket <bucket>")
      .option("-k, --key <destinationKey>")
      .description("copies the objects")
      .action(async (key, destinationBucket, options) => {
        const objectManager = new ObjectManager(
          credentials.get("key"),
          credentials.get("secret"),
          {
            bucket: credentials.get("bucket"),
          },
        );
        let objectCopyOptions = {};
        await objectManager.copy(key, destinationBucket, objectCopyOptions);
      });

    return program;
  }
}
