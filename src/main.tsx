import React, { useState } from "react"
import ReactDOM from "react-dom/client"

import { BrowserRouter, createBrowserRouter, Route, RouterProvider, Routes, useNavigate } from "react-router-dom"

import App from "./App"
import OutputModuleEditor from "./views/OutputModuleEditor"
// import { SettingsProvider } from "./components/SettingsProvider"

/**
 * ! Use Tauri's events to communicate between routes
 */
const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
    },
    {
        path: "/omeditor",
        element: <OutputModuleEditor />,
    },
])

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        {/* <SettingsProvider> */}
            <RouterProvider router={router} />
        {/* </SettingsProvider> */}
    </React.StrictMode>,
)