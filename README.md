# News App

# Setting Up Environment Variables

## Step 1: Run the script

- npm run setup-dbs

## Step 2: Create .env Files

- Create two files in the main directory:
  - `.env.development` - info in setup-dbs.sql
  - `.env.test` - info in setup-dbs.sql

## Step 3: Install dotenv

- Run in terminal: npm install dotenv

## Step 4: Add .env to ignore

- In gitignore add: .env.\*

## Step 5: Verify setup

-- 5a. Run in terminal: npm run test-seed
-- 5b. Then run in terminal: npm run seed-dev
