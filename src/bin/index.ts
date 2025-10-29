import chalk from "chalk";
import { Command } from "commander";
import { merge } from "../commands/merge.ts";
import { validate } from "../commands/validate.ts"; // fixed filename typo
import boxen from "boxen";

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

program.parse(process.argv);
