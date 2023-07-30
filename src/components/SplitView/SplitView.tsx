import React, { useState, useRef, createRef, useEffect } from "react"
import GripIcon from "../Icons/GripIcon"
import { tryParseNumber } from "../../classes/Helpers/Functions"
import "./SplitView.css"

interface ISplitViewProps {
    leftPane?: React.JSX.Element
    rightPane?: React.JSX.Element
    gripIcon?: React.JSX.Element
    defaultSizes?: number[] | string[]
    splitterPos?: number | string
    minSize?: number[] | string[]
    style: React.CSSProperties
}

/**
 * @brief Possibly the simplest React SplitView setup
 * @remarks I kinda surprised that I couldn't find an out-of-the-box working solution for this... This is a very basic implementation, and any fixes/changes are very welcome :)
 * @param props Default SplitView props
 * @returns A `<SplitView />` component
 */
export default function SplitView(props: ISplitViewProps): React.JSX.Element {
    const
        [isDragging, setIsDragging] = useState(false),
        [splitterPos, setSplitterPos] = useState(props.splitterPos ? `${props.splitterPos}px` : "50%"),
        [leftPaneWidth, setLeftPaneWidth] = useState(props.defaultSizes ? props.defaultSizes[0] : "50%"),
        [rightPaneWidth, setRightPaneWidth] = useState(props.defaultSizes ? props.defaultSizes[1] : "50%"),
        gripIcon = props.gripIcon ?? <GripIcon filled respectsTheme size={12}/>,
        minSize = props.minSize?.map((value, index) => {
            if (typeof value === "string") {
                const parsed = tryParseNumber(value)
                if (parsed) return parsed
                else return 0
            } else return value
        }) ?? [192, 192]

    let
        wrapperRef = useRef<HTMLDivElement>(null),
        splitterRef = useRef<HTMLDivElement>(null),
        leftPaneRef = useRef<HTMLDivElement>(null),
        rightPaneRef = useRef<HTMLDivElement>(null)

    const onMouseDown = () => setIsDragging(true)
    const onMouseUp = () => setIsDragging(false)

    // this will bite my ass later...
    useEffect(() => {
        if (isDragging  /*|| !wrapperRect || !leftPaneWidth || !rightPaneWidth*/) return

        const observer = new ResizeObserver((entries, observer) => {

            // Looks ridiculous, but for whatever reason useEffect
            // does not have the most recent state?
            //
            // Having traverse the entry.target is slightly slower, but much more reliable 
            let wrapper = entries[0].contentRect,
                leftPaneWidthNum = [...entries[0].target.children].find((item) => item.className === "left-pane")?.clientWidth ?? wrapper.width / 2,
                rightPaneWidthNum = [...entries[0].target.children].find((item) => item.className === "right-pane")?.clientWidth ?? wrapper.width / 2

            // const
            //     newLeftPaneWidth = wrapperRect.width * (parseInt(leftPaneWidth) / wrapperRect.width),
            //     newRightPaneWidth = wrapperRect.width * (parseInt(rightPaneWidth) / wrapperRect.width)

            // first - detect smallest panel
            if (leftPaneWidthNum < rightPaneWidthNum) {
                // left pane is smaller
                // keep left pane size, resize right pane
                let newRightPaneWidth = wrapper.width - leftPaneWidthNum
                if (newRightPaneWidth < minSize[1])
                    newRightPaneWidth = minSize[1]

                setRightPaneWidth(`${newRightPaneWidth - (splitterRef.current?.clientWidth ?? 10)}px`)
                setLeftPaneWidth(`${leftPaneWidthNum}px`)
                setSplitterPos(`${leftPaneWidthNum}px`)

                // console.log(`Left is smaller. Left: ${leftPaneWidthNum}, Right: ${newRightPaneWidth - (splitterRef.current?.clientWidth ?? 10)}`)
            } else {
                // right pane is smaller
                // keep right pane size, resize left pane
                let newLeftPaneWidth = wrapper.width - rightPaneWidthNum - (splitterRef.current?.clientWidth ?? 10)
                if (newLeftPaneWidth < minSize[0])
                    newLeftPaneWidth = minSize[0]
                
                setLeftPaneWidth(`${newLeftPaneWidth}px`)
                setRightPaneWidth(`${rightPaneWidthNum}px`)
                setSplitterPos(`${newLeftPaneWidth}px`)

                // console.log(`Right is smaller. Left: ${newLeftPaneWidth}, Right: ${rightPaneWidthNum - (splitterRef.current?.clientWidth ?? 10)}`)
            }
        })

        observer.observe(wrapperRef.current!)

        return () => observer.disconnect()
    }, [])

    const onMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!isDragging) return

        const
            wrapperRect = wrapperRef.current?.getBoundingClientRect(),
            newLeftPaneWidth = event.clientX - wrapperRect!.left,
            newRightPaneWidth = wrapperRect!.right - event.clientX - splitterRef.current!.clientWidth

        if (newRightPaneWidth <= minSize[1] || newLeftPaneWidth <= minSize[0]) 
            return

        setSplitterPos(`${newLeftPaneWidth}px`)
        setLeftPaneWidth(`${newLeftPaneWidth}px`)
        setRightPaneWidth(`${newRightPaneWidth}px`)

        // console.log(`Left: ${leftPaneWidth}, Right: ${rightPaneWidth}`)
    }

    return (
        <div ref={wrapperRef} style={props.style} className="splitter-wrapper" onMouseUp={onMouseUp} onMouseMove={onMouseMove}>
            <div ref={splitterRef} className="splitter" onMouseDown={onMouseDown} onMouseUp={onMouseUp} style={{ left: splitterPos }}>{gripIcon}</div>
            <div ref={leftPaneRef} className="left-pane" style={{ width: leftPaneWidth }}>{props.leftPane}</div>
            <div ref={rightPaneRef} className="right-pane" style={{ width: rightPaneWidth }}>{props.rightPane}</div>
        </div>
    )
}