document.addEventListener('DOMContentLoaded', async function() {
    const isMobile = window.innerWidth <= 768;
    if(isMobile) return

    const { data, _ } = await CLIENT.auth.getSession()
    const session = data.session

    if(session) {
        document.querySelector('.title').innerHTML  = "Budget <i>As Privileged User</i>"
    } else {
        document.querySelector('.title').innerHTML  = "Budget <i>As Demo User</i>";
        ["folderInput", "toRun", "toDemo"].forEach(id => document.getElementById(id).disabled = true)
    }
    wide_range()
    createMonthSelect()
    run_demo()
})

const start_form = document.getElementById("start-range")
const end_form = document.getElementById("end-range")

const month_select = document.getElementById("select_months")
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"]
const year_form = document.createElement("select")
const currentYear = new Date().getFullYear()

function createMonthSelect() {

    for (let year = currentYear - 1; year <= currentYear + 1; year++) {

        const year_option = document.createElement("option");
        year_option.value = year;
        year_option.textContent = year;

        if (year === currentYear) year_option.selected = true;
        year_form.appendChild(year_option);
    }
    month_select.appendChild(year_form)

    MONTHS.forEach((m, i) => {
        const m_btn = document.createElement("button")
        m_btn.textContent = m
        m_btn.onclick = (e) => {
            e.preventDefault()
            start_form.value = new Date(year_form.value, i+1, 1).toISOString().split("T")[0]
            end_form.value = new Date(year_form.value, i+2, 0).toISOString().split("T")[0]
            update_plot(module_df)
        }
        month_select.appendChild(m_btn)
    })
}

start_form.addEventListener("change", () => {
    update_plot(module_df)
})
end_form.addEventListener("change", () => {
    update_plot(module_df)
})
document.getElementById("date-reset").addEventListener("click", async () => {
    wide_range()
    update_plot(module_df)
    year_form.value = currentYear
})

function wide_range() {
    const today = new Date()

    const past_eight_m = new Date(today);
    past_eight_m.setMonth(today.getMonth() - 8);

    const forward_eight_m = new Date(today);
    forward_eight_m.setMonth(today.getMonth() + 8);

    start_form.value = past_eight_m.toISOString().split("T")[0]
    end_form.value = forward_eight_m.toISOString().split("T")[0]
}

let files = []
let module_df = null
document.getElementById("folderInput").addEventListener("change", (e) => {
    files = e.target.files
})

document.getElementById("toRun").addEventListener("click", async () => {
    byDayBtn.classList.add("active")
    byMonthBtn.classList.remove("active")
    module_df = await files_to_df(files);
    update_plot(module_df)
})

document.getElementById("toDemo").addEventListener("click", async () => {
    byDayBtn.classList.add("active")
    byMonthBtn.classList.remove("active")
    await run_demo()
})

const byDayBtn = document.getElementById("byDay")
const byMonthBtn = document.getElementById("byMonth")

byDayBtn.addEventListener("click", () => {
    byDayBtn.classList.add("active")
    byMonthBtn.classList.remove("active")
    month_select.querySelectorAll("button, select").forEach(el => {
        el.disabled = false
    })
    update_plot(module_df)
})

byMonthBtn.addEventListener("click", () => {
    byMonthBtn.classList.add("active")
    byDayBtn.classList.remove("active")
    month_select.querySelectorAll("button, select").forEach(el => {
        el.disabled = true
    })
    wide_range()
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
