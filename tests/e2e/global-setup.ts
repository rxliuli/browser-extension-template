import { execSync } from 'node:child_process'

/**
 * Builds the test variant of the extension once per run. It differs from the
 * production build only in being granted every site in the manifest, because
 * a test cannot click the browser's permission prompt.
 */
export default function setup() {
  execSync('pnpm exec wxt build --mode e2e', { stdio: 'inherit' })
}
