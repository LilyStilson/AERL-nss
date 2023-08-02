import React from "react"
import ReactDOM from "react-dom/client"

import { createBrowserRouter, RouterProvider } from "react-router-dom"

import App from "./App"
import OutputModuleEditor from "./views/OutputModuleEditor"

import { invoke } from "@tauri-apps/api"
import { exit } from "@tauri-apps/api/process"
import Arguments from "./classes/Arguments"
import { appWindow, WebviewWindow, WindowManager } from "@tauri-apps/api/window"

let args: Arguments = new Arguments()
await args.init()
if (args.arguments) {
    for (let arg of args.arguments) {
        switch (arg.name) {
            case "print":
                console.log("print")
                await invoke("print_console", { msg: `print arg = ${arg.value}` })
                break
        }
    }
    await exit(0)
}

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />
    },
    {
        path: "/omeditor",
        element: <OutputModuleEditor />
    }
])

WebviewWindow.getByLabel("main")?.show()

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
)