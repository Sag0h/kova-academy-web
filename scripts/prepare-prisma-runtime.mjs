import { copyFile, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const wasmFile = "query_compiler_bg.postgresql.wasm";
const sourceWasm = join(
  projectRoot,
  "node_modules",
  "@prisma",
  "client",
  "runtime",
  wasmFile,
);
const generatedRoot = join(projectRoot, "app", "generated", "prisma");
const generatedClass = join(generatedRoot, "internal", "class.ts");
const generatedWasm = join(generatedRoot, wasmFile);

await copyFile(sourceWasm, generatedWasm);

const original = await readFile(generatedClass, "utf8");
const packageResolution =
  'const wasmModulePath = _require.resolve("@prisma/client/runtime/query_compiler_bg.postgresql.wasm")';
const deployedResolution =
  'const wasmModulePath = process.cwd() + "/app/generated/prisma/query_compiler_bg.postgresql.wasm"';

if (!original.includes(packageResolution)) {
  throw new Error("No se encontró la referencia WASM esperada en Prisma Client.");
}

await writeFile(
  generatedClass,
  original.replace(packageResolution, deployedResolution),
);

console.log("Prisma WASM runtime preparado para el despliegue.");
