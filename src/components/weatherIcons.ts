import {
  mdiWeatherCloudy,
  mdiWeatherCloudyAlert,
  mdiWeatherFog,
  mdiWeatherHail,
  mdiWeatherLightning,
  mdiWeatherLightningRainy,
  mdiWeatherNight,
  mdiWeatherPartlyCloudy,
  mdiWeatherPouring,
  mdiWeatherRainy,
  mdiWeatherSnowy,
  mdiWeatherSnowyRainy,
  mdiWeatherSunny,
  mdiWeatherWindy,
  mdiWeatherWindyVariant,
} from '@mdi/js'

// HA's standard weather conditions -> icon + label
export const weatherConditions: Record<string, { icon: string; label: string }> = {
  'clear-night': { icon: mdiWeatherNight, label: 'Clear' },
  cloudy: { icon: mdiWeatherCloudy, label: 'Cloudy' },
  exceptional: { icon: mdiWeatherCloudyAlert, label: 'Exceptional' },
  fog: { icon: mdiWeatherFog, label: 'Fog' },
  hail: { icon: mdiWeatherHail, label: 'Hail' },
  lightning: { icon: mdiWeatherLightning, label: 'Lightning' },
  'lightning-rainy': { icon: mdiWeatherLightningRainy, label: 'Thunderstorm' },
  partlycloudy: { icon: mdiWeatherPartlyCloudy, label: 'Partly cloudy' },
  pouring: { icon: mdiWeatherPouring, label: 'Pouring' },
  rainy: { icon: mdiWeatherRainy, label: 'Rain' },
  snowy: { icon: mdiWeatherSnowy, label: 'Snow' },
  'snowy-rainy': { icon: mdiWeatherSnowyRainy, label: 'Sleet' },
  sunny: { icon: mdiWeatherSunny, label: 'Sunny' },
  windy: { icon: mdiWeatherWindy, label: 'Windy' },
  'windy-variant': { icon: mdiWeatherWindyVariant, label: 'Windy' },
}

export function weatherCondition(state: string | undefined) {
  return (state && weatherConditions[state]) || { icon: mdiWeatherCloudyAlert, label: state ?? 'Unknown' }
}
