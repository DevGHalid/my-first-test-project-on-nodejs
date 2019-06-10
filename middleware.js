
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
