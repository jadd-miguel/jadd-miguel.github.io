let calendar;
document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth'
    });
    calendar.render();
});

let event_list = [];
class Event {
    constructor(date, cat, info) {
        this.date = date;
        this.cat = cat;
        this.info = info;
    }

    print() {
        return this.date + " " + this.cat + " " + this.info;
    }
}

function event_add() {
    const date = document.getElementById("event-date").value;
    const category = document.getElementById("event-cat").value;
    const info = document.getElementById("event-info").value;

    event_list.push(new Event(date, category, info));
    update_visuals();
}

function update_visuals() {
    const list = document.getElementById("event-list");
    list.innerHTML = "";
    calendar.removeAllEvents();

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
            event_list.splice(index, 1);
            update_visuals();
        };

        li.appendChild(btn);
        list.appendChild(li);
    });
}
