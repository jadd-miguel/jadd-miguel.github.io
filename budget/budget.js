document.addEventListener('DOMContentLoaded', async function() {
    const { data, _ } = await CLIENT.auth.getSession()
    const session = data.session

    if(session) {
        document.querySelector('.title').innerHTML  = "Budget <i>As Privileged User</i>"
    } else {
        document.querySelector('.title').innerHTML  = "Budget <i>As Demo User</i>"
        document.querySelectorAll('input, button').forEach(el => el.disabled = true)
    }
})


let files = []

window.addEventListener("DOMContentLoaded", () => {
  run_demo()
})

document.getElementById("folderInput").addEventListener("change", (e) => {
    files = e.target.files
})

document.getElementById("toRun").addEventListener("click", async () => {
    const df = await files_to_df(files);
    update_plot(df)
})

document.getElementById("toDemo").addEventListener("click", async () => {
    run_demo()
})

async function run_demo() {
    const response = await fetchFile("budget_demo.csv")
    const df = await files_to_df([response])
    update_plot(df)
}

async function files_to_df(files) {
    let logs = await get_logs(files)
    let parsed_logs = parse_logs(logs)
    let df = get_df(parsed_logs)
    return df
}

function update_plot(df) {

    const total_agg = group_by_date(df, AGG_OPTIONS.TOTAL)
    Plotly.newPlot(
        "trend",
        [{
            x: total_agg.map(row => row.key),
            y: total_agg.map(row => row.sum),
            type: "date"
        }],
        {
            title: { text: "Holdings Trend" },
            xaxis: { title: { text: "Days"} },
            yaxis: { title: { text: "Amount Holding ($)"} }
        }
    )

    const net_agg = group_by_date(df, AGG_OPTIONS.NET)
    Plotly.newPlot(
        "date_net",
        [{
            x: net_agg.map(d => d.key),
            y: net_agg.map(d => d.sum),
            type: "bar",
            marker: {
                color: net_agg.map(d => d.sum).map(v => v >= 0 ? "green" : "red")
            }
        }],
        {
            title: { text: "Net Change Per Day" },
            xaxis: { title: { text: "Days"} },
            yaxis: { title: { text: "Net Change ($)"} }
        }
    )
}
