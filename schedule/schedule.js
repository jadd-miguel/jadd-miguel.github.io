let calendar = null
document.addEventListener('DOMContentLoaded', async function() {
    show_snackbar("Loading")
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
        document.querySelectorAll('input, button').forEach(el => el.disabled = true)
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
    constructor(date, cat, info, id=null) {
        if(id)
            this.id = id;
        if(date != "")
            this.date = date;
        this.category = cat;
        this.info = info;
    }
    print() { return this.date + " " + this.category + " " + this.info }
}

async function event_add() {
    const date = document.getElementById("event-date").value
    const category = document.getElementById("event-cat").value
    const info = document.getElementById("event-info").value
  
    result = await insertData("schedule", [new Event(date, category, info)])
    if(!result)
        return
    await update_visuals()
}

async function update_visuals() {
    const list_html = document.getElementById("event-list")
    list_html.innerHTML = ""

    event_list = []
    calendar.removeAllEvents()
    fetched_events = await fetchData("schedule")

    event_list = fetched_events.map(e => (new Event(e.date, e.category, e.info, e.id)))
    event_list.forEach((event, _) => {

        calendar.addEvent({
            title: event.category,
            start: event.date
        })
        const li = document.createElement("li")
        li.textContent = event.print() + " "

        const btn = document.createElement("button")
        btn.textContent = "X"

        btn.onclick = async () => {
            result = await deleteData("schedule", event.id)
            if(!result)
                return
            update_visuals();
        }
        li.appendChild(btn)
        list_html.appendChild(li)
    })
}
