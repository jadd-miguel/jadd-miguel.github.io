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

function drawTrend(df, x_option, date_range) {
    let amount_agg = group_by(df, AGG_VALUES.AMOUNT, x_option)

    const startKey = amount_agg[0].key;
    const endKey = amount_agg[amount_agg.length - 1].key

    const filled_agg = fill_agg(amount_agg, startKey, endKey)
    const { slope, intercept } = linearRegression(filled_agg)

    let points = []
    if(x_option == X_OPTIONS.BY_DAY) {
        writeDashboard(slope, intercept, amount_agg)

        const trendLine = createTrendLine(startKey, "2045-01-01", slope, intercept)
            .filter(d => d.x >= date_range.start && d.x <= date_range.end)
        points.push({
            x: trendLine.map(z => z.x),
            y: trendLine.map(z => z.y),
            mode: "lines",
            name: "Trend"
        })
    }
    amount_agg = amount_agg.filter(d => d.key >= date_range.start && d.key <= date_range.end)
    points.push(
        createChartObject(amount_agg, "lines+markers", "Total", "orange")
    )
    const layout = {
        title: { text: "Holdings Trend" },
        xaxis: { title: { text: x_option} },
        yaxis: { title: { text: "Amount Holding ($)"} }
    }
    Plotly.newPlot("trend", points, layout)
}

function drawNet(df, agg_value, x_option, date_range) {
    let agg = group_by(df, agg_value, x_option)
    agg = agg.filter(d => d.key >= date_range.start && d.key <= date_range.end)
    
    const [positive, negative] = splitAggPolarity(agg)

    const pos_line = createChartObject(positive, "bar", "Profit", "green")
    const neg_line = createChartObject(negative, "bar", "Deficit", "red")

    const layout = {
        title: { text: agg_value + " Per " + x_option},
        xaxis: { title: { text: x_option} },
        yaxis: { type: "log", title: { text: agg_value + " ($)"} }
    }
    Plotly.newPlot("data_net", [pos_line, neg_line], layout)
}

function drawCat(df, date_range) {
    df = df.filter(x => x.date >= date_range.start && x.date <= date_range.end)
    const agg = group_by(df, AGG_VALUES.NET, X_OPTIONS.BY_CATEGORY)
    const sorted_agg = agg.sort((a, b) => Math.abs(b.sum) - Math.abs(a.sum))
    const [positive, negative] = splitAggPolarity(sorted_agg)

    const pos_line = createChartObject(positive, "bar", "Income", "green")
    const neg_line = createChartObject(negative, "bar", "Expenses", "red")
    
    const layout = {
        title: { text: "Category Transactions" },
        xaxis: { title: { text: "Categories"} },
        yaxis: { type: "log", title: { text: "Total Amount ($)"} }
    }
    Plotly.newPlot("category", [pos_line, neg_line], layout)
}

function createChartObject(data, type, name, color) {
    return {
        x: data.map(d => d.key),
        y: data.map(d => d.sum),
        type: type,
        name: name,
        marker: { color: color }
    }
}

function writeDashboard(slope, intercept, amount_agg) {
    document.getElementById("slope").innerText = "Rate: $" + round(slope).toLocaleString() + "/day"

    const daysTillNoFunds = round(intercept / slope  * -1)
    let funds_date = new Date();
    funds_date.setDate(funds_date.getDate() + daysTillNoFunds)

    const today = new Date()
    const dayDiff = Math.floor((funds_date - today) / (1000 * 60 * 60 * 24))
        
    document.getElementById("zero").innerText
        = daysTillNoFunds < 0 ? "Upward Trend" : "'Til Zero: " + dayDiff.toLocaleString() + "days/" + funds_date.toISOString().split("T")[0]
    document.getElementById("worth").innerText = "Worth: $" + round(amount_agg.at(-1).sum).toLocaleString()
}

function splitAggPolarity(agg) {
    let positive = agg.filter(d => d.sum >= 0);
    let negative = agg.filter(d => d.sum < 0);

    negative = negative.map(x => ({
        key: x.key,
        sum: Math.abs(x.sum)
    }))

    return [positive, negative]
}
