const SERVER_URL = "https://aezewrnpboaixgjbvyoc.supabase.co"
const ANON_KEY = "sb_publishable_IcZSnNPX54lkgnTqQMAZ8g_OTxa2V-T"

const CLIENT = supabase.createClient(SERVER_URL, ANON_KEY)
const FILE_STORAGE = "my site"

async function fetchFile(name) {
    const { data, error } = await CLIENT.storage
        .from(FILE_STORAGE)
        .download(name)

    if (error) {
        console.log("Fetch File Error: ", error)
    } else {
        console.log("Download Success")
    }
    return data
}

async function insertData(table, load) {
    const { _, error } = await CLIENT
        .from(table)
        .insert(load)

    if (error) {
        console.log("Insert Error: ", error)
    } else {
        console.log("Insert Success")
    }
}

async function deleteData(table, id) {
    const { data, error } = await CLIENT
        .from(table)
        .delete()
        .eq("id", id)

    if (error) {
        console.log("Delete Error: ", error)
    } else {
        console.log("Delete Success")
    }
}

async function getData(table) {
    const { data, error } = await CLIENT
        .from(table)
        .select("*")

    if (error) {
        console.log("Get Error: ", error)
    } else {
        console.log("Get Success")
    }
    return data
}
