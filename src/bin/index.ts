import chalk from "chalk";
import { Command } from "commander";
import { merge } from "../commands/merge.ts";
import { validate } from "../commands/validate.ts"; // fixed filename typo
import boxen from "boxen";
import { encrypt } from "../commands/encrypt.ts";
import { decrypt } from "../commands/decrypt.ts";

const program = new Command();
console.log(
  boxen("CONFIGFORGE CLI ⌬", { padding: 1, margin: 1, borderStyle: "double" })
);

program
  .name("configforge")
  .description(chalk.green("CLI tool to merge and validate .env files"))
  .version("1.0.0");

// Merge Command
program
  .command("merge")
  .description(chalk.yellow("Merge multiple .env files into one"))
  .argument("<files...>", "Files to merge")
  .option("-s, --separator <char>", "Separator between merged values", "")
  .option("-o, --output <file>", "Output file name", ".env.merged")
  .action(async (files: string[], options) => {
    console.log(
      chalk.blueBright("→ Merging files:"),
      chalk.white(files.join(", "))
    );
    console.log(
      chalk.yellow("→ Options:"),
      chalk.white(JSON.stringify(options))
    );
    await merge(files, options);
  });

// Validate Command
program
  .command("validate")
  .description(
    chalk.yellow(
      "Validate variable existence in .env files using config.schema.json"
    )
  )
  .argument("<files...>", "Files to validate")
  .action(async (files: string[]) => {
    await validate(files);
  });

// Encrypt Command
program
  .command("encrypt")
  .description(chalk.yellow("Encrypt multiple .env files"))
  .argument("<files...>", "Files to encrypt")
  .option("--key <key>", "Your secret key for encryption and decryption")
  .option("-o, --output <file>", "Output file name", ".env.enc")
  .action(async (files: string[], options) => {
    const { key } = options;

    if (!key) {
      console.log(chalk.red("❌ Missing required option --key <key>"));
      process.exit(1);
    }

    console.log(
      chalk.blueBright("→ Encrypting file(s):"),
      chalk.white(files.join(", "))
    );
    console.log(
      chalk.yellow("→ Options:"),
      chalk.white(JSON.stringify(options))
    );

    await encrypt(files, key, options);
  });

// Decrypt Command
program
  .command("decrypt")
  .description(chalk.yellow("decrypt multiple .env files"))
  .argument("<files...>", "Files to decrypt")
  .option("--key <key>", "Your secret key for encryption and decryption")
  .option("-o, --output <file>", "Output file name", ".env.dec")
  .action(async (files: string[], options) => {
    const { key } = options;

    if (!key) {
      console.log(chalk.red("❌ Missing required option --key <key>"));
      process.exit(1);
    }

    console.log(
      chalk.blueBright("→ Decrypting file(s):"),
      chalk.white(files.join(", "))
    );
    console.log(
      chalk.yellow("→ Options:"),
      chalk.white(JSON.stringify(options))
    );

    await decrypt(files, key, options);
  });

program.parse(process.argv);
