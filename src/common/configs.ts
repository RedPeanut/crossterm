const configs = {
  initial_value: {
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
      // isCollapsed: false
    },
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
    /* {
      type: 'group',
      title: 'group',
      id: 'cbf8ea19-4474-4c15-8af0-3a4bdcdff717'
    }, */
    {
      type: 'local',
      title: 'local',
      id: '751b26d0-5c94-4328-a0e8-23fdd85d160f',
      size: { row: 24, col: 80 },
    }
  ]
};

export type ConfigsType = typeof configs;
export type ConfigsInitialValueType = typeof configs.initial_value;

export default configs;