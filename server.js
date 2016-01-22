var strapi = require("strapi");
var nwb = require("./hooks/nwb");

process.chdir(__dirname);

strapi.start(function(error, strapi) {
  // Enable post graphql
  // if (strapi.config.graphql.enabled === true) {
  //   // Wait GraphQL schemas generation
  //   // strapi.once('waterline:graphql:ready', function () {
  //     strapi.router.post(strapi.config.graphql.route, strapi.middlewares.graphql({
  //       schema: strapi.schemas,
  //       pretty: true
  //     }));
  //   // });
  // }

  nwb(strapi);
});
