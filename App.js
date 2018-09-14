d3.tsv(
    "https://gist.githubusercontent.com/susielu/63269cf8ec84497920f2b7ef1ac85039/raw/4c3c8d0bf0938e4fef5cfb9eff58cb582904db97/data.hidden.tsv",
    function(error, stock) {
        class LineChart extends React.Component {
            constructor(props) {
                super(props)
                this.state = {
                    hover: false
                }
            }

            render() {
                const { AnnotationCallout } = ReactAnnotation

                const margin = { top: 20, right: 20, bottom: 30, left: 20 },
                    height = 500 - margin.top - margin.bottom,
                    width = 860 - margin.left - margin.right

                const x = d3.scaleTime().range([0, width])
                const y = d3.scaleLinear().range([height, 0])

                const valueline = d3
                    .line()
                    .x(d => x(d.date))
                    .y(d => y(d.close))

                stock.forEach(function(d) {
                    d.date = new Date(d.date)
                    d.close = +d.close
                })

                x.domain(d3.extent(stock, d => d.date))
                y.domain([0, d3.max(stock, d => d.close)])

                //Add annotations
                const labels = [
                    {
                        data: { date: "9-Apr-12", close: 636.23 },
                        dy: 37,
                        dx: -142
                    },
                    {
                        data: { date: "26-Feb-08", close: 119.15 },
                        dy: -137,
                        dx: 0,
                        note: { align: "middle", padding: 10 }
                    },
                    {
                        data: { date: "18-Sep-09", close: 185.02 },
                        dy: 37,
                        dx: 42
                    }
                ].map(l => {
                    l.note = Object.assign({}, l.note, {
                        title: `Close: ${l.data.close}`,
                        label: `${l.data.date}`
                    })
                    l.x = x(new Date(l.data.date))
                    l.y = y(l.data.close)
                    l.subject = { radius: 4 }

                    return l
                })

                const annotations = labels.map((a, i) => (
                    <g key={i}>
                    <AnnotationCallout
                dx={a.dx}
                dy={a.dy}
                className={this.state.hover === i ? "" : "hidden"}
                color={"#9610ff"}
                x={a.x}
                y={a.y}
                note={a.note}
                subject={a.subject}
                />
                <circle
                fill="#9610ff"
                r={5}
                cx={a.x}
                cy={a.y}
                onMouseOver={() =>
                this.setState({
                    hover: i
                })}
                onMouseOut={() =>
                this.setState({
                    hover: null
                })}
                />
                </g>
            ))

                return (
                    <svg width={860} height={500}>
                    <g transform={`translate(${margin.left}, ${margin.top})`}>
            <g transform="translate(20, 20)">
                    <text>Hover over the dots to see more information</text>
                <text y={30}>Uses react-annotation's AnnotationCallout to make a tooltip</text>
                </g>
                <line x2={width} y1={height} y2={height} stroke="grey" />

                    <line y1={0} y2={height} stroke="grey" />
                    <path d={valueline(stock)} stroke="#ddd" fill="none" />
                    {annotations}
                    </g>
                    </svg>
            )
            }
        }
        ReactDOM.render(<LineChart />, document.getElementById("main"))
    }
)
