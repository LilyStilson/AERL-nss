import React from "react"
import ReactDOM from "react-dom/client"

import { createBrowserRouter, RouterProvider } from "react-router-dom"

import App from "./App"
import OutputModuleEditor from "./views/OutputModuleEditor"
import { SettingsProvider } from "./components/SettingsProvider"

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

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <SettingsProvider>
            <RouterProvider router={router} />
        </SettingsProvider>
    </React.StrictMode>,
)