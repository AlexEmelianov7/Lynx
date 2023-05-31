/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"zjblessons/WorklistApp/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"zjblessons/WorklistApp/test/integration/pages/Worklist",
	"zjblessons/WorklistApp/test/integration/pages/Object",
	"zjblessons/WorklistApp/test/integration/pages/NotFound",
	"zjblessons/WorklistApp/test/integration/pages/Browser",
	"zjblessons/WorklistApp/test/integration/pages/App"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "zjblessons.WorklistApp.view."
	});

	sap.ui.require([
		"zjblessons/WorklistApp/test/integration/WorklistJourney",
		"zjblessons/WorklistApp/test/integration/ObjectJourney",
		"zjblessons/WorklistApp/test/integration/NavigationJourney",
		"zjblessons/WorklistApp/test/integration/NotFoundJourney"
	], function () {
		QUnit.start();
	});
});