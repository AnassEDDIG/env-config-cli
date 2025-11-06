import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import crypto from "node:crypto";
import fs from "node:fs";
import chalk from "chalk";
import inquirer from "inquirer";

export async function encrypt(
  files: string[],
  key: string,
  options: { output: string }
) {
  const outputFile = resolve(process.cwd(), options.output);

  // Warn if output file exists
  if (fs.existsSync(outputFile)) {
    console.log(
      chalk.yellow(`⚠️  ${outputFile} already exists and may be overwritten!`)
    );
    try {
      const { proceed } = await inquirer.prompt([
        {
          type: "confirm",
          name: "proceed",
          message: "Continue encryption and overwrite existing file?",
          default: false,
        },
      ]);

      if (!proceed) {
        console.log(chalk.red("❌ Encryption cancelled by user."));
        process.exit(0);
      }
    } catch (error) {
      console.error(chalk.red("❌ Error during user confirmation:"), error);
      process.exit(1);
    }
  }

  console.log(chalk.cyanBright("\n🔐 Starting encryption process...\n"));

  for (const file of files) {
    try {
      const fullPath = resolve(process.cwd(), file);

      if (!fs.existsSync(fullPath)) {
        console.log(chalk.red(`❌ File not found: ${fullPath}, double check the path!`));
        continue;
      }

      const content = await readFile(fullPath, "utf-8");

      const iv = crypto.randomBytes(16);
      const derivedKey = crypto.scryptSync(key, "salt", 32);
      const cipher = crypto.createCipheriv("aes-256-cbc", derivedKey, iv);

      const encrypted = Buffer.concat([
        cipher.update(content, "utf8"),
        cipher.final(),
      ]);

      const output = `IV:${iv.toString("hex")}\nDATA:${encrypted.toString(
        "base64"
      )}`;

      const outputPath = `${process.cwd()}/${file}.enc`;
      await writeFile(outputPath, output, "utf-8");

      console.log(
        chalk.green(`✅ Successfully encrypted:`),
        chalk.white(file),
        chalk.blue(`→ ${outputPath}`)
      );
    } catch (error) {
      console.error(chalk.red(`❌ Error encrypting file ${file}:`), error);
    }
  }

  console.log(chalk.cyanBright("\n✨ Encryption process completed.\n"));
}
