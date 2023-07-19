import { useState, useEffect, useRef, createRef } from "react";
import Blog from "./components/Blog";
import blogService from "./services/blogs";
import loginService from "./services/login";
import Notification from "./components/Notification";
import Togglable from "./components/Togglable";
import BlogForm from "./components/BlogForm";
import BlogExpanded from "./components/BlogExpanded";
import LoginForm from "./components/LoginForm";
import "./App.css";

const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [user, setUser] = useState(null);
  const blogFormRef = useRef();

  useEffect(() => {
    blogService.getAll().then((blogs) => {
      const sortedBlogs = blogs.sort((a, b) => b.likes - a.likes);
      setBlogs(sortedBlogs);
    });
  }, []);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedBlogAppUser");
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      blogService.setToken(user.token);
    }
  }, []);
  const addBlog = (blogObject) => {
    blogFormRef.current.toggleVisibility();
    blogService
      .create(blogObject)
      .then((returnedBlog) => {
        setBlogs(blogs.concat(returnedBlog));
        setMessage(
          `A new blog ${returnedBlog.title} by ${returnedBlog.author} added`
        );
        setTimeout(() => {
          setMessage(null);
        }, 5000);
      })
      .catch((error) => {
        setMessage("Failed to add the blog. Please try again later.");
        console.error("Error adding blog:", error);
      });
  };
  const updateBlog = (id, blogObject) => {
    blogService
      .update(id, blogObject)
      .then((returnedBlog) => {
        setBlogs(blogs.map((blog) => (blog.id !== id ? blog : returnedBlog)));
        setMessage(`Blog ${blogObject.title} by ${blogObject.author} updated`);
        setTimeout(() => {
          setMessage(null);
        }, 5000);
      })
      .catch((error) => {
        setMessage("Failed to update the blog. Please try again later.");
        console.error("Error updating blog:", error);
      });
  };

  const deleteBlog = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this blog?"
    );

    if (confirmed) {
      blogService
        .deleteBlog(id)
        .then(() => {
          setBlogs(blogs.filter((blog) => blog.id !== id));
          setMessage("Blog deleted");
          setTimeout(() => {
            setMessage(null);
          }, 5000);
        })
        .catch(() => {
          setMessage("Failed to delete the blog. Please try again later.");
          setTimeout(() => {
            setMessage(null);
          }, 5000);
        });
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const user = await loginService.login({
        username,
        password,
      });
      window.localStorage.setItem("loggedBlogAppUser", JSON.stringify(user));
      blogService.setToken(user.token);
      setUser(user);

      setUsername("");
      setPassword("");
      setMessage(`${user.name}, welcome! You're now logged in`);
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    } catch (exception) {
      setMessage("Wrong username or password");
      setUsername("");
      setPassword("");
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    }
  };

  const handleLogout = () => {
    window.localStorage.clear();
    setUser(null);
  };

  const blogForm = () => (
    <div className="home">
      <h2>Blogs</h2>

      <Togglable
        buttonLabel="New blog"
        buttonHideLabel="cancel"
        ref={blogFormRef}
      >
        <BlogForm createBlog={addBlog} />
      </Togglable>

      {blogs.map((blog) => (
        <div className="Blog" key={blog.id}>
          <Blog key={blog.id} blog={blog} />
          <Togglable
            buttonLabel="view"
            buttonHideLabel="hide"
            ref={createRef()}
          >
            <BlogExpanded handleUpdate={updateBlog} blog={blog} />
          </Togglable>

          {user && blog.user && user.name === blog.user.name && (
            <button onClick={() => deleteBlog(blog.id)}>remove</button>
          )}
        </div>
      ))}
    </div>
  );

  const loginForm = () => (
    <LoginForm
      handleSubmit={handleLogin}
      username={username}
      password={password}
      setUsername={setUsername}
      setPassword={setPassword}
    />
  );

  return (
    <div>
      <h1>Blog App</h1>
      <Notification message={message} />
      {user === null ? (
        loginForm()
      ) : (
        <div>
          <p>{user.name} logged in</p>
          <button onClick={handleLogout}>logout</button>
        </div>
      )}
      {blogForm()}
    </div>
  );
};

export default App;
