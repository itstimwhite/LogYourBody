# Contributing to LogYourBody

Thank you for your interest in contributing to LogYourBody! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Bugs

1. **Check existing issues** first to avoid duplicates
2. **Use the bug report template** when creating new issues
3. **Provide detailed information** including:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, browser, version)
   - Screenshots if applicable

### Suggesting Features

1. **Check existing feature requests** to avoid duplicates
2. **Use the feature request template**
3. **Describe the use case** and why the feature would be valuable
4. **Consider alternatives** and discuss trade-offs

### Code Contributions

1. **Fork the repository** and create a feature branch
2. **Follow coding standards** and project conventions
3. **Write tests** for new functionality
4. **Update documentation** as needed
5. **Submit a pull request** using the provided template

## 🏗️ Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account (for backend features)
- Stripe account (for payment features)

### Local Development

```bash
# Clone your fork
git clone https://github.com/yourusername/LogYourBody.git
cd LogYourBody

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Fill in your environment variables

# Start development server
npm run dev

# Start Supabase (for backend features)
npm run supabase:start
```

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components
│   └── ...             # Feature-specific components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── lib/                # Utility functions
├── pages/              # Page components
├── types/              # TypeScript definitions
└── main.tsx           # App entry point
```

## 📋 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types for props and return values
- Avoid `any` type - use proper typing
- Use interface for object shapes, type for unions/primitives

```typescript
// Good
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// Avoid
const user: any = getUserData();
```

### React Components

- Use functional components with hooks
- Follow the single responsibility principle
- Use proper prop typing with interfaces
- Implement proper error boundaries

```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({ children, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button 
      className={cn('btn', `btn-${variant}`)}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Styling

- Use TailwindCSS utility classes
- Follow the existing design system
- Use the `cn()` utility for conditional classes
- Ensure responsive design (mobile-first)
- Maintain WCAG AA accessibility standards

```typescript
// Good
<div className={cn(
  "flex items-center space-x-2",
  isActive && "bg-primary text-primary-foreground",
  size === "sm" && "px-2 py-1 text-sm"
)}>
```

### Accessibility

- Use semantic HTML elements
- Include proper ARIA labels
- Ensure keyboard navigation works
- Test with screen readers
- Maintain color contrast ratios

```typescript
// Good
<button
  aria-label="Close dialog"
  onClick={onClose}
  className="absolute top-2 right-2"
>
  <X className="h-4 w-4" />
  <span className="sr-only">Close</span>
</button>
```

## 🧪 Testing

### Unit Tests

- Write tests for utility functions
- Test component behavior, not implementation
- Use descriptive test names
- Maintain test coverage above 80%

```typescript
// Example test
describe('formatBodyWeight', () => {
  it('should format weight with proper units', () => {
    expect(formatBodyWeight(70.5, 'kg')).toBe('70.5 kg');
    expect(formatBodyWeight(155.2, 'lbs')).toBe('155.2 lbs');
  });
});
```

### Integration Tests

- Test user workflows end-to-end
- Verify data persistence
- Test error handling scenarios

### Running Tests

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run type checking
npm run typecheck
```

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for complex functions
- Document component props and usage
- Include examples for non-obvious APIs

```typescript
/**
 * Calculates body mass index from weight and height
 * @param weight - Weight in kilograms
 * @param height - Height in centimeters
 * @returns BMI rounded to 1 decimal place
 */
export function calculateBMI(weight: number, height: number): number {
  return Math.round((weight / Math.pow(height / 100, 2)) * 10) / 10;
}
```

### README Updates

- Update setup instructions for new dependencies
- Document new environment variables
- Add examples for new features

## 🔄 Pull Request Process

### Before Submitting

1. **Ensure all tests pass**
   ```bash
   npm test
   npm run typecheck
   ```

2. **Check code formatting**
   ```bash
   npm run format.fix
   ```

3. **Verify accessibility** (for UI changes)
   - Test keyboard navigation
   - Check color contrast
   - Verify screen reader compatibility

4. **Test responsive design** (for UI changes)
   - Mobile devices
   - Tablet breakpoints
   - Desktop resolutions

### PR Guidelines

- **Use descriptive titles** and clear descriptions
- **Link related issues** using "Fixes #123" or "Related to #123"
- **Include screenshots** for UI changes
- **List breaking changes** if any
- **Update documentation** as needed

### Review Process

1. **Automated checks** must pass (tests, type checking, building)
2. **Maintainer review** for code quality and design
3. **Accessibility review** for UI changes
4. **Final approval** and merge

## 🎨 Design Guidelines

### UI/UX Principles

- **Consistency**: Follow established patterns and components
- **Simplicity**: Keep interfaces clean and intuitive
- **Accessibility**: Design for all users and devices
- **Performance**: Optimize for speed and efficiency

### Color Scheme

Use the existing Tailwind color palette:
- Primary: Blue tones for main actions
- Secondary: Gray tones for secondary actions
- Success: Green for positive feedback
- Warning: Yellow for warnings
- Error: Red for errors

### Typography

- Headings: Use the established hierarchy (h1-h6)
- Body text: Maintain readability with proper line height
- Code: Use monospace fonts for technical content

## 🐛 Debugging

### Common Issues

1. **Environment variables not loaded**
   - Ensure `.env` file exists
   - Restart development server after changes

2. **Supabase connection issues**
   - Check Supabase is running: `npm run supabase:start`
   - Verify environment variables are correct

3. **Build failures**
   - Run type checking: `npm run typecheck`
   - Check for unused imports
   - Ensure all dependencies are installed

### Debugging Tools

- React DevTools browser extension
- Supabase Studio for database inspection
- Browser network tab for API calls
- Console for error messages and warnings

## 📊 Performance Considerations

### Optimization Guidelines

- **Bundle size**: Avoid unnecessary dependencies
- **Code splitting**: Use dynamic imports for large components
- **Image optimization**: Use appropriate formats and sizes
- **Caching**: Implement proper caching strategies
- **Database queries**: Optimize Supabase queries

### Monitoring

- Use built-in performance monitoring
- Check bundle analyzer output
- Monitor Core Web Vitals
- Test on various devices and connections

## 🔒 Security

### Guidelines

- **Never commit secrets** to the repository
- **Sanitize user inputs** to prevent XSS
- **Use HTTPS** for all external requests
- **Implement proper authentication** checks
- **Follow OWASP guidelines** for web security

### Environment Variables

- Use `.env.example` for documentation
- Never commit actual `.env` files
- Use different keys for development and production
- Rotate keys regularly

## 📱 Mobile Development

### Responsive Design

- Design mobile-first
- Test on actual devices when possible
- Ensure touch targets are adequate (44px minimum)
- Optimize for various screen sizes

### PWA Features

- Maintain service worker functionality
- Test offline capabilities
- Ensure proper manifest configuration

## 🚀 Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version number bumped
- [ ] Migration scripts (if needed)
- [ ] Deployment verified

## 📞 Getting Help

### Community

- **GitHub Discussions**: General questions and community chat
- **GitHub Issues**: Bug reports and feature requests
- **Email**: tim@timwhite.dev for direct contact

### Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🙏 Recognition

Contributors who make significant contributions will be:
- Added to the contributors list in README.md
- Mentioned in release notes
- Given credit in relevant documentation

Thank you for contributing to LogYourBody! Your help makes this project better for everyone. 🎉