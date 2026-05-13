async function get_logs(files) {
    let file_logs = [];
    for (const file of files) {
        let text = await file.text();
        text = text.trim();
        file_logs.push(text);
    }
    const all_logs = file_logs.join("\n");
    return all_logs;
}

function parse_logs(raw_logs) {
        
    const logs = raw_logs.split("\n");
    let parsed_logs = [];

    for (const log of logs) {
        let parsed = log.split(",").map(r => r.replace(/"/g, ""));
        parsed_logs.push(parsed);
    }
    return parsed_logs;
}

class Transaction {
    constructor(date, title, net, total, deduct, credit) {
        this.date = date;
        this.title = title;
        this.net = net;
        this.total = total;
        this.deduct = deduct;
        this.credit = credit;
    }
}

const DISCARD = ["INITIAL"];
function get_df(raw_logs) {
    let df = [];
    let logs = [];
    let total = 0;

    for (const raw_log of raw_logs) {
        if (raw_log[1] === "INITIAL") {
            total = Number(raw_log[4]);
        }
        if (!DISCARD.includes(raw_log[1])) {
            logs.push(raw_log);
        }
    }

    logs = logs.map(r => r.slice(0, -1));
    logs.sort((a, b) => new Date(a[0]) - new Date(b[0]));

    for (const log of logs) {
        let date = log[0]
        let title = log[1].replace(/\s+/g, " ");

        let deduct = log[2] === "" ? 0 : Number(log[2]);
        let credit = log[3] === "" ? 0 : Number(log[3]);
        let net = credit - deduct;

        total = total + net
        df.push(new Transaction(date, title, net, total, deduct, credit));
    }
    return df;
}

const AGG_OPTIONS = [NET = "net", TOTAL = "total"];
function group_by_date(df, option) {
    let dates = {};

    for (const row of df) {

        const key = row.date;
        let value = "";

        switch (option) {
            case AGG_OPTIONS.NET:
                value = row.net;
                break;

            case AGG_OPTIONS.TOTAL:
                value = row.total;
                break;
        };

        if (!dates[key]) {
            dates[key] = [];
        }     
        dates[key].push(value);
    }

    const agg = Object.entries(dates).map(([key, values]) => ({
        key,
        sum: values.reduce((a, b) => a+b, 0)
    }));
    return agg;
}
