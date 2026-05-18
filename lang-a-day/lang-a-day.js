document.addEventListener('DOMContentLoaded', async function() {
    const { data, _ } = await CLIENT.auth.getSession()
    const session = data.session

    if(session) {
        document.querySelector('.title').innerHTML  = "Lang-A-Day <i>As Privileged User</i>"
    } else {
        document.querySelector('.title').innerHTML  = "Lang-A-Day <i>As Demo User</i>"
        document.getElementById('ruleAndPoints').disabled = true
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

async function grabLangRules() {
    await handleRule()
}

async function ruleAndPoints() {
    await handlePoints(active_rule)
    await handleRule()
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
