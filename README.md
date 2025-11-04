# ConfigForge ⚙️

A **CLI tool to manage, merge, validate, encrypt, and type `.env` files** across different environments.
Written in **TypeScript**, 100% Node.js, framework-free, and designed for real-world developer workflows.

---

## 🧰 What ConfigForge Does

Developers often juggle multiple `.env` files for different environments:

```
.env.development
.env.staging
.env.production
```

Each contains environment variables like:

```
API_URL=https://dev.api.com
DB_USER=root
DB_PASS=1234
```

Managing, merging, validating, and deploying these files manually can lead to mistakes. ConfigForge simplifies this workflow.

---

## 🧩 Main Features Overview

### 1. 🔄 Merge `.env` Files (Phase 1)

Combine multiple `.env` files into a single file while **handling conflicts interactively**.

During merging, if a variable exists in multiple files with different values, ConfigForge will **prompt you** to choose which value to keep. For example:

```
Conflict detected for "API_URL". Which value do you want to keep?

1. Keep existing value: https://api.default.com
2. Use new value: https://api.prod.com
```

#### Command

```bash
configforge merge <files...> [options]
```

#### Options

| Option                   | Description                     | Default           |
| ------------------------ | ------------------------------- | ----------------- |
| `-s, --separator <char>` | Separator between merged values | `` (empty string) |
| `-o, --output <file>`    | Output file name                | `.env.merged`     |

- Custom separators supported
- Safe default output: `.env.merged`
- Confirmation before overwriting existing files

---

### 2. ✅ Validate `.env` Files (Phase 2)

Ensure that all required environment variables exist **and conform to a predefined schema** before deployment.

ConfigForge automatically validates your `.env` files against a `config.schema.json` file located in your project root. This schema defines all **required variables** your environment must include.

Example schema (`config.schema.json`):

```json
{
  "required": ["API_KEY", "DATABASE_URL", "JWT_SECRET"]
}
```

#### Command

```bash
configforge validate <files...>
```

- Supports **multiple .env files**
- Highlights **missing** and **extra** variables clearly
- Reads schema from **`config.schema.json`**
- Provides a **visual summary** with colored CLI tables

Example output:

```
❌ Validation Failed
Found missing variables in 1 file(s).
Found extra variables in 1 file(s).

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ File            │ Missing Variables        │ Extra Variables                            │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ .env.production │ DATABASE_URL, JWT_SECRET │ TEMP_TOKEN, DEBUG_MODE                     │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

If all files match the schema:

```
✅ All 2 file(s) are valid and meet schema requirements.
```

### 3. 🔒 Encryption & Decryption (Phase 3)

Secure sensitive `.env` files using Node’s `crypto` module.

ConfigForge can **encrypt** and **decrypt** `.env` files using a secret key, ensuring that credentials and API tokens remain protected — especially in shared repositories or deployment pipelines.

#### 🔐 Encrypt

```bash
configforge encrypt <files...> --key <secretKey> [options]
```

Example:

```bash
configforge encrypt .env.production --key mySecretKey
```

→ Outputs an encrypted file like:

`
.env.production.enc
`

#### 🔓 Decrypt

```bash
configforge decrypt <files...> --key <secretKey> [options]
```

Example:

```bash
configforge decrypt .env.production.enc --key mySecretKey
```

→ Restores your `.env.production` file.

#### ⚙️ Options

| Option                  | Description                               | Default      |
| ----------------------- | ----------------------------------------- | ------------ |
| `--key <secretKey>`   | Secret key used for encryption/decryption | **Required** |
| `-o, --output <file>` | Specify custom output file name           | `.env.enc` |

- Uses AES-256-CBC encryption with random IVs for each file
- Prevents overwriting with confirmation prompts
- Displays a success message after secure encryption
- Designed for use in CI/CD pipelines and local setups"

### 4. 🧠 Type Generation (Phase 4)

Generate TypeScript definitions for `.env` files, providing IntelliSense and type safety for `process.env`.

### 5. 🧮 Config Inspector (Phase 5)

Quick color-coded summary of all environment variables, masking sensitive values like passwords or API keys.

---

## 🚀 Test the Tool (MVP)

Since ConfigForge is still in MVP development, it is **not yet published on npm**. To test the tool:

1. Clone the repository:

```bash
git clone https://github.com/AnassEDDIG/env-config-cli
cd configforge
```

2. Install dependencies:

```bash
npm install
```

3. Create two files `.prod.env` and `.dev.env`, type some `key=value` pairs, and test.

4. Run the CLI commands directly using `npm` with default options:

```bash
npm run dev merge .env.default .env.production
```

5. Or with options:

```bash
npm run dev merge .env.default .env.production -- --output .env --separator ===
```

> Once the core functionalities are stable and tested, ConfigForge will be published to npm for easy global installation.

---

## 🤝 Conclusion

ConfigForge was built to make `.env` management safe, interactive, and developer-friendly. It is ideal for developers working on multi-environment projects who want full control over their environment variables.

Developed with ❤️ by Anass EDDIG.

- Open-source, modular, and extendable
- Designed for TypeScript & Node.js enthusiasts
- Encourages best practices for environment configuration
