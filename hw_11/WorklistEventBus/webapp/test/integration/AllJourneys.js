/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"zjblessons/WorklistEventBus/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"zjblessons/WorklistEventBus/test/integration/pages/Worklist",
	"zjblessons/WorklistEventBus/test/integration/pages/Object",
	"zjblessons/WorklistEventBus/test/integration/pages/NotFound",
	"zjblessons/WorklistEventBus/test/integration/pages/Browser",
	"zjblessons/WorklistEventBus/test/integration/pages/App"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "zjblessons.WorklistEventBus.view."
	});

	sap.ui.require([
		"zjblessons/WorklistEventBus/test/integration/WorklistJourney",
		"zjblessons/WorklistEventBus/test/integration/ObjectJourney",
		"zjblessons/WorklistEventBus/test/integration/NavigationJourney",
		"zjblessons/WorklistEventBus/test/integration/NotFoundJourney"
	], function () {
		QUnit.start();
	});
});