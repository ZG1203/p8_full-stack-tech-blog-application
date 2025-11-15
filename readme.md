# Week8 Full Stack Application with Node, Express, Sequelize, and Authentication

## Description

A full stack tech blog application built with **Node.js**, **Express**, **Sequelize**, and **JWT authentication**. User can 
   1) Register and log in to manage their content.
   2) View all blog articles and filter them by categories.
   3) Create new blog posts.
   4) Update and delete when viewing own blog posts.

## Installation
1. Clone the code locally
2. Copy the `.env.example` file** and rename it to `.env`.
3. Open MySQL in the terminal:
   ```bash
   mysql -u root -p
   ```
4. Run the following command to set up the database:
   ```bash
   source db/schema.sql;
   ```
5. Exit MySQL
   ```bash
   quit;
   ```
6. Update the .env file and set DB_PASSWORD to your MySQL password.
7. Install dependencies
   ```bash
   npm install
   ```
8. Seed the database with test data:
   ```bash
   npm run seed
   ```
9. Run the application
   ```bash
   npm run start
   ```
10. Access the application
   Open your browser and navigate to: http://localhost:3001
