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

## 🧩 Main Features (Conceptual Overview)

### 1. 🔄 Merge `.env` Files (Phase 1)

Combine multiple `.env` files into a single file while **handling conflicts interactively**.

During merging, if a variable exists in multiple files with different values, ConfigForge will **prompt you** to choose which value to keep. For example:

```
Conflict detected for "API_URL". Which value do you want to keep?
1) Keep existing value: https://api.default.com
2) Use new value: https://api.prod.com
```

- Custom separators supported
- Safe default output: `.env.merged`
- Confirmation before overwriting existing files

### 2. ✅ Validation (Phase 2)

Ensure required environment variables exist before deployment.

### 3. 🔒 Encryption & Decryption (Phase 3)

Secure sensitive `.env` files using Node's crypto module.

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
