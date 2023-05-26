sap.ui.define([
		"zjblessons/WorklistApp/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("zjblessons.WorklistApp.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);