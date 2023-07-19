const BlogExpanded = ({ blog, handleUpdate }) => {
  const update = (event) => {
    event.preventDefault();

    const updated = {
      user: blog.user.id,
      title: blog.title,
      author: blog.author,
      url: blog.url,
      likes: blog.likes + 1,
    };
    const id = blog.id;

    handleUpdate(id, updated);
  };

  return (
    <div className="BlogExpanded">
      <div>{blog.url}</div>

      <div>
        likes: {blog.likes} <button onClick={update}>Like</button>
      </div>
      {blog.user && <div>author: {blog.user.name}</div>}
    </div>
  );
};

export default BlogExpanded;
