// Import required packages
const sequelize = require("../config/connection");

// import models
const { Post, Category, User } = require("../models");

// add data and seeding for Category model

// import seed data
const postData = require("./posts.json");
const categoryData = require("./categories.json");
const userData = require("./users.json");

// Seed database
const seedDatabase = async () => {
  await sequelize.sync({ force: true });

   await User.bulkCreate(userData, {
    individualHooks: true
  });

  await Category.bulkCreate(categoryData);

  await Post.bulkCreate(postData);

  process.exit(0);
};

// Call seedDatabase function
seedDatabase();
