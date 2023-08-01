import { ScrollArea } from "@mantine/core"

interface IListViewProps<T> {
    items: T[]
    itemTemplate: (item: T, index: number) => React.ReactNode
    style?: React.CSSProperties
}

export default function ListView<T>(props: IListViewProps<T>): React.JSX.Element {
    return (
        <ScrollArea style={{ height: "100%" }}>
            {
                props.items.map((item, index) => {
                    return (
                        props.itemTemplate.call(null, item, index)
                    )
                })
            }
        </ScrollArea>
    )
}