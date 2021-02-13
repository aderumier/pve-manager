Ext.define('PVE.sdn.ZoneView', {
    extend: 'Ext.grid.GridPanel',
    alias: ['widget.pveSDNZoneView'],

    onlineHelp: 'pvesdn_zone_plugins',

    stateful: true,
    stateId: 'grid-sdn-zone',

    createSDNEditWindow: function(type, sid) {
	let schema = PVE.Utils.sdnzoneSchema[type];
	if (!schema || !schema.ipanel) {
	    throw "no editor registered for zone type: " + type;
	}

	Ext.create('PVE.sdn.zones.BaseEdit', {
	    paneltype: 'PVE.sdn.zones.' + schema.ipanel,
	    type: type,
	    zone: sid,
	    autoShow: true,
	    listeners: {
		destroy: this.reloadStore,
	    },
	});
    },

    initComponent: function() {
	let me = this;

	let store = new Ext.data.Store({
	    model: 'pve-sdn-zone',
	    proxy: {
                type: 'proxmox',
		url: "/api2/json/cluster/sdn/zones?pending=1",
	    },
	    sorters: {
		property: 'zone',
		order: 'DESC',
	    },
	});

	let reload = function() {
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
	    if (!rec) {
		return;
	    }
	    let type = rec.data.type,
	        zone = rec.data.zone;

	    me.createSDNEditWindow(type, zone);
	};

	let edit_btn = new Proxmox.button.Button({
	    text: gettext('Edit'),
	    disabled: true,
	    selModel: sm,
	    handler: run_editor,
	});

	let remove_btn = Ext.create('Proxmox.button.StdRemoveButton', {
	    selModel: sm,
	    baseurl: '/cluster/sdn/zones/',
	    callback: reload,
	});

	// else we cannot dynamically generate the add menu handlers
	let addHandleGenerator = function(type) {
	    return function() { me.createSDNEditWindow(type); };
	};
	let addMenuItems = [], type;

	for (type in PVE.Utils.sdnzoneSchema) {
	    let zone = PVE.Utils.sdnzoneSchema[type];
	    if (zone.hideAdd) {
		continue;
	    }
	    addMenuItems.push({
		text: PVE.Utils.format_sdnzone_type(type),
		iconCls: 'fa fa-fw fa-' + zone.faIcon,
		handler: addHandleGenerator(type),
	    });
	}

	Ext.apply(me, {
	    store: store,
	    reloadStore: reload,
	    selModel: sm,
	    viewConfig: {
		trackOver: false,
	    },
	    tbar: [
		{
		    text: gettext('Add'),
		    menu: new Ext.menu.Menu({
			items: addMenuItems,
		    }),
		},
		remove_btn,
		edit_btn,
	    ],
	    columns: [
		{
		    header: 'ID',
		    flex: 2,
		    dataIndex: 'zone',
		    renderer: function(value, metaData, rec) {
			return PVE.Utils.render_sdn_pending(rec, value, 'zone', 1);
		    }
		},
		{
		    header: gettext('Type'),
		    flex: 1,
		    dataIndex: 'type',
		    renderer: function(value, metaData, rec) {
			return PVE.Utils.render_sdn_pending(rec, value, 'type', 1);
		    }
		},
		{
		    header: 'MTU',
		    flex: 1,
		    dataIndex: 'mtu',
		    renderer: function(value, metaData, rec) {
			return PVE.Utils.render_sdn_pending(rec, value, 'mtu');
		    }
		},
		{
		    header: gettext('Nodes'),
		    flex: 3,
		    dataIndex: 'nodes',
		    renderer: function(value, metaData, rec) {
			return PVE.Utils.render_sdn_pending(rec, value, 'nodes');
		    }
		},
		{
		    header: gettext('Pending'),
		    flex: 3,
		    dataIndex: 'pending',
		    renderer: function(value, metaData, rec) {
			if(value !== undefined ) {
			    delete value.nodes;
			    delete value.zone;
			    delete value.type;
			    delete value.mtu;
			    if(!Ext.Object.isEmpty(value)){
				return JSON.stringify(value);
			    }
			}
			return '';
		    }
	    ],
	    listeners: {
		activate: reload,
		itemdblclick: run_editor,
		selectionchange: set_button_status
	    },
	});

	me.callParent();
    },
});
