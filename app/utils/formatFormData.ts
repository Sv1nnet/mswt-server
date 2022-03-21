const parsers = {
  bool: (v: string) => v === 'true' ? true : v === 'false' ? false : v,
  number: (v: string) => v !== undefined && v !== null && v !== '' ? parseFloat(v) : undefined,
  undefined: (v: any) => v === null && v === '' ? undefined : v,
  string: (v: any) => v === undefined || v === null ? '' : v,
}

const parse = (value, parsers) => {
  if (Array.isArray(parsers)) {
    return parsers.reduce((acc, parser) => {
      return parser(acc)
    }, value)
  }
  return parsers(value)
}

const formatFormData = <F = {}, R = {}>(form: F, config = {}): R => (Object
  .entries(form)
  .reduce((acc, [ key, value ]) => {
    if (key in config) acc[key] = parse(value, parsers[config[key]])
    else acc[key] = value
    return acc
  }, {}) as R)

export default formatFormData
