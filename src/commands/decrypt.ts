import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import crypto from "node:crypto";
import fs from "node:fs";
import chalk from "chalk";
import inquirer from "inquirer";

export async function decrypt(
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
          message: "Continue decryption and overwrite existing file?",
          default: false,
        },
      ]);

      if (!proceed) {
        console.log(chalk.red("❌ Decryption cancelled by user."));
        process.exit(0);
      }
    } catch (error) {
      console.error(chalk.red("❌ Error during user confirmation:"), error);
      process.exit(1);
    }
  }

  console.log(chalk.cyanBright("\n🔓 Starting decryption process...\n"));

  for (const file of files) {
    try {
      const fullPath = resolve(process.cwd(), file);

      if (!fs.existsSync(fullPath)) {
        console.log(
          chalk.red(`❌ File not found: ${fullPath}, double check the path!`)
        );

        continue;
      }

      const content = await readFile(fullPath, "utf-8");

      // Expecting format:
      // IV:xxxxxxxx
      // DATA:xxxxxxxx
      const ivMatch = content.match(/^IV:([a-f0-9]+)\n/);
      const dataMatch = content.match(/DATA:([\s\S]+)/);

      if (!ivMatch || !dataMatch || !ivMatch[1] || !dataMatch[1]) {
        console.log(chalk.red(`❌ Invalid encrypted file format: ${file}`));
        continue;
      }

      const iv = Buffer.from(ivMatch[1], "hex");
      const encryptedData = Buffer.from(dataMatch[1].trim(), "base64");
      const derivedKey = crypto.scryptSync(key, "salt", 32);
      const decipher = crypto.createDecipheriv("aes-256-cbc", derivedKey, iv);

      const decrypted = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final(),
      ]);

      // Remove .enc extension for output
      const outputPath = file.endsWith(".enc")
        ? `${process.cwd()}/${file.replace(/\.enc$/, ".dec")}`
        : `${process.cwd()}/${file}.dec`;

      await writeFile(outputPath, decrypted.toString("utf-8"), "utf-8");

      console.log(
        chalk.green(`✅ Successfully decrypted:`),
        chalk.white(file),
        chalk.blue(`→ ${outputPath}`)
      );
    } catch (error) {
      console.error(chalk.red(`❌ Error decrypting file ${file}:`), error);
    }
  }

  console.log(chalk.cyanBright("\n✨ Decryption process completed.\n"));
}
