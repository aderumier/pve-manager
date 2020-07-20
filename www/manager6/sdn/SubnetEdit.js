Ext.define('PVE.sdn.SubnetInputPanel', {
    extend: 'Proxmox.panel.InputPanel',
    mixins: ['Proxmox.Mixin.CBind'],

    onGetValues: function(values) {
	let me = this;

	if (me.isCreate) {
	    values.type = 'subnet';
	    values.subnet = values.cidr;
	    delete values.cidr;
	}

	if (!values.gateway) {
	    delete values.gateway;
	}
	if (!values.snat) {
	    delete values.snat;
	}

	return values;
    },

    items: [
	{
	    xtype: 'pmxDisplayEditField',
	    name: 'cidr',
	    cbind: {
		editable: '{isCreate}',
	    },
	    flex: 1,
	    allowBlank: false,
	    fieldLabel: gettext('Subnet'),
	},
	{
	    xtype: 'textfield',
	    name: 'gateway',
	    vtype: 'IP64Address',
	    fieldLabel: gettext('Gateway'),
	    allowBlank: true,
	},
	{
	    xtype: 'proxmoxcheckbox',
	    name: 'snat',
	    uncheckedValue: 0,
	    checked: false,
	    fieldLabel: 'SNAT'
	},
        {
            xtype: 'pveSDNIpamSelector',
            fieldLabel: gettext('Ipam'),
            name: 'ipam',
            value: '',
            allowBlank: true,
        },
    ]
});

Ext.define('PVE.sdn.SubnetEdit', {
    extend: 'Proxmox.window.Edit',

    subject: gettext('Subnet'),

    subnet: undefined,

    width: 350,

    initComponent: function() {
	var me = this;

	me.isCreate = me.subnet === undefined;

	if (me.isCreate) {
	    me.url = '/api2/extjs/cluster/sdn/subnets';
	    me.method = 'POST';
	} else {
	    me.url = '/api2/extjs/cluster/sdn/subnets/' + me.subnet;
	    me.method = 'PUT';
	}

	let ipanel = Ext.create('PVE.sdn.SubnetInputPanel', {
	    isCreate: me.isCreate,
	});

	Ext.apply(me, {
	    items: [
		ipanel,
	    ],
	});

	me.callParent();

	if (!me.isCreate) {
	    me.load({
		success: function(response, options) {
		    let values = response.result.data;
		    ipanel.setValues(values);
		},
	    });
	}
    },
});
