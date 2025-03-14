## News App

A RESTful API built with Node.js, Express, and PostgreSQL that allows users to interact with news articles, post comments, and update votes.

## Hosted Version

You can access the live API here: https://news-app-backend-project.onrender.com/api

## Getting Started

## Prerequisites

Ensure you have the following installed:

- **Node.js**: v18.0.0 or later
- **PostgreSQL**: v14.0 or later

## Installation

**Clone the repository**

git clone: https://github.com/Lee1049/news-app.git

## Setting Up Environment Variables

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
