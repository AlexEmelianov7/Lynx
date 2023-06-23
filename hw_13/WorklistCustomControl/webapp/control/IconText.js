sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/core/Icon",
    "sap/m/Text"
], function (Control, Icon, Text) {
    "use strict";

    return Control.extend("./IconText", {
        metadata: {
            properties: {
                icon: "sap.ui.core.URI",
                iconColor: "sap.ui.core.IconColor",
                text: { defaultValue: "no data" }
            },
            aggregations: {
                _icon: { type: "sap.ui.core.Icon", multiple: false, visibility: "hidden" },
                _text: { type: "sap.m.Text", multiple: false, visibility: "hidden" }
            },
            events: {
                press: {}
            }
        },

        init: function () {
            this.setAggregation("_icon", new Icon ({
                src: this.getIcon()
            }))

            this.setAggregation("_text", new Text ({
                text: this.getText()
            }))
        },

        setIcon: function (sValue) {
            this.getAggregation("_icon").setSrc(sValue);

            return this;    
        },

        setText: function (sValue) {
            this.setProperty("text", sValue, true);
            this.getAggregation("_text").setText(sValue);
    
            return this;    
        },

        onclick: function () {
            this.firePress();
        },

        renderer: {
            apiVersion: 4,
            render: function(oRm, oControl) {
                oRm.openStart("div", oControl);
                oRm.style("display", "flex");
                oRm.style("gap", "5px");
                oRm.openEnd();
                oRm.renderControl(oControl.getAggregation("_icon").setColor(oControl.getIconColor()));
                oRm.renderControl(oControl.getAggregation("_text"));
                oRm.close("div");
            }
        }

    });

}
);