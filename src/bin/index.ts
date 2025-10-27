import chalk from "chalk";
import { merge } from "../commands/merge.ts";
import { Command } from "commander";

const program = new Command();

program
  .name("configforge")
  .description(chalk.green("CLI tool to merge env files ⚙️"))
  .version("1.0.0");

program
  .command("merge")
  .description(chalk.green("Merge multiple .env files"))
  .argument("<files...>", "Files to merge") // Keep plain
  .option("-s, --separator <char>", "Separator between merged values", "")
  .option("-o, --output <file>", "Output file", ".env.merged")
  .action(async (files: string[], options) => {
    console.log(chalk.blue("Merging files:"), files);
    console.log(chalk.yellow("Options:"), options);
    await merge(files, options);
  });

program.parse(process.argv);
