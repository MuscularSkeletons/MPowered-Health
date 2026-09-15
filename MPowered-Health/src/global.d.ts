/** Declares project-wide TypeScript types. */
// CSS imports resolve to a map from class names to generated class strings.
declare module '*.css' {
  const classes: Record<string, string>;
  export default classes;
}
