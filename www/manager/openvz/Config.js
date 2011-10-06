Ext.define('PVE.openvz.Config', {
    extend: 'PVE.panel.Config',
    alias: 'widget.PVE.openvz.Config',

    initComponent: function() {
        var me = this;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) {
	    throw "no node name specified";
	}

	var vmid = me.pveSelNode.data.vmid;
	if (!vmid) {
	    throw "no VM ID specified";
	}

	var vmname = me.pveSelNode.data.name;
	var descr = vmname ? " '" + vmname + "'" : '';
	Ext.apply(me, {
	    title: "OpenVZ container " + vmid + descr +  
		" on node '" + nodename + "'",
	    hstateid: 'ovztab',
	    items: [
		{
		    title: 'Summary',
		    xtype: 'pveOpenVZSummary',
		    itemId: 'summary',
		},
		{
		    title: 'Ressources',
		    itemId: 'ressources',
		    xtype: 'pveOpenVZRessourceView'
		},
		{
		    title: 'Network',
		    itemId: 'network',
		    xtype: 'pveOpenVZNetworkView'
		},
		{
		    title: 'Options',
		    itemId: 'options',
		    xtype: 'pveOpenVZOptions'
		},
		{
		    xtype: 'pveOpenVZConsole',
		    title: 'Console',
		    itemId: 'console',
		    nodename: nodename,
		    vmid: vmid
		},
		{
		    title: 'Backup',
		    itemId: 'backup',
		    html: 'Backup and restore - not implemented!'
		},
		{
		    title: 'Permissions',
		    itemId: 'permissions',
		    html: 'permissions ' + vmid
		}

	    ]
	});

	me.callParent();
   }
});
