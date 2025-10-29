import fs from "node:fs";
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
import chalk from "chalk";
import boxen from "boxen";
import Table from "cli-table3";

export async function validate(files: string[]) {
  const missingVariables: { file: string; variables: string[] }[] = [];
  interface Pairs {
    [key: string]: string;
  }
  interface ExtraVarsObj {
    [key: string]: string[];
  }

  const extraVariables: ExtraVarsObj = {};

  try {
    const schemaPath = resolve(process.cwd(), "config.schema.json");

    if (!fs.existsSync(schemaPath)) {
      console.log(chalk.red(`❌ File not found: ${schemaPath}`));
      process.exit(1);
    }

    const config: { required: string[] } = JSON.parse(
      await readFile(schemaPath, "utf-8")
    );

    console.log(
      chalk.blue.bold("ℹ️  Using schema from:"),
      chalk.cyan("./config.schema.json"),
      "\n→ Required keys:",
      chalk.magenta(config.required.join(", "))
    );

    for (const file of files) {
      const fullPath = resolve(process.cwd(), file);

      if (!fs.existsSync(fullPath)) {
        console.log(chalk.red(`❌ File not found: ${fullPath}`));
        process.exit(1);
      }

      const content = await readFile(fullPath, "utf-8");
      const lines = content
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"));

      const obj: Pairs = {};
      for (const line of lines) {
        const [rawKey, ...rest] = line.split("=");
        if (!rawKey) continue;
        obj[rawKey.trim()] = rest.join("=").trim();
      }

      const extraVarsFound: string[] = [];
      for (const key in obj) {
        if (obj[key] && !config.required.includes(key)) {
          extraVarsFound.push(key);
        }
      }

      const variables = config.required.filter((key) => !obj[key]);
      if (extraVarsFound.length > 0) extraVariables[file] = extraVarsFound;
      if (variables.length > 0) missingVariables.push({ file, variables });
    }

    if (missingVariables.length > 0) {
      console.log(
        boxen(
          chalk.red.bold(
            `❌ Validation Failed\n\nFound missing variables in ${
              missingVariables.length
            } file(s).\nFound extra variables in ${
              Object.keys(extraVariables).length
            } file(s).`
          ),
          {
            padding: 1,
            borderColor: "red",
            borderStyle: "round",
            title: chalk.red.bold("Config Validator"),
            titleAlignment: "center",
          }
        )
      );

      const table = new Table({
        head: [
          chalk.cyan.bold("File"),
          chalk.red.bold("Missing Variables"),
          chalk.yellow.bold("Extra Variables"),
        ],
        style: {
          head: [],
          border: [],
        },
        colWidths: [30, 45, 45],
        wordWrap: true,
      });

      for (const pair of missingVariables) {
        table.push([
          chalk.white(pair.file),
          chalk.red(pair.variables.join(", ")),
          chalk.yellow(extraVariables[pair.file]?.join(", ") || "none"),
        ]);
      }

      console.log(table.toString());
      process.exit(1);
    } else {
      console.log(
        boxen(
          chalk.green.bold(
            `✅ All ${files.length} file(s) are valid and meet schema requirements.`
          ),
          {
            padding: 1,
            borderColor: "green",
            borderStyle: "round",
            title: chalk.green("Validation Successful"),
            titleAlignment: "center",
          }
        )
      );
      if (Object.keys(extraVariables).length > 0) {
        console.log(chalk.yellow(
          `[!] Found extra variables (not defined in the schema) in ${
            Object.keys(extraVariables).length
          } file(s).`)
        );
        const table = new Table({
          head: ["file", chalk.yellow.bold("Extra Variables")],
          style: {
            head: [],
            border: [],
          },
          colWidths: [30, 45],
          wordWrap: true,
        });
        for (let key in extraVariables) {
          table.push([
            chalk.red(key),
            chalk.yellow(extraVariables[key]?.join(", ") || "none"),
          ]);
        }
        console.log(table.toString());
      }
    }
  } catch (error) {
    console.error(
      chalk.red("❌ Error while reading or validating files:"),
      error
    );
    process.exit(1);
  }
}
