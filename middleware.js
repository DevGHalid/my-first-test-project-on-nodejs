
function facade() {
  const middlewares = [];

  let use = function(callback) {
    if (callback) {
      middlewares.push(callback);
    }
  };

  let render = function() {
    let i = middlewares.length;

    while (i--) {
      const middleware = middlewares[i];
      const $next = use;

      use = function() {
        const argv = Array.prototype.slice.call(arguments);
        argv.push($next);

        return middleware.apply(null, argv);
      };
    }

    use();
  };

  return { render, use };
}


//----
function createSchemaElement() {
  let count = 0;
  let bufferHouse = [];
  const OBSERVE_STATE = Symbol("#observe_state");
  const DIRECTIVE = Symbol("#directive");
  const NODE_ELEMENT = "#elem";
  const NODE_TEXT = "#text";

  function createElement(tagName, attr, children = []) {
    const node = {
      _id: (count += 1),
      nodeName: NODE_ELEMENT,
      tagName,
      attr,
      children,
      __node: null
    };
    bufferHouse.push(node);
    return node;
  }

  function createText(...contents) {
    const index = (count += 1);
    const children = contents.map(content => {
      if (content instanceof Object) {
        content._id.push(index);
      }

      return content;
    });

    const node = { _id: index, nodeName: NODE_TEXT, children, __node: null };
    bufferHouse.push(node);

    return node;
  }

  function findElement(index) {
    let begin = 0;
    let last = bufferHouse.length - 1;
    let middleIndex = 0;

    while (begin <= last) {
      middleIndex = Math.floor((begin + last) / 2);
      const item = bufferHouse[middleIndex]._id;

      if (item < index) {
        begin = middleIndex + 1;
      } else if (item > index) {
        last = middleIndex - 1;
      } else {
        return bufferHouse[middleIndex];
      }
    }

    return -1;
  }

  // create node
  function createNode(node) {
    // create text node
    if (typeof node === "string") {
      return document.createTextNode(node);
    } else if (node.hasOwnProperty("nodeName") && node.nodeName === NODE_TEXT) {
      const txt = node.children
        .map(item => (item.type === OBSERVE_STATE ? item.value : item))
        .join("");

      return document.createTextNode(txt);
    }

    // create node element
    const el = document.createElement(node.tagName);

    if (node.children) {
      node.children.forEach(item => {
        // create children to node
        const currentNode = createNode(item);
        el.appendChild(currentNode);

        if (item.hasOwnProperty("__node")) {
          item.__node = currentNode;
        }
      });
    }
    return el;
  }

  // global options
  const globalOptions = {
    $state: {}
  };

  const listIf = [];
  function $if(callback) {
    if (typeof callback === "function") {
      const beginDom = callback();
      listIf.push({ beginDom, handler: callback });
      return beginDom;
    }
  }

  // observable state
  function observable(state) {
    if (state instanceof Object) {
      return Object.assign(globalOptions, makeObserve(state));
    }
  }

  // make observe
  function makeObserve(data) {
    // signals for subscribe
    const signals = [];

    function subscribeAll(handelSignal) {
      if (typeof handelSignal === "function") {
        signals.push(handelSignal);
      }
    }

    function notify(key, value) {
      if (signals.length > 0) {
        // apply all signals which be subscribe
        signals.forEach(handelSignal => handelSignal(key, value));
      }
    }

    // make reactive
    function makeReactive(key) {
      // state
      const currentData = {
        _id: [],
        type: OBSERVE_STATE,
        value: data[key]
      };

      Object.defineProperty(data, key, {
        get() {
          // get state
          return currentData;
        },
        set({ value }) {
          // set state
          currentData.value = value;
          // update render
          updateRender(currentData._id, currentData.value);
          notify(key, currentData);
        }
      });
    }

    for (let key in data) {
      // make all property reactive
      makeReactive(key);
    }

    return { subscribeAll, $state: data };
  }

  // update node
  function updateNode(newNode, oldNode) {
    const [newLength, oldLength] = [newNode.length, oldNode.length];
    for (let i = 0; i < newLength || i < oldLength; i++) {
      const [itemNewNode, itemOldNode] = [newNode[i], oldNode[i]];
    }
  }

  // update render
  function updateRender(listIndex, newValue) {
    listIndex.forEach(index => {
      const currentNode = findElement(index);
      const { __node } = currentNode;
      if (__node !== null) {
        __node.textContent = newValue;
      }
    });
  }

  const listMounted = [];
  // mounted
  function mounted(callback) {
    if (typeof callback === "function") {
      listMounted.push(callback);
    }
  }

  // get length only node
  function getLengthOnlyNode(node) {
    node = Array.isArray(node) ? node : [node];
    let count = 0;
    return (function setConter(items) {
      if (Array.isArray(items)) {
        let i = 0;
        while (items[i]) {
          const item = items[i];

          if (item instanceof Object) {
            setConter(item.children);
            count += 1;
          }

          i += 1;
        }
        return count;
      }
      return 0;
    })(node);
  }

  // render
  function render(callback, root = null) {
    const handlerRender = callback.bind(null, globalOptions);
    const beginHouse = handlerRender();
    if (beginHouse) {
      const node = createNode(beginHouse);
      if (root instanceof HTMLElement) {
        root.appendChild(node);
      }
    }

    if (listMounted.length > 0) {
      listMounted.forEach(mounted => mounted.call(null, globalOptions));
    }
  }

  return {
    render,
    createText,
    createElement,
    createNode,
    findElement,
    observable,
    mounted,
    $if
  };
}
const {
  createElement,
  createText,
  findElement,
  createNode,
  render,
  observable,
  mounted,
  $if
} = createSchemaElement();

// ---------------------- test ----------------------------

const { subscribeAll, $state } = observable({
  age: 12
});

mounted(observe => {
  let i = 0;

  document.body.onclick = () => {
    i += 1;
    observe.$state.age = { ...observe.$state.age, value: i };
  };
});

render(observe => {
  return createElement("div", null, [
    createElement("h1", null, ["index "]),
    createElement("h1", null, ["index "]),
    createElement("h1", null, ["index "]),
    createElement("h1", null, ["index "]),
    createElement("h1", null, ["index "]),
    createElement("h1", null, ["index "]),
    createElement("h1", null, ["index "]),
    $if(() =>
      observe.$state.age.value == 2
        ? createElement("h1", null, [
            "Yes :) !!!",
            createElement("div", null, ["test yes"])
          ])
        : createElement("h2", null, [
            "Not :( !!!",
            createElement("div", null, ["test not"])
          ])
    ),
    createText(observe.$state.age),
    createElement("h1", null, ["index "])
  ]);
}, document.getElementById("app"));
