Ext.define('PVE.sdn.ipams.PVEIpamInputPanel', {
    extend: 'PVE.panel.SDNIpamBase',

    //onlineHelp: 'pvesdn_ipam_plugin_pve', // FIXME uncomment once doc-gen is updated

    onGetValues: function(values) {
        var me = this;

        if (me.isCreate) {
            values.type = me.type;
        } else {
            delete values.ipam;
        }

        return values;
    },

    initComponent : function() {
	var me = this;

        me.items = [
           {
            xtype: me.isCreate ? 'textfield' : 'displayfield',
            name: 'ipam',
            maxLength: 10,
            value: me.zone || '',
            fieldLabel: 'ID',
            allowBlank: false
          },
	];

	me.callParent();
    }
});
