sap.ui.define([
    "zjblessons/WorklistApp/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "zjblessons/WorklistApp/model/formatter",
], function (
    BaseController,
    JSONModel,
    formatter,
) {
    "use strict";

    return BaseController.extend("zjblessons.WorklistApp.controller.List", {

        formatter: formatter,

        onInit : function () {
            this.getRouter().getRoute("list").attachPatternMatched(this._onObjectMatched, this);

            let iOriginalBusyDelay,
                oList = this.byId("list"),
                oViewModel = new JSONModel({
                    listTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
                    listBusyDelay: 0
                });
            this.setModel(oViewModel, "listView");

            iOriginalBusyDelay = oList.getBusyIndicatorDelay();
            oList.attachEventOnce("updateFinished", function(){
                oViewModel.setProperty("/listBusyDelay", iOriginalBusyDelay);
            });
        },

        onUpdateFinished : function (oEvent) {
            var sTitle,
                oList = oEvent.getSource(),
                iTotalItems = oEvent.getParameter("total");
    
            if (iTotalItems && oList.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
            } else {
                sTitle = this.getResourceBundle().getText("worklistTableTitle");
            }
            this.getModel("listView").setProperty("/listTableTitle", sTitle);
        },

        _onObjectMatched : function () {
            try{
                this.getModel().read("/zjblessons_base_Materials", {
                    success: (oData) => this._setListData(oData),
                    error: (oError) => new sap.m.MessageToast.show(oError.message)
                });
            } catch(oError){
                new sap.m.MessageToast.show(oError.message);
            } finally{
                // this.byId("list").attachEventOnce("updateFinished", function(){
                //     this.getModel("listView").setProperty("/listBusyDelay", this.byId("list").getBusyIndicatorDelay());
                // });
            }
        },

        _setListData: function (oData) {
            const oList = this.getView().byId("list");

            let oModel = new JSONModel;
            oModel.setData(oData);
            oList.setModel(oModel);

            this._bindListData();   	  
        },

        _bindListData: function () {
            this.getView().byId("list").bindItems({
                path: "/results",
                template: new sap.m.StandardListItem({
                    title: "{MaterialText}",
                    description: "{MaterialDescription}"
                }),
                sorter: new sap.ui.model.Sorter("Created", true)
            })
        },

    });

}
);
