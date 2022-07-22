const {  
  client,
  createUser,
  updateUser,
  getAllUsers,
  getUserById,
  createPost,
  updatePost,
  getAllPosts,
  getPostsByTagName
} = require('./index');

async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    // have to make sure to drop in correct order
    await client.query(`
      DROP TABLE IF EXISTS post_tags;
      DROP TABLE IF EXISTS tags;
      DROP TABLE IF EXISTS posts;
      DROP TABLE IF EXISTS users;
    `);

    console.log("Finished dropping tables!");
  } catch (error) {
    console.error("Error dropping tables!");
    throw error;
  }
}

async function createTables() {
  try {
    console.log("Starting to build tables...");

    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username varchar(255) UNIQUE NOT NULL,
        password varchar(255) NOT NULL,
        name varchar(255) NOT NULL,
        location varchar(255) NOT NULL,
        active boolean DEFAULT true
      );
      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        "authorId" INTEGER REFERENCES users(id),
        title varchar(255) NOT NULL,
        content TEXT NOT NULL,
        active BOOLEAN DEFAULT true
      );
      CREATE TABLE tags(
        id SERIAL PRIMARY KEY,
        name varchar(255) UNIQUE NOT NULL 
      );
      CREATE TABLE post_tags(
        "postId" INTEGER REFERENCES posts(id),
        "tagId" INTEGER REFERENCES tags(id),
        UNIQUE ("postId", "tagId")
      );
    `);

    console.log("Finished building tables!");
  } catch (error) {
    console.error("Error building tables!");
    throw error;
  }
}

async function createInitialUsers() {
  try {
    console.log("Starting to create users...");

    await createUser({ 
      username: 'albert', 
      password: 'bertie99',
      name: 'Al Bert',
      location: 'Sidney, Australia' 
    });
    await createUser({ 
      username: 'sandra', 
      password: '2sandy4me',
      name: 'Just Sandra',
      location: "Ain't tellin'"
    });
    await createUser({ 
      username: 'glamgal',
      password: 'soglam',
      name: 'Joshua',
      location: 'Upper East Side'
    });

    console.log("Finished creating users!");
  } catch (error) {
    console.error("Error creating users!");
    throw error;
  }
}

async function createInitialPosts() {
  try {
    const [albert, sandra, glamgal] = await getAllUsers();

    console.log("Starting to create posts...");
    await createPost({
      authorId: albert.id,
      title: "First Post",
      content: "This is my first post. I hope I love writing blogs as much as I love writing them.",
      tags: ["#happy", "#youcandoanything"]
    });

    await createPost({
      authorId: sandra.id,
      title: "How does this work?",
      content: "Seriously, does this even do anything?",
      tags: ["#happy", "#worsy-day-ever"]
    });

    await createPost({
      authorId: glamgal.id,
      title: "Living the Glam Life",
      content: "Do you even? I swear that half of you are posing.", 
      tags: ["#happy", "#youcandoanything", "#canmandoeverything"]
    });
    console.log("Finished creating posts!");
  } catch (error) {
    console.log("Error creating posts!");
    throw error;
  }
}

async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialPosts();
  } catch (error) {
    console.log("Error during rebuildDB")
    throw error;
  }
}

async function testDB() {
  try {
      console.log('STARTING DATABASE');

      console.log('GETTING USERS');
      const users = await getAllUsers();
      console.log("getAllUsers: ", users);
      console.log('Got users!');

      console.log('UPDATING USER');
      const updateUserResult = await updateUser(users[0].id, {
          name: 'Niko',
          location: 'London'
      });
      console.log("Update User Result: ", updateUserResult);

      console.log("GETTING POSTS.");
      const posts = await getAllPosts();
      console.log("All Posts Result: ", posts);
      console.log("Got all posts");

      console.log("UPDATING POST");
      const updatePostResult = await updatePost(posts[0].id, {
          title: "Hello",
          content: "Whats up everybody!!"
      })
      console.log("Update Post Result: ", updatePostResult);
      console.log("done updating posts");

      console.log("UPDATING POST TAG ID 1");
      const updatePostTagResult = await updatePost(posts[1].id, {
          tags: ["#youcandoanything", "#redfish", "#bluefish"]
      });
      console.log("Result: ", updatePostTagResult);

      console.log("FETCHING USER WITH ID 1");
      const albert = await getUserById(1);
      console.log("Albert Result: ", albert);

      console.log("ALL POSTS WITH #HAPPY TAG")
      const postsWithHappy = await getPostsByTagName('#happy');
      console.log("Result: ", postsWithHappy);
      
      console.log('FINISHED');

  } catch (error) {
      console.error("Error testing database!");
      throw error;
  }
}


rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());