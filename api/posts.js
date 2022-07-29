const express = require('express');
const postsRouter = express.Router();
const { getAllPosts, createPost, updatePost, getPostById } = require('../db');
const { requireUser, requireActiveUser } = require('./utils');

postsRouter.use((req, res, next) => {
    console.log('A request is being made to /posts');
    next();
});

postsRouter.post('/', requireUser, requireActiveUser, async (req, res, next) => {
  const { title, content, tags = "" } = req.body;
  const tagArr = tags.trim().split(/\s+/);
  const postData = [];

  if (tagArr.length) {
      postData.tags = tagArr;
  }

  try {
      postData.authorId = req.user.id;
      postData.title = title;
      postData.content = content;

      const post = await createPost(postData);
      console.log("post: ", post);

      if (post) {
          res.send({ post });
      } else {
          next({
              name: "CreatePostError",
              message: "There was an error creating your post"
          })
      }

  } catch({ name, message }) {
      next({ name, message });
  }
});

postsRouter.get('/', async (req, res) => {
  const allPosts = await getAllPosts();
  
  const posts = allPosts.filter(post => {
      return (post.active && post.author.active) || (req.user && post.author.id === req.user.id);
  });

  res.send({
      posts
  });
});

postsRouter.patch('/:postId', requireUser, requireActiveUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  const updateFields = {};

  if (tags && tags.length > 0) {
      updateFields.tags = tags.trim().split(/\s+/);
  }

  if (title) {
      updateFields.title = title;
  }

  if (content) {
      updateFields.content = content;
  }

  try {
      const originalPost = await getPostById(postId);

      if (originalPost.author.id === req.user.id) {
          const updatedPost = await updatePost(postId, updateFields);
          res.send({ post: updatedPost });
      } else {
          next({
              name: 'UnauthorizedUserError',
              message: 'You cannot update a post that is not yours'
          })
      }

  } catch ({ name, message }) {
      next({ name, message });
  }
});

postsRouter.delete('/:postId', requireUser, requireActiveUser, async (req, res, next) => {
  const { postId } = req.params;
  try {
      const post = await getPostById(postId);

      if (post && post.author.id === req.user.id) {
          const updatedPost = await updatePost(post.id, { active: false })

          res.send({ post: updatedPost });
      } else {
          next(post ? {
              name: 'UnauthorizedUserError',
              message: 'You cannot delete a post which is not yours'
          } : {
              name: 'PostNotFoundError',
              message: "That post does not exist"
          });
      }

  } catch ({ name, message }) {
      next({ name, message });
  }
})

module.exports = postsRouter;