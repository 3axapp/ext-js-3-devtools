import {ExtJSComponent} from '../page/ext-js/ext-js';

export const environment = {};

const component: ExtJSComponent = {
  initialConfig: {
    cls: 'super-class',
    width: 'auto'
  },
} as any;
//
// setForest([
//   {
//     id: 'ext-1231',
//     ctype: 'Ext.data.Grid',
//     modal: false,
//     component: Object.assign({}, component),
//     children: [
//       {
//         id: 'ext-1232',
//         ctype: 'Ext.Button',
//         modal: false,
//         component: Object.assign({}, component),
//         children: [],
//       },
//       {
//         id: 'ext-1233',
//         ctype: 'Ext.Button',
//         modal: false,
//         component: Object.assign({}, component),
//         children: [],
//       }
//     ],
//   },
//   {
//     id: 'modal-window33',
//     ctype: 'Ext.Window',
//     modal: true,
//     component: Object.assign({}, component),
//     children: [],
//   },
// ]);
//
// bus.once('queryExtJSAvailability', () => {
//   bus.emit('extJSAvailability', [{exists: true}]);
// });

