// create a new router
const app = require("express").Router();

// import the models
const { Post, User, Category } = require("../models/index");

// Route to add a new post
app.post("/", async (req, res) => {
  try {
    const { title, content, userId, categoryId } = req.body;
    const post = await Post.create({ title, content, categoryId, userId });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: "Error adding post" });
  }
});

// Route to get all posts
app.get("/", async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {model: User, attributes: ['username'], as: 'user'},
        {model: Category, attributes: ['category_name'], as: 'category'}
      ]
    }
  );

  const postswithname = posts.map(post => ({
    id: post.id,
    title: post.title,
    content: post.content,
    author: post.user?.username,
    category: post.category?.category_name,
    categoryId: post.categoryId,
    userId: post.userId,
    createdOn: post.createdOn
  }));

    res.json(postswithname);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving posts", error });
  }
});

// Route to get one post
app.get("/:id", async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        {model: User, attributes: ['username'], as: 'user'},
        {model: Category, attributes: ['category_name'], as: 'category'}
      ]
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const postswithname = post.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      author: post.user?.username,
      category: post.category?.category_name,
      categoryId: post.categoryId,
      userId: post.userId,
      createdOn: post.createdOn
    }));

    res.json(postswithname);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving post" });
  }
});

// Route to update a post
app.put("/:id", async (req, res) => {
  try {
    const { title, content, userId, categoryId } = req.body;
    const post = await Post.update(
      { title, content, userId, categoryId },
      { where: { id: req.params.id } }
    );
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Error updating post" });
  }
});

// Route to delete a post
app.delete("/:id", async (req, res) => {
  try {
    const post = await Post.destroy({ where: { id: req.params.id } });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Error deleting post" });
  }
});

// export the router
module.exports = app;
