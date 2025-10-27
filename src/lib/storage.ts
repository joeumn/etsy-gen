import { promises as fs } from "fs";
import path from "path";

const rootDataDir = path.resolve(
  process.env.DATA_ROOT ?? path.join(process.cwd(), "data"),
);
const rootGeneratedDir = path.resolve(
  process.env.GENERATED_ROOT ?? path.join(process.cwd(), "generated"),
);

export const resolveDataPath = (...segments: string[]) =>
  path.join(rootDataDir, ...segments);

export const resolveGeneratedPath = (...segments: string[]) =>
  path.join(rootGeneratedDir, ...segments);

export const ensureDir = async (dirPath: string) => {
  await fs.mkdir(dirPath, { recursive: true });
};

export const appendNdjson = async (filePath: string, payload: unknown[]) => {
  if (payload.length === 0) {
    return;
  }

  const dir = path.dirname(filePath);
  await ensureDir(dir);

  const lines = payload.map((item) => JSON.stringify(item)).join("\n").concat("\n");
  await fs.appendFile(filePath, lines, "utf8");
};

export const writeJsonFile = async (filePath: string, data: unknown) => {
  const dir = path.dirname(filePath);
  await ensureDir(dir);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
};
