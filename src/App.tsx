import "./App.css"
import { Card,  MantineProvider, Button } from "@mantine/core"
import { WebviewWindow, appWindow } from '@tauri-apps/api/window'
import MainView, { TMainViewHandle } from "./views/MainView"
import MenuBar from "./components/MenuBar/MenuBar"
import { CloseIcon, ExpandIcon, MinimizeIcon } from "./components/Icons/Icons"
import { CSSProperties, useEffect, useRef, useState } from "react"
import { Platform, GetPlatform } from "./classes/Helpers/Platform"
import { Theme } from "./classes/Helpers/Enums";
import { LauncherLogoIcon } from "./components/Icons/Icons"
import settings from "./classes/Settings"
import AppContainer from "./components/AppContainer"

export default function App() {
    let [isWindowMaximized, setIsWindowMaximized] = useState(false);
    let [modalOpened, setModalOpened] = useState(false);
    let [recentProjects, setRecentProjects] = useState<string[]>([])
    let mainViewRef = useRef<TMainViewHandle>(null)

    appWindow.onResized(async () => {
        setIsWindowMaximized(await appWindow.isMaximized())
    })

    useEffect(() => {
        (async () => {
            await settings.init()
            if (!settings.isLoaded) 
                if (!await settings.tryLoad()) 
                    if (!await settings.tryLoadLegacy())
                        await settings.reset()
            
            setRecentProjects(settings.Current.RecentProjects)
        
            console.log(settings)
        })()

        return () => {
            settings.save()
        }
    }, [])

    function appExit() {
        WebviewWindow.getByLabel("omeditor")?.close()
        appWindow.close()
    }
    
    return (
        <AppContainer colorScheme={settings.colorScheme} componentDefinitions={settings.ComponentDefinitions}>
            <div style={{ display: "flex", width: "100%", flexWrap: "nowrap", flexDirection: "column", margin: "8px" }}>
                <div style={{ flex: "0 1" }}>
                    <Card shadow="sm" className="titlebar" data-tauri-drag-region>
                        <div className="menubar">
                            <MenuBar variant="subtle" position="bottom-start" disabled={modalOpened} menuItems={[
                                {
                                    name: "AErender Launcher",
                                    appButton: true,
                                    icon: <LauncherLogoIcon size={24} />,
                                    children: [
                                        {
                                            name: "Output Module Editor",
                                            shortcut: { windows: "Ctrl+O", macos: "Cmd+O" },
                                            onClick: async () => {
                                                const om = WebviewWindow.getByLabel("omeditor")
                                                console.log(om)
                                                if (om) om.show()
                                            }
                                        },
                                        {
                                            name: "Settings",
                                            shortcut: { windows: "Ctrl+P", macos: "Cmd+P" },
                                        },
                                        {
                                            name: "About AErender Launcher",
                                            shortcut: { windows: "F12" },
                                        }
                                    ]
                                },
                                {
                                    name: "File",
                                    children: [
                                        {
                                            name: "Recent projects",
                                            // TODO: temp data to test menu spawning
                                            children: recentProjects.map((project) => { return { name: project } })
                                        },
                                        {
                                            name: "Import Configuration",
                                            shortcut: { windows: "Ctrl+I", macos: "Cmd+I" },
                                        },
                                        {
                                            name: "Export Configuration",
                                            shortcut: { windows: "Ctrl+E", macos: "Cmd+E" },
                                        },
                                        {
                                            name: "Exit",
                                            shortcut: { windows: "Alt+F4", macos: "Cmd+Q" },
                                            onClick: appExit
                                        }
                                    ]
                                },
                                {
                                    name: "Tasks",
                                    children: [
                                        {
                                            name: "New Task",
                                            shortcut: { windows: "Ctrl+N", macos: "Cmd+N" },
                                            onClick: async () => mainViewRef.current?.newTask()
                                        },
                                        {
                                            name: "Edit Task",
                                            shortcut: { windows: "Ctrl+R", macos: "Cmd+R" },
                                        },
                                        {
                                            name: "Duplicate Task",
                                            shortcut: { windows: "Ctrl+D", macos: "Cmd+D" },
                                        },
                                        {
                                            name: "Delete Task",
                                            shortcut: { windows: "Delete", macos: "Backspace" },
                                        }
                                    ]
                                },
                                {
                                    name: "Help",
                                    children: [
                                        {
                                            name: "Documentation",
                                            shortcut: { windows: "F1" },
                                        }
                                    ]
                                }
                            ]} />
                        </div>
                        <div className="chrome">
                            <Button.Group>
                                <Button variant="subtle" color="blue" onClick={() => {
                                    appWindow.minimize()
                                }}>
                                    <MinimizeIcon size={12} filled respectsTheme />
                                </Button>
                                <Button variant="subtle" color="blue" onClick={() => {
                                    appWindow.toggleMaximize()
                                }}>
                                    <ExpandIcon size={12} filled alt={isWindowMaximized} respectsTheme/>
                                </Button>
                                <Button variant="subtle" color="red" onClick={appExit}>
                                    <CloseIcon size={14} filled respectsTheme />
                                </Button>
                            </Button.Group>
                        </div>
                    </Card>
                </div>
                <div style={{ flex: "2 0", height: "100%", marginTop: "8px" }}>
                    <MainView ref={mainViewRef} callback={(sender: unknown) => {
                        if (typeof(sender) == "boolean") {
                            setModalOpened(sender as boolean)
                        }
                    }} />
                </div>
            </div>
        </AppContainer>
    )
}