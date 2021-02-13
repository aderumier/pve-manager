Ext.define('PVE.sdn.VnetView', {
    extend: 'Ext.grid.GridPanel',
    alias: 'widget.pveSDNVnetView',

    onlineHelp: 'pvesdn_config_vnet',

    stateful: true,
    stateId: 'grid-sdn-vnet',

    initComponent: function() {
	let me = this;

	let store = new Ext.data.Store({
	    model: 'pve-sdn-vnet',
	    proxy: {
                type: 'proxmox',
		url: "/api2/json/cluster/sdn/vnets",
	    },
	    sorters: {
		property: 'vnet',
		order: 'DESC',
	    },
	});
	let reload = () => store.load();

	let sm = Ext.create('Ext.selection.RowModel', {});

        let run_editor = function() {
	    let rec = sm.getSelection()[0];

	    let win = Ext.create('PVE.sdn.VnetEdit', {
		autoShow: true,
		onlineHelp: 'pvesdn_config_vnet',
		vnet: rec.data.vnet,
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
	    baseurl: '/cluster/sdn/vnets/',
	    callback: reload,
	});

	Ext.apply(me, {
	    store: store,
	    reloadStore: reload,
	    selModel: sm,
	    viewConfig: {
		trackOver: false,
	    },
	    tbar: [
		{
		    text: gettext('Create'),
		    handler: function() {
			let win = Ext.create('PVE.sdn.VnetEdit', {
			    autoShow: true,
			    onlineHelp: 'pvesdn_config_vnet',
			    type: 'vnet',
			});
			win.on('destroy', reload);
		    },
		},
		remove_btn,
		edit_btn,
	    ],
	    columns: [
		{
		    header: 'ID',
		    flex: 2,
		    dataIndex: 'vnet',
		},
		{
		    header: gettext('Alias'),
		    flex: 1,
		    dataIndex: 'alias',
		},
		{
		    header: gettext('Zone'),
		    flex: 1,
		    dataIndex: 'zone',
		},
		{
		    header: gettext('Tag'),
		    flex: 1,
		    dataIndex: 'tag',
		},
		{
		    header: gettext('VLAN Aware'),
		    flex: 1,
		    dataIndex: 'vlanaware',
		},
		{
		    header: 'Subnets',
		    flex: 1,
		    dataIndex: 'subnets',
		},
	    ],
	    listeners: {
		activate: reload,
		itemdblclick: run_editor,
	    },
	});

	me.callParent();
    },
}, function() {
    Ext.define('pve-sdn-vnet', {
	extend: 'Ext.data.Model',
	fields: [
	    'alias',
	    'subnets',
	    'tag',
	    'type',
	    'vnet',
	    'zone',
	],
	idProperty: 'vnet',
    });
});
