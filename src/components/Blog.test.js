import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import Blog from "./Blog";
import Togglable from "./Togglable";
import BlogExpanded from "./BlogExpanded";
import BlogForm from "./BlogForm";
import userEvent from "@testing-library/user-event";

describe("Blog", () => {
  const blog = {
    title: "Blog Title",
    author: "Blog Author",
    url: "Blog URL",
    likes: 0,
    user: {
      username: "Blog User",
      name: "Blog User Name",
      id: "Blog User ID",
    },
    id: "Blog ID",
  };
  test("renders title/author but not whole blog", () => {
    const component = render(<Blog blog={blog} />);
    expect(component.container).toHaveTextContent("Blog Title");
    expect(component.container).toHaveTextContent("Blog Author");
    expect(component.container).not.toHaveTextContent("Blog URL");
    expect(component.container).not.toHaveTextContent("Blog User");
    expect(component.container).not.toHaveTextContent("Blog User Name");
    expect(component.container).not.toHaveTextContent("Blog User ID");
    expect(component.container).not.toHaveTextContent("Blog ID");
  });
  test("renders title/author/url/likes after expanding blog to expanded blog", () => {
    const component = render(
      <div className="Blog" key={blog.id}>
        <Blog key={blog.id} blog={blog} />
        <Togglable buttonLabel="view" buttonHideLabel="hide">
          <BlogExpanded blog={blog} />
        </Togglable>
      </div>
    );
    const button = component.getByText("view");
    act(() => {
      button.click();
    });

    expect(component.container).toHaveTextContent("Blog Title");
    expect(component.container).toHaveTextContent("Blog Author");
    expect(component.container).toHaveTextContent("Blog URL");
    expect(component.container).toHaveTextContent("Blog User");
    expect(component.container).toHaveTextContent("Blog User Name");
  });
  test("ensures like button is clicked twice", () => {
    const mockHandler = jest.fn();
    const component = render(
      <div className="Blog" key={blog.id}>
        <Blog key={blog.id} blog={blog} />
        <Togglable buttonLabel="view" buttonHideLabel="hide">
          <BlogExpanded handleUpdate={mockHandler} blog={blog} />
        </Togglable>
      </div>
    );
    const button = component.getByText("view");
    act(() => {
      button.click();
    });
    const likeButton = component.getByText("Like");
    act(() => {
      likeButton.click();
    });
    act(() => {
      likeButton.click();
    });
    expect(mockHandler.mock.calls).toHaveLength(2);
  });
  test("<BlogForm > calls event handler with right details when blog is creatd", () => {
    const createBlog = jest.fn();
    const component = render(<BlogForm createBlog={createBlog} />);
    const title = screen.getByPlaceholderText("Blog Title");
    const author = screen.getByPlaceholderText("Blog Author");
    const url = screen.getByPlaceholderText("Blog URL");

    const submitButton = component.getByText("create");
    userEvent.type(title, "Blog Title");
    userEvent.type(author, "Blog Author");
    userEvent.type(url, "Blog URL");
    userEvent.click(submitButton);

    expect(createBlog.mock.calls).toHaveLength(1);
    expect(createBlog.mock.calls[0][0].title).toBe("Blog Title");
    expect(createBlog.mock.calls[0][0].author).toBe("Blog Author");
    expect(createBlog.mock.calls[0][0].url).toBe("Blog URL");
  });
});
