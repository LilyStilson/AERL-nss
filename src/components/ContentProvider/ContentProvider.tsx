import React, { CSSProperties } from "react"
import "./ContentProvider.css"

interface IContentProviderProps {
    Header?: React.JSX.Element;
    Content?: React.JSX.Element;
    Footer?: React.JSX.Element;
    paddingEnabled?: boolean
    style?: CSSProperties;
}

export default function ContentProvider(props: IContentProviderProps) {
    return (
        <div className="content-provider" style={props.style}>
            {   props.Header != null &&
                
                <div className="cp-header">
                    {props.Header}
                </div> 
            }
            {   props.Content != null &&

                <div className="cp-content" style={{ margin: props.paddingEnabled ?? true ? "8px 0" : "0" }}>
                    {props.Content}
                </div>
            }
            {   props.Footer != null &&
            
                <div className="cp-footer">
                    {props.Footer}
                </div>
            }   
        </div>
    )
}