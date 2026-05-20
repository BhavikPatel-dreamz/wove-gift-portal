import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.js',
  },
  datasource: {
    url: "postgresql://neondb_owner:npg_gnEjQ6aqoGM2@ep-royal-mouse-ad4cnrnx-pooler.c-2.us-east-1.aws.neon.tech/WOVE-UPDATES?sslmode=require&channel_binding=require",
  },
})
