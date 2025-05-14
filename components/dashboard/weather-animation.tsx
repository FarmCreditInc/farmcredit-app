"use client"

import { useEffect, useState } from "react"
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, Droplets, Sun, Wind } from "lucide-react"
import { cn } from "@/lib/utils"

type WeatherCondition =
  | "sunny"
  | "partly-cloudy"
  | "cloudy"
  | "rainy"
  | "thunderstorm"
  | "drizzle"
  | "windy"
  | "foggy"
  | "hazy"
  | "snowy"
  | "humid"
  | "dry"
  | "default"

interface WeatherAnimationProps {
  condition: WeatherCondition
  className?: string
}

export function WeatherAnimation({ condition, className }: WeatherAnimationProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className={cn("relative h-24 w-24", className)}>
      {/* Sunny / Clear */}
      {condition === "sunny" && (
        <div className="weather-container">
          <div className="sun-wrapper">
            <Sun className="h-16 w-16 text-yellow-500 animate-sun-pulse" />
            <div className="sun-rays">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="sun-ray"
                  style={{
                    transform: `rotate(${i * 45}deg)`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Partly Cloudy */}
      {condition === "partly-cloudy" && (
        <div className="weather-container">
          <div className="partly-cloudy-wrapper">
            <Sun className="h-14 w-14 text-yellow-500 absolute right-1 top-1" />
            <Cloud className="h-12 w-12 text-gray-300 absolute left-1 bottom-1 animate-float" />
          </div>
        </div>
      )}

      {/* Cloudy / Overcast */}
      {condition === "cloudy" && (
        <div className="weather-container">
          <div className="cloud-wrapper">
            <Cloud className="h-16 w-16 text-gray-400 animate-float" />
            <div className="small-clouds">
              {[...Array(3)].map((_, i) => (
                <Cloud
                  key={i}
                  className="h-6 w-6 text-gray-300 absolute animate-float"
                  style={{
                    top: `${10 + i * 10}px`,
                    left: `${i * 15 - 10}px`,
                    animationDelay: `${i * 0.5}s`,
                    opacity: 0.7,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rainy / Showers */}
      {condition === "rainy" && (
        <div className="weather-container">
          <div className="cloud-wrapper">
            <CloudRain className="h-16 w-16 text-blue-500" />
            <div className="rain-drops">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="rain-drop"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${0.5 + Math.random()}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Thunderstorms */}
      {condition === "thunderstorm" && (
        <div className="weather-container">
          <div className="cloud-wrapper">
            <CloudLightning className="h-16 w-16 text-purple-500" />
            <div className="lightning-flash"></div>
            <div className="rain-drops">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="rain-drop"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${0.5 + Math.random()}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Drizzle */}
      {condition === "drizzle" && (
        <div className="weather-container">
          <div className="cloud-wrapper">
            <CloudDrizzle className="h-16 w-16 text-blue-400" />
            <div className="drizzle-drops">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="drizzle-drop"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 20}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${1 + Math.random()}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Windy */}
      {condition === "windy" && (
        <div className="weather-container">
          <div className="wind-wrapper">
            <Wind className="h-16 w-16 text-blue-400 animate-wind" />
            <div className="wind-lines">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="wind-line"
                  style={{
                    top: `${10 + i * 8}px`,
                    width: `${20 + i * 5}px`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Foggy / Misty */}
      {condition === "foggy" && (
        <div className="weather-container">
          <div className="fog-wrapper">
            <CloudFog className="h-16 w-16 text-gray-300" />
            <div className="fog-layers">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="fog-layer"
                  style={{
                    top: `${12 + i * 6}px`,
                    animationDelay: `${i * 0.5}s`,
                    opacity: 0.7 - i * 0.1,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hazy */}
      {condition === "hazy" && (
        <div className="weather-container">
          <div className="haze-wrapper">
            <Sun className="h-16 w-16 text-orange-300 opacity-60" />
            <div className="haze-layers">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="haze-layer"
                  style={{
                    animationDelay: `${i * 0.7}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Snowy */}
      {condition === "snowy" && (
        <div className="weather-container">
          <div className="snow-wrapper">
            <CloudSnow className="h-16 w-16 text-blue-100" />
            <div className="snowflakes">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="snowflake"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Humid */}
      {condition === "humid" && (
        <div className="weather-container">
          <div className="humid-wrapper">
            <Droplets className="h-16 w-16 text-blue-400" />
            <div className="humidity-particles">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="humidity-particle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dry */}
      {condition === "dry" && (
        <div className="weather-container">
          <div className="dry-wrapper">
            <Sun className="h-16 w-16 text-orange-500" />
            <div className="heat-waves">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="heat-wave"
                  style={{
                    top: `${8 + i * 8}px`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Default */}
      {condition === "default" && (
        <div className="weather-container">
          <div className="default-wrapper">
            <Sun className="h-16 w-16 text-yellow-500" />
          </div>
        </div>
      )}

      <style jsx>{`
        .weather-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .cloud-wrapper, .sun-wrapper, .default-wrapper, .partly-cloudy-wrapper, 
        .wind-wrapper, .fog-wrapper, .haze-wrapper, .snow-wrapper, .humid-wrapper, .dry-wrapper {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
        }

        /* Rain animation */
        .rain-drops {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 60%;
        }

        .rain-drop {
          position: absolute;
          width: 2px;
          height: 10px;
          background: linear-gradient(to bottom, rgba(59, 130, 246, 0.5), rgba(59, 130, 246, 0.8));
          border-radius: 0 0 5px 5px;
          animation: rain-fall linear infinite;
        }

        @keyframes rain-fall {
          0% {
            transform: translateY(0);
            opacity: 0.8;
          }
          80% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(30px);
            opacity: 0;
          }
        }

        /* Drizzle animation */
        .drizzle-drops {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 60%;
        }

        .drizzle-drop {
          position: absolute;
          width: 1px;
          height: 5px;
          background: linear-gradient(to bottom, rgba(59, 130, 246, 0.3), rgba(59, 130, 246, 0.6));
          border-radius: 0 0 3px 3px;
          animation: drizzle-fall linear infinite;
        }

        @keyframes drizzle-fall {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0.6;
          }
          50% {
            transform: translateY(15px) translateX(3px);
          }
          100% {
            transform: translateY(30px) translateX(0);
            opacity: 0;
          }
        }

        /* Sun animation */
        .sun-wrapper {
          animation: sun-rotate 20s linear infinite;
        }

        .sun-rays {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .sun-ray {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 30px;
          height: 2px;
          background: rgba(245, 158, 11, 0.5);
          transform-origin: 0 50%;
          animation: sun-ray-pulse 2s ease-in-out infinite;
        }

        @keyframes sun-rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes sun-ray-pulse {
          0%, 100% {
            width: 20px;
            opacity: 0.5;
          }
          50% {
            width: 30px;
            opacity: 0.8;
          }
        }

        @keyframes sun-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        /* Cloud animation */
        .small-clouds {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        @keyframes float {
          0%, 100% {
            transform: translateX(0) translateY(0);
          }
          25% {
            transform: translateX(3px) translateY(-2px);
          }
          50% {
            transform: translateX(5px) translateY(0);
          }
          75% {
            transform: translateX(2px) translateY(2px);
          }
        }

        /* Lightning animation */
        .lightning-flash {
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: rgba(255, 255, 255, 0);
          animation: lightning 3s ease-in-out infinite;
        }

        @keyframes lightning {
          0%, 20%, 40%, 60%, 80%, 100% {
            background-color: rgba(255, 255, 255, 0);
          }
          10%, 30%, 50%, 70%, 90% {
            background-color: rgba(255, 255, 255, 0.3);
          }
          15%, 45%, 75% {
            background-color: rgba(255, 255, 255, 0.6);
          }
        }

        /* Wind animation */
        .wind-lines {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .wind-line {
          position: absolute;
          height: 2px;
          background: rgba(96, 165, 250, 0.5);
          right: 0;
          animation: wind-blow 2s ease-in-out infinite;
        }

        @keyframes wind-blow {
          0% {
            transform: translateX(0);
            opacity: 0;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            transform: translateX(-40px);
            opacity: 0;
          }
        }

        @keyframes wind {
          0%, 100% {
            transform: translateX(0) skewX(0);
          }
          25% {
            transform: translateX(2px) skewX(-5deg);
          }
          75% {
            transform: translateX(-2px) skewX(5deg);
          }
        }

        /* Fog animation */
        .fog-layers {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .fog-layer {
          position: absolute;
          height: 4px;
          width: 100%;
          background: linear-gradient(to right, rgba(209, 213, 219, 0), rgba(209, 213, 219, 0.8), rgba(209, 213, 219, 0));
          animation: fog-move 5s ease-in-out infinite;
        }

        @keyframes fog-move {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(10px);
          }
        }

        /* Haze animation */
        .haze-layers {
          position: absolute;
          width: 100%;
          height: 100%;
          opacity: 0.5;
        }

        .haze-layer {
          position: absolute;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(251, 146, 60, 0.2) 0%, rgba(251, 146, 60, 0) 70%);
          animation: haze-pulse 4s ease-in-out infinite;
        }

        @keyframes haze-pulse {
          0%, 100% {
            transform: scale(0.8);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.5;
          }
        }

        /* Snow animation */
        .snowflakes {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 50%;
        }

        .snowflake {
          position: absolute;
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
          animation: snow-fall linear infinite;
        }

        @keyframes snow-fall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0.8;
          }
          25% {
            transform: translateY(8px) translateX(5px) rotate(45deg);
          }
          50% {
            transform: translateY(16px) translateX(-5px) rotate(90deg);
          }
          75% {
            transform: translateY(24px) translateX(5px) rotate(135deg);
          }
          100% {
            transform: translateY(32px) translateX(0) rotate(180deg);
            opacity: 0;
          }
        }

        /* Humidity animation */
        .humidity-particles {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .humidity-particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: rgba(96, 165, 250, 0.4);
          border-radius: 50%;
          animation: humidity-float 3s ease-in-out infinite;
        }

        @keyframes humidity-float {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-5px) scale(1.5);
            opacity: 0.7;
          }
        }

        /* Dry/Heat animation */
        .heat-waves {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .heat-wave {
          position: absolute;
          width: 100%;
          height: 5px;
          background: transparent;
          border-radius: 50%;
          border: 1px dashed rgba(249, 115, 22, 0.3);
          animation: heat-pulse 3s ease-in-out infinite;
        }

        @keyframes heat-pulse {
          0%, 100% {
            transform: scale(0.8);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.6;
          }
        }

        .animate-float {
          animation: float 5s ease-in-out infinite;
        }

        .animate-sun-pulse {
          animation: sun-pulse 3s ease-in-out infinite;
        }

        .animate-wind {
          animation: wind 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
