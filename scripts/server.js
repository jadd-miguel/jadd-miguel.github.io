const SERVER_URL = "https://ugxwfxnfuwswmojuaagt.supabase.co"
const ANON_KEY = "sb_publishable_aWNpR_9LhqbLuCtc-95zsw_TKSeJBQA"

const CLIENT = supabase.createClient(SERVER_URL, ANON_KEY, {auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }})
const FILE_STORAGE = "my site"

async function login() {
    const email = document.getElementById(window.innerWidth > 1024 ? "email" : "mbl-email").value
    const password = document.getElementById(window.innerWidth > 1024 ? "password" : "mbl-password").value

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
        document.querySelectorAll(".login, .mbl-login").forEach(x => { x.style.display = 'none' })
        document.querySelectorAll(".logout, .mbl-logout").forEach(x => { x.style.display = 'block' })
    }
}

async function logout() {
    const data = await CLIENT.auth.signOut()
    if(data.error) {
        show_snackbar("Logout Error: " + data.error)
    } else {
        document.querySelectorAll(".login, .mbl-login").forEach(x => { x.style.display = 'block' })
        document.querySelectorAll(".logout, .mbl-logout").forEach(x => { x.style.display = 'none' })
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
        console.log("Fetch File Success")
    }
    return data
}

async function insertData(table, load) {
    const { _, error } = await CLIENT
        .from(table)
        .insert(load)
    if (error) {
        show_snackbar("Insert Error: " + error.message)
        return false
    } else {
        show_snackbar("Insert Success")
        return true
    }
}

async function editData(table, load, id) {
    const { _, error } = await CLIENT
        .from(table)
        .update(load)
        .eq("id", id)
    if (error) {
        show_snackbar("Edit Error: " + error.message)
        return false
    } else {
        show_snackbar("Edit Success")
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

const LANG_TABLE = "language"
async function fetchLangRules(language) {
    const { data, error } = await CLIENT
        .from(LANG_TABLE)
        .select("*")
        .eq("language", language)
    if (error) {
        show_snackbar("Fetch Language Error: " + error.message)
        return
    } else {
        console.log("Fetch Language Success")
    }
    return data
}

async function insertLangPoints(id, pts) {
    const { data, error } = await CLIENT
        .from(LANG_TABLE)
        .update({
            points: pts
        })
        .eq("id", id)
    if (error) {
        show_snackbar("Points Add Error: " + error.message)
        return
    } else {
        console.log("Points Add Success")
    }
}
