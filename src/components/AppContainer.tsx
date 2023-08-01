import React from "react"
import { Theme } from "../classes/Helpers/Enums"
import { MantineThemeComponents } from "@mantine/styles/lib/theme/types/MantineTheme"
import { MantineProvider } from "@mantine/core"

interface IAppContainerProps {
    colorScheme: Theme
    componentDefinitions: MantineThemeComponents
    children?: React.ReactNode
}

export default function AppContainer(props: IAppContainerProps): React.JSX.Element {
    return (
        <div className="app-container">
            <MantineProvider withCSSVariables withGlobalStyles withNormalizeCSS theme={{ 
                colorScheme: props.colorScheme, 
                components: props.componentDefinitions
            }}>
                {props.children}
            </MantineProvider>

        </div>
    )
}