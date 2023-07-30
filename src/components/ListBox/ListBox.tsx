import React, { useState } from "react"
import { Text, Card, Checkbox, Paper, ScrollArea, useMantineTheme, useMantineColorScheme } from "@mantine/core"

interface IListBoxProps {
    items: string[]
    selected?: number
    checkboxEnabled?: boolean
    // checked?: number[]
    style?: React.CSSProperties
    onSelectionChange?: (index: number) => void
    onCheckedChange?: (checked: number[]) => void
}

export default function ListBox(props: IListBoxProps): React.JSX.Element {
    let theme = useMantineTheme()

    let [selected, setSelected] = useState(props.selected ?? -1)
    let [checked, setChecked] = useState<number[]>([])

    return (
        <ScrollArea style={{ height: "inherit", ...props.style }}>
            {
                props.items.map((item, index) => {
                    return (
                        <Paper shadow="sm" key={index} style={{ padding: "8px", margin: "1px 1px 8px 1px", display: "flex", alignItems: "center", outline: selected == index ? `${theme.colors.blue[6]} solid 1px` : "none" }} onClick={() => {
                            setSelected(index)
                            props.onSelectionChange?.call(null, index)
                        }}>
                            {
                                props.checkboxEnabled ? (
                                    <Checkbox checked={checked.includes(index)} onChange={(event) => {
                                        let newValue = checked.includes(index) ? checked.filter((value) => value !== index) : [...checked, index]

                                        setChecked((checked) => newValue)
                                        
                                        props.onCheckedChange?.call(null, newValue)
                                    }} />
                                ) : null
                            }
                            <Text style={{ marginLeft: "8px" }}>{item}</Text>
                        </Paper>
                    )
                })

            }
        </ScrollArea> 
    )
}
