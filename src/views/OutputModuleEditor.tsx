import React, { useState } from "react"
import { appWindow, getCurrent as getCurrentWindow } from "@tauri-apps/api/window"
import AppContainer from "../components/AppContainer"
import settings from "../classes/Settings"
import { Button, Card, Title } from "@mantine/core"
import { CloseIcon, ExpandIcon, MinimizeIcon } from "../components/Icons/Icons"
import ContentProvider from "../components/ContentProvider/ContentProvider"

// getCurrentWindow().hide()
export default function OutputModuleEditor(): React.JSX.Element {
    const thisWindow = getCurrentWindow()

    let [isWindowMaximized, setIsWindowMaximized] = useState(false);

    thisWindow.onResized(async () => {
        setIsWindowMaximized(await thisWindow.isMaximized())
    })
    
    return (
        <AppContainer colorScheme={settings.colorScheme} componentDefinitions={settings.ComponentDefinitions}>
            <ContentProvider style={{ width: "100%", padding: "8px" }}
                Header={
                    <Card shadow="sm" data-tauri-drag-region style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px" }}>
                        <Title order={4}>Output Module Editor</Title>
                        <div className="chrome">
                            <Button.Group>
                                <Button variant="subtle" color="blue" onClick={() => {
                                    thisWindow.minimize()
                                }}>
                                    <MinimizeIcon size={12} filled respectsTheme />
                                </Button>
                                <Button variant="subtle" color="blue" onClick={() => {
                                    thisWindow.toggleMaximize()
                                }}>
                                    <ExpandIcon size={12} filled alt={isWindowMaximized} respectsTheme/>
                                </Button>
                                <Button variant="subtle" color="red" onClick={() => {
                                    thisWindow.hide()
                                }}>
                                    <CloseIcon size={14} filled respectsTheme />
                                </Button>
                            </Button.Group>
                        </div>
                    </Card>
                }
                Content={
                    <Card shadow="sm">

                    </Card>
                }
                Footer={
                    <Card shadow="sm">

                    </Card>       
                }
            />
        </AppContainer>
    )
}