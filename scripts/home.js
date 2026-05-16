document.addEventListener('DOMContentLoaded', async function() {
    const { data, _ } = await CLIENT.auth.getSession()
    const session = data.session
        console.log(data)
    if(!document.querySelector(".login") || !document.querySelector(".logout")) {
        return
    }
    if(session) {
        document.querySelector('.title').innerHTML  = "Home <i>As Privileged User</i>"
        document.querySelector(".login").style.display = 'none'
        document.querySelector(".logout").style.display = 'block'
    } else {
        document.querySelector(".login").style.display = 'block'
        document.querySelector(".logout").style.display = 'none'
        document.querySelector('.title').innerHTML  = "Home <i>As Demo User</i>"
    }
})
