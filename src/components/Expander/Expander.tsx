import React from "react"
import { Accordion, Button, Text, Title, createStyles, rem } from "@mantine/core"
import "./Expander.css"

interface IExpanderProps {
    title?: string
    subtitle?: string
    style?: React.CSSProperties
    menu?: React.ReactNode[]
    children?: React.ReactNode
}

const useStyles = createStyles((theme) => ({
    root: {
        // backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
        // borderRadius: theme.radius.sm,
    },
  
    item: {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[1],
        color: theme.colorScheme === 'dark' ? theme.white : theme.black,
        border: `${rem(1)} solid transparent`,
        position: 'relative',
        zIndex: 0,
        transition: 'transform 150ms ease',
  
        '&[data-active]': {
            // transform: 'scale(1.03)',
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
            boxShadow: theme.shadows.md,
            borderColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4],
            borderRadius: theme.radius.md,
            zIndex: 1,
        },
    },
}))

// Built on top of Mantine's Accordion
export default function Expander(props: IExpanderProps): React.JSX.Element {
    const { classes } = useStyles()
    return (
        <Accordion chevronPosition="left" variant="filled" classNames={classes} className={classes.root} style={props.style}>
            <Accordion.Item value="default">
                <div className="expander-title">
                    <Accordion.Control style={{ width: "unset", flexGrow: "1" }}>
                        <Title order={4} color="">{props.title}</Title>
                    </Accordion.Control>
                    <Text style={{ flexShrink: "1", marginRight: "8px" }}>{props.subtitle}</Text>
                    <Button.Group>
                        {props.menu}
                    </Button.Group>
                </div>
                <Accordion.Panel>{props.children}</Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    )
}