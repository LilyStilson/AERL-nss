import { get } from "http";

enum Platform {
    Windows = "Win",
    macOS = "Mac",
    Linux = "Linux",
}

function GetPlatform(): Platform | null {
    const UA = navigator.userAgent;
    if (UA.indexOf(Platform.Windows) != -1) {
        return Platform.Windows;
    }

    if (UA.indexOf(Platform.macOS) != -1) {
        return Platform.macOS;
    }

    if (UA.indexOf(Platform.Linux) != -1) {
        return Platform.Linux;
    }

    return null
}

export { Platform, GetPlatform }