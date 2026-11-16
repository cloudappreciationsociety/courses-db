import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });


console.log("Connecting to:", process.env.DATABASE_URL);

export default defineConfig({
    dialect: "postgresql",
    out: "./db",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});