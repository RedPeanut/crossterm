const configs = {
  initial_value: {
    grid_size: { width: 800, height: 600 },

    activitybar_hidden: false,

    sidebar_hidden: false,
    sidebar_size: 0,
    sidebar_position: 0, // left | right | bottom

    panel_size: 0,
    panel_position: 0,
    panel_alignment: 'center', // left | center | right
  }
};

export type ConfigsType = typeof configs;
export type ConfigsInitialValueType = typeof configs.initial_value;

export default configs;