import "dotenv/config";
import { spawnSync } from "node:child_process";
import process from "node:process";

const repoRoot = new URL("../", import.meta.url);

function maskDatabaseUrl(connectionString) {
  try {
    const parsed = new URL(connectionString);
    const username = parsed.username ? `${parsed.username}:***@` : "";
    const database = parsed.pathname.replace(/^\//, "") || "unknown";
    return `${parsed.protocol}//${username}${parsed.host}/${database}`;
  } catch {
    return "[invalid DATABASE_URL format]";
  }
}

function runPrismaCommand(args, input) {
  const commands = [
    ["pnpm", ["prisma", ...args]],
    ["npx", ["prisma", ...args]],
  ];

  for (const [command, args] of commands) {
    const result = spawnSync(command, args, {
      cwd: repoRoot,
      env: process.env,
      encoding: "utf8",
      stdio: "pipe",
      input,
    });

    if (result.error && result.error.code === "ENOENT") {
      continue;
    }

    return {
      command: `${command} ${args.join(" ")}`,
      status: result.status ?? 1,
      stdout: result.stdout?.trim() ?? "",
      stderr: result.stderr?.trim() ?? "",
    };
  }

  return {
    command: `prisma ${args.join(" ")}`,
    status: 1,
    stdout: "",
    stderr: "Could not find pnpm or npx in PATH.",
  };
}

function isPendingMigrationState(result) {
  return (
    result.status !== 0 &&
    result.stdout.includes("Following migrations have not yet been applied:")
  );
}

async function main() {
 const connectionString = "postgresql://neondb_owner:npg_gnEjQ6aqoGM2@ep-royal-mouse-ad4cnrnx-pooler.c-2.us-east-1.aws.neon.tech/WOVE-UPDATES?sslmode=require&channel_binding=require";

  if (!connectionString) {
    console.error("DATABASE_URL is missing. Add it to .env before running this test.");
    process.exit(1);
  }

  console.log("Testing database setup...");
  console.log(`Target: ${maskDatabaseUrl(connectionString)}`);

  const validateResult = runPrismaCommand(["validate"]);
  if (validateResult.status !== 0) {
    console.error(`\nPrisma validation failed: ${validateResult.command}`);
    if (validateResult.stdout) {
      console.error(validateResult.stdout);
    }
    if (validateResult.stderr) {
      console.error(validateResult.stderr);
    }
    process.exit(validateResult.status);
  }

  console.log(`Prisma validation passed: ${validateResult.command}`);

  const migrationStatusResult = runPrismaCommand(["migrate", "status"]);
  if (migrationStatusResult.status !== 0 && !isPendingMigrationState(migrationStatusResult)) {
    console.error(`\nMigration status check failed: ${migrationStatusResult.command}`);
    if (migrationStatusResult.stdout) {
      console.error(migrationStatusResult.stdout);
    }
    if (migrationStatusResult.stderr) {
      console.error(migrationStatusResult.stderr);
    }
    process.exit(migrationStatusResult.status);
  }

  if (isPendingMigrationState(migrationStatusResult)) {
    console.warn("Prisma migration status check reached the database, but migrations are still pending.");
  } else {
    console.log("Prisma migration status check passed.");
  }

  const queryResult = runPrismaCommand(
    ["db", "execute", "--stdin"],
    "SELECT current_database(), current_schema(), version();"
  );
  if (queryResult.status !== 0) {
    console.error(`\nDatabase query check failed: ${queryResult.command}`);
    if (queryResult.stdout) {
      console.error(queryResult.stdout);
    }
    if (queryResult.stderr) {
      console.error(queryResult.stderr);
    }
    process.exit(queryResult.status);
  }

  console.log("Database query check passed.");
  if (migrationStatusResult.stdout) {
    console.log("\nMigration status output:");
    console.log(migrationStatusResult.stdout);
  }
}

main().catch((error) => {
  console.error("Unexpected database test failure.");
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
