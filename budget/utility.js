async function get_logs(files) {
    let file_logs = [];
    for (const file of files) {
        let text = await file.text()
        text = text.trim()
        file_logs.push(text)
    }
    const all_logs = file_logs.join("\n")
    return all_logs
}

function parse_logs(raw_logs) {
        
    const logs = raw_logs.split("\n")
    let parsed_logs = []

    for (const log of logs) {
        let parsed = log.split(",").map(r => r.replace(/"/g, ""))
        parsed_logs.push(parsed)
    }
    return parsed_logs
}

class Transaction {
    constructor(date, title, deduct, credit, amount, net) {
        this.date = date;
        this.title = title;
        this.deduct = deduct;
        this.credit = credit;
        this.amount = amount;
        this.net = net;
    }
}

const LOG_DISCARD = ["INITIAL"]
function get_df(raw_logs) {
    let df = [];
    let logs = [];
    let amount = 0;

    for (const raw_log of raw_logs) {
        if (raw_log[1] ===  "INITIAL") {
            amount = Number(raw_log[4])
        }
        if (!LOG_DISCARD.includes(raw_log[1])) {
            logs.push(raw_log);
        }
    }

    logs = logs.map(r => r.slice(0, -1))
    logs.sort((a, b) => new Date(a[0]) - new Date(b[0]))

    for (const log of logs) {
        let date = new Date(
            log[0]
                .replace(/\//g, "-")
                .replace(/"/g, "")
        ).toISOString().split("T")[0]
        
        let title = log[1].replace(/\s+/g, " ")

        let deduct = log[2] === "" ? 0 : Number(log[2].replace(/"/g, ""))
        let credit = log[3] === "" ? 0 : Number(log[3].replace(/"/g, ""))
        let net = credit - deduct

        amount = amount + net
        df.push(new Transaction(date, title, deduct, credit, amount, net))
    }
    return df
}

const CATEGORY_SPECIAL = ["ARRIOLA A"]
const CATEGORY_DISCARD = ["TFR", "THANK YOU", "PLACEHOLDER"]
const AGG_VALUES = {NET: "Net", AMOUNT: "Amount", DEDUCT: "Deduct", CREDIT: "Credit", AVERAGE: "Average"}
const X_OPTIONS = { BY_DAY: "Days", BY_MONTH: "Months", BY_CATEGORY: "Categories" }
function group_by(df, agg_value, x_options) {
    let collect = {}
    for (const row of df) {

        IS_CAT_OPTION = x_options == X_OPTIONS.BY_CATEGORY
        TO_DISCARD = CATEGORY_DISCARD.some(w => row.title.includes(w))
        IS_SPECIAL = CATEGORY_SPECIAL.some(w => row.title.includes(w))

        if(IS_CAT_OPTION & TO_DISCARD&& !IS_SPECIAL)
            continue
        if(IS_CAT_OPTION & agg_value != AGG_VALUES.AMOUNT & TO_DISCARD&& !IS_SPECIAL)
            continue

        let key = ""
        switch (x_options) {
            case X_OPTIONS.BY_DAY:
                key = row.date
                break

            case X_OPTIONS.BY_MONTH:
                key = row.date.slice(0, 7) + "-01"
                break
            case X_OPTIONS.BY_CATEGORY:
                key = agg_value != AGG_VALUES.AVERAGE ? getCategoryByMerchant(row.title) : ""
                break
        }
        let value = ""
        switch (agg_value) {
            case AGG_VALUES.AMOUNT:
                value = row.amount
                break
            case AGG_VALUES.NET:
                value = row.net
                break
            case AGG_VALUES.AVERAGE:
                key = row.date.slice(0, 7) + "-01 | " + getCategoryByMerchant(row.title)
                value = row.net
                break
            case AGG_VALUES.DEDUCT:
                value = row.deduct * -1
                break
            case AGG_VALUES.CREDIT:
                value = row.credit
                break
        }
        if (!collect[key]) {
            collect[key] = []
        }     
        collect[key].push(value)
    }
    let agg = null
    if(agg_value == AGG_VALUES.AMOUNT)
        agg = Object.entries(collect)
            .map(([key, values]) => ({
                key,
                sum: values.at(-1)
            }))
    else if(agg_value == AGG_VALUES.AVERAGE)
        agg = compileAvgMonthlyByCat(collect)
    else
        agg = Object.entries(collect)
            .map(([key, values]) => ({
                key,
                sum: values.reduce((a, b) => a + b, 0)
            }))
    return agg
}

function compileAvgMonthlyByCat(collect) {
    const byCategory = {};
    console.log(collect)
    for (const [key, value] of Object.entries(collect)) {
        const [date, cat] = key.split('|').map(s => s.trim());
        const monthTotal = value.reduce((a, b) => a + b, 0);
        (byCategory[cat] ??= []).push({ date, total: monthTotal });
    }

    return Object.entries(byCategory)
        .filter(([cat, entries]) => new Set(entries.map(e => e.date)).size > 2)
        .map(([cat, entries]) => {
            const uniqueMonths = new Set(entries.map(e => e.date)).size;
            const totalSum = entries.reduce((a, e) => a + e.total, 0);
            return {
                key: cat,
                sum: totalSum / uniqueMonths
            };
        });
}

function fill_agg(agg, start, end) {
    let filled = []
    let dates = agg.map(x => x.key)
    let last_val = null
    for(let d = new Date(start); d <= new Date(end); d.setDate(d.getDate() + 1)) {
        const chk_date = d.toISOString().split("T")[0]

        if(dates.includes(chk_date)) {
            const existing = agg.find(d => d.key === chk_date)
            last_val = existing.sum
            filled.push(existing)
        } else {
            filled.push({key: chk_date, sum: last_val})
        }
    }
    return filled
}

function linearRegression(agg) {
    const points = agg.map((day, i) => ({
        x: i,
        y: day.sum
    }))
    const sumX = points.reduce((s, p) => s + p.x, 0)
    const sumY = points.reduce((s, p) => s + p.y, 0)
    const sumXY = points.reduce((s, p) => s + p.x * p.y, 0)
    const sumXX = points.reduce((s, p) => s + p.x * p.x, 0)

    const n = points.length;
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)

    const intercept = (sumY - slope * sumX) / n
    return { slope, intercept }
}

function createTrendLine(start, end, slope, intercept) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    let trend = []
    for(let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {

        const daysPast = (d - startDate) / 86400000
        trend.push({
            x: new Date(d).toISOString().split("T")[0],
            y: slope * daysPast + intercept
        })
    }
    return trend
}

function round(num) {
    return Math.round(num * 100) / 100
}

function getCategoryByMerchant(merchant) {
    const merchant_norm = merchant.trim().toUpperCase()

    for (const [category, merchants] of Object.entries(category_blueprint)) {
        for (const m of merchants) {
            
            if (merchant_norm === m.trim().toUpperCase())
                return category

        }
    }
    console.log(merchant)
    return merchant
}
