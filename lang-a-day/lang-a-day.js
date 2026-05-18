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
    const language = document.querySelector('input[name="lang"]:checked').value
    let rules = await fetchLangRules(language);

    rules = rules.map(x => new Rule(x.id, x.rule, x.content, x.language, x.points))
    const rule = rules[Math.floor(Math.random() * rules.length)]

    document.getElementById("content").textContent = rule.content
    document.getElementById("rule").textContent = rule.rule
}
