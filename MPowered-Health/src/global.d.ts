// This file tells TypeScript how the project imports shared asset types.
// CSS imports resolve to a map from class names to generated class strings.
declare module '*.css' {
  const classes: Record<string, string>;
  export default classes;
}
