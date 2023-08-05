import { createStyles, rem } from "@mantine/core"
import { useListState } from "@mantine/hooks"
import "./DragDropList.css"
import React from "react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import GripIcon from "../Icons/GripIcon"

export interface DragDropListProps {
    items: any[]
    itemTemplate: (item: React.JSX.Element, index: number) => React.ReactNode
    onReorder: (newOrder: number[]) => void
}

const useStyles = createStyles((theme) => ({
    item: {
        display: 'flex',
        alignItems: 'center',
        borderRadius: theme.radius.md,
        border: `${rem(1)} solid ${
            theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
        }`,
        padding: `${theme.spacing.sm} ${theme.spacing.xl}`,
        paddingLeft: `calc(${theme.spacing.xl} - ${theme.spacing.md})`, // to offset drag handle
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.white,
        marginBottom: theme.spacing.sm,
    },

    itemDragging: {
        boxShadow: theme.shadows.sm,
    },

    symbol: {
        fontSize: rem(30),
        fontWeight: 700,
        width: rem(60),
    },

    dragHandle: {
        ...theme.fn.focusStyles(),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[6],
        paddingLeft: theme.spacing.md,
        paddingRight: theme.spacing.md,
    },
}));

export default function DragDropList(props: DragDropListProps): React.JSX.Element {
    const { classes, cx } = useStyles()
    const [state, handlers] = useListState(props.items)

    const listItems = props.items.map((item, index) => (
        <Draggable key={item ^ index} index={index} draggableId={`${item ^ index}`}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={cx(classes.item, snapshot.isDragging && classes.itemDragging)}
                >
                    <div {...provided.dragHandleProps} className={classes.dragHandle}>
                        <GripIcon filled respectsTheme size={24} />
                    </div>
                    {props.itemTemplate(item, index)}
                </div>
            )}
        </Draggable>
    ))

    return (
        <DragDropContext onDragEnd={({ destination, source }) => handlers.reorder({ from: source.index, to: destination?.index ?? 0 })}>
            <Droppable droppableId="dnd-list" direction="vertical">
                {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                        {listItems}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    )
}