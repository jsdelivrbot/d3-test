const GRAPH_DATA = "https://api.myjson.com/bins/b0nnk"
const GRAPH_ANNOTATIONS = "https://api.myjson.com/bins/fu9nk"

const X_VALUE = "Date"
const Y_VALUE = "Stock price"
const ANNOTATION_TITLE_KEY = "Annotation_title"
const ANNOTATION_JUMP_KEY = "Annotation_jump_positive"
const ANNOTATION_COLOR_KEY = "Annotation_color"

const GRAPH_TITLE = "Graph"
const DATE_FORMAT = "%d/%m/%Y"

const margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 50
    },
    height = 500 - margin.top - margin.bottom;
let width = 860 - margin.left - margin.right;


const parseDate = d3.timeParse(DATE_FORMAT);

const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

const valueline = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.price));

const svg = d3.select("svg")
    .attr("width", 960)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


d3.queue()
    .defer(d3.json, GRAPH_DATA)
    .defer(d3.json, GRAPH_ANNOTATIONS)
    .await(getGraph);


function getGraph(error, data, annotations)
{
    if (error) throw error;

    data.forEach(function (d)
    {
        d.date = parseDate(d[X_VALUE]);
        d.price = +d[Y_VALUE];

    });



    const labels = annotations && annotations.map(item =>
    {
        data && data.forEach(function (dataItem, i)
        {
            item.data = {}
            item.data.date = item["Date"];

            if (dataItem['Date'] === item[X_VALUE])
            {
                item.ycoord = +dataItem[Y_VALUE]

            }
            item.data.price = item.ycoord;
            item.subject = {}
            item.subject.text = 'A';
            item.subject.radius = 4;
            item.className = "anomaly"
            item.subject.y = "bottom"
            item["dx"] = 0;
            item["dy"] = 20;

            const jump = item[ANNOTATION_JUMP_KEY] === "TRUE" ? 'top' : 'bottom'
            item.note = Object.assign(
                {}, item.note,
                {
                    title: item[ANNOTATION_TITLE_KEY],
                    label: `${item.data.date} ${jump}`
                })
        });
        return item
    })


    x.domain(d3.extent(data, d => d.date));
    y.domain([0, d3.max(data, d => d.price)]);

    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", valueline);

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("g")
        .append("text")
        .attr("x", (width / 2))
        .attr("y", margin.top - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "22px")
        .text(GRAPH_TITLE);



    window.makeAnnotations = d3.annotation()
        .annotations(labels)
        .type(d3.annotationCalloutCircle)
        .accessors(
            {
                x: item => x(parseDate(item.date)),
                y: item => y(item.price)
            })
        .accessorsInverse(
            {
                date: d => x.invert(d.x),
                price: d => y.invert(d.y)
            })
        .on('subjectover', function (annotation)
        {
            annotation.type.a.selectAll("g.annotation-connector, g.annotation-note")
                .classed("hidden", false)
        })
        .on('subjectout', function (annotation)
        {
            annotation.type.a.selectAll("g.annotation-connector, g.annotation-note")
                .classed("hidden", true)
        })

    svg.append("g")
        .attr("class", "annotation-test")
        .call(makeAnnotations)

    svg.selectAll("g.annotation-connector, g.annotation-note")
        .classed("hidden", true)

}