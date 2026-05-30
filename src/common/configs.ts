const configs = {
  initial_value: {
    window_size: { width: 800, height: 600 },
    // grid_size: { width: 800, height: 600 }, // not use

    // activitybar_visible: true, // not use
    // activitybar_size: ACTIVITYBAR_WIDTH, // not use
    // activitybar_position: 0, // not use
    // activitybar_alignment: 'center', // not use

    sidebar_visible: true,
    sidebar_size: 240, // SIDEBAR_WIDTH
    // sidebar_position: 0, // left | right | bottom // not use
    // sidebar_alignment: 'center', // not use

    // // panel_visible: true, // not use
    // panel_size: 0,
    // panel_position: 0,
    // panel_alignment: 'center', // left | center | right

    paneview: [
      { name: 'bookmark', collapsed: [ false, false ], sizeType: [ 'fill_parent', null ], size: [ null, 200 ], preferredHeight: [ null, 200 ] },
      { name: 'sample', collapsed: [ false ], sizeType: [ 'fill_parent' ], size: [ null ] }
    ],
  },
  list: [
    {
      type: 'folder',
      title: 'folder',
      id: '52528ee3-aa4f-44a5-b763-5cf69acacf51',
      children: [
        {
          id: 'e54af9c1-f003-4b1b-8db4-e796f69a9a4d',
          title: 'xyz',
          type: 'remote',
          url: {
            host: '192.168.0.25',
            port: 22,
            username: 'kimjk',
            password: '1234',
          },
          size: { row: 24, col: 80 }
        },
        {
          type: 'local',
          title: 'local',
          id: '96367ed9-6fb1-434b-b45d-de9d2d21898a',
        }
      ],
      isCollapsed: false
    },

    {
      type: 'folder',
      title: 'g',
      id: '97852b6c-955e-4a10-9e7a-1634892a7390',
      children: [
        { id: '7579abd5-6a4f-4ee3-b223-9fba37e13c45', title: 'a', type: 'local', size: { row: 24, col: 80 }, },
        { id: '24129430-9e9a-4832-8128-15140b5e4c33', title: 'b', type: 'local', size: { row: 24, col: 80 }, },
        { id: 'f9fc745a-ef19-428e-9604-a8e16bf7c3f2', title: 'c', type: 'local', size: { row: 24, col: 80 }, },
        { id: '8625a1e7-3dee-4f06-a9c2-f8521cdb6872', title: 'd', type: 'local', size: { row: 24, col: 80 }, },
        { id: 'adc96fad-694f-4957-afd2-d30dba2ad77f', title: 'e', type: 'local', size: { row: 24, col: 80 }, },
        { id: '432fbf81-723e-463f-80a1-200773998dda', title: 'f', type: 'local', size: { row: 24, col: 80 }, },
        { id: 'bb905633-730d-4a0c-8cc0-ba385d2a8b13', title: 'g', type: 'local', size: { row: 24, col: 80 }, },
        { id: '07d7d5a1-0870-4d35-b760-f3897443b6d5', title: 'h', type: 'local', size: { row: 24, col: 80 }, },
      ],
      isCollapsed: false
    },

    /* {
      type: 'group',
      title: 'group',
      id: 'cbf8ea19-4474-4c15-8af0-3a4bdcdff717'
    }, */
    { id: 'a459abbd-6560-4de2-a792-9f808f3746ec', title: 'i', type: 'local', size: { row: 24, col: 80 }, },
    { id: '1761e3b9-7702-41a2-8397-c618ce8f1db8', title: 'j', type: 'local', size: { row: 24, col: 80 }, },
    { id: '36ddea07-1a8c-4d23-8d1d-ad008ea063ae', title: 'k', type: 'local', size: { row: 24, col: 80 }, },
    { id: 'ba11e845-1c7c-45a2-b5d0-0ef13aa12634', title: 'l', type: 'local', size: { row: 24, col: 80 }, },
    {
      type: 'local',
      title: 'local',
      id: '751b26d0-5c94-4328-a0e8-23fdd85d160f',
      size: { row: 24, col: 80 },
    },
    { id: '02a6e4f5-1b2f-48d0-9a55-c52a6e858a4b', title: 'm', type: 'local', size: { row: 24, col: 80 }, },
    { id: '5d1921e5-6492-42fd-ae40-ae09fc3c395e', title: 'n', type: 'local', size: { row: 24, col: 80 }, },
    { id: 'fcf78377-7b1c-4eb2-abf2-a8880c5b03e8', title: 'o', type: 'local', size: { row: 24, col: 80 }, },
    { id: '0c249d60-d2ca-49aa-b0d4-5a7ef741fe66', title: 'p', type: 'local', size: { row: 24, col: 80 }, },
    { id: '9b9c9698-ce1d-44da-82cf-bb4ea37867f1', title: 'q', type: 'local', size: { row: 24, col: 80 }, },
    { id: '49cc737a-2170-4d1b-a9bc-276b13f24d2b', title: 'r', type: 'local', size: { row: 24, col: 80 }, },
    {
      type: 'remote',
      title: 'remote',
      // url: 'www.remote.com',
      id: '8d65f5a3-306d-44c7-a43f-b5abc17b6a2b',
      url: {
        host: '192.168.200.104',
        port: 22,
        username: 'kimjk',
        password: '1234',
        // password: '1111',
      },
      size: { row: 24, col: 80 }
    },
    { id: '69adc5c0-e03c-4bf8-99a7-8720b2e79d47', title: 's', type: 'local', size: { row: 24, col: 80 }, },
    { id: '00164180-e076-461d-96e4-96e13adec566', title: 't', type: 'local', size: { row: 24, col: 80 }, },
    { id: 'ece6fe4c-aa5e-471d-8c15-ece06d247cb3', title: 'u', type: 'local', size: { row: 24, col: 80 }, },
    { id: '2c043441-c316-45f8-983c-ef49ffb2d80e', title: 'v', type: 'local', size: { row: 24, col: 80 }, },
    { id: '39b4650f-741f-41c2-96cd-223810214df5', title: 'w', type: 'local', size: { row: 24, col: 80 }, },
    { id: '547a8274-e85d-4339-8ab6-61d8f25b3f64', title: 'x', type: 'local', size: { row: 24, col: 80 }, },
  ]
};

export type ConfigsType = typeof configs;
export type ConfigsInitialValueType = typeof configs.initial_value;

export default configs;