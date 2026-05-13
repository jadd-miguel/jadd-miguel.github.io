let calendar;
document.addEventListener('DOMContentLoaded', async function() {
    var calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth'
    });
    calendar.render();
    await update_visuals()
});

let event_list = [];
class Event {
    constructor(date, cat, info, id=null) {
        this.id = id;
        this.date = date;
        this.category = cat;
        this.info = info;
    }

    print() {
        return this.date + " " + this.cat + " " + this.info;
    }
}

async function event_add() {
    const date = document.getElementById("event-date").value;
    const category = document.getElementById("event-cat").value;
    const info = document.getElementById("event-info").value;

    await insertData("schedule", [new Event(date, category, info)])
    update_visuals();
}

async function update_visuals() {
    const list = document.getElementById("event-list");
    list.innerHTML = "";
    calendar.removeAllEvents();
    vals = await getData("schedule")
    event_list = vals.map(e => (new Event(e.date, e.category, e.info, e.id)))
    event_list.forEach((event, index) => {

        calendar.addEvent({
            title: event.cat,
            start: event.date
        });

        const li = document.createElement("li");
        li.textContent = event.print();

        const btn = document.createElement("button");
        btn.textContent = "X";

        btn.onclick = () => {
            deleteData("schedule", event.id)
            update_visuals();
        };

        li.appendChild(btn);
        list.appendChild(li);
    });
}
