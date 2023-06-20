sap.ui.define([
		"zjblessons/WorklistEventBus/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("zjblessons.WorklistEventBus.controller.NotFound", {

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