let token = localStorage.getItem("authToken");
let currentUser = null;
let currentPost = null;
let isViewingMyPosts = false;
let currentCategory = 'all';
let allPosts = [];

function register() {
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  fetch("http://localhost:3001/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.errors) {
        alert(data.errors[0].message);
      } else {
        alert("User registered successfully");
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  fetch("http://localhost:3001/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      // Save the token in the local storage
      if (data.token) {
        localStorage.setItem("authToken", data.token);
        token = data.token;
        currentUser = data.userData;

        alert("User Logged In successfully");

        // Fetch the posts list
        fetchPosts();

        // Hide the auth container and show the app container as we're now logged in
        document.getElementById("auth-container").classList.add("hidden");
        document.getElementById("app-container").classList.remove("hidden");
      } else {
        alert(data.message);
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function logout() {
  fetch("http://localhost:3001/api/users/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).then(() => {
    // Clear the token from the local storage as we're now logged out
    localStorage.removeItem("authToken");
    token = null;
    document.getElementById("auth-container").classList.remove("hidden");
    document.getElementById("app-container").classList.add("hidden");
    location.reload();
  });
}

function fetchPosts( ) {
  fetch("http://localhost:3001/api/posts", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((posts) => { 
      allPosts = posts;
      const postsContainer = document.getElementById("posts");
      postsContainer.innerHTML = "";
      posts.forEach((post) => {
        const div = document.createElement("div");
        div.style.textAlign = "left";
        div.style.borderBottom = "1px solid #eee";
        div.innerHTML = `<h3>${post.title}</h3>
          <small>By: ${post.author} on ${new Date(post.createdOn).toLocaleString()} Category: ${post.category}</small>
          <p>${post.content}</p>`;
        postsContainer.appendChild(div);
      });
    });
}

// Create post
function createPost() {
  const title = document.getElementById("post-title").value;
  const content = document.getElementById("post-content").value;
  const categoryValue = document.getElementById("post-category").value;

  const categoryMap = {
      'datascience': 1,
      'programming': 2,
      'security': 3
    };

  const categoryId = categoryMap[categoryValue];
    
  fetch("http://localhost:3001/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content, categoryId, userId: currentUser.id }),
  })
  .then((res) => res.json())
  .then(() => {
    alert("Post created successfully");
    fetchPosts();
  })
  .catch((error) => {
    console.log(error);
    alert("Error creating post");
  });
}

// to edit or update post
function changePost(post) {
    currentPost = post;

    document.getElementById('postdetail-title').textContent = post.title;
    document.getElementById('postdetail-author').textContent = `By ${post.author} |`;
    document.getElementById('postdetail-category').textContent = ` Category: ${post.category} |`;
    document.getElementById('postdetail-date').textContent = `Posted on: ${new Date(post.createdOn).toLocaleDateString()}`;
    document.querySelector('.postdetail-content').textContent = post.content; 

    // Show edit/delete buttons when user is viewing own posts
    const postActions = document.getElementById('postdetail-actions');
    postActions.classList.remove('hidden');

    // Show post detail and hide posts list
    document.querySelector('.posts-list').classList.add('hidden');
    document.getElementById('post-detail').classList.remove('hidden');
}


// Edit post
function editPost() {
    if (!currentPost) return;

    document.getElementById('post-title').value = currentPost.title;
    document.getElementById('post-content').value = currentPost.content;
    const categoryMap = {
        1: 'datascience',
        2: 'programming', 
        3: 'security'
    };
    document.getElementById('post-category').value = categoryMap[currentPost.categoryId]

    // Change create post button to update
    const createButton = document.querySelector('.createpost button');
    createButton.textContent = 'Update Post';
    createButton.onclick = updatePost;

    // reload all posts
    backToPostsList();
}

// Update post
function updatePost() {
    if (!currentPost) return;

    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const categoryvalue = document.getElementById('post-category').value;

    if (!title || !content) {
        alert('Please fill in title and content');
        return;
    }

    const categoryMap = {
        'datascience': 1,
        'programming': 2,
        'security': 3
    };

    const categoryId = categoryMap[categoryvalue];

    //send data to server
    fetch(`http://localhost:3001/api/posts/${currentPost.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
            title, 
            content, 
            categoryId,
            userId: currentUser.id 
        }),
    })
    .then((res) => res.json())
    .then(( ) => {    
      // Reset form
      document.getElementById('post-title').value = '';
      document.getElementById('post-content').value = '';
      // Change button to create post
      const createButton = document.querySelector('.createpost button');
      createButton.textContent = 'Create Post';
      createButton.onclick = createPost;
      alert('Post updated successfully!');
      fetchPosts();
      backToPostsList();
    })
  .catch((error) => {
      console.log(error);
      alert("Error updating post");
    });
}

// Delete post
function deletePost() {
  if (!currentPost) return;

  if (confirm('Are you sure you want to delete this post?')) {
    //send data to server
    fetch(`http://localhost:3001/api/posts/${currentPost.id}`, {
      method: "DELETE",
      headers: {
          Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.json())
    .then(( ) => {
      alert('Post deleted successfully!');
      fetchPosts(); // Refresh posts list
      backToPostsList(); // Go back to posts list
    })
    .catch((error) => {
        console.log(error);
        alert("Error deleting post");
    });
  }
}

function backToPostsList() {
    document.querySelector('.posts-list').classList.remove('hidden');
    document.getElementById('post-detail').classList.add('hidden');
}


// Load posts based on category
function loadPosts(category = 'all') {
  currentCategory = category;
  isViewingMyPosts = false;

  backToPostsList();

  document.querySelectorAll('.category-filter li').forEach(li => {
  li.classList.remove('active');
  if (li.getAttribute('data-category') === category) {
      li.classList.add('active');
  }
});
  displayFilteredPosts()
}

function viewMyPosts() {
  isViewingMyPosts = true;
  currentCategory = 'all';

  backToPostsList();

  document.querySelectorAll('.category-filter li').forEach(li => {li.classList.remove('active');});
  document.querySelector('.category-filter li[data-category="all"]').classList.add('active');

  const postsListTitle = document.getElementById("posts-list-title");
  postsListTitle.textContent = "My Posts"; 
  displayFilteredPosts();
}

function displayFilteredPosts() {
  const postsContainer = document.getElementById("posts");
  const postsListTitle = document.getElementById("posts-list-title");
  postsContainer.innerHTML = "";
  let filteredPosts = allPosts;
    
  // Apply category filter
  if (currentCategory !== 'all') {
    const categoryMap = {
        'datascience': 1,
        'programming': 2,
        'security': 3
    };

    filteredPosts = filteredPosts.filter(post => post.categoryId === categoryMap[currentCategory]);
    const categoryNames = {
        'datascience': 'Data Science',
        'programming': 'Programming',
        'security': 'Cyber Security'
    };
    postsListTitle.textContent = `${categoryNames[currentCategory]} Posts`;
  }

  if (isViewingMyPosts && currentUser) {
    filteredPosts = filteredPosts.filter(post => post.userId === currentUser.id);
    postsListTitle.textContent = "My Posts"; 
  } else if (!isViewingMyPosts && currentCategory === 'all') {
    postsListTitle.textContent = "All Posts";
  }

  if (filteredPosts.length === 0) {
    postsContainer.innerHTML = '<p>No posts found.</p>';
    return;
  }

  filteredPosts.forEach((post) => {
    const div = document.createElement("div");
    div.style.textAlign = "left";
    div.style.padding = "10px";
    div.style.borderBottom = "1px solid #eee";
    if (isViewingMyPosts) {
      div.style.cursor = "pointer";
      div.addEventListener('click', () => changePost(post)); 
    } else {
      div.style.cursor = "default"; 
    }
    div.innerHTML = `<h3>${post.title}</h3>
      <small>By: ${post.author} on ${new Date(post.createdOn).toLocaleString()} Category: ${post.category}</small>
      <p>${post.content}</p>;`
    postsContainer.appendChild(div);
  });
}