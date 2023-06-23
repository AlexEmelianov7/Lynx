sap.ui.define([
		"zjblessons/WorklistCustomControl/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("zjblessons.WorklistCustomControl.controller.NotFound", {

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