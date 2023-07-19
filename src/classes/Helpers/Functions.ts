export function isNullOrEmpty<T>(array?: Array<T>): boolean {
    return array === null || array === undefined || array.length === 0;
}