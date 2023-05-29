/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

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
		"zjblessons/MasterDetailApp/test/integration/NavigationJourneyPhone",
		"zjblessons/MasterDetailApp/test/integration/NotFoundJourneyPhone",
		"zjblessons/MasterDetailApp/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});