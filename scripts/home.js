document.addEventListener('DOMContentLoaded', async function() {
    const { data, _ } = await CLIENT.auth.getSession()
    const session = data.session

    if(!document.querySelector(".login") || !document.querySelector(".logout")) {
        return
    }
    if(session) {
        document.querySelectorAll(".login, .mbl-login").forEach(x => { x.style.display = 'none' })
        document.querySelectorAll(".logout, .mbl-logout").forEach(x => { x.style.display = 'block' })
    } else {
        document.querySelectorAll(".login, .mbl-login").forEach(x => { x.style.display = 'block' })
        document.querySelectorAll(".logout, .mbl-logout").forEach(x => { x.style.display = 'none' })
    }
})
