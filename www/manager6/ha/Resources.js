Ext.define('PVE.ha.ResourcesView', {
    extend: 'Ext.grid.GridPanel',
    alias: ['widget.pveHAResourcesView'],

    onlineHelp: 'ha_manager_resources',

    stateful: true,
    stateId: 'grid-ha-resources',

    initComponent: function() {
	var me = this;

	var caps = Ext.state.Manager.get('GuiCap');

	if (!me.rstore) {
	    throw "no store given";
	}

	Proxmox.Utils.monStoreErrors(me, me.rstore);

	var store = Ext.create('Proxmox.data.DiffStore', {
	    rstore: me.rstore,
	    filters: {
		property: 'type',
		value: 'service',
	    },
	});

	var reload = function() {
	    me.rstore.load();
	};

	var render_error = function(dataIndex, value, metaData, record) {
	    var errors = record.data.errors;
	    if (errors) {
		var msg = errors[dataIndex];
		if (msg) {
		    metaData.tdCls = 'proxmox-invalid-row';
		    var html = '<p>' + Ext.htmlEncode(msg) + '</p>';
		    metaData.tdAttr = 'data-qwidth=600 data-qtitle="ERROR" data-qtip="' +
			html.replace(/\"/g, '&quot;') + '"';
		}
	    }
	    return value;
	};

	var sm = Ext.create('Ext.selection.RowModel', {});

	var run_editor = function() {
	    var rec = sm.getSelection()[0];
	    var sid = rec.data.sid;

	    var regex = /^(\S+):(\S+)$/;
	    var res = regex.exec(sid);

	    if (res[1] !== 'vm' && res[1] !== 'ct') {
		return;
	    }
	    var guestType = res[1];
	    var vmid = res[2];

            var win = Ext.create('PVE.ha.VMResourceEdit', {
                guestType: guestType,
                vmid: vmid,
            });
            win.on('destroy', reload);
            win.show();
	};

	var remove_btn = Ext.create('Proxmox.button.StdRemoveButton', {
	    selModel: sm,
	    baseurl: '/cluster/ha/resources/',
	    getUrl: function(rec) {
		var me = this;
		return me.baseurl + '/' + rec.get('sid');
	    },
	    callback: function() {
		reload();
	    },
	});

	var edit_btn = new Proxmox.button.Button({
	    text: gettext('Edit'),
	    disabled: true,
	    selModel: sm,
	    handler: run_editor,
	});

	Ext.apply(me, {
	    store: store,
	    selModel: sm,
	    viewConfig: {
		trackOver: false,
	    },
	    tbar: [
		{
		    text: gettext('Add'),
		    disabled: !caps.nodes['Sys.Console'],
		    handler: function() {
			var win = Ext.create('PVE.ha.VMResourceEdit', {});
			win.on('destroy', reload);
			win.show();
		    },
		},
		edit_btn, remove_btn,
	    ],

	    columns: [
		{
		    header: 'ID',
		    width: 100,
		    sortable: true,
		    dataIndex: 'sid',
		},
		{
		    header: gettext('State'),
		    width: 100,
		    sortable: true,
		    dataIndex: 'state',
		},
		{
		    header: gettext('Node'),
		    width: 100,
		    sortable: true,
		    dataIndex: 'node',
		},
		{
		    header: gettext('Request State'),
		    width: 100,
		    hidden: true,
		    sortable: true,
		    renderer: function(v) {
			return v || 'started';
		    },
		    dataIndex: 'request_state',
		},
		{
		    header: gettext('CRM State'),
		    width: 100,
		    hidden: true,
		    sortable: true,
		    dataIndex: 'crm_state',
		},
		{
		    header: gettext('Name'),
		    width: 100,
		    sortable: true,
		    dataIndex: 'vname',
		},
		{
		    header: gettext('Max. Restart'),
		    width: 100,
		    sortable: true,
		    renderer: (v) => v === undefined ? '1' : v,
		    dataIndex: 'max_restart',
		},
		{
		    header: gettext('Max. Relocate'),
		    width: 100,
		    sortable: true,
		    renderer: (v) => v === undefined ? '1' : v,
		    dataIndex: 'max_relocate',
		},
		{
		    header: gettext('Group'),
		    width: 200,
		    sortable: true,
		    renderer: function(value, metaData, record) {
			return render_error('group', value, metaData, record);
		    },
		    dataIndex: 'group',
		},
		{
		    header: gettext('Description'),
		    flex: 1,
		    renderer: Ext.String.htmlEncode,
		    dataIndex: 'comment',
		},
	    ],
	    listeners: {
		beforeselect: function(grid, record, index, eOpts) {
		    if (!caps.nodes['Sys.Console']) {
			return false;
		    }
		},
		itemdblclick: run_editor,
	    },
	});

	me.callParent();
    },
});
