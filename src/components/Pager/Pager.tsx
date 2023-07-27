import "./Pager.css"

interface IPagerProps {
    children: React.JSX.Element[]
    page: number
}

export default function Pager(props: IPagerProps): React.JSX.Element {
    return (
        <div className="pager">
            <div className="pager-content">
                {
                    props.children.map((item, idx) => <div key={`pager-page-${idx}`} className="pager-content-wrapper" style={{transform: `translateX(${-props.page * 100}%)`}}>{item}</div>)
                }
            </div>
        </div>
    )
}