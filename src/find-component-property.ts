import { defaultPrefix, FindTemplateOptions } from "./find-template-string"

export interface FoundProperty {
  start: number
  end: number
  code: string
  varName: string
  value: string
}

export function findComponentProperty(
  source: string,
  options?: FindTemplateOptions
): FoundProperty | undefined {
  // tslint:disable-next-line: whitespace
  let prefix = options?.prefix ?? defaultPrefix

  const lineBegin = `(?:^|\\n)`
  const compBegin = "export\\s+default\\s*(?:createComponent\\s*\\(\\s*)?{"
  const compBefore = "\\s*(?:.*,\\s*)?"
  const compEnd = "\\s*(?:}|,)"
  prefix = `(?:${prefix})`
  const templateString = "`(?:[^`\\\\]*(?:\\\\.[^`\\\\]*)*)`"
  const varNameRegex = `([a-zA-Z_][a-zA-Z0-9_]*|\\s*${prefix}\\s*(${templateString})(?:\\s*;)?)`
  const templProp = `template(?:\\s*:\\s*${varNameRegex})?`

  const reg = new RegExp(
    `(${lineBegin}${compBegin}${compBefore})(${templProp})${compEnd}`,
    "g"
  )

  const result: FoundProperty[] = []
  let found: RegExpExecArray | null

  while ((found = reg.exec(source)) !== null) {
    console.log("find-component-property found", found)
    const [, before, code, varName, value] = found
    const start = found.index + before.length
    result.push({
      start,
      end: start + code.length,
      code,
      varName: !varName ? "template" : varName,
      value
    })
  }

  if (result.length >= 2)
    throw new Error(`There are several candidate properties for the template`)
  console.log("find-component-property result", result[0])
  return result[0]
}
