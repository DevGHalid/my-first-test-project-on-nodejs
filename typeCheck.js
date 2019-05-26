const fs = require("fs");
const colors = require("colors");

fs.readFile("./check.type", "utf8", (err, data) => {
  const jsCode = compileToJavascriptCode(data);
  if (jsCode != null) {
    try {
      eval(jsCode.minTemplate);
      // fs.writeFile("check.js", jsCode, error => {
      //   if (error) throw error;
      // });
    } catch (error) {
      console.log(colors.red(error));
    }
  }
});

// global variable for error observe
let error = false;

// handel error
function handlerError(msg) {
  // set error
  error = true;
  // show error
  return console.error(new Error(msg));
}

// const variable
const VAR_INT = "int";
const VAR_CHAR = "char";
const VAR_BOOL = "bool";
const VAR_VOID = "void";

// list variable obj
const VARABLE = {
  [VAR_INT]: /^[0-9\~\+\-]+$/,
  [VAR_BOOL]: /^(\!+)?[true|false]+$/,
  [VAR_CHAR]: /^\'|\"|\`$/
};

// list variable arr
const VARABLE_NAME = Object.keys(VARABLE);
// list name variable to str for regexp
const VARABLE_NAME_STR = VARABLE_NAME.join("|");
// regexp variable
const VARABLE_REGEXP = new RegExp(VARABLE_NAME_STR);
// regexp variable global
const VARABLE_REGEXP_GLOBAL = new RegExp(VARABLE_NAME_STR, "g");
// default variable for compiler
const DEFAULT_VARIABLE = "let";
// regexp for search variable
const typeVaribleRegExp = /(\w+)[\s+](\w+)[\s+]?\=?(.*)?/;
// regexp for search created variable
const varibleRegExp = /(\w+)[\s+]?\=[\s+]?(.*)[\s+]?/;

/* check if there is type */
function isVariable(name) {
  return VARABLE.hasOwnProperty(name);
}

/* check variable value */
function testVariable(key, val) {
  return VARABLE[key].test(val);
}

/* find type */
function findType(val) {
  return VARABLE_NAME.find(key => testVariable(key, val));
}

/* compile to javascript code */
function compileToJavascriptCode(template) {
  const blockRegExp = /\{([\s]+[a-zA-Z0-9\s=;]+)\}/g;

  const _template = template.replace(/\s\s+/, " ").replace(/\n/g, "");
  const matchBlock = _template.match(blockRegExp, "");
  const cleanBlock = _template.replace(blockRegExp, "");
  const stack = cleanBlock.split(";");

  return doCheckCompiler(template, _template, stack);
}

function doCheckCompiler(tm, minTm, stack) {
  // variables that was just created
  const stackVariable = [];
  // variables changed
  const changedVariable = [];

  for (let i = 0; i < stack.length; i++) {
    const _stack = stack[i];

    if (_stack) {
      if (typeVaribleRegExp.test(_stack) == true) {
        if (VARABLE_REGEXP.test(_stack) == true) {
          stackVariable.push(initVariableHandler(_stack.trim()));
        }
      } else {
        if (varibleRegExp.test(_stack) == true) {
          const match = _stack.trim().match(varibleRegExp);

          const dataVariable = {
            tm: match[0],
            name: match[1],
            val: match[2]
          };

          changedVariable.push(dataVariable);
        }
      }
    }
  }
  // not error
  if (!error) {
    const isVariable = isVariableSuccessfullyChanged(
      stackVariable,
      changedVariable
    );
    if (isVariable) {
      const newTemplate = tm.replace(VARABLE_REGEXP_GLOBAL, DEFAULT_VARIABLE);

      const minTemplate = minTm.replace(
        VARABLE_REGEXP_GLOBAL,
        DEFAULT_VARIABLE
      );

      return { minTemplate, newTemplate, stackVariable, changedVariable };
    }
  }
  return null;
}

/*
 * Do check on change variable,
 */
function isVariableSuccessfullyChanged(listVar, changedVar) {
  if (changedVar.length > 0) {
    for (let i = 0; i < listVar.length; i++) {
      const item = listVar[i];
      const { tm, name, key, val } = item;

      for (let j = 0; j < changedVar.length; j++) {
        const chv = changedVar[j];
        if (chv.name === name) {
          // if change not matched with type variable
          if (!testVariable(key, chv.val)) {
            // show error
            const msg = "\n\n * he is type " + findType(val);
            showErrorVariable(chv.tm, name, val, chv.val, msg);
            return false;
          }
        }
      }
    }
  }

  return true;
}

/*
 * Do initialization variable
 */
function initVariableHandler(_var) {
  // get all created variable
  const match = _var.match(typeVaribleRegExp);
  const val = match[3] ? match[3].trim() : null;
  const dataVariable = {
    tm: match[0],
    key: match[1],
    name: match[2],
    val
  };

  // do check type with value
  if (
    dataVariable.val != null &&
    !testVariable(dataVariable.key, dataVariable.val)
  ) {
    // show error
    return showErrorVariable(
      dataVariable.tm,
      dataVariable.name,
      dataVariable.val,
      "",
      "\n\n * he is type " + dataVariable.key
    );
  }

  return dataVariable;
}

// show error (variable)
function showErrorVariable(tm, name, val, newVal = "", addTxt = "", space = 3) {
  val = val || "";
  const text = newVal || val;
  const lenVal = newVal.length > 0 ? newVal.length : val.length;

  const type = findType(text);
  const indexValue = tm.indexOf(text);
  const index = (indexValue > 0 ? indexValue : 0) + space;
  const valueError = `${text}\n${" ".repeat(index)}${"^".repeat(lenVal)}`.bold
    .red;
  const whereError = tm.replace(text, valueError);

  // content error
  const contentError = `Cannot assign to ${name} is incompatible with ${type}${addTxt.toUpperCase() ||
    ""}\n *\n * ${whereError}`;

  return handlerError(contentError);
}

function equalQuotationMark(str, val) {
  return str.charAt(0) === val && str.charAt(str.length - 1) === val;
}

function equalQuotationMarkAll(val) {
  return (
    equalQuotationMark(val, "'") ||
    equalQuotationMark(val, '"') ||
    equalQuotationMark(val, "`")
  );
}
