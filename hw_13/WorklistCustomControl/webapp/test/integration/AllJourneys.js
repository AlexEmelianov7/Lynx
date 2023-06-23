/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"zjblessons/WorklistCustomControl/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"zjblessons/WorklistCustomControl/test/integration/pages/Worklist",
	"zjblessons/WorklistCustomControl/test/integration/pages/Object",
	"zjblessons/WorklistCustomControl/test/integration/pages/NotFound",
	"zjblessons/WorklistCustomControl/test/integration/pages/Browser",
	"zjblessons/WorklistCustomControl/test/integration/pages/App"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "zjblessons.WorklistCustomControl.view."
	});

	sap.ui.require([
		"zjblessons/WorklistCustomControl/test/integration/WorklistJourney",
		"zjblessons/WorklistCustomControl/test/integration/ObjectJourney",
		"zjblessons/WorklistCustomControl/test/integration/NavigationJourney",
		"zjblessons/WorklistCustomControl/test/integration/NotFoundJourney"
	], function () {
		QUnit.start();
	});
});