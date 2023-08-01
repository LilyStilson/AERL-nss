import React, { forwardRef, useImperativeHandle, useState } from "react"
import { Text, Card, Checkbox, Paper, ScrollArea, useMantineTheme, useMantineColorScheme } from "@mantine/core"

export interface IListBoxProps {
    items: string[]
    selected?: number
    checkboxEnabled?: boolean
    // checked?: number[]
    style?: React.CSSProperties
    onSelectionChange?: (index: number) => void
    onCheckedChange?: (checked: number[]) => void
}

export type TListBoxSelectionHandle = {
    selectAll: () => void
    deselectAll: () => void
}

//export default function ListBox(props: IListBoxProps): React.JSX.Element {
const ListBox = forwardRef<TListBoxSelectionHandle, IListBoxProps>((props: IListBoxProps, thisRef) => {
    let theme = useMantineTheme()

    let [selected, setSelected] = useState(props.selected ?? -1)
    let [checked, setChecked] = useState<number[]>([])

    useImperativeHandle(thisRef, () => ({
        selectAll() {
            let newValue = props.items.map((item, index) => index)
            setChecked((checked) => newValue)
            props.onCheckedChange?.call(null, newValue)
        },
        deselectAll() {
            setChecked((checked) => [])
            props.onCheckedChange?.call(null, [])
        }
    }))

    return (
        <ScrollArea style={{ height: "100%", ...props.style }}>
            {
                props.items.map((item, index) => {
                    return (
                        <Paper shadow="sm" key={index} style={{ padding: "4px", margin: "1px 1px 4px 1px", display: "flex", alignItems: "center", outline: selected == index ? `${theme.colors.blue[6]} solid 1px` : "none" }} onClick={() => {
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
})

export default ListBox