sap.ui.define([
	] , function () {
		"use strict";

		return {

			formatModified: function (oModified){
				if(oModified){
					var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
						pattern: "HH:mm dd/MM/yyyy"
					}).format(new Date(oModified));
					return oDateFormat;
				}
			},
			numberUnit: function (sValue) {
				if (!sValue) {
					return "";
				}
				return parseFloat(sValue).toFixed(2);
			}
		};
	}
);