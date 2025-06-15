import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmailInput } from "../EmailInput";

describe("EmailInput", () => {
  it("shows suggestions and allows selection", async () => {
    const user = userEvent.setup();
    const Wrapper = () => {
      const [value, setValue] = React.useState("test@");
      return <EmailInput value={value} onChange={setValue} />;
    };
    render(<Wrapper />);
    await user.type(screen.getByRole("textbox"), "gma");
    const suggestion = await screen.findByText("test@gmail.com");
    expect(suggestion).toBeInTheDocument();
    await user.click(suggestion);
    expect(screen.getByRole("textbox")).toHaveValue("test@gmail.com");
  });

  it("shows validation error for invalid email", () => {
    const Wrapper = () => {
      const [value, setValue] = React.useState("");
      return <EmailInput value={value} onChange={setValue} />;
    };
    render(<Wrapper />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "invalid" } });
    expect(screen.getByText(/missing the '@'/)).toBeInTheDocument();
  });

  it("warns for disposable domains", () => {
    const Wrapper = () => {
      const [value, setValue] = React.useState("");
      return <EmailInput value={value} onChange={setValue} />;
    };
    render(<Wrapper />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "a@tempmail.com" } });
    expect(screen.getByText(/Disposable email/)).toBeInTheDocument();
  });
});
