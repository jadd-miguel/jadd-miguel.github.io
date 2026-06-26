const grabLangRulesBtn = document.getElementById('grabLangRules')
const ruleAndPointsBtn = document.getElementById('ruleAndPoints')

document.addEventListener('DOMContentLoaded', async function() {
    const { data, _ } = await CLIENT.auth.getSession()
    const session = data.session

    if(session) {
        document.querySelector('.title').innerHTML  = "Lang-A-Day (Authenticated)"
    } else {
        document.querySelector('.title').innerHTML  = "Lang-A-Day (Unauthenticated)"
        ruleAndPointsBtn.disabled = true
    }
})

let active_rule = null
class Rule {
    constructor(id, rule, content, language, points) {
        this.id = id;
        this.rule = rule;
        this.content = content;
        this.language = language;
        this.points = points;
    }
}

function disableBtns(){
    grabLangRulesBtn.classList.add("inactive")
    ruleAndPointsBtn.classList.add("inactive")
}

function enableBtns(){
    grabLangRulesBtn.classList.remove("inactive")
    ruleAndPointsBtn.classList.remove("inactive")
}


async function grabLangRules() {
    disableBtns()
    await handleRule()
    enableBtns()
}

async function ruleAndPoints() {
    disableBtns()
    await handlePoints(active_rule)
    await handleRule()
    enableBtns()
}

async function handleRule() {
    const language = document.querySelector('input[name="lang"]:checked').value
    let rules = await fetchLangRules(language);

    rules = rules.map(x => new Rule(x.id, x.rule, x.content, x.language, x.points))
    active_rule = rules[Math.floor(Math.random() * rules.length)]

    document.getElementById("content").textContent = active_rule.content
    document.getElementById("rule").textContent = "Rule: " + active_rule.rule + ", Points: " + active_rule.points
}

async function handlePoints(rule) {
    if(rule)
        await insertLangPoints(rule.id, rule.points + 1)
}
