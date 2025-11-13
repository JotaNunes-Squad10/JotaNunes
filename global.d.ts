// Allow importing CSS and other static assets in TypeScript files (side-effect imports)
// This prevents TS error 2882: "Cannot find module or type declarations for side-effect import of '*.css'".

declare module '*.css';
declare module '*.scss';
declare module '*.sass';
declare module '*.less';

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg' {
  const content: string;
  export default content;
}

// If you need more strict typing for CSS modules, replace the above with
// declarations for '*.module.css' returning an object mapping class names to strings.
