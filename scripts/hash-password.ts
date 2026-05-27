// Usage: npx tsx scripts/hash-password.ts yourPasswordHere
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.log("Usage: npx tsx scripts/hash-password.ts <password>");
  process.exit(1);
}

async function main() {
  const hash = await bcrypt.hash(password, 12);
  const escaped = hash.replace(/\$/g, "\\$");
  console.log("Hashed password (escaped for .env.local):");
  console.log(escaped);
  console.log("\nPaste this into your .env.local file as-is.");
  console.log("The \\$ escapes prevent dotenv from treating $ as variable references.");
}

main();
