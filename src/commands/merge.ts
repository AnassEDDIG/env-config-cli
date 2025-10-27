import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import boxen from "boxen";
import fs from "node:fs";
import chalk from "chalk";
import inquirer from "inquirer";

export async function merge(
  files: string[],
  options: { separator: string; output: string }
) {
  const outputFile = resolve(process.cwd(), options.output);

  // Warn if output file exists
  if (fs.existsSync(outputFile)) {
    console.log(
      chalk.yellow(`⚠️  ${outputFile} exists and will be overwritten!`)
    );
    try {
      const answer = await inquirer.prompt([
        {
          type: "confirm",
          name: "continue",
          message: "Continue merging?",
          default: false,
        },
      ]);

      if (!answer.continue) {
        console.log(chalk.red("Merging cancelled."));
        process.exit(0);
      }
    } catch (error) {
      console.error("An error occurred while prompting:", error);
      process.exit(1);
    }
  }

  interface Pairs {
    [key: string]: string;
  }

  let obj: Pairs = {};
  const conflicts: {
    key: string;
    oldVal: string;
    newVal: string;
    from: string;
  }[] = [];

  try {
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
        .filter((line) => line && !line.startsWith("#")); // ignore comments & empty lines

      for (const line of lines) {
        const [rawKey, ...rest] = line.split("=");
        if (!rawKey) continue;
        const key = rawKey.trim();
        const value = rest.join("=").trim(); // in case value contains '='

        if (key && value) {
          if (obj[key] && obj[key] !== value) {
            try {
              const { choice } = await inquirer.prompt([
                {
                  type: "list",
                  name: "choice",
                  message: `${chalk.redBright(
                    "Conflict detected"
                  )} for ${chalk.blue(
                    `"${key}"`
                  )}. Which value do you want to keep?`,
                  choices: [
                    {
                      name: `Keep existing value: ${obj[key]}`,
                      value: obj[key],
                    },
                    { name: `Use new value: ${value}`, value: value },
                  ],
                },
              ]);

              conflicts.push({
                key,
                oldVal: obj[key],
                newVal: value,
                from: file,
              });

              obj[key] = choice;
            } catch (error) {
              console.error("An error occurred while prompting:", error);
              process.exit(1);
            }
          } else {
            obj[key] = value;
          }
        }
      }
    }

    // Write merged content
    let finalContent = "";
    for (const key in obj) {
      finalContent += `\n${key}=${obj[key]}${
        options.separator && "\n" + options.separator
      }`;
    }

    await writeFile(outputFile, finalContent.trim() + "\n", "utf-8");

    console.log(
      chalk.green(
        `✅ Successfully merged ${files.length} file(s) → ${outputFile}`
      )
    );

    // Display conflicts summary
    if (conflicts.length > 0) {
      const summaryLines: string[] = [
        `[!] Found ${conflicts.length} variable conflict(s):`,
      ];

      for (const c of conflicts) {
        summaryLines.push(
          `${chalk.cyan(c.key)}: "${chalk.red(c.oldVal)}" → "${chalk.green(
            c.newVal
          )}" (${chalk.yellow("from " + c.from)})`
        );
      }

      console.log(
        boxen(summaryLines.join("\n"), {
          padding: 1,
          borderColor: "yellow",
          borderStyle: "double",
        })
      );
    }
  } catch (error) {
    console.error(chalk.red("❌ Error while reading or writing files:"), error);
    process.exit(1);
  }
}
