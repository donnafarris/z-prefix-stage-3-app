import { registerApplication, start } from "single-spa";
import {
  constructApplications,
  constructRoutes,
  constructLayoutEngine,
} from "single-spa-layout";

const routes = constructRoutes(document.querySelector("#single-spa-layout"), {
  loaders: {
    header: "<p>Loading header</p>",
    mainPage: "<p>Loading main page</p>"
  },
  errors: {
    header: "<p>Failed to load header</p>",
    mainPage: "<p>Failed to load main page</p>"
  },
});
const applications = constructApplications({
  routes,
  loadApp({ name }) {
    return System.import(name);
  },
});
const layoutEngine = constructLayoutEngine({ routes, applications });

applications.forEach(registerApplication);
layoutEngine.activate();
start();
