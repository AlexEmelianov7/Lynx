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

			creationInfo: function (sModifiedFullName, dDate) {
				const oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "EEE, MMM dd, YYYY,"
				}).format(new Date(dDate));

				if (sModifiedFullName && dDate) {
					const sDateMinutes = this.getResourceBundle().getText("dMinutes"),
							sDateHours = this.getResourceBundle().getText("dHours"),
							sDateDays = this.getResourceBundle().getText("dDays"),
							sDateOn = this.getResourceBundle().getText("dOn"),
							sDateModified = this.getResourceBundle().getText("dModified"),
							sDateAgo = this.getResourceBundle().getText("dAgo");

					const currentDate = new Date();
					const diffDate = currentDate - dDate;


					const oneMinute = 1000 * 60,
							oneHour = oneMinute * 60,
					 		oneDay = oneHour * 24;

					const diffDays = Math.floor(diffDate / oneDay);
					const diffHours = Math.floor(diffDate / oneHour) - diffDays * 24;
					const diffMinutes = Math.floor(diffDate / oneMinute) - diffDays * 24 * 60 - diffHours * 60 ;

					const agoDays = diffDays > 0 ? `${diffDays}${sDateDays}` : "";
					const agoHours = diffHours > 0 ? `${diffHours}${sDateHours}` : "";
					const agoMinutes = diffMinutes > 0 ? `${diffMinutes}${sDateMinutes}` : "";

					const sformattedFullName = sModifiedFullName.split(" ")[1];

					return `${sformattedFullName} ${sDateOn} ${oDateFormat} ${sDateModified} ${agoDays} ${agoHours} ${agoMinutes} ${sDateAgo}`;
				}

			},

			formatName: function (sName) {
				if (sName) {
					return sName.split(" ")
					.map((sPart, index) => index === 0 ? `${sPart[0]}.` : sPart)
					.join(" ");
				}	
			},

			btnIconFormatter: function (aMessages) {
				let sIcon;

				aMessages.forEach(oMessage => {
					switch (oMessage.type) {
						case "Error":
							sIcon = this.getResourceBundle().getText("iError");
							break;
						case "Warning":
							sIcon = sIcon !== this.getResourceBundle().getText("iError") 
								? this.getResourceBundle().getText("iAlert") 
								: sIcon;
							break;
						case "Success":
							sIcon = this.getResourceBundle().getText("iError") && 
								sIcon !== this.getResourceBundle().getText("iAlert") 
								? this.getResourceBundle().getText("iSuccess") 
								: sIcon;
							break;
					
						default:
							sIcon = !sIcon ? this.getResourceBundle().getText("iInformation") : sIcon;
							break;
					}
				});

				return sIcon || this.getResourceBundle().getText("iInformation");
			},

			btnTypeFormatter: function (aMessages) {
				let sHighestSeverityIcon;

				aMessages.forEach(sMessage => {
					switch (sMessage.type) {
						case "Error":
							sHighestSeverityIcon = "Negative";
							break;
						case "Warning":
							sHighestSeverityIcon = sHighestSeverityIcon !== "Negative"
								? "Critical"
								: sHighestSeverityIcon
							break;
						case "Success":
							sHighestSeverityIcon = sHighestSeverityIcon !== "Negative" && 
							sHighestSeverityIcon !== "Critical"
								? "Success"
								: sHighestSeverityIcon;
							break;
					
						default:
							sHighestSeverityIcon = !sHighestSeverityIcon
							? "Neutral"
							: sHighestSeverityIcon;
							break;
					}
				});

				return sHighestSeverityIcon;
			},

			btnTextFormatter: function (aMessages = []) {
				const sHighestSeverityIconType = this.formatter.btnTypeFormatter(aMessages);

				let sHighestSeverityMessageType;

				switch (sHighestSeverityIconType) {
					case "Negative":
						sHighestSeverityMessageType = "Error";
						break;
					case "Critical":
						sHighestSeverityMessageType = "Warning";
						break;
					case "Success":
						sHighestSeverityMessageType = "Success";
						break;
				
					default:
						sHighestSeverityMessageType = !sHighestSeverityMessageType
						? "Information"
						: sHighestSeverityMessageType;
						break;
				}

				return aMessages.reduce(function(iNumberOfMessages, oMessageItem) {
					return oMessageItem.type === sHighestSeverityMessageType ? ++iNumberOfMessages : iNumberOfMessages;
				}, 0);
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