let token = localStorage.getItem("authToken");

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
  });
}

function fetchPosts() {
  fetch("http://localhost:3001/api/posts", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((posts) => {
      const postsContainer = document.getElementById("posts");
      postsContainer.innerHTML = "";
      posts.forEach((post) => {
        const div = document.createElement("div");
        div.innerHTML = `<h3>${post.title}</h3><p>${
          post.content
        }</p><small>By: ${post.postedBy} on ${new Date(
          post.createdOn
        ).toLocaleString()}</small>`;
        postsContainer.appendChild(div);
      });
    });
}

function createPost() {
  const title = document.getElementById("post-title").value;
  const content = document.getElementById("post-content").value;
  fetch("http://localhost:3001/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content, postedBy: "User" }),
  })
    .then((res) => res.json())
    .then(() => {
      alert("Post created successfully");
      fetchPosts();
    });
}

// to update below
// Load posts based on current category and view mode
function loadPosts() {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = '';

    let filteredPosts = posts;

    if (isViewingMyPosts) {
        if (!currentUser) {
            alert('Please login to view your posts');
            return;
        }
        filteredPosts = posts.filter(post => post.author === currentUser.username);
    } else if (currentCategory !== 'all') {
        filteredPosts = posts.filter(post => post.category === currentCategory);
    }

    if (filteredPosts.length === 0) {
        postsContainer.innerHTML = '<p>No posts found.</p>';
        return;
    }

    filteredPosts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post-item';
        postElement.setAttribute('data-id', post.id);
        
        const excerpt = post.content.length > 150 
            ? post.content.substring(0, 150) + '...' 
            : post.content;

        postElement.innerHTML = `
            <h4>${post.title}</h4>
            <div class="post-meta">By ${post.author} | ${post.category} | ${post.date}</div>
            <div class="post-excerpt">${excerpt}</div>
        `;

        postElement.addEventListener('click', () => showPostDetail(post.id));
        postsContainer.appendChild(postElement);
    });
}

// Show post detail
        function showPostDetail(postId) {
            const post = posts.find(p => p.id === postId);
            if (!post) return;

            currentPost = post;

            document.getElementById('detail-title').textContent = post.title;
            document.getElementById('detail-author').textContent = `By ${post.author}`;
            document.getElementById('detail-category').textContent = post.category;
            document.getElementById('detail-date').textContent = post.date;
            document.getElementById('detail-content').textContent = post.content;

            // Show edit/delete buttons if the post belongs to the current user
            const postActions = document.getElementById('post-actions');
            if (currentUser && post.author === currentUser.username) {
                postActions.classList.remove('hidden');
            } else {
                postActions.classList.add('hidden');
            }

            // Show post detail and hide posts list
            document.querySelector('.posts-list').classList.add('hidden');
            document.getElementById('post-detail').classList.remove('hidden');
        }

        // Edit post
        function editPost() {
            if (!currentPost) return;

            document.getElementById('post-title').value = currentPost.title;
            document.getElementById('post-content').value = currentPost.content;
            document.getElementById('post-category').value = currentPost.category;

            // Change create post button to update
            const createButton = document.querySelector('.post-creation button');
            createButton.textContent = 'Update Post';
            createButton.onclick = updatePost;

            // Scroll to post creation form
            document.querySelector('.post-creation').scrollIntoView({ behavior: 'smooth' });
        }

        // Update post
        function updatePost() {
            if (!currentPost) return;

            const title = document.getElementById('post-title').value;
            const content = document.getElementById('post-content').value;
            const category = document.getElementById('post-category').value;

            if (!title || !content) {
                alert('Please fill in title and content');
                return;
            }

            // Update post
            const postIndex = posts.findIndex(p => p.id === currentPost.id);
            if (postIndex !== -1) {
                posts[postIndex].title = title;
                posts[postIndex].content = content;
                posts[postIndex].category = category;
                
                localStorage.setItem('posts', JSON.stringify(posts));
                
                // Reset form
                document.getElementById('post-title').value = '';
                document.getElementById('post-content').value = '';
                
                // Reset button
                const createButton = document.querySelector('.post-creation button');
                createButton.textContent = 'Submit Post';
                createButton.onclick = createPost;
                
                loadPosts();
                showPostDetail(currentPost.id);
                alert('Post updated successfully!');
            }
        }

        // Delete post
        function deletePost() {
            if (!currentPost) return;

            if (confirm('Are you sure you want to delete this post?')) {
                posts = posts.filter(p => p.id !== currentPost.id);
                localStorage.setItem('posts', JSON.stringify(posts));
                
                // Hide post detail and show posts list
                document.getElementById('post-detail').classList.add('hidden');
                document.querySelector('.posts-list').classList.remove('hidden');
                
                loadPosts();
                alert('Post deleted successfully!');
            }
        }

// View user's posts in the main content area
        function viewMyPosts() {
            if (!currentUser) {
                alert('Please login to view your posts');
                return;
            }

            isViewingMyPosts = true;
            updatePostsListTitle();
            loadPosts();
            
            // Hide post detail if it's open
            document.getElementById('post-detail').classList.add('hidden');
            document.querySelector('.posts-list').classList.remove('hidden');
            
            // Close mobile sidebar if open
            closeMobileSidebar();
        }

        // Initialize the application when the page loads
        document.addEventListener('DOMContentLoaded', init);
