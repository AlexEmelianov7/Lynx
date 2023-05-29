/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 jbcommon_auth_ModifiedBy in the list

sap.ui.require([
	"sap/ui/test/Opa5",
	"zjblessons/MasterDetailApp/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"zjblessons/MasterDetailApp/test/integration/pages/App",
	"zjblessons/MasterDetailApp/test/integration/pages/Browser",
	"zjblessons/MasterDetailApp/test/integration/pages/Master",
	"zjblessons/MasterDetailApp/test/integration/pages/Detail",
	"zjblessons/MasterDetailApp/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "zjblessons.MasterDetailApp.view."
	});

	sap.ui.require([
		"zjblessons/MasterDetailApp/test/integration/MasterJourney",
		"zjblessons/MasterDetailApp/test/integration/NavigationJourney",
		"zjblessons/MasterDetailApp/test/integration/NotFoundJourney",
		"zjblessons/MasterDetailApp/test/integration/BusyJourney"
	], function () {
		QUnit.start();
	});
});