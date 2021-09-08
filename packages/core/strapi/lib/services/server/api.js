'use strict';

const Router = require('@koa/router');

const { createRouteManager } = require('./routing');

const createAPI = (strapi, opts = {}) => {
  const { prefix, defaultPolicies } = opts;

  const api = new Router({ prefix });

  const routeManager = createRouteManager(strapi, { defaultPolicies });

  return {
    use(fn) {
      api.use(fn);
      return this;
    },

    routes(routes) {
      routeManager.addRoutes(routes, api);
      return this;
    },

    mount(router) {
      router.use(api.routes(), api.allowedMethods());
      return this;
    },
  };
};

module.exports = { createAPI };
