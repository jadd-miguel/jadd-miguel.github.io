const SERVER_URL = "https://aezewrnpboaixgjbvyoc.supabase.co"
const ANON_KEY = "sb_publishable_IcZSnNPX54lkgnTqQMAZ8g_OTxa2V-T"

const CLIENT = supabase.createClient(SERVER_URL, ANON_KEY, {auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }})
const FILE_STORAGE = "my site"

async function login() {
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    document.getElementById("email").value = ""
    document.getElementById("password").value = ""

    const { _, error } = await CLIENT.auth.signInWithPassword({
        email,
        password
    })
    if (error) {
        show_snackbar("Login Error: " + error.message)
    } else {
        show_snackbar("Login Success")
        document.querySelector('.title').innerHTML  = "Home <i>As Privileged User</i>"
        document.querySelector(".login").style.display = 'none'
        document.querySelector(".logout").style.display = 'block'
    }
}

async function logout() {
    const data = await CLIENT.auth.signOut()
    if(data.error) {
        show_snackbar("Logout Error: " + data.error)
    } else {
        document.querySelector('.title').innerHTML  = "Home <i>As Demo User</i>"
        document.querySelector(".login").style.display = 'block'
        document.querySelector(".logout").style.display = 'none'
        show_snackbar("Logout Success")
    }
}

async function fetchFile(name) {
    show_snackbar("Fetching " + name)
    const { data, error } = await CLIENT.storage
        .from(FILE_STORAGE)
        .download(name)

    if (error) {
        show_snackbar("Fetch File Error: " + error.message)
        return
    } else {
        show_snackbar("Fetch File Success")
    }
    return data
}

async function insertData(table, load) {
    const { _, error } = await CLIENT
        .from(table)
        .insert(load)
    console.log(error)
    if (error) {
        show_snackbar("Insert Error: " + error.message)
        return false
    } else {
        show_snackbar("Insert Success")
        return true
    }
}

async function deleteData(table, id) {
    const { data, error } = await CLIENT
        .from(table)
        .delete()
        .eq("id", id)
    if (error) {
        show_snackbar("Delete Error: " + error.message)
        return false
    } else {
        show_snackbar("Delete Success")
        return true
    }
}

async function fetchData(table) {
    const { data, error } = await CLIENT
        .from(table)
        .select("*")
    if (error) {
        show_snackbar("Fetch Data Error: " + error.message)
        return
    } else {
        console.log("Fetch Success")
    }
    return data
}
