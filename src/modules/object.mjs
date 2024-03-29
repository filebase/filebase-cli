import { createReadStream, statSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ObjectManager } from "@filebase/sdk";
import inquirer from "inquirer";
import Table from "tty-table";
import rfs from "recursive-fs";

export default class ObjectModule {
  constructor(program, credentials, stdin) {
    const subcommand = program
      .command("object")
      .description("upload and manage objects");

    subcommand.hook("preAction", async (thisCommand, actionCommand) => {
      const options = thisCommand.opts();
      if (typeof options.bucket === "string") {
        return;
      }
      const defaultBucket = await credentials.get("bucket");
      if (typeof defaultBucket === "undefined") {
        throw new Error(
          `Bucket must be passed as an option if no default bucket is set!`,
        );
      }
    });

    subcommand
      .command("upload <key> [source]")
      .option("-m, --metadata <metadata>")
      .option("-b, --bucket <bucket>")
      .description("creates a new name with the specified label")
      .action(async (key, source) => {
        const options = program.opts();
        const objectManager = new ObjectManager(
          credentials.get("key"),
          credentials.get("secret"),
          {
            bucket: options.bucket || credentials.get("bucket"),
          },
        );
        let objectToUpload = stdin;
        if (!stdin) {
          if (typeof source === "undefined") {
            throw new Error(`Source must be defined if not piping in a file`);
          }
          const resolvedSource = resolve(source);
          const pathStats = statSync(resolvedSource);
          if (pathStats.isFile()) {
            objectToUpload = createReadStream(resolvedSource);
          } else {
            const { files } = await rfs.read(resolvedSource);
            objectToUpload = files.map((file) => {
              const pathStats = statSync(file);
              return {
                path: file.replace(resolvedSource, ""),
                type: "import",
                content: pathStats.isFile() ? file : null,
              };
            });
          }
        }
        let objectMetadata;
        if (typeof options.metadata === "string") {
          objectMetadata = options.metadata;
        }
        const uploadedObject = await objectManager.upload(
          key,
          objectToUpload,
          objectMetadata,
        );
        console.log(uploadedObject.cid);
      });

    subcommand
      .command("get <key>")
      .option("-b, --bucket <bucket>")
      .description("gets a object with the specified key")
      .action(async (key) => {
        const options = program.opts();
        const objectManager = new ObjectManager(
          credentials.get("key"),
          credentials.get("secret"),
          {
            bucket: options.bucket || credentials.get("bucket"),
          },
        );
        const objectDetails = await objectManager.get(key);
        objectDetails.Key = key;
        objectDetails.Metadata = JSON.stringify(objectDetails.Metadata);
        const table = Table(
          [
            { value: "Key", alias: "name" },
            { value: "ETag", alias: "etag" },
            { value: "ContentType", alias: "content_type" },
            { value: "ContentLength", alias: "size" },
            { value: "LastModified", alias: "last_modified" },
            { value: "Metadata", alias: "metadata" },
          ],
          [objectDetails],
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
      .command("download <key> [outputPath]")
      .option("-b, --bucket <bucket>")
      .description("downloads a object with the specified key")
      .action(async (key, output = undefined) => {
        const options = program.opts();
        const objectManager = new ObjectManager(
          credentials.get("key"),
          credentials.get("secret"),
          {
            bucket: options.bucket || credentials.get("bucket"),
          },
        );
        const readStream = await objectManager.download(key);
        await writeFile(
          output ? resolve(output) : resolve(process.cwd(), key),
          readStream,
        );
      });

    subcommand
      .command("delete <key>")
      .option("-b, --bucket <bucket>")
      .description("deletes a name with the specified label")
      .action(async (key) => {
        const options = program.opts();
        const objectManager = new ObjectManager(
          credentials.get("key"),
          credentials.get("secret"),
          {
            bucket: options.bucket || credentials.get("bucket"),
          },
        );
        const answers = await inquirer.prompt([
          {
            type: "input",
            name: "confirm_delete",
            message: `Are you sure you want to delete the object with key [${key}]? Yes/No`,
          },
        ]);
        if (answers["confirm_delete"] === "Yes") {
          await objectManager.delete(key);
          console.log(`Deleted Object: ${key}`);
        }
      });

    subcommand
      .command("list")
      .option("-b, --bucket <bucket>")
      .description("lists the objects")
      .action(async () => {
        const options = program.opts();
        const objectManager = new ObjectManager(
          credentials.get("key"),
          credentials.get("secret"),
          {
            bucket: options.bucket || credentials.get("bucket"),
          },
        );
        const objects = (await objectManager.list()).Contents;
        const table = Table(
          [
            { value: "Key", alias: "name" },
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
      .command("copy <key> <destinationBucket> [destinationKey]")
      .option("-b, --bucket <bucket>")
      .option("-k, --key <destinationKey>")
      .description("copies the objects")
      .action(async (key, destinationBucket, destinationKey) => {
        const options = program.opts();
        const objectManager = new ObjectManager(
          credentials.get("key"),
          credentials.get("secret"),
          {
            bucket: options.bucket || credentials.get("bucket"),
          },
        );
        let objectCopyOptions = {};
        if (typeof destinationKey === "string") {
          objectCopyOptions.destinationKey = destinationKey;
        }
        await objectManager.copy(key, destinationBucket, objectCopyOptions);
      });

    return program;
  }
}
