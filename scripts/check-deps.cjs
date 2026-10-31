const fs = require('fs')
const path = require('path')
const root = path.join(process.cwd(), 'node_modules')
const bad = []

function checkDir(dir) {
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith('.')) continue
    const full = path.join(dir, name)
    if (name.startsWith('@')) {
      checkDir(full)
      continue
    }
    const pkgFile = path.join(full, 'package.json')
    if (!fs.existsSync(pkgFile)) continue
    let pkg
    try {
      pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'))
    } catch {
      bad.push([name, 'package.json 解析失败'])
      continue
    }
    const mains = []
    if (typeof pkg.main === 'string') mains.push(pkg.main)
    if (pkg.exports && typeof pkg.exports === 'object') {
      const walk = (value) => {
        if (typeof value === 'string') mains.push(value)
        else if (value && typeof value === 'object') Object.values(value).forEach(walk)
      }
      walk(pkg.exports)
    }
    for (const entry of mains) {
      if (!entry.startsWith('.') || entry.includes('*')) continue
      const target = path.resolve(full, entry)
      if (!fs.existsSync(target)) {
        bad.push([name, entry])
        break
      }
    }
  }
}

checkDir(root)
console.log('node_modules 顶层条目数:', fs.readdirSync(root).length)
console.log('缺失入口文件的包:', bad.length)
bad.slice(0, 40).forEach(([name, entry]) => console.log(' -', name, '->', entry))
