Ext.define('PVE.window.NotesEdit', {
    extend: 'Proxmox.window.Edit',

    title: gettext('Notes'),

    width: 600,
    height: '400px',
    resizable: true,
    layout: 'fit',

    autoLoad: true,

    defaultButton: undefined,

    items: {
	xtype: 'textarea',
	name: 'description',
	height: '100%',
	value: '',
	hideLabel: true,
    },
});
