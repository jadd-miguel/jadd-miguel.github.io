const supabaseUrl = "https://aezewrnpboaixgjbvyoc.supabase.co"
const supabaseAnonKey = "sb_publishable_IcZSnNPX54lkgnTqQMAZ8g_OTxa2V-T"

const client = supabase.createClient(supabaseUrl, supabaseAnonKey)

async function fetchFile(name) {
    const { data, error } = await client.storage
        .from("my site")
        .download(name)

    if (error) {
        console.log("Fetch File Error: ", error)
    } else {
        console.log("Download Success")
    }
    return data
}

async function insertData(table, load) {
    const { data, error } = await client
        .from(table)
        .insert(load)

    if (error) {
        console.log("Insert Error: ", error)
    } else {
        console.log("Insert Success")
    }
}

async function deleteData(table, id) {
    const { data, error } = await client
        .from(table)
        .delete()
        .eq("id", id)

    if (error) {
        console.log("Delete Error: ", error)
    } else {
        console.log("Delete Success")
    }
}

async function getData(table, id) {
    const { data, error } = await client
        .from(table)
        .select("*")

    if (error) {
        console.log("Get Error: ", error)
    } else {
        console.log("Get Success")
    }
    return data
}
