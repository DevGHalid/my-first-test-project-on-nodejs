
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
  const bufferHouse = [];
  const KEY_OBSERVE_STATE = Symbol('#observe_state');
  const DIRECTIVE = Symbol('#directive');
  const NODE_ELEMENT = '#elem';
  const NODE_TEXT = '#text';

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
    if (typeof node === 'string') {
      return document.createTextNode(node);
    } else if (node.hasOwnProperty('nodeName') && node.nodeName === NODE_TEXT) {
      const txt = node.children
        .map(item => (item.type === KEY_OBSERVE_STATE ? item.value : item))
        .join('');

      return document.createTextNode(txt);
    }
    const parent = document.createElement(node.tagName);

    if (node.children) {
      node.children.forEach(item => {
        const currentNode = createNode(item);
        parent.appendChild(currentNode);

        if (item.hasOwnProperty('__node')) {
          item.__node = currentNode;
        }
      });
    }
    return parent;
  }

  const globalOptions = {
    $state: {}
  };

  const listIf = [];
  function setIf(callback) {
    if (typeof callback === 'function') {
      const house = callback();
      const index = (count = count + 1);

      const handler = () => {
        count--;
        return callback();
      };

      const node = {
        _id: index,
        tagName: 'div',
        nodeName: DIRECTIVE,
        children: house,
        options: { handler }
      };
      listIf.push(node);
      bufferHouse.push(node);

      return node;
    }
  }

  function setObserveState(state) {
    if (state instanceof Object) {
      return Object.assign(globalOptions, makeObserve(state));
    }
  }

  function makeObserve(data) {
    const signals = [];

    function subscribeAll(handelSignal) {
      if (typeof handelSignal === 'function') {
        signals.push(handelSignal);
      }
    }

    function notify(key, value) {
      if (signals.length > 0) {
        signals.forEach(handelSignal => handelSignal(key, value));
      }
    }

    function makeReactive(key) {
      const currentData = {
        value: data[key],
        _id: [],
        type: KEY_OBSERVE_STATE
      };

      Object.defineProperty(data, key, {
        get() {
          return currentData;
        },
        set({ value }) {
          currentData.value = value;
          updateRender(currentData._id, currentData.value);
          notify(key, currentData);
        }
      });
    }

    for (let key in data) {
      makeReactive(key);
    }

    return { subscribeAll, $state: data };
  }

  function updateElement(newNode, oldNode) {
    const [newLength, oldLength] = [newNode.length, oldNode.length];
    for (let i = 0; i < newLength || i < oldLength; i++) {
      const [itemNewNode, itemOldNode] = [newNode[i], oldNode[i]];
      if (itemNewNode) {
        if (itemNewNode.nodeName != itemOldNode.nodeName) {
          itemNewNode.__node = createNode(itemNewNode);
          itemOldNode.__node.parentNode.replaceChild(
            itemNewNode.__node,
            itemOldNode.__node
          );
        }
      }
    }
  }

  function updateRender(listIndex, newValue) {
    if (listIf.length > 0) {
      listIf.forEach(item => {
        const newHouse = item.options.handler();
        // updateElement(newHouse, item.children);

        // item.children = newHouse;
      });
    }

    if (listIndex.length > 0) {
      listIndex.forEach(index => {
        const currentNode = findElement(index);
        const { __node } = currentNode;
        if (__node !== null) {
          __node.textContent = newValue;
        }
      });
    }
  }

  const listMounted = [];
  function mounted(callback) {
    if (typeof callback === 'function') {
      listMounted.push(callback);
    }
  }

  function getLengthOnlyNode(node) {
    let i = 0;
    function setConter() {
      i++;

      if (node.children) {
      }
    }
  }

  getLengthOnlyNode(
    createElement('h1', null, ['index ', createElement('h1', null, ['index '])])
  );

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
    setObserveState,
    mounted,
    setIf
  };
}
const {
  createElement,
  createText,
  findElement,
  createNode,
  render,
  setObserveState,
  mounted,
  setIf
} = createSchemaElement();

const { subscribeAll, $state } = setObserveState({
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
  return createElement('div', null, [
    createElement('h1', null, ['index ']),
    createElement('h1', null, ['index ']),
    createElement('h1', null, ['index ']),
    setIf(() => {
      return [
        observe.$state.age.value > 2
          ? createElement('h1', null, [
              'index',
              createElement('div', null, ['Renderings'])
            ])
          : createText('test')
      ];
    }),
    createText(observe.$state.age),
    createElement('h1', null, ['index '])
  ]);
}, document.getElementById('app'));
