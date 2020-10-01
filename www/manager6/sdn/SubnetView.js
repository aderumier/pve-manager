Ext.define('PVE.sdn.SubnetView', {
    extend: 'Ext.grid.GridPanel',
    alias: 'widget.pveSDNSubnetView',

    stateful: true,
    stateId: 'grid-sdn-subnet',

    base_url: undefined,

    remove_btn: undefined,

    setBaseUrl: function(url) {
        var me = this;

        me.base_url = url;

        if (url === undefined) {
            me.store.removeAll();
        } else {
            me.remove_btn.baseurl = url + '/';
            me.store.setProxy({
                type: 'proxmox',
                url: '/api2/json/' + url + '?pending=1'
            });

            me.store.load();
        }
    },

    initComponent : function() {
	let me = this;

        var store = new Ext.data.Store({
            model: 'pve-sdn-subnet'
        });

        var reload = function() {
            store.load();
        };

	let sm = Ext.create('Ext.selection.RowModel', {});

	var set_button_status = function() {
	    var rec = me.selModel.getSelection()[0];

	    if (!rec || rec.data.state === 'deleted') {
		edit_btn.disable();
		remove_btn.disable();
		return;
	    }
	};

        let run_editor = function() {
	    let rec = sm.getSelection()[0];

	    let win = Ext.create('PVE.sdn.SubnetEdit',{
		autoShow: true,
		subnet: rec.data.subnet,
		base_url: me.base_url,
	    });
	    win.on('destroy', reload);
        };

	let edit_btn = new Proxmox.button.Button({
	    text: gettext('Edit'),
	    disabled: true,
	    selModel: sm,
	    handler: run_editor,
	});

	me.remove_btn = Ext.create('Proxmox.button.StdRemoveButton', {
	    selModel: sm,
	    baseurl: me.base_url + '/',
            callback: function() {
                reload();
            },
	});

	Ext.apply(me, {
	    store: store,
	    reloadStore: reload,
	    selModel: sm,
	    viewConfig: {
		trackOver: false
	    },
	    tbar: [
		{
		    text: gettext('Create'),
		    handler: function() {
			let win = Ext.create('PVE.sdn.SubnetEdit', {
			    autoShow: true,
			    base_url: me.base_url,
			    type: 'subnet',
			});
			win.on('destroy', reload);
		    }
		},
		me.remove_btn,
		edit_btn,
	    ],
	    columns: [
		{
		    header: 'ID',
		    flex: 2,
		    dataIndex: 'cidr',
                    renderer: function(value, metaData, rec) {
                        return PVE.Utils.render_sdn_pending(rec, value, 'cidr', 1);
                    }
		},
		{
		    header: gettext('Gateway'),
		    flex: 1,
		    dataIndex: 'gateway',
                    renderer: function(value, metaData, rec) {
                        return PVE.Utils.render_sdn_pending(rec, value, 'gateway');
                    }
		},
		{
		    header: 'SNAT',
		    flex: 1,
		    dataIndex: 'snat',
                    renderer: function(value, metaData, rec) {
                        return PVE.Utils.render_sdn_pending(rec, value, 'snat');
                    }
		},
		{
		    header: 'Ipam',
		    flex: 1,
		    dataIndex: 'ipam',
                    renderer: function(value, metaData, rec) {
                        return PVE.Utils.render_sdn_pending(rec, value, 'ipam');
                    }
		},
                {
                    header: gettext('Pending'),
                    flex: 3,
                    dataIndex: 'pending',
                    renderer: function(value, metaData, rec) {
                        if(value !== undefined ) {
                                delete value.cidr;
                                delete value.gateway;
                                delete value.snat;
                                delete value.ipam;
				if(!Ext.Object.isEmpty(value)){
				    return JSON.stringify(value);
				}
                        }
                        return '';
                    }
                },

	    ],
	    listeners: {
		activate: reload,
		itemdblclick: run_editor,
                selectionchange: set_button_status
	    }
	});

	me.callParent();

        if (me.base_url) {
            me.setBaseUrl(me.base_url); // load
        }
    }
}, function() {

    Ext.define('pve-sdn-subnet', {
	extend: 'Ext.data.Model',
	fields: [
	    'cidr',
	    'gateway',
	    'snat',
	],
	idProperty: 'subnet'
    });

});
