import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, CloudSun, Newspaper, Loader } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

// Типизация данных погоды
type WeatherData = {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy';
};

// Тип новости
type NewsItem = {
  id: number;
  title: string;
  source: string;
  url: string;
};

export default function InfoWidgets() {
  const isMobile = useIsMobile();

  // Состояние для погоды
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 0,
    condition: 'sunny'
  });
  const [weatherLoading, setWeatherLoading] = useState(true);

  // Состояние для новостей (мок)
  const [news, setNews] = useState<NewsItem[]>([
    { 
      id: 1, 
      title: "New luxury development coming to Puerto Portals", 
      source: "Mallorca Daily Bulletin",
      url: "#"
    },
    { 
      id: 2, 
      title: "Record sales in Mallorca's premium real estate sector", 
      source: "Diario de Mallorca",
      url: "#"
    },
    { 
      id: 3, 
      title: "Port Adriano announces expansion for superyachts", 
      source: "Mallorca Zeitung",
      url: "#"
    }
  ]);

  // Запрос данных о погоде с использованием WeatherAPI.com
  useEffect(() => {
    async function fetchWeather() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/api/weather?q=Palma`
        );
        const data = await response.json();
        // Получаем температуру из data.current.temp_c
        const temperature = Math.round(data.current.temp_c);
        // Получаем описание погоды, например "Sunny", "Partly cloudy", "Cloudy", "Rain"
        const conditionText = data.current.condition.text.toLowerCase();
        let condition: 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy' = 'sunny';
        
        if (conditionText.includes('sunny')) {
          condition = 'sunny';
        } else if (conditionText.includes('cloudy') && conditionText.includes('partly')) {
          condition = 'partly-cloudy';
        } else if (conditionText.includes('cloudy')) {
          condition = 'cloudy';
        } else if (conditionText.includes('rain')) {
          condition = 'rainy';
        } else {
          condition = 'sunny';
        }
        
        setWeather({ temperature, condition });
      } catch (error) {
        console.error("Error fetching weather data", error);
      } finally {
        setWeatherLoading(false);
      }
    }
    fetchWeather();
  }, []);

  const getWeatherIcon = () => {
    switch (weather.condition) {
      case 'sunny':
        return <Sun className="w-6 h-6 text-yellow-500" />;
      case 'cloudy':
        return <Cloud className="w-6 h-6 text-gray-400" />;
      case 'rainy':
        return <CloudRain className="w-6 h-6 text-blue-400" />;
      case 'partly-cloudy':
        return <CloudSun className="w-6 h-6 text-yellow-400" />;
      default:
        return <Sun className="w-6 h-6 text-yellow-500" />;
    }
  };

  const handleNewsClick = () => {
    window.open('https://www.majorcadailybulletin.com', '_blank');
  };

  // Не рендерим на мобильных устройствах
  if (isMobile) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-30 space-y-2 lg:flex lg:space-y-0 lg:space-x-2 lg:bottom-4 lg:right-4">
      <TooltipProvider>
        {/* Виджет погоды */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="w-10 h-10 lg:w-auto lg:h-auto glass-effect overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md group">
              <CardContent className="p-2 lg:p-3 flex items-center">
                {weatherLoading ? (
                  <Loader className="w-6 h-6 animate-spin text-gray-500" />
                ) : (
                  <>
                    {getWeatherIcon()}
                    <span className="hidden lg:inline ml-2 text-sm font-medium">
                      Palma: {weather.temperature}°C
                    </span>
                  </>
                )}
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Current weather in Palma de Mallorca</p>
          </TooltipContent>
        </Tooltip>
        
        {/* Виджет новостей */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card 
              className="w-10 h-10 lg:w-auto lg:h-auto glass-effect overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md"
              onClick={handleNewsClick}
            >
              <CardContent className="p-2 lg:p-3 flex items-center">
                <Newspaper className="w-6 h-6 text-primary" />
                <div className="hidden lg:block ml-2 max-w-xs">
                  <div className="relative h-5 overflow-hidden">
                    {news.map((item, index) => (
                      <div 
                        key={item.id}
                        className="absolute whitespace-nowrap text-xs animate-pulse-subtle"
                        style={{
                          top: 0,
                          opacity: index === 0 ? 1 : 0,
                          transition: 'opacity 0.5s ease-in-out'
                        }}
                      >
                        <span className="font-medium">{item.source}:</span> {item.title}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Latest Mallorca news</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
