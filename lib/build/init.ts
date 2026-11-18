import { fs, globby, question } from 'zx'

const files = await globby('**/*.{ts,tsx,html,json,yaml,md}', {
  dot: true,
  ignore: ['node_modules/**', '.output/**', '.wxt/**', __filename],
})

const projectName = await question('Please enter the project name: ')
const projectId = projectName.replaceAll(' ', '-').toLowerCase()

const id = 'browser-extension-template'
const name = 'Browser Extension Template'

for (const it of files) {
  let content = (await fs.readFile(it, 'utf-8')) as string
  if (!content.includes(id) && !content.includes(name)) {
    continue
  }
  content = content.replaceAll(id, projectId).replaceAll(name, projectName)
  await fs.writeFile(it, content)
}
