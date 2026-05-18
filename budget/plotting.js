function update_plot(df) {

    const start = document.getElementById("start-range").value
    const end =  document.getElementById("end-range").value
    const date_range = {start, end}

    let x_option = null
    if(byDayBtn.classList.contains("active")) {
        x_option = X_OPTIONS.BY_DAY
    } else if(byMonthBtn.classList.contains("active")) {
        x_option = X_OPTIONS.BY_MONTH
    }
    drawTrend(df, x_option, date_range)

    let agg_value = null
    if(byNetBtn.classList.contains("active")) {
        agg_value = AGG_VALUES.NET
    } else if(byDeductBtn.classList.contains("active")) {
        agg_value = AGG_VALUES.DEDUCT
    } else if(byCreditBtn.classList.contains("active")) {
        agg_value = AGG_VALUES.CREDIT
    }
    drawNet(df, agg_value, x_option, date_range)
    drawCat(df, date_range)
}

function drawTrend(df, time_option, date_range) {
    const amount_agg = group_by(df, AGG_VALUES.AMOUNT, time_option)

    const startKey = amount_agg[0].key;
    const endKey = amount_agg[amount_agg.length - 1].key

    const filled_agg = fill_agg(amount_agg, startKey, endKey)
    const { slope, intercept } = linearRegression(filled_agg)

    document.getElementById("slope").innerText = "Rate: $" + (Math.round(slope * 100) / 100) + "/day"

    const daysTillNoFunds = (Math.round(intercept * -1 / slope) / 100)
    document.getElementById("zero").innerText = daysTillNoFunds < 0 ? "Stable Trend" : "Day of Until No Funds " + daysTillNoFunds

    const startDate = toDayNumber(startKey)
    const endDate = toDayNumber(endKey)
    const diff = endDate - startDate

    const trend = {
        x: [startKey, endKey],
        y: [
            slope * 0 + intercept,
            slope * (diff - 1) + intercept
        ],
        mode: "lines",
        name: "Trend"
    }
    const total = {
        x: amount_agg.map(row => row.key),
        y: amount_agg.map(row => row.sum),
        mode: "lines+markers",
        name: "Total"
    }
    const layout = {
        title: { text: "Holdings Trend" },
        xaxis: { title: { text: time_option} },
        yaxis: { title: { text: "Amount Holding ($)"} }
    }
    Plotly.newPlot("trend", [total, trend], layout)
}

function drawNet(df, agg_value, x_option, date_range) {
    const agg = group_by(df, agg_value, x_option)
    const agg_line = {
        x: agg.map(d => d.key),
        y: agg.map(d => d.sum),
        type: "bar",
        marker: { color: agg.map(d => d.sum).map(v => v >= 0 ? "green" : "red") }
    }
    const layout = {
        title: { text: agg_value + " Per " + x_option},
        xaxis: { title: { text: x_option} },
        yaxis: { title: { text: agg_value + " ($)"} }
    }
    Plotly.newPlot("data_net", [agg_line], layout)
}

function drawCat(df, date_range) {
    const agg = group_by(df, AGG_VALUES.NET, X_OPTIONS.BY_CATEGORY)
    const agg_line = {
        x: agg.map(d => d.key),
        y: agg.map(d => d.sum),
        type: "bar",
        marker: { color: agg.map(d => d.sum).map(v => v >= 0 ? "green" : "red") }
    }    
    const layout = {
        title: { text: "Category Expenses" },
        xaxis: { title: { text: "Categories"} },
        yaxis: { title: { text: "Amount Spent ($)"} }
    }
    Plotly.newPlot("category", [agg_line], layout)
}
