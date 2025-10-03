// Jest setup file for MVP Agent Builder
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    };
  },
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock ReactFlow
jest.mock('reactflow', () => {
  const React = require('react');
  return {
    ReactFlow: ({ children, ...props }) => React.createElement('div', { 'data-testid': 'react-flow', ...props }, children),
    Background: (props) => React.createElement('div', { 'data-testid': 'react-flow-background', ...props }),
    Controls: (props) => React.createElement('div', { 'data-testid': 'react-flow-controls', ...props }),
    MiniMap: (props) => React.createElement('div', { 'data-testid': 'react-flow-minimap', ...props }),
    useNodesState: () => [[], jest.fn(), jest.fn()],
    useEdgesState: () => [[], jest.fn(), jest.fn()],
    addEdge: jest.fn(),
    useReactFlow: () => ({
      getNodes: jest.fn(() => []),
      getEdges: jest.fn(() => []),
      setNodes: jest.fn(),
      setEdges: jest.fn(),
      addNodes: jest.fn(),
      addEdges: jest.fn(),
      deleteElements: jest.fn(),
      fitView: jest.fn(),
      zoomIn: jest.fn(),
      zoomOut: jest.fn(),
      project: jest.fn(),
      screenToFlowPosition: jest.fn(),
    }),
    ReactFlowProvider: ({ children }) => React.createElement('div', { 'data-testid': 'react-flow-provider' }, children),
    Panel: ({ children, ...props }) => React.createElement('div', { 'data-testid': 'react-flow-panel', ...props }, children),
  };
});

// Mock fetch globally
global.fetch = jest.fn();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock additional modules that might cause issues
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    span: 'span',
  },
  AnimatePresence: ({ children }) => children,
}));

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
  Toaster: () => null,
}));

jest.mock('lucide-react', () => ({
  Play: () => 'Play',
  Save: () => 'Save',
  Upload: () => 'Upload',
  Download: () => 'Download',
  Settings: () => 'Settings',
  X: () => 'X',
  Plus: () => 'Plus',
  Trash2: () => 'Trash2',
  Edit: () => 'Edit',
  Eye: () => 'Eye',
  ChevronDown: () => 'ChevronDown',
  Check: () => 'Check',
  Brain: () => 'Brain',
  MessageSquare: () => 'MessageSquare',
  Palette: () => 'Palette',
  ArrowLeft: () => 'ArrowLeft',
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }) => {
    const React = require('react');
    return React.createElement('button', props, children);
  },
}));

// Mock agent builder sub-components
jest.mock('@/components/agent-builder/visual-canvas', () => ({
  VisualCanvas: ({ children, ...props }) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'visual-canvas', ...props }, children);
  },
  VisualCanvasWrapper: ({ children, ...props }) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'visual-canvas-wrapper', ...props }, children);
  },
}));

jest.mock('@/components/agent-builder/node-toolbar', () => ({
  NodeToolbar: ({ ...props }) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'node-toolbar', ...props });
  },
}));

jest.mock('@/components/agent-builder/execution-panel', () => ({
  ExecutionPanel: ({ children, ...props }) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'execution-panel', ...props }, children);
  },
}));

jest.mock('@/components/agent-builder/natural-language-builder', () => ({
  NaturalLanguageBuilder: ({ ...props }) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'natural-language-builder', ...props });
  },
}));

// Suppress console warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is deprecated') ||
       args[0].includes('Warning: componentWillReceiveProps') ||
       args[0].includes('act(...)'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
