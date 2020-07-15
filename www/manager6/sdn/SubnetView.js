Ext.define('PVE.sdn.SubnetView', {
    extend: 'Ext.grid.GridPanel',
    alias: 'widget.pveSDNSubnetView',

    stateful: true,
    stateId: 'grid-sdn-subnet',

    initComponent : function() {
	let me = this;

	let store = new Ext.data.Store({
	    model: 'pve-sdn-subnet',
	    proxy: {
                type: 'proxmox',
		url: "/api2/json/cluster/sdn/subnets"
	    },
	    sorters: {
		property: 'subnet',
		order: 'DESC'
	    }
	});
	let reload = () => store.load();

	let sm = Ext.create('Ext.selection.RowModel', {});

        let run_editor = function() {
	    let rec = sm.getSelection()[0];

	    let win = Ext.create('PVE.sdn.SubnetEdit',{
		autoShow: true,
		subnet: rec.data.subnet,
	    });
	    win.on('destroy', reload);
        };

	let edit_btn = new Proxmox.button.Button({
	    text: gettext('Edit'),
	    disabled: true,
	    selModel: sm,
	    handler: run_editor,
	});

	let remove_btn = Ext.create('Proxmox.button.StdRemoveButton', {
	    selModel: sm,
	    baseurl: '/cluster/sdn/subnets/',
	    callback: reload
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
			    type: 'subnet',
			});
			win.on('destroy', reload);
		    }
		},
		remove_btn,
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
