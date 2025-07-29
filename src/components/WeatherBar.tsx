
import { Cloud, CloudRain, CloudSnow, Sun, Moon, Thermometer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ServerWeather } from '@/hooks/useRealTimePlayerData';

interface WeatherBarProps {
  weather: ServerWeather;
  connected: boolean;
}

const WeatherBar = ({ weather, connected }: WeatherBarProps) => {
  const getWeatherIcon = () => {
    switch (weather.weather) {
      case 'rain':
        return <CloudRain className="w-4 h-4 text-blue-500" />;
      case 'snow':
        return <CloudSnow className="w-4 h-4 text-blue-200" />;
      case 'thunder':
        return <CloudRain className="w-4 h-4 text-purple-500" />;
      default:
        return weather.is_day ? 
          <Sun className="w-4 h-4 text-yellow-500" /> : 
          <Moon className="w-4 h-4 text-blue-300" />;
    }
  };

  const getWeatherText = () => {
    const timeText = weather.is_day ? 'Day' : 'Night';
    const weatherText = weather.weather.charAt(0).toUpperCase() + weather.weather.slice(1);
    return `${timeText} • ${weatherText}`;
  };

  const getWeatherColor = () => {
    if (!connected) return 'bg-gray-500/20 text-gray-500';
    
    switch (weather.weather) {
      case 'rain':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'snow':
        return 'bg-blue-200/20 text-blue-200 border-blue-200/30';
      case 'thunder':
        return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
      default:
        return weather.is_day ? 
          'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' : 
          'bg-blue-300/20 text-blue-300 border-blue-300/30';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Badge className={`px-3 py-1 rounded-full ${getWeatherColor()} backdrop-blur-sm`}>
        <div className="flex items-center space-x-2">
          {getWeatherIcon()}
          <span className="text-sm font-medium">
            {connected ? getWeatherText() : 'Offline'}
          </span>
          {connected && weather.temperature && (
            <>
              <span className="text-xs opacity-60">•</span>
              <div className="flex items-center space-x-1">
                <Thermometer className="w-3 h-3" />
                <span className="text-xs">{Math.round(weather.temperature)}°C</span>
              </div>
            </>
          )}
        </div>
      </Badge>
      
      {/* Weather effects */}
      {connected && weather.weather === 'rain' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="rain-effect opacity-30"></div>
        </div>
      )}
      
      {connected && weather.weather === 'snow' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="snow-effect opacity-40"></div>
        </div>
      )}
    </div>
  );
};

export default WeatherBar;
