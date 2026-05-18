document.addEventListener('DOMContentLoaded', async function() {
    const { data, _ } = await CLIENT.auth.getSession()
    const session = data.session

    if(session) {
        document.querySelector('.title').innerHTML  = "Budget <i>As Privileged User</i>"
    } else {
        document.querySelector('.title').innerHTML  = "Budget <i>As Demo User</i>";
        ["folderInput", "toRun", "toDemo", "start-range", "end-range"].forEach(id => document.getElementById(id).disabled = true)
    }
    const today = new Date()

    const past_eight_m = new Date(today);
    past_eight_m.setMonth(today.getMonth() - 8);

    const forward_eight_m = new Date(today);
    forward_eight_m.setMonth(today.getMonth() + 8);

    document.getElementById("start-range").value = past_eight_m.toISOString().split("T")[0]
    document.getElementById("end-range").value = forward_eight_m.toISOString().split("T")[0]
    run_demo()
})

let files = []
let module_df = null
document.getElementById("folderInput").addEventListener("change", (e) => {
    files = e.target.files
})

document.getElementById("toRun").addEventListener("click", async () => {
    module_df = await files_to_df(files);
    update_plot(module_df)
})

document.getElementById("toDemo").addEventListener("click", async () => {
    await run_demo()
})

const byDayBtn = document.getElementById("byDay")
const byMonthBtn = document.getElementById("byMonth")

byDayBtn.addEventListener("click", () => {
    byDayBtn.classList.add("active")
    byMonthBtn.classList.remove("active")
    update_plot(module_df)
})

byMonthBtn.addEventListener("click", () => {
    byMonthBtn.classList.add("active")
    byDayBtn.classList.remove("active")
    update_plot(module_df)
})

const byNetBtn = document.getElementById("byNet")
const byDeductBtn = document.getElementById("byDeduct")
const byCreditBtn = document.getElementById("byCredit")

byNetBtn.addEventListener("click", () => {
    byNetBtn.classList.add("active")
    byDeductBtn.classList.remove("active")
    byCreditBtn.classList.remove("active")
    update_plot(module_df)
})

byDeductBtn.addEventListener("click", () => {
    byNetBtn.classList.remove("active")
    byDeductBtn.classList.add("active")
    byCreditBtn.classList.remove("active")
    update_plot(module_df)
})

byCreditBtn.addEventListener("click", () => {
    byNetBtn.classList.remove("active")
    byDeductBtn.classList.remove("active")
    byCreditBtn.classList.add("active")
    update_plot(module_df)
})

async function run_demo() {
    const response = await fetchFile("demo_budget.csv")
    module_df = await files_to_df([response])
    update_plot(module_df)
}

async function files_to_df(files) {
    let logs = await get_logs(files)
    let parsed_logs = parse_logs(logs)
    let df = get_df(parsed_logs)
    return df
}
