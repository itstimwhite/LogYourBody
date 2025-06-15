import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { 
  StepContainer, 
  StepHeader, 
  QuickPresets, 
  FormField 
} from "../step-container";
import { Scale } from "lucide-react";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("StepContainer", () => {
  it("renders children with animation classes", () => {
    render(
      <StepContainer>
        <div data-testid="child">Test Content</div>
      </StepContainer>
    );

    const container = screen.getByTestId("child").parentElement;
    expect(container).toHaveClass("space-y-8");
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <StepContainer className="custom-class">
        <div>Test</div>
      </StepContainer>
    );

    const container = screen.getByText("Test").parentElement;
    expect(container).toHaveClass("space-y-8", "custom-class");
  });
});

describe("StepHeader", () => {
  it("renders icon, title, and subtitle", () => {
    render(
      <StepHeader
        icon={<Scale data-testid="icon" />}
        title="Test Title"
        subtitle="Test Subtitle"
      />
    );

    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Subtitle")).toBeInTheDocument();
  });

  it("renders without subtitle", () => {
    render(
      <StepHeader
        icon={<Scale />}
        title="Test Title"
      />
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.queryByText("Test Subtitle")).not.toBeInTheDocument();
  });

  it("applies custom icon colors", () => {
    render(
      <StepHeader
        icon={<Scale />}
        title="Test"
        iconBgColor="bg-red-100"
        iconColor="text-red-500"
      />
    );

    const iconContainer = screen.getByText("Test")
      .parentElement
      ?.parentElement
      ?.querySelector(".mx-auto");
    
    expect(iconContainer).toHaveClass("bg-red-100");
    
    const iconWrapper = iconContainer?.querySelector(".h-10");
    expect(iconWrapper).toHaveClass("text-red-500");
  });
});

describe("QuickPresets", () => {
  const mockOnSelect = vi.fn();
  
  const presets = [
    { label: "Small", value: 10 },
    { label: "Medium", value: 20 },
    { label: "Large", value: 30 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all preset buttons", () => {
    render(
      <QuickPresets
        presets={presets}
        selectedValue={20}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText("Quick presets")).toBeInTheDocument();
    expect(screen.getByText("Small")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("Large")).toBeInTheDocument();
  });

  it("highlights selected preset", () => {
    render(
      <QuickPresets
        presets={presets}
        selectedValue={20}
        onSelect={mockOnSelect}
      />
    );

    const selectedButton = screen.getByText("Medium").closest("button");
    expect(selectedButton).toHaveClass("border-linear-purple", "bg-linear-purple", "text-white");
    
    const unselectedButton = screen.getByText("Small").closest("button");
    expect(unselectedButton).not.toHaveClass("bg-linear-purple");
  });

  it("calls onSelect when preset is clicked", () => {
    render(
      <QuickPresets
        presets={presets}
        selectedValue={20}
        onSelect={mockOnSelect}
      />
    );

    fireEvent.click(screen.getByText("Large"));
    expect(mockOnSelect).toHaveBeenCalledWith(30);
  });

  it("uses custom format label function", () => {
    const customFormat = (preset: any) => `${preset.label} (${preset.value})`;
    
    render(
      <QuickPresets
        presets={presets}
        selectedValue={20}
        onSelect={mockOnSelect}
        formatLabel={customFormat}
      />
    );

    expect(screen.getByText("Small (10)")).toBeInTheDocument();
    expect(screen.getByText("Medium (20)")).toBeInTheDocument();
    expect(screen.getByText("Large (30)")).toBeInTheDocument();
  });
});

describe("FormField", () => {
  it("renders children with label", () => {
    render(
      <FormField label="Test Label">
        <input data-testid="input" />
      </FormField>
    );

    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByTestId("input")).toBeInTheDocument();
  });

  it("shows helper text when no error", () => {
    render(
      <FormField helper="This is helpful">
        <input />
      </FormField>
    );

    expect(screen.getByText("This is helpful")).toBeInTheDocument();
  });

  it("shows error message instead of helper text", () => {
    render(
      <FormField 
        helper="This is helpful" 
        error="This is an error"
      >
        <input />
      </FormField>
    );

    expect(screen.getByText("This is an error")).toBeInTheDocument();
    expect(screen.queryByText("This is helpful")).not.toBeInTheDocument();
  });

  it("error message has alert role", () => {
    render(
      <FormField error="Error message">
        <input />
      </FormField>
    );

    const errorElement = screen.getByRole("alert");
    expect(errorElement).toHaveTextContent("Error message");
  });

  it("applies custom className", () => {
    render(
      <FormField className="custom-class">
        <input />
      </FormField>
    );

    const container = screen.getByRole("textbox").parentElement;
    expect(container).toHaveClass("space-y-3", "custom-class");
  });
});