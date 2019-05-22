const fs = require("fs");

fs.readFile("./src/view.js", (error, data) => {
  compileTemplate(String(data));
});

function compileTemplate(html) {
  html = html.replace(/\n/g, "");

  const startTagJavascript = "\\<javascript\\>";
  const endTagJavascript = "\\<\\/javascript\\>";
  const regTm = new RegExp(
    `${startTagJavascript}(.*?)${endTagJavascript}`,
    "g"
  );

  const startTagTemplate = "\\<Template\\>";
  const endTagTemplate = "\\<\\/Template\\>";
  const regTagTemplateBody = new RegExp(
    `${startTagTemplate}(.*?)${endTagTemplate}`,
    "g"
  );
  const regTagTemplate = new RegExp(
    `${startTagTemplate}|${endTagTemplate}`,
    "g"
  );
  const bodyTemplate = "`" + regTagTemplateBody.exec(html)[1] + "`";
  const newTmplateBody = setTemplate(bodyTemplate);

  let match;

  let scripts = "";
  while ((match = regTm.exec(html))) {
    const bodyScript = match[1];

    scripts += bodyScript + " ";
  }

  console.log(scripts, newTmplateBody);
}

function setTemplate(tm) {
  const start = "\\{\\{";
  const end = "\\}\\}";
  const rg = new RegExp(`${start}|${end}`, "g");
  tm = tm.trim().replace(rg, a => {
    if (a.search(start) > -1) {
      return "${";
    } else if (a.search(end) > -1) {
      return "}";
    }
  });

  return tm;
}
