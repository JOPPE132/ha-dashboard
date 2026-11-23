// Central place for entity IDs and display settings. Add new entities here as you add integrations.
export const config = {
  locale: 'nb-NO',
  weatherEntity: 'weather.hjem',
  forecastDays: 5,
  sunriseEntity: 'sensor.sun_next_rising',
  sunsetEntity: 'sensor.sun_next_setting',
  shoppingListEntity: 'todo.shopping_list',
  calendarDays: 7,
  power: {
    vat: 0.25,
    markupOre: 0,
  },
} as const
