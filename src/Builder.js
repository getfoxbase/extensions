import { rollup } from 'rollup'
import autoResolve from '@rollup/plugin-auto-install'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { babel } from '@rollup/plugin-babel'
import { terser } from "rollup-plugin-terser"
import { v4 as uuid } from 'uuid'
import { Volume } from 'memfs'
import fs from 'fs'
import path from 'path'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/node'

export default class Builder {
    static async buildFromGit(url) {
        const vol = Volume.fromJSON({}, `/`)
        
        await git.clone({
            fs: vol,
            http,
            dir: `/`,
            url,
            singleBranch: true,
            depth: 1
        })

        const files = Object.fromEntries(
            Object.entries(vol.toJSON())
                .filter(file => file[0].substring(0, 6) !== '/.git/')
                .map(file => {
                    file[0] = file[0].substr(1)
                    return file
                })
        )

        return await this.build(files)
    }

    static ensureDirectoryExistence(filePath) {
        const dirname = path.dirname(filePath)
        if (fs.existsSync(dirname)) {
          return true
        }
        this.ensureDirectoryExistence(dirname)
        fs.mkdirSync(dirname)
      }

    static async build(sourceFiles) {
        const buildId = uuid()

        // Create folder and files
        fs.mkdirSync(`./${buildId}`)
        for (const filename in sourceFiles) {
            this.ensureDirectoryExistence(`./${buildId}/${filename}`)
            fs.writeFileSync(`./${buildId}/${filename}`, sourceFiles[filename])
        }
        
        // Determine main script
        let mainScript = 'index.js'
        if (fs.existsSync(`./${buildId}/package.json`)) {
            try {
                let packageJson = JSON.parse(fs.readFileSync(`./${buildId}/package.json`))
                mainScript = packageJson.main ?? 'index.js'
            } catch {}
        }

        // Rollup options
        const inputOptions = {
            input: `./${buildId}/${mainScript}`,
            plugins: [autoResolve({
                pkgFile: `./${buildId}/package.json`,
                manager: 'npm'
            }), nodeResolve(), commonjs({
                transformMixedEsModules: true,
                esmExternals: true
            }), babel({ babelHelpers: 'bundled' }), terser()]
        }
        const outputOptions = {
            file: `./${buildId}/__build__.js`,
            format: 'cjs'
        }

        // Build with Rollup and Babel
        const bundle = await rollup(inputOptions)
        const { output } = await bundle.generate(outputOptions);
        const code = output[0]?.code
        await bundle.close()

        // Clean build folder
        for (const filename in sourceFiles) {
            fs.unlinkSync(`./${buildId}/${filename}`)
        }
        if (fs.existsSync(`./${buildId}/package.json`)) {
            fs.unlinkSync(`./${buildId}/package.json`)
        }
        fs.rmdirSync(`./${buildId}`, {
            recursive: true
        })

        return code
    }
}