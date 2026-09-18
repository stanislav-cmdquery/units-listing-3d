declare module '*.css' {
  const styles: Record<string, never>
  export default styles
}

// Replaced by the consumer's bundler; only NODE_ENV is read, for dev-only warnings.
declare const process: { env: { NODE_ENV?: string } }
