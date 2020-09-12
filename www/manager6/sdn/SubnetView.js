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
                url: '/api2/json/' + url
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
		    dataIndex: 'cidr'
		},
		{
		    header: gettext('Gateway'),
		    flex: 1,
		    dataIndex: 'gateway',
		},
		{
		    header: 'SNAT',
		    flex: 1,
		    dataIndex: 'snat',
		},
		{
		    header: 'Ipam',
		    flex: 1,
		    dataIndex: 'ipam',
		}
	    ],
	    listeners: {
		activate: reload,
		itemdblclick: run_editor
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
