/*global location */
sap.ui.define([
		"zjblessons/MasterDetailApp/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"zjblessons/MasterDetailApp/model/formatter",
		"sap/m/VBox",
		"sap/m/Panel",
		"sap/ui/table/Table",
		"sap/ui/table/Column",
	], function (BaseController, JSONModel, formatter, VBox, Panel, Table, Column) {
		"use strict";

		return BaseController.extend("zjblessons.MasterDetailApp.controller.Detail", {

			formatter: formatter,

			_oViewModel: new JSONModel({
				masterItem: "",
				count: "",
				countGroups: "",
				countSubGroups: "",
				countRegions: "",
				countPlants: ""
			}),

			onInit : function () {
				this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

				this.setModel(this._oViewModel, "detailView");
			},

			_onObjectMatched : function (oEvent) {
				let sEntity =  oEvent.getParameter("arguments").entity;
				
				this.getModel("detailView").setProperty("/masterItem", sEntity);

				switch ("All") {
					case sEntity:
						this._createPanel();
						break;
					default:
						if(this.byId(sEntity).getBinding("rows")) {
							this.byId(sEntity).getBinding("rows").refresh();
						}
						else {
							const oLocalEvent = oEvent;
							this.byId(sEntity).bindRows({
								path: "/zjblessons_base_" + sEntity,
								events: {
									dataReceived: this.setCount.bind(this),
								},
								template: new sap.ui.table.Row({}),
							});
						}
						break;
				}
			},

			setCount: function (oEvent) {
				this.getModel("detailView").setProperty("/count", "(" + oEvent.getSource().getLength() + ")");
			},

			setCountGroups: function (oEvent) {
				this.getModel("detailView").setProperty("/countGroups", "(" + oEvent.getSource().getLength() + ")");
			},
			setCountSubGroups: function (oEvent) {
				this.getModel("detailView").setProperty("/countSubGroups", "(" + oEvent.getSource().getLength() + ")");
			},
			setCountRegions: function (oEvent) {
				this.getModel("detailView").setProperty("/countRegions", "(" + oEvent.getSource().getLength() + ")");
			},
			setCountPlants: function (oEvent) {
				this.getModel("detailView").setProperty("/countPlants", "(" + oEvent.getSource().getLength() + ")");
			},

			_createPanel: function () {
				if (!this.oPanels) {
					this.oPanels = new VBox({
						visible: "{= (${detailView>/masterItem}) === 'All'}",
						items: [
							new Panel({
								expandable: true,
								headerText: "{i18n>ttlGroups} {detailView>/countGroups}",
								content: [
									(this.oGroups = new Table ({
										columns: [
											new Column ({
												width: "auto",
												label: new sap.m.Label ({
													text: "GroupID"
												}),
												template: new sap.m.Text ({
													text: "{GroupID}"
												}),
											}),
											new Column ({
												width: "auto",
												label: new sap.m.Label ({
													text: "GroupText"
												}),
												template: new sap.m.Text ({
													text: "{GroupText}"
												}),
											}),
											new Column ({
												width: "auto",
												label: new sap.m.Label ({
													text: "GroupDescription"
												}),
												template: new sap.m.Text ({
													text: "{GroupDescription}"
												}),
											}),
										],
									})),
								],
							}),
							new Panel({
								expandable: true,
								headerText: "{i18n>ttlSubGroups} {detailView>/countSubGroups}",
								content: [
									(this.oSubGroups = new Table ({
										columns: [
											new Column ({
												width: "auto",
												label: new sap.m.Label ({
													text: "SubGroupID"
												}),
												template: new sap.m.Text ({
													text: "{SubGroupID}"
												}),
											}),
											new Column ({
												width: "auto",
												label: new sap.m.Label ({
													text: "SubGroupText"
												}),
												template: new sap.m.Text ({
													text: "{SubGroupText}"
												}),
											}),
											new Column ({
												width: "auto",
												label: new sap.m.Label ({
													text: "CreatedBy"
												}),
												template: new sap.m.Text ({
													text: "{CreatedBy}"
												}),
											}),
										],
									})),
								],
							}),
							new Panel({
								expandable: true,
								headerText: "{i18n>ttlRegions} {detailView>/countRegions}",
								content: [
									(this.oRegions = new Table ({
										columns: [
											new Column ({
												width: "auto",
												label: new sap.m.Label ({
													text: "RegionID"
												}),
												template: new sap.m.Text ({
													text: "{RegionID}"
												}),
											}),
											new Column ({
												width: "auto",
												label: new sap.m.Label ({
													text: "RegionText"
												}),
												template: new sap.m.Text ({
													text: "{RegionText}"
												}),
											}),
											new Column ({
												width: "auto",
												label: new sap.m.Label ({
													text: "CreatedBy"
												}),
												template: new sap.m.Text ({
													text: "{CreatedBy}"
												}),
											}),
										],
									})),
								],
							}),
							new Panel({
								expandable: true,
								headerText: "{i18n>ttlPlants} {detailView>/countPlants}",
								content: [
									(this.oPlants = new Table ({
										columns: [
											new Column ({
												width: "auto",
												label: new sap.m.Label ({
													text: "PlantID"
												}),
												template: new sap.m.Text ({
													text: "{PlantID}"
												}),
											}),
											new Column ({
												width: "auto",
												label: new sap.m.Label ({
													text: "PlantText"
												}),
												template: new sap.m.Text ({
													text: "{PlantText}"
												}),
											}),
											new Column ({
												width: "auto",
												label: new sap.m.Label ({
													text: "CreatedBy"
												}),
												template: new sap.m.Text ({
													text: "{CreatedBy}"
												}),
											}),
										],
									})),
								],
							}),
						],
					});

					this.oGroups.bindRows({
						path: "/zjblessons_base_Groups",
						events: {
							dataReceived: this.setCountGroups.bind(this),
						},
						template: new sap.ui.table.Row({}),
					});
					this.oSubGroups.bindRows({
						path: "/zjblessons_base_SubGroups",
						events: {
							dataReceived: this.setCountSubGroups.bind(this),
						},
						template: new sap.ui.table.Row({}),
					});
					this.oRegions.bindRows({
						path: "/zjblessons_base_Regions",
						events: {
							dataReceived: this.setCountRegions.bind(this),
						},
						template: new sap.ui.table.Row({}),
					});
					this.oPlants.bindRows({
						path: "/zjblessons_base_Plants",
						events: {
							dataReceived: this.setCountPlants.bind(this),
						},
						template: new sap.ui.table.Row({}),
					});

					this.byId("contentVBox").addItem(this.oPanels);

				}
			},

			onShareEmailPress : function () {
				var oViewModel = this.getModel("detailView");

				sap.m.URLHelper.triggerEmail(
					null,
					oViewModel.getProperty("/shareSendEmailSubject"),
					oViewModel.getProperty("/shareSendEmailMessage")
				);
			},

			_bindView : function (sObjectPath) {
				var oViewModel = this.getModel("detailView");
				oViewModel.setProperty("/busy", false);

				this.getView().bindElement({
					path : sObjectPath,
					events: {
						change : this._onBindingChange.bind(this),
						dataRequested : function () {
							oViewModel.setProperty("/busy", true);
						},
						dataReceived: function () {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			},

			_onBindingChange : function () {
				var oView = this.getView(),
					oElementBinding = oView.getElementBinding();

				if (!oElementBinding.getBoundContext()) {
					this.getRouter().getTargets().display("detailObjectNotFound");
					this.getOwnerComponent().oListSelector.clearMasterListSelection();
					return;
				}

				var sPath = oElementBinding.getPath(),
					oResourceBundle = this.getResourceBundle(),
					oObject = oView.getModel().getObject(sPath),
					sObjectId = oObject.ModifiedBy,
					sObjectName = oObject.ModifiedByFullName,
					oViewModel = this.getModel("detailView");

				this.getOwnerComponent().oListSelector.selectAListItem(sPath);

				oViewModel.setProperty("/shareSendEmailSubject",
					oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
				oViewModel.setProperty("/shareSendEmailMessage",
					oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
			},

			_onMetadataLoaded : function () {
				var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
					oViewModel = this.getModel("detailView");

				oViewModel.setProperty("/delay", 0);

				oViewModel.setProperty("/busy", true);
			
				oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
			}

		});

	}
);