export default class PathUtils {
    static getFile(filePath: string): string {
        const parts = filePath.split(/[\\/]/)
        return parts[parts.length - 1]
    }
    static getFileExtension(filePath: string): string {
        const fileName = this.getFile(filePath)
        const extensionParts = fileName.split(".")
        return extensionParts.length > 1 ? extensionParts[extensionParts.length - 1] : ""
    }
    static getFileName(filePath: string): string {
        return this.getFile(filePath).replace(`.${this.getFileExtension(filePath)}`, "")
    }
}