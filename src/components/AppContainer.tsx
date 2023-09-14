import React, { useEffect } from "react"
import { Theme } from "../classes/Helpers/Enums"
import { MantineThemeComponents } from "@mantine/styles/lib/theme/types/MantineTheme"
import { MantineProvider, useMantineTheme } from "@mantine/core"
// import { useSettings } from "./SettingsProvider"

interface IAppContainerProps {
    theme: Theme
    children?: React.ReactNode
}

export default function AppContainer(props: IAppContainerProps): React.JSX.Element {
    let componentDefinitions = {
            Button: { defaultProps: { size: "md" } },
            TextInput: { defaultProps: { size: "md" } },
            NumberInput: { defaultProps: { size: "md" } },
            Checkbox: { defaultProps: { size: "md" } },
            Text: { defaultProps: { size: "md" } },
            Title: { defaultProps: { color: props.theme == Theme.Light ? "black" : "white" } },
            Select: { defaultProps: { size: "md", } },
            Card: { defaultProps: { withBorder: props.theme == Theme.Light } },
            Paper: { defaultProps: { withBorder: props.theme == Theme.Light } },
            Slider: { defaultProps: { size: "md" } },
        }

    useEffect(() => {
        console.debug("AppContainer.tsx :: Theme changed", props.theme)
    }, [props.theme])


    return (
        <div className="app-container">
            <MantineProvider withCSSVariables withGlobalStyles withNormalizeCSS theme={{ 
                colorScheme: props.theme, 
                components: componentDefinitions
            }}>
                {props.children}
            </MantineProvider>

        </div>
    )
}