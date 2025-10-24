import { useEffect, useMemo } from 'react';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine, ISourceOptions } from "@tsparticles/engine";
import { useTheme } from '../hooks/useTheme';

export const NetworkBackground = () => {
  const { theme } = useTheme();

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    });
  }, []);

  const particlesOptions: ISourceOptions = useMemo(() => {
    const isDark = theme === 'mydark';
    
    return {
      particles: {
        number: {
          value: 60,
          density: {
            enable: true,
            value_area: 481
          }
        },
        color: {
          value: ["#6B9EFF", "#A78BFA", "#60D5FF", "#FFB347"]
        },
        shape: {
          type: "circle"
        },
        opacity: {
          value: 0.6,
          random: false,
          anim: {
            enable: true,
            speed: 0.5,
            opacity_min: 0.2,
            sync: true
          }
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: false,
            speed: 40,
            size_min: 0.1,
            sync: false
          }
        },
        links: {
          enable: true,
          distance: 180,
          color: isDark ? "#8B5CF6" : "#6366F1",
          opacity: 0.4,
          width: 1
        },
        move: {
          enable: true,
          speed: 2,
          direction: "none",
          random: false,
          straight: false,
          outModes: {
            default: "out"
          },
          bounce: false,
          attract: {
            enable: false,
            rotateX: 600,
            rotateY: 1200
          }
        }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onHover: {
            enable: true,
            mode: "grab"
          },
          onClick: {
            enable: true,
            mode: "push"
          },
          resize: {
            enable: true
          }
        },
        modes: {
          grab: {
            distance: 183,
            links: {
              opacity: 1
            }
          },
          bubble: {
            distance: 400,
            size: 40,
            duration: 2,
            opacity: 0.8
          },
          repulse: {
            distance: 200,
            duration: 0.4
          },
          push: {
            quantity: 4
          },
          remove: {
            quantity: 2
          }
        }
      },
      retina_detect: true,
      fpsLimit: 60,
      background: {
        color: "transparent"
      }
    };
  }, [theme]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <Particles
        id="tsparticles"
        options={particlesOptions}
        className="absolute inset-0"
      />
    </div>
  );
};