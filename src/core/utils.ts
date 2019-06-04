import { workspace } from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import LanguageCodes from '../meta/LanguageCodes'

export function caseInsensitiveMatch (a: string, b: string) {
  return a.toUpperCase() === b.toUpperCase()
}

export function normalizeLocale (locale: string, fallback = 'en'): string {
  if (!locale)
    return fallback

  const result = LanguageCodes.find(codes => {
    return Array.isArray(codes)
      ? !!codes.find(c => caseInsensitiveMatch(c, locale))
      : caseInsensitiveMatch(locale, codes)
  }) || fallback

  return Array.isArray(result)
    ? result[0].toString()
    : result
}

export function getKeyname (keypath: string) {
  const keys = keypath.split(/\./g)
  if (!keys.length)
    return ''
  return keys[keys.length - 1]
}

export function getFileInfo (filepath: string) {
  const info = path.parse(filepath)

  let locale = normalizeLocale(info.name, '')
  let nested = false
  if (!locale) {
    nested = true
    locale = normalizeLocale(path.basename(info.dir), '')
  }
  if (!locale)
    console.error(`Failed to get locale on file ${filepath}`)

  return {
    locale,
    nested,
  }
}

export function notEmpty<T> (value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

export function replaceLocalePath (filepath: string, targetLocale: string): string {
  const info = path.parse(filepath)

  if (normalizeLocale(info.name, ''))
    return path.resolve(info.dir, `${targetLocale}${info.ext}`)

  if (normalizeLocale(path.basename(info.dir), ''))
    return path.resolve(path.dirname(info.dir), targetLocale, `${info.name}${info.ext}`)

  return ''
}

export function isVueI18nProject (projectUrl: string): boolean {
  if (!projectUrl || !workspace.workspaceFolders)
    return false

  try {
    const rawPackageJSON = fs.readFileSync(`${projectUrl}/package.json`, 'utf-8')
    const {
      dependencies,
      devDependencies,
    } = JSON.parse(rawPackageJSON)
    return !!dependencies['vue-i18n'] || !!devDependencies['vue-i18n']
  }
  catch (err) {
    return false
  }
}