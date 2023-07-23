export function isNullOrEmpty<T>(array?: Array<T>): boolean {
    return array === null || array === undefined || array.length === 0;
}

export function tryParseNumber(str: string): number | undefined {
    let parsed = Number(str)
    return !isNaN(parsed) ? parsed : undefined
}

export function tryParseBoolean(str: string): boolean | undefined {
    const T = ["true", "True", "1"]
    const F = ["false", "False", "0"]
    if (T.includes(str)) return true
    if (F.includes(str)) return false
    return undefined
}