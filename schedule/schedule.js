let calendar = null
document.addEventListener('DOMContentLoaded', async function() {
    await permissions()
    await inital_calendar()
})

async function permissions() {
    const { data, _ } = await CLIENT.auth.getSession()
    const session = data.session

    if(session) {
        document.querySelector('.title').innerHTML  = "Schedule <i>As Privileged User</i>"
    } else {
        document.querySelector('.title').innerHTML  = "Schedule <i>As Demo User</i>"
            document.querySelectorAll('input, button').forEach(el => {
            if (!el.closest("#calendar")) {
                el.disabled = true
            }
        })
    }
}

async function inital_calendar() {
    var calendarEl = document.getElementById('calendar')
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth'
    })
    calendar.render()
    await update_visuals()
}

let event_list = [];
class Event {
    constructor(date, cat, info, id=null, done=false) {
        if(id)
            this.id = id;
        if(date != "")
            this.date = date;
        this.category = cat;
        this.info = info;
        this.done = done;
    }
    print() { return this.date + ", " + this.category + ", " + this.info }
}

async function event_add() {
    const date = document.getElementById("event-date").value
    const category = document.getElementById("event-cat").value
    const info = document.getElementById("event-info").value
    const done = document.getElementById("is-done").checked;
  
    result = await insertData("schedule", [new Event(date, category, info, null, done)])
    if(!result)
        return
    await update_visuals()
}

const SPECIAL_CATEGORY = "errands"
async function update_visuals() {
    const list_html = document.getElementById("event-list")
    list_html.innerHTML = ""

    event_list = []
    calendar.removeAllEvents()
    fetched_events = await fetchData("schedule")

    event_list = fetched_events.map(e => (new Event(e.date, e.category, e.info, e.id, e.done)))
    event_list.sort((a, b) =>
        a.category.localeCompare(b.category) ||
        b.done - a.done ||
        new Date(a.date ?? 0) - new Date(b.date ?? 0) ||
        a.info.localeCompare(b.info)
    )
    await handleEventUpdate(list_html)
    await permissions()
    clear_form()
}

const COLORS = ["#3B82F6","#EF4444","#22C55E","#F97316","#A855F7","#EC4899","#06B6D4","#10B981","#7C3AED","#D946EF"]
const GREY = "#6B7280"
async function handleEventUpdate() {
    curr_cat = ""
    color_idx = 0
    event_list.forEach(async (event, _) => {
        if(curr_cat == "") {
            curr_cat = event.category
        }
        else if(curr_cat != event.category) {
            curr_cat = event.category
            color_idx++
        }
        const color = event.done ? GREY : COLORS[color_idx % COLORS.length]
        calendar.addEvent({
            title: event.category,
            start: event.date,
            color: color
        })
        await handleEventListDraw(event, color)
    })
}

async function handleEventListDraw(event, color) {
        const span = document.createElement("span")
        span.textContent = event.print()

        const fill_btn = document.createElement("button")
        fill_btn.textContent = "FILL-FORM"
        fill_btn.onclick = () => { 
            fill_form(event)
            fill_btn.classList.add("active");
        }

        const overwrite_btn = document.createElement("button")
        overwrite_btn.textContent = "OVERWRITE"
        overwrite_btn.onclick = async () => { await overwrite_event(event) }

        const delete_btn = document.createElement("button")
        delete_btn.textContent = "X"
        delete_btn.onclick = async () => { await delete_event(event) }

        const li = document.createElement("li")
        li.style.backgroundColor = color

        li.appendChild(span)
        li.appendChild(fill_btn)
        li.appendChild(overwrite_btn)
        li.appendChild(delete_btn)

        const list_html = document.getElementById("event-list")
        list_html.appendChild(li)
}

function fill_form(event) {
    clear_form()
    document.getElementById("event-date").value = event.date
    document.getElementById("event-cat").value = event.category
    document.getElementById("event-info").value = event.info
    document.getElementById("is-done").checked = event.done
}

async function overwrite_event(event) {
    const date = document.getElementById("event-date").value
    const category = document.getElementById("event-cat").value
    const info = document.getElementById("event-info").value
    const done = document.getElementById("is-done").checked;

    const load = {};

    if (event.date !== date) load.date = date;
    if (event.category !== category) load.category = category;
    if (event.info !== info) load.info = info;
    if (event.done !== done) load.done = done;

    result = await editData("schedule", load, event.id)
    if(!result)
        return
    update_visuals();   
}

async function delete_event(event) {
    result = await deleteData("schedule", event.id)
    if(!result)
        return
    update_visuals();
}

function clear_form() {
    document.getElementById("event-date").value = ""
    document.getElementById("event-cat").value = ""
    document.getElementById("event-info").value = ""
    document.getElementById("is-done").checked = ""
    document.querySelectorAll("button").forEach(btn => {
        btn.classList.remove("active");
    })
}
