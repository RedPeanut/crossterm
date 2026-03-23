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
};

export type ConfigsType = typeof configs;
export type ConfigsInitialValueType = typeof configs.initial_value;

export default configs;