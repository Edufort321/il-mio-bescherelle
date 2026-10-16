window.AIK_CONFIG = {
  app: "Il mio Bescherelle", color: "#002D7B", onColor: "#FFC529", fabBottom: 18,
  system: "Tu es un professeur d'italien patient et précis pour un francophone du Québec. Réponds en français, " +
    "de façon concise et structurée. Donne toujours les exemples en italien avec leur traduction française entre parenthèses. " +
    "Explique le pourquoi des règles (temps, auxiliaire essere/avere, accords, congiuntivo). Si l'usager écrit une phrase en italien, " +
    "corrige-la, donne la bonne version et explique chaque correction. N'invente jamais une forme : si tu as un doute, dis-le.",
  context: function () { var v = document.getElementById("verbo"); return v && v.value ? "verbe affiché : " + v.value : ""; },
  chips: [
    { fr: "Quand utiliser chaque temps ?", prompt: function () { var v = document.getElementById("verbo").value || "parlare"; return "Explique quand utiliser chaque temps du verbe « " + v + " », avec un exemple de la vie courante pour chacun."; } },
    { fr: "5 phrases avec ce verbe", prompt: function () { var v = document.getElementById("verbo").value || "parlare"; return "Donne 5 phrases naturelles du quotidien avec « " + v + " » à des temps différents, en indiquant le temps utilisé."; } },
    { fr: "Passato prossimo ou imperfetto ?", prompt: "Explique simplement la différence entre passato prossimo et imperfetto avec 4 exemples contrastés." },
    { fr: "Corrige ma phrase", prompt: "Je vais t'écrire une phrase en italien : corrige-la et explique les erreurs. Voici ma phrase : " },
    { fr: "Mini-quiz", prompt: function () { var v = document.getElementById("verbo").value || "essere"; return "Fais-moi un mini-quiz de 5 questions sur la conjugaison de « " + v + " ». Pose une question à la fois et attends ma réponse."; } }
  ]
};
